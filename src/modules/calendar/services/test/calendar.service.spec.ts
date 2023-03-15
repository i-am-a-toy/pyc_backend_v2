import { NotFoundException } from '@nestjs/common';
import { createNamespace, destroyNamespace, Namespace } from 'cls-hooked';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { ENTITY_NOT_FOUND } from 'src/common/dto/error/error-code.dto';
import { FromToDTO } from 'src/common/dto/from-to/from-to.dto';
import { Role } from 'src/common/types/role/role.type';
import { TransactionManager } from 'src/core/database/typeorm/transaction-manager';
import { ServiceException } from 'src/core/exception/service.exception';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { Calendar } from 'src/entities/calendar/calendar.entity';
import { CalendarRepository } from 'src/entities/calendar/calendar.repository';
import { CreatorVO } from 'src/entities/vo/creator.vo';
import { LastModifierVO } from 'src/entities/vo/last-modifier.vo';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';
import { DataSource, EntityManager, EntityNotFoundError } from 'typeorm';
import { ICalendarService } from '../../interfaces/calendar-service.interface';
import { CalendarService } from '../calendar.service';

describe('Calendar Service', () => {
  jest.setTimeout(300_000);

  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let service: ICalendarService;
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
      entities: [Calendar],
    }).initialize();

    const txManager = new TransactionManager();
    const calendarRepository = new CalendarRepository(txManager);
    service = new CalendarService(calendarRepository);
  });

  beforeEach(() => {
    namespace = createNamespace(PYC_NAMESPACE);
  });

  afterEach(async () => {
    await dataSource.query(`TRUNCATE TABLE calendars;`);
    await dataSource.query(`ALTER SEQUENCE calendars_id_seq RESTART WITH 1;`);
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

  it('register', async () => {
    //given
    const pycUser: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    const title = 'titleA';
    const content = 'contentA';
    const start = new Date('2023-02-21');
    const end = new Date('2023-02-25');
    const isAllDay = true;
    const range = new FromToDTO(start, end, isAllDay);

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.register(pycUser, range, title, content);
    });

    //then
    const calendar = await dataSource.manager.findOneByOrFail(Calendar, { id: 1 });
    expect(calendar.title).toBe('titleA');
    expect(calendar.content).toBe('contentA');
    expect(calendar.range.start).toStrictEqual(new Date('2023-02-21'));
    expect(calendar.range.end).toStrictEqual(new Date('2023-02-25'));
    expect(calendar.range.isAllDay).toBe(true);
    expect(calendar.creator).toStrictEqual(new CreatorVO(1, 'userA', Role.LEADER));
    expect(calendar.lastModifier).toStrictEqual(new LastModifierVO(1, 'userA', Role.LEADER));
  });

  it('findCalendarsByRange - 조회결과가 없을 때', async () => {
    //given
    const start = new Date('2023-03-14');
    const end = new Date('2023-03-15');

    //when
    const [calendars, count] = await namespace.runAndReturn<Promise<[Calendar[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.findCalendarsByRange(start, end);
    });

    //then
    expect(calendars).toStrictEqual([]);
    expect(count).toBe(0);
  });

  it('findCalendarsByRange - 일정의 Start, End가 요청 range 안에 포함될 때', async () => {
    //given
    const start = new Date('2023-02-01');
    const end = new Date('2023-02-28');

    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-02-21'), new Date('2023-02-25'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-03-01'), new Date('2023-03-31'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
    ]);

    //when
    const [calendars, count] = await namespace.runAndReturn<Promise<[Calendar[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.findCalendarsByRange(start, end);
    });

    //then
    const [selectedCalendarA] = calendars;
    expect(selectedCalendarA.title).toBe('titleA');
    expect(count).toBe(1);
  });

  it('findCalendarsByRange - 일정의 Start, End가 요청 range를 포함할 때', async () => {
    //given
    const start = new Date('2023-02-01');
    const end = new Date('2023-02-28');

    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-01-21'), new Date('2023-01-25'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-01-25'), new Date('2023-03-31'), true, 'titleB', 'contentB', creator.userId, creator.name, creator.role),
    ]);

    //when
    const [calendars, count] = await namespace.runAndReturn<Promise<[Calendar[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.findCalendarsByRange(start, end);
    });

    //then
    const [selectedCalendarA] = calendars;
    expect(selectedCalendarA.title).toBe('titleB');
    expect(count).toBe(1);
  });

  it('findCalendarsByRange - 일정의 start가 요청 Range 밖에 있고 end는 요청 Range 안에 있을 때', async () => {
    //given
    const start = new Date('2023-02-01');
    const end = new Date('2023-02-28');

    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-01-21'), new Date('2023-01-25'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-01-25'), new Date('2023-02-25'), true, 'titleB', 'contentB', creator.userId, creator.name, creator.role),
    ]);

    //when
    const [calendars, count] = await namespace.runAndReturn<Promise<[Calendar[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.findCalendarsByRange(start, end);
    });

    //then
    const [selectedCalendarA] = calendars;
    expect(selectedCalendarA.title).toBe('titleB');
    expect(count).toBe(1);
  });

  it('findCalendarsByRange - 일정의 end가 요청 Range 밖에 있고 start는 요청 Range 안에 있을 때', async () => {
    //given
    const start = new Date('2023-02-01');
    const end = new Date('2023-02-28');

    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-01-21'), new Date('2023-01-25'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-02-25'), new Date('2023-03-25'), true, 'titleB', 'contentB', creator.userId, creator.name, creator.role),
    ]);

    //when
    const [calendars, count] = await namespace.runAndReturn<Promise<[Calendar[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.findCalendarsByRange(start, end);
    });

    //then
    const [selectedCalendarA] = calendars;
    expect(selectedCalendarA.title).toBe('titleB');
    expect(count).toBe(1);
  });

  it('findCalendarsByRange - 4가지 경우의 수 포함 및 Order Test', async () => {
    //given
    const start = new Date('2023-02-01');
    const end = new Date('2023-02-28');

    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-02-03'), new Date('2023-02-10'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-01-20'), new Date('2023-03-25'), true, 'titleB', 'contentB', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-01-25'), new Date('2023-02-25'), true, 'titleC', 'contentC', creator.userId, creator.name, creator.role),
      Calendar.of(new Date('2023-02-25'), new Date('2023-03-25'), true, 'titleD', 'contentD', creator.userId, creator.name, creator.role),
    ]);

    //when
    const [calendars, count] = await namespace.runAndReturn<Promise<[Calendar[], number]>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return await service.findCalendarsByRange(start, end);
    });

    //then
    const [selectedB, selectedC, selectedA, selectedD] = calendars;
    expect(selectedB.title).toBe('titleB');
    expect(selectedC.title).toBe('titleC');
    expect(selectedA.title).toBe('titleA');
    expect(selectedD.title).toBe('titleD');
    expect(count).toBe(4);
  });

  it('findCalendarId - 존재하지 않는 경우', () => {
    //given
    const id = 1;

    //when
    //then
    expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.findCalendarId(id);
      }),
    ).rejects.toThrowError(new ServiceException(ENTITY_NOT_FOUND, '일정을 찾을 수 없습니다.'));
  });

  it('findCalendarId - success', async () => {
    //given
    const pycUser: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    const [calendarA] = await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-02-21'), new Date('2023-02-25'), true, 'titleA', 'contentA', pycUser.userId, pycUser.name, pycUser.role),
    ]);

    //when
    const calendar = await namespace.runAndReturn<Promise<Calendar>>(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      return service.findCalendarId(calendarA.id);
    });

    //then
    expect(calendar.title).toBe('titleA');
    expect(calendar.content).toBe('contentA');
    expect(calendar.range.start).toStrictEqual(new Date('2023-02-21'));
    expect(calendar.range.end).toStrictEqual(new Date('2023-02-25'));
    expect(calendar.range.isAllDay).toBe(true);
    expect(calendar.creator).toStrictEqual(new CreatorVO(1, 'userA', Role.LEADER));
    expect(calendar.lastModifier).toStrictEqual(new LastModifierVO(1, 'userA', Role.LEADER));
  });

  it('modify - 일정이 존재하지 않을 때', () => {
    //given
    const id = 1;
    const pycUser: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    const title = 'titleA';
    const content = 'contentA';
    const start = new Date('2023-02-21');
    const end = new Date('2023-02-25');
    const isAllDay = true;
    const range = new FromToDTO(start, end, isAllDay);

    //when
    //then
    expect(
      namespace.runPromise(async () => {
        namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
        await service.modify(pycUser, id, range, title, content);
      }),
    ).rejects.toThrowError(new ServiceException(ENTITY_NOT_FOUND, '일정을 찾을 수 없습니다.'));
  });

  it('modify - Success', async () => {
    //given
    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    const [calendarA] = await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-02-21'), new Date('2023-02-25'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
    ]);

    const lastModifier: PycUser = { id: 'id', userId: 2, name: 'userB', role: Role.PASTOR };
    const title = 'change';
    const content = 'change';
    const start = new Date('2023-02-26');
    const end = new Date('2023-02-28');
    const isAllDay = false;
    const range = new FromToDTO(start, end, isAllDay);

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.modify(lastModifier, calendarA.id, range, title, content);
    });

    //then
    const updated = await dataSource.manager.findOneByOrFail(Calendar, { id: 1 });
    expect(updated.title).toBe('change');
    expect(updated.content).toBe('change');
    expect(updated.range.start).toStrictEqual(new Date('2023-02-26'));
    expect(updated.range.end).toStrictEqual(new Date('2023-02-28'));
    expect(updated.range.isAllDay).toBe(false);
    expect(updated.lastModifier).toStrictEqual(new LastModifierVO(2, 'userB', Role.PASTOR));
  });

  it('deleteById - 일정이 존재하지 않을 때', async () => {
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

  it('deleteById - Success', async () => {
    //given
    const creator: PycUser = { id: 'id', userId: 1, name: 'userA', role: Role.LEADER };
    const [calendarA] = await dataSource.manager.save(Calendar, [
      Calendar.of(new Date('2023-02-21'), new Date('2023-02-25'), true, 'titleA', 'contentA', creator.userId, creator.name, creator.role),
    ]);

    //when
    await namespace.runPromise(async () => {
      namespace.set<EntityManager>(PYC_ENTITY_MANAGER, dataSource.createEntityManager());
      await service.deleteById(calendarA.id);
    });

    //then
    await expect(dataSource.manager.findOneByOrFail(Calendar, { id: 1 })).rejects.toThrowError(
      new EntityNotFoundError(Calendar, { id: 1 }),
    );
  });
});
