import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { TokenPayload } from 'src/common/dto/token';
import { Gender } from 'src/common/types/gender/gender.type';
import { Rank } from 'src/common/types/rank/rank.type';
import { Role } from 'src/common/types/role/role.type';
import { TransactionManager } from 'src/core/database/typeorm/transaction-manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { Cell } from 'src/entities/cell/cell.entity';
import { RefreshToken } from 'src/entities/refresh-token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { User } from 'src/entities/user/user.entity';
import { UserRepository } from 'src/entities/user/user.repository';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager } from 'typeorm';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { AuthService } from '../auth.service';
import { TokenService } from '../../../../core/token/services/token.service';

const mockUsers: User[] = [
  plainToInstance(User, {
    role: Role.LEADER,
    gender: Gender.MALE,
    rank: Rank.INFANT_BAPTISM,
    name: 'userA',
    image: 'imageA',
    isLongAbsence: false,
    password: hashSync('test', 10),
  }),
  plainToInstance(User, {
    role: Role.MEMBER,
    gender: Gender.MALE,
    rank: Rank.INFANT_BAPTISM,
    name: 'userB',
    image: 'imageB',
    isLongAbsence: false,
  }),
];

/**
 * logout, refresh는 TestCode Skip: TokenService를 그대로 호출
 */

describe('AuthService Test', () => {
  // for testContainers
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let namespace: Namespace;
  let jwtService: JwtService;
  let service: IAuthService;

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
      logging: true,
    }).initialize();

    jwtService = new JwtService({
      secret: 'test',
      signOptions: {
        issuer: 'pyc',
        expiresIn: 60 * 60,
      },
    });
    const txManager = new TransactionManager();
    const refreshTokenRepository = new RefreshTokenRepository(txManager);
    const userRepository = new UserRepository(txManager);

    service = new AuthService(new TokenService(jwtService, refreshTokenRepository), userRepository);
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
    expect(namespace).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(service).toBeDefined();
  });

  it('isValidated - Token이 빈 string일 경우', () => {
    //given
    const token = '';

    //when
    const result = service.isValidated(token);

    //then
    expect(result).toBe(false);
  });

  it('isValidated - Token이 유효하지 않는 경우', () => {
    //given
    const token = jwtService.sign(new TokenPayload('tokenId', 1, 'userA', Role.LEADER.enumName).toPlain(), { secret: 'inValid' });

    //when
    const result = service.isValidated(token);

    //then
    expect(result).toBe(false);
  });

  it('isValidated', () => {
    //given
    const token = jwtService.sign(new TokenPayload('tokenId', 1, 'userA', Role.LEADER.enumName).toPlain());

    //when
    const result = service.isValidated(token);

    //then
    expect(result).toBe(true);
  });

  it('login - user가 존재하지 않는 경우', async () => {
    //given
    const name = 'foobar';
    const password = 'test';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.login(name, password);
      }),
    ).rejects.toThrowError(new NotFoundException('유저를 찾을 수 없습니다.'));
  });

  it('login - user의 권한이 충족되지 않는 경우', async () => {
    //given
    const [_leaderUserA, memberUserB] = await dataSource.manager.save(User, mockUsers);

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.login(memberUserB.name, 'test');
      }),
    ).rejects.toThrowError(new ForbiddenException('권한이 없습니다.'));
  });

  it('login - 입력한 비밀번호와 다른 경우', async () => {
    //given
    const [leaderUserA, _memberUserB] = await dataSource.manager.save(User, mockUsers);

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.login(leaderUserA.name, 'difference');
      }),
    ).rejects.toThrowError(new UnauthorizedException('비밀번호가 다릅니다.'));
  });

  it('login', async () => {
    //given
    const [leaderUserA, _memberUserB] = await dataSource.manager.save(User, mockUsers);

    //when
    //then
    const tokens = await namespace.runAndReturn<Promise<string[]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.login(leaderUserA.name, 'test');
    });
    expect(tokens.length).toBe(2);
  });

  it('changePassword - user가 존재하지 않는 경우', async () => {
    //given
    const id = 1;
    const prevPassword = 'foobar';
    const newPassword = 'changed';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.changePassword(id, prevPassword, newPassword);
      }),
    ).rejects.toThrowError(new NotFoundException('유저를 찾을 수 없습니다.'));
  });

  it('changePassword - user의 권한이 충족되지 않는 경우', async () => {
    //given
    const [_leaderUserA, memberUserB] = await dataSource.manager.save(User, mockUsers);
    const prevPassword = 'foobar';
    const newPassword = 'changed';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.changePassword(memberUserB.id, prevPassword, newPassword);
      }),
    ).rejects.toThrowError(new ForbiddenException('권한이 없습니다.'));
  });

  it('changePassword - 입력한 이전 비밀번호가 다른 경우', async () => {
    //given
    const [leaderUserA, _memberUserB] = await dataSource.manager.save(User, mockUsers);
    const prevPassword = 'foobar';
    const newPassword = 'changed';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.changePassword(leaderUserA.id, prevPassword, newPassword);
      }),
    ).rejects.toThrowError(new UnauthorizedException('비밀번호가 다릅니다.'));
  });

  it('changePassword', async () => {
    //given
    const [leaderUserA, _memberUserB] = await dataSource.manager.save(User, mockUsers);
    const prevPassword = 'test';
    const newPassword = 'changed';

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.changePassword(leaderUserA.id, prevPassword, newPassword);
    });

    //then
    const updated = await dataSource.manager.findOneByOrFail(User, { id: leaderUserA.id });
    expect(compareSync('changed', updated.password!)).toBe(true);
  });
});
