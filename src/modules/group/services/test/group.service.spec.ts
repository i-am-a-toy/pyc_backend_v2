import { hashSync } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager } from 'typeorm';
import { ENTITY_NOT_FOUND, RESOURCE_NOT_ALLOWED } from '../../../../common/dto/error/error-code.dto';
import { Gender } from '../../../../common/types/gender/gender.type';
import { Rank } from '../../../../common/types/rank/rank.type';
import { Role } from '../../../../common/types/role/role.type';
import { TransactionManager } from '../../../../core/database/typeorm/transaction-manager';
import { ServiceException } from '../../../../core/exception/service.exception';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from '../../../../core/middleware/namespace.constant';
import { Cell } from '../../../../entities/cell/cell.entity';
import { Group } from '../../../../entities/group/group.entity';
import { GroupRepository } from '../../../../entities/group/group.repository';
import { User } from '../../../../entities/user/user.entity';
import { UserRepository } from '../../../../entities/user/user.repository';
import { IGroupService } from '../../interfaces/group-service.interface';
import { GroupService } from '../group.service';

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

describe('GroupService Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: IGroupService;
  let namespace: Namespace;

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
      entities: [Group, Cell, User],
    }).initialize();

    const txManager = new TransactionManager();
    const userRepository = new UserRepository(txManager);
    const groupRepository = new GroupRepository(txManager);
    service = new GroupService(userRepository, groupRepository);
  });

  beforeEach(() => {
    namespace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE groups CASCADE;');
    await dataSource.query('ALTER SEQUENCE groups_id_seq RESTART WITH 1;');
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
    expect(service).toBeDefined();
    expect(namespace).toBeDefined();
  });

  it('register - 리더가 존재하지 않는 경우', async () => {
    //given
    const leaderId = 1;
    const name = 'groupName';
    const creatorId = 1;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.register(leaderId, name, creatorId);
      }),
    ).rejects.toThrowError(new ServiceException(ENTITY_NOT_FOUND, '리더를 찾을 수 없습니다.'));
  });

  it('register - 요청으로 들어온 Leader가 권한이 충분하지 않을 때', async () => {
    //given
    const [userA, userB] = await dataSource.manager.save(User, mockUsers);

    const leaderId = userB.id;
    const name = 'groupName';
    const creatorId = userA.id;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.register(leaderId, name, creatorId);
      }),
    ).rejects.toThrowError(new ServiceException(RESOURCE_NOT_ALLOWED, '선택한 유저의 권한이 부족합니다.'));
  });

  it('register', async () => {
    //given
    const [userA, userB] = await dataSource.manager.save(User, mockUsers);

    const leaderId = userA.id;
    const name = 'groupA';
    const creatorId = userA.id;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.register(leaderId, name, creatorId);
      }),
    ).resolves.not.toThrowError();

    const group = await dataSource.manager.findOneBy(Group, { id: 1 });
    expect(group).not.toBeNull();

    const groupLeader = await dataSource.manager.findOneBy(User, { id: userA.id });
    expect(groupLeader).not.toBeNull();
    expect(groupLeader!.role).toStrictEqual(Role.GROUP_LEADER);
  });

  it('findGroupById - 존재하지 않는 경우', async () => {
    //given
    const id = 1;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.findGroupById(id);
      }),
    ).rejects.toThrowError(new ServiceException(ENTITY_NOT_FOUND, '그룹을 찾을 수 없습니다.'));
  });

  it('findGroupById', async () => {
    //given
    const [userA, userB] = await dataSource.manager.save(User, mockUsers);
    const [groupA] = await dataSource.manager.save(Group, [Group.openCeremony(userA, 'groupA', userA.id)]);

    //when
    const group = await namespace.runAndReturn<Promise<Group>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findGroupById(groupA.id);
    });

    //then
    expect(group.id).toBe(1);
    expect(group.name).toBe('groupA');
    expect(group.leaderId).toBe(1);
  });

  it('findGroupList - 조회 결과가 없는 경우', async () => {
    //given
    const offset = 0;
    const limit = 20;

    //when
    const [groupList, count] = await namespace.runAndReturn<Promise<[Group[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findGroupList(offset, limit);
    });

    //then
    expect(groupList).toStrictEqual([]);
    expect(count).toBe(0);
  });

  it('findGroupList - with offset', async () => {
    //given
    const offset = 1;
    const limit = 20;
    const [userA, userB] = await dataSource.manager.save(User, mockUsers);
    const [groupA] = await dataSource.manager.save(Group, [Group.openCeremony(userA, 'groupA', userA.id)]);

    //when
    const [groupList, count] = await namespace.runAndReturn<Promise<[Group[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findGroupList(offset, limit);
    });

    //then
    expect(groupList).toStrictEqual([]);
    expect(count).toBe(1);
  });

  it('findGroupList - with limit', async () => {
    //given
    const offset = 0;
    const limit = 20;
    const [userA, userB] = await dataSource.manager.save(User, mockUsers);
    const [groupA] = await dataSource.manager.save(Group, [Group.openCeremony(userA, 'groupA', userA.id)]);

    //when
    const [groupList, count] = await namespace.runAndReturn<Promise<[Group[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findGroupList(offset, limit);
    });

    //then
    const [selectedGroupA] = groupList;
    expect(selectedGroupA.id).toBe(1);
    expect(selectedGroupA.name).toBe('groupA');
    expect(selectedGroupA.leaderId).toBe(1);
    expect(count).toBe(1);
  });
});
