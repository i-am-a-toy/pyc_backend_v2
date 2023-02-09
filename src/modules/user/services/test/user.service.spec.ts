import { NotFoundException } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { Gender } from 'src/common/types/gender/gender.type';
import { Rank } from 'src/common/types/rank/rank.type';
import { Role } from 'src/common/types/role/role.type';
import { TransactionManager } from 'src/core/database/typeorm/transaction-manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { Cell } from 'src/entities/cell/cell.entity';
import { User } from 'src/entities/user/user.entity';
import { UserRepository } from 'src/entities/user/user.repository';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager } from 'typeorm';
import { IUserService } from '../../interfaces/user-service.interface';
import { UserService } from '../user.service';

const mockUsers: User[] = [
  plainToInstance(User, {
    role: Role.LEADER,
    gender: Gender.MALE,
    rank: Rank.INFANT_BAPTISM,
    name: 'userA',
    isLongAbsence: false,
    password: hashSync('test', 10),
  }),
  plainToInstance(User, {
    role: Role.MEMBER,
    gender: Gender.MALE,
    rank: Rank.INFANT_BAPTISM,
    name: 'userB',
    isLongAbsence: false,
  }),
];

describe('UserService Test', () => {
  // for testContainers
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let namespace: Namespace;
  let service: IUserService;

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
      entities: [Cell, User],
    }).initialize();

    const txManager = new TransactionManager();
    const userRepository = new UserRepository(txManager);
    service = new UserService(userRepository);
  });

  beforeEach(() => {
    namespace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE users CASCADE;');
    await dataSource.query('ALTER SEQUENCE users_id_seq RESTART WITH 1;');
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
    expect(service).toBeDefined();
  });

  it('findById - user가 존재하지 않는 경우', async () => {
    //given
    const id = 1;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.findById(id);
      }),
    ).rejects.toThrowError(new NotFoundException('유저를 찾을 수 없습니다.'));
  });

  it('findById - user가 존재하는 경우', async () => {
    //given
    const [userA, _] = await dataSource.manager.save(User, mockUsers);
    const id = userA.id;

    //when
    const result = await namespace.runAndReturn<Promise<User>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findById(id);
    });

    //then
    expect(result.id).toBe(1);
    expect(result.name).toBe('userA');
    expect(result.role).toStrictEqual(Role.LEADER);
    expect(result.gender).toStrictEqual(Gender.MALE);
    expect(result.rank).toStrictEqual(Rank.INFANT_BAPTISM);
    expect(result.isLongAbsence).toBe(false);
    expect(compareSync('test', result.password!)).toBe(true);
  });
});
