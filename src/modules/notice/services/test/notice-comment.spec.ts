import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { Role } from 'src/common/types/role/role.type';
import { TransactionManager } from 'src/core/database/typeorm/transaction-manager';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { NoticeCommentRepository } from 'src/entities/notice-comment/notice-comment.repository';
import { Notice } from 'src/entities/notice/notice.entity';
import { NoticeRepository } from 'src/entities/notice/notice.repository';
import { CreatorVO } from 'src/entities/vo/creator.vo';
import { LastModifierVO } from 'src/entities/vo/last-modifier.vo';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager, EntityNotFoundError } from 'typeorm';
import { INoticeCommentService } from '../../interfaces/notice-comment-service.interface';
import { NoticeCommentService } from '../notice-comment.service';

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

describe('NoticeComment Service', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: INoticeCommentService;
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
      entities: [Notice, NoticeComment],
    }).initialize();

    const txManager = new TransactionManager();
    const noticeRepository = new NoticeRepository(txManager);
    const commentRepository = new NoticeCommentRepository(txManager);
    service = new NoticeCommentService(noticeRepository, commentRepository);
  });

  beforeEach(() => {
    namespace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query(`TRUNCATE TABLE notice_comments CASCADE;`);
    await dataSource.query(`ALTER SEQUENCE notice_comments_id_seq RESTART WITH 1;`);
    await dataSource.query(`TRUNCATE TABLE notices CASCADE;`);
    await dataSource.query(`ALTER SEQUENCE notices_id_seq RESTART WITH 1;`);
    destroyNamespace(PYC_NAMESPACE);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('Should be Defined', () => {
    //given
    //when
    //then
    expect(container).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(service).toBeDefined();
    expect(namespace).toBeDefined();
  });

  it('Save - Notice가 존재하지 않는 경우', async () => {
    //given
    const pycUser: PycUser = { id: 'tokenA', userId: 1, name: 'userA', role: Role.LEADER };
    const noticeId = 1;
    const comment = 'commentA';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.comment(pycUser, noticeId, comment);
      }),
    ).rejects.toThrowError(new NotFoundException('공지사항을 찾을 수 없습니다.'));
  });

  it('Save', async () => {
    //given
    await dataSource.manager.save(Notice, mockNotices);

    const pycUser: PycUser = { id: 'tokenA', userId: 1, name: 'userA', role: Role.LEADER };
    const noticeId = 1;
    const comment = 'commentA';

    //when
    const noticeComment = await namespace.runAndReturn<Promise<NoticeComment>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.comment(pycUser, noticeId, comment);
    });

    //then
    expect(noticeComment.id).toBe(1);
    expect(noticeComment.content).toBe('commentA');
    expect(noticeComment.creator).toStrictEqual(new CreatorVO(1, 'userA', Role.LEADER));
    expect(noticeComment.lastModifier).toStrictEqual(new LastModifierVO(1, 'userA', Role.LEADER));
  });

  it('findByNoticeId - 조회 결과가 존재하지 않는 경우', async () => {
    //given
    const noticeId = 1;
    const offset = 0;
    const limit = 20;

    //when
    const [entities, count] = await namespace.runAndReturn<Promise<[NoticeComment[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findByNoticeId(noticeId, offset, limit);
    });

    //then
    expect(entities).toStrictEqual([]);
    expect(count).toBe(0);
  });

  it('findByNoticeId - with limit', async () => {
    //given
    const [noticeA] = await dataSource.manager.save(Notice, mockNotices);
    await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(noticeA, 'commentA', 1, 'userA', Role.LEADER),
      NoticeComment.of(noticeA, 'commentB', 1, 'userA', Role.LEADER),
    ]);
    const offset = 0;
    const limit = 1;

    //when
    const [entities, count] = await namespace.runAndReturn<Promise<[NoticeComment[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findByNoticeId(noticeA.id, offset, limit);
    });

    //then
    const [selectedCommentA] = entities;
    expect(selectedCommentA.content).toBe('commentA');
    expect(count).toBe(2);
  });

  it('findByNoticeId - with offset', async () => {
    //given
    const [noticeA] = await dataSource.manager.save(Notice, mockNotices);
    await dataSource.manager.save(NoticeComment, [
      NoticeComment.of(noticeA, 'commentA', 1, 'userA', Role.LEADER),
      NoticeComment.of(noticeA, 'commentB', 1, 'userA', Role.LEADER),
    ]);
    const offset = 1;
    const limit = 20;

    //when
    const [entities, count] = await namespace.runAndReturn<Promise<[NoticeComment[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findByNoticeId(noticeA.id, offset, limit);
    });

    //then
    const [selectedCommentB] = entities;
    expect(selectedCommentB.content).toBe('commentB');
    expect(count).toBe(2);
  });

  it('findById - 조회 결과가 존재하지 않는 경우', async () => {
    //given
    const id = 1;

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.findById(id);
      }),
    ).rejects.toThrowError(new NotFoundException('댓글을 찾을 수 없습니다.'));
  });

  it('findById', async () => {
    //given
    const [noticeA] = await dataSource.manager.save(Notice, mockNotices);
    const [commentA] = await dataSource.manager.save(NoticeComment, [NoticeComment.of(noticeA, 'commentA', 1, 'userA', Role.LEADER)]);

    //when
    const selectedCommentA = await namespace.runAndReturn<Promise<NoticeComment>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findById(commentA.id);
    });

    //then
    expect(selectedCommentA.id).toBe(1);
    expect(selectedCommentA.content).toBe('commentA');
    expect(selectedCommentA.creator).toStrictEqual(new CreatorVO(1, 'userA', Role.LEADER));
    expect(selectedCommentA.lastModifier).toStrictEqual(new LastModifierVO(1, 'userA', Role.LEADER));
  });

  it('modify - 댓글이 존재하지 않는 경우', async () => {
    //given
    const pycUser: PycUser = { id: 'tokenA', userId: 1, name: 'userA', role: Role.LEADER };
    const id = 1;
    const comment = 'commentA';

    //when
    //then
    await expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.modify(pycUser, id, comment);
      }),
    ).rejects.toThrowError(new NotFoundException('댓글을 찾을 수 없습니다.'));
  });

  it('modify', async () => {
    //given
    const [noticeA] = await dataSource.manager.save(Notice, mockNotices);
    const [commentA] = await dataSource.manager.save(NoticeComment, [NoticeComment.of(noticeA, 'commentA', 1, 'userA', Role.LEADER)]);

    const pycUser: PycUser = { id: 'tokenA', userId: 2, name: 'userB', role: Role.PASTOR };
    const comment = 'change';

    //when
    const updatedCommentA = await namespace.runAndReturn<Promise<NoticeComment>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.modify(pycUser, commentA.id, comment);
    });

    //then
    expect(updatedCommentA.id).toBe(1);
    expect(updatedCommentA.content).toBe('change');
    expect(updatedCommentA.lastModifier).toStrictEqual(new LastModifierVO(2, 'userB', Role.PASTOR));
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
    const [commentA] = await dataSource.manager.save(NoticeComment, [NoticeComment.of(noticeA, 'commentA', 1, 'userA', Role.LEADER)]);

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.deleteById(commentA.id);
    });

    //then
    await expect(dataSource.manager.findOneByOrFail(NoticeComment, { id: commentA.id })).rejects.toThrowError(
      new EntityNotFoundError(NoticeComment, { id: 1 }),
    );
  });
});
