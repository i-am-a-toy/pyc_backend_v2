import { Inject, Injectable, Logger } from '@nestjs/common';
import { DayEventDTO } from 'src/common/dto/calendar/day-event.dto';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { ENTITY_NOT_FOUND } from 'src/common/dto/error/error-code.dto';
import { FromToDTO } from 'src/common/dto/from-to/from-to.dto';
import { getDateString, getMonthString } from 'src/common/utils/date';
import { Transactional } from 'src/core/decorator/transactional.decorator';
import { ServiceException } from 'src/core/exception/service.exception';
import { CalendarRepositoryKey, ICalendarRepository } from 'src/entities/calendar/calendar-repository.interface';
import { Calendar } from 'src/entities/calendar/calendar.entity';
import { ICalendarService } from '../interfaces/calendar-service.interface';

@Injectable()
export class CalendarService implements ICalendarService {
  private readonly logger: Logger = new Logger(CalendarService.name);
  constructor(@Inject(CalendarRepositoryKey) private readonly repository: ICalendarRepository) {}

  @Transactional()
  async register(pycUser: PycUser, range: FromToDTO, title: string, content: string): Promise<void> {
    const { userId, name, role } = pycUser;
    await this.repository.save(Calendar.of(range.start, range.end, range.isAllDay, title, content, userId, name, role));
  }

  async findCalendarsByRange(
    start: Date,
    end: Date,
    options?: { offset: number; limit: number } | undefined,
  ): Promise<[Calendar[], number]> {
    return await this.repository.findAllByRange(start, end, options);
  }

  async findCalendarId(id: number): Promise<Calendar> {
    return await this.findById(id);
  }

  async findCalendarDayEvents(start: Date, end: Date): Promise<DayEventDTO[]> {
    const [calendars] = await this.repository.findAllByRange(start, end);

    const dateMap: Map<Date, boolean> = new Map();
    for (let i = start.getDate(); i <= end.getDate(); i++) {
      const date = new Date(`${start.getFullYear()}-${getMonthString(start.getMonth())}-${getDateString(i)}`);
      dateMap.set(date, !!calendars.find((c) => c.range.start <= date && c.range.end >= date));
    }

    return Array.from(dateMap).map((e) => {
      const [date, isExist] = e;
      return new DayEventDTO(date, isExist);
    });
  }

  @Transactional()
  async modify(pycUser: PycUser, id: number, range: FromToDTO, title: string, content: string): Promise<void> {
    const calendar = await this.findById(id);
    const { userId, name, role } = pycUser;
    calendar.updateCalendar(range.start, range.end, range.isAllDay, title, content, userId, name, role);
    await this.repository.save(calendar);
  }

  @Transactional()
  async deleteById(id: number): Promise<void> {
    await this.repository.deleteById(id);
  }

  private async findById(id: number): Promise<Calendar> {
    const calendar = await this.repository.findById(id);
    if (!calendar) {
      this.logger.warn(`Could not find calendar with Id: ${id}`);
      throw new ServiceException(ENTITY_NOT_FOUND, '일정을 찾을 수 없습니다.');
    }
    return calendar;
  }
}
