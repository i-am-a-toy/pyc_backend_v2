import { MethodNotAllowedException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AccessTokenClaim, TokenPayload } from 'src/common/dto/token';
import { Gender } from 'src/common/types/gender/gender.type';
import { Rank } from 'src/common/types/rank/rank.type';
import { Role } from 'src/common/types/role/role.type';
import { TransactionManager } from 'src/core/database/typeorm/transaction-manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { Cell } from 'src/entities/cell/cell.entity';
import { RefreshToken } from 'src/entities/refresh-token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { User } from 'src/entities/user/user.entity';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager } from 'typeorm';
import { ITokenService } from '../../interfaces/token-service.interface';
import { TokenService } from '../token.service';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const mockUsers: User[] = [
  plainToInstance(User, {
    role: Role.LEADER,
    gender: Gender.MALE,
    rank: Rank.INFANT_BAPTISM,
    name: 'userA',
    isLongAbsence: false,
  }),
];

describe('nestjs/jwt를 이용한 jwt 생성 Test', () => {
  let jwtService: JwtService;

  beforeEach(async () => {
    jwtService = new JwtService({
      secret: 'test',
      signOptions: {
        issuer: 'pyc',
      },
    });
  });

  it('should be defined', () => {
    expect(jwtService).toBeDefined();
  });

  it('tokenClaim을 이용하여 Token 생성 및 검증', () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');

    //when
    const token = jwtService.sign(payload.toPlain(), { expiresIn: 60 * 60 });
    const verified = plainToInstance(AccessTokenClaim, jwtService.verify<AccessTokenClaim>(token));

    //then
    expect(verified.id).toBe('test');
    expect(verified.userId).toBe(1);
    expect(verified.name).toBe('foobar');
    expect(verified.role).toBe('foobar');
    expect(verified.iss).toBe('pyc');
  });

  it('token이 만료되었을 때', () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');

    //when
    const token = jwtService.sign(payload.toPlain(), { expiresIn: '1ms' });

    //when
    //then
    expect(() => jwtService.verify<AccessTokenClaim>(token)).toThrowError(TokenExpiredError);
  });

  it('token의 secret이 다를 경우', () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');

    //when
    const token = jwtService.sign(payload.toPlain(), { expiresIn: 60 * 60 });

    //when
    //then
    expect(() => jwtService.verify<AccessTokenClaim>(token, { secret: '123' })).toThrowError(new JsonWebTokenError('invalid signature'));
  });
});

describe('TokenService Test', () => {
  // for testContainers
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let namespace: Namespace;
  let jwtService: JwtService;
  let service: ITokenService;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:15.1').start();
    dataSource = await new DataSource({
      type: 'postgres',
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      username: container.getUsername(),
      password: container.getPassword(),
      synchronize: true,
      entities: [Cell, User, RefreshToken],
    }).initialize();

    jwtService = new JwtService({
      secret: 'test',
      signOptions: {
        issuer: 'pyc',
        expiresIn: 60 * 60,
      },
    });
    const txManager = new TransactionManager();
    service = new TokenService(jwtService, new RefreshTokenRepository(txManager));
  });

  beforeEach(() => {
    namespace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE users CASCADE;');
    await dataSource.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
    await dataSource.query('TRUNCATE TABLE refresh_tokens CASCADE;');
    await dataSource.query('ALTER SEQUENCE refresh_tokens_id_seq RESTART WITH 1;');
    destroyNamespace(PYC_NAMESPACE);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('Should be defined', () => {
    //given
    //when
    //then
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
  });

  it('create Token Test', async () => {
    //given
    const [userA] = await dataSource.manager.save(User, mockUsers);

    //when
    const [accessToken, refreshToken] = await namespace.runAndReturn<Promise<string[]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.createToken(userA);
    });

    //then
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    const claim = jwtService.verify<AccessTokenClaim>(accessToken);
    expect(claim.userId).toBe(1);
    expect(claim.name).toBe('userA');
    expect(claim.role).toBe(Role.LEADER.enumName);
  });

  it('verified Token Test - 만료되었을 경우', () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');
    const token = jwtService.sign(payload.toPlain(), { expiresIn: '1ms' });

    //when
    //then
    expect(() => service.verifiedToken(token)).toThrowError(new UnauthorizedException('인증 정보가 유효하지 않습니다.'));
  });

  it('verified Token Test - 서명이 다를 때', () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');
    const token = jwtService.sign(payload.toPlain(), { expiresIn: '1 days', secret: 'foobar' });

    //when
    //then
    expect(() => service.verifiedToken(token)).toThrowError(new UnauthorizedException('인증 정보가 유효하지 않습니다.'));
  });

  it('verified Token Test - 정상적으로 검증', () => {
    //given
    const claim = new TokenPayload('test', 1, 'foobar', 'foobar');
    const token = jwtService.sign(claim.toPlain(), { expiresIn: '1 days', secret: 'test' });

    //when
    const verified = service.verifiedToken(token);

    //then
    expect(verified.id).toBe('test');
    expect(verified.userId).toBe(1);
    expect(verified.name).toBe('foobar');
    expect(verified.role).toBe('foobar');
    expect(verified.iss).toBe('pyc');
  });

  it('refresh Token Test - 검증에 실패하는 경우', async () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');
    const accessToken = jwtService.sign(payload.toPlain(), { expiresIn: '1 days', secret: 'foobar' });
    const refreshToken = 'foobar';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.refresh(accessToken, refreshToken);
      }),
    ).rejects.toThrowError(new UnauthorizedException(`Token Invalid`));
  });

  it('refresh Token Test - Refresh Token이 존재하지 않는 경우', async () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');
    const accessToken = jwtService.sign(payload.toPlain(), { expiresIn: '1 days', secret: 'test' });
    const refreshToken = 'foobar';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.refresh(accessToken, refreshToken);
      }),
    ).rejects.toThrowError(new NotFoundException(`RefreshToken이 존재하지 않습니다.`));
  });

  it('refresh Token Test - refreshToken이 만료되었을 경우', async () => {
    //given
    const [userA] = await dataSource.manager.save(User, mockUsers);
    process.env.REFRESH_TOKEN_EXPIRED = '0';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        const [accessToken, refreshToken] = await service.createToken(userA);
        await sleep(1000);
        await service.refresh(accessToken, refreshToken);
      }),
    ).rejects.toThrowError(new MethodNotAllowedException(`RefreshToken이 이미 만료되었습니다.`));
  });

  it('refresh Token Test - 정상적으로 Refresh 되는 경우', async () => {
    //given
    const [userA] = await dataSource.manager.save(User, mockUsers);
    process.env.REFRESH_TOKEN_EXPIRED = '2';

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      const [accessToken, refreshToken] = await service.createToken(userA);
      await sleep(1000);
      const [newAccessToken, newRefreshToken] = await service.refresh(accessToken, refreshToken);

      //then
      expect(newRefreshToken !== refreshToken).toBe(true);

      const prevClaim = jwtService.verify<AccessTokenClaim>(accessToken);
      const newClaim = jwtService.verify<AccessTokenClaim>(newAccessToken);
      expect(new Date(prevClaim.exp) < new Date(newClaim.exp)).toBe(true);

      const updated = await dataSource.manager.findOneByOrFail(RefreshToken, { id: 1 });
      expect(updated.token).toBe(newRefreshToken);
    });
  });

  it('removeToken Test - 존재하지 않는 경우', async () => {
    //given
    const payload = new TokenPayload('test', 1, 'foobar', 'foobar');
    const token = jwtService.sign(payload.toPlain(), { expiresIn: '1 days', secret: 'test' });

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.removeToken(token);
      }),
    ).resolves.not.toThrowError();
  });

  it('removeToken Test - 정상적으로 삭제', async () => {
    //given
    const [userA] = await dataSource.manager.save(User, mockUsers);

    //when
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        const [accessToken, _refreshToken] = await service.createToken(userA);
        await service.removeToken(accessToken);
      }),
    ).resolves.not.toThrowError();

    //then
    const removed = await dataSource.manager.findOneBy(RefreshToken, { userId: userA.id });
    expect(removed).toBeNull();
  });
});
