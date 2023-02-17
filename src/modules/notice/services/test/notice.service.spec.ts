import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { Role } from 'src/common/types/role/role.type';
import { TransactionManager } from 'src/core/database/typeorm/transaction-manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { Notice } from 'src/entities/notice/notice.entity';
import { NoticeRepository } from 'src/entities/notice/notice.repository';
import { CreatorVO } from 'src/entities/vo/creator.vo';
import { LastModifierVO } from 'src/entities/vo/last-modifier.vo';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager, EntityNotFoundError } from 'typeorm';
import { INoticeService } from '../../interfaces/notice-service.interface';
import { NoticeService } from '../notice.service';

const mockNotices: Notice[] = [
  plainToInstance(Notice, {
    title: 'noticeA',
    content: 'contentA',
    creator: new CreatorVO(1, 'userA', Role.LEADER),
    lastModifier: new LastModifierVO(1, 'userA', Role.LEADER),
  }),
  plainToInstance(Notice, {
    title: 'noticeB',
    content: 'contentB',
    creator: new CreatorVO(2, 'userB', Role.LEADER),
    lastModifier: new LastModifierVO(2, 'userB', Role.LEADER),
  }),
];

describe('NoticeService Test', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: INoticeService;
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
      entities: [Notice],
    }).initialize();

    const txManager = new TransactionManager();
    const noticeRepository = new NoticeRepository(txManager);
    service = new NoticeService(noticeRepository);
  });

  beforeEach(() => {
    namespace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query('TRUNCATE TABLE notices CASCADE;');
    await dataSource.query('ALTER SEQUENCE notices_id_seq RESTART WITH 1;');
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

  it('Save', async () => {
    //given
    const pycUser: PycUser = new PycUser('tokenId', 1, 'userA', Role.LEADER);
    const title = '공지사항 제목';
    const content = '공지사항 본문';

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.write(pycUser, title, content);
    });

    //then
    const saved = await dataSource.manager.findOneByOrFail(Notice, { id: 1 });
    expect(saved.id).toBe(1);
    expect(saved.title).toBe('공지사항 제목');
    expect(saved.content).toBe('공지사항 본문');
    expect(saved.creator).toStrictEqual(new CreatorVO(1, 'userA', Role.LEADER));
    expect(saved.lastModifier).toStrictEqual(new LastModifierVO(1, 'userA', Role.LEADER));
  });

  it('FindNoticeById - 존재하지 않는 경우', async () => {
    //given
    const id = 1;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.findNoticeById(id);
      }),
    ).rejects.toThrowError(new NotFoundException('공지사항을 찾을 수 없습니다.'));
  });

  it('FindNoticeById', async () => {
    //given
    const [noticeA, _] = await dataSource.manager.save(Notice, mockNotices);

    //when
    const notice = await namespace.runAndReturn<Promise<Notice>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findNoticeById(noticeA.id);
    });

    //then
    expect(notice.id).toBe(1);
    expect(notice.title).toBe('noticeA');
    expect(notice.content).toBe('contentA');
    expect(notice.creator).toStrictEqual(new CreatorVO(1, 'userA', Role.LEADER));
    expect(notice.lastModifier).toStrictEqual(new LastModifierVO(1, 'userA', Role.LEADER));
  });

  it('FindNotices 조회 결과가 없는 경우', async () => {
    //given
    const offset = 0;
    const limit = 20;

    //when
    const [entities, count] = await namespace.runAndReturn<Promise<[Notice[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findNotices(offset, limit);
    });

    //then
    expect(entities).toStrictEqual([]);
    expect(count).toBe(0);
  });

  it('FindNotices - with limit', async () => {
    //given
    await dataSource.manager.save(Notice, mockNotices);

    const offset = 0;
    const limit = 1;

    //when
    const [entities, count] = await namespace.runAndReturn<Promise<[Notice[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findNotices(offset, limit);
    });

    //then
    const [noticeA] = entities;
    expect(noticeA.title).toBe('noticeA');
    expect(count).toBe(2);
  });

  it('FindNotices - with offset', async () => {
    //given
    await dataSource.manager.save(Notice, mockNotices);

    const offset = 1;
    const limit = 20;

    //when
    const [entities, count] = await namespace.runAndReturn<Promise<[Notice[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findNotices(offset, limit);
    });

    //then
    const [noticeB] = entities;
    expect(noticeB.title).toBe('noticeB');
    expect(count).toBe(2);
  });

  it('modify - 존재하지 않는 경우', async () => {
    //given
    const pycUser: PycUser = { id: 'userId', userId: 1, name: 'userA', role: Role.LEADER };
    const targetId = 1;
    const title = 'change';
    const content = 'change';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.modify(pycUser, targetId, title, content);
      }),
    ).rejects.toThrowError(new NotFoundException('공지사항을 찾을 수 없습니다.'));
  });

  it('modify', async () => {
    //given
    const [noticeA] = await dataSource.manager.save(Notice, mockNotices);
    const modifier: PycUser = { id: 'userId', userId: 2, name: 'userB', role: Role.PASTOR };
    const title = 'change';
    const content = 'change';

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.modify(modifier, noticeA.id, title, content);
    });

    //then
    const updatedNoticeA = await dataSource.manager.findOneByOrFail(Notice, { id: noticeA.id });
    expect(updatedNoticeA.id).toBe(1);
    expect(updatedNoticeA.title).toBe('change');
    expect(updatedNoticeA.content).toBe('change');
    expect(updatedNoticeA.lastModifier).toStrictEqual(new LastModifierVO(2, 'userB', Role.PASTOR));
  });

  it('deleteById - 존재하지 않는 경우', async () => {
    //given
    const id = 1;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.deleteById(id);
      }),
    ).resolves.not.toThrowError();
  });

  it('deleteById', async () => {
    //given
    const [noticeA] = await dataSource.manager.save(Notice, mockNotices);

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.deleteById(noticeA.id);
    });

    //then
    await expect(dataSource.manager.findOneByOrFail(Notice, { id: noticeA.id })).rejects.toThrowError(
      new EntityNotFoundError(Notice, { id: 1 }),
    );
  });
});
