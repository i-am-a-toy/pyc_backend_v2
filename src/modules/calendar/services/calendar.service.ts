import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { FromToDTO } from 'src/common/dto/from-to/from-to.dto';
import { CalendarRepositoryKey, ICalendarRepository } from 'src/entities/calendar/calendar-repository.interface';
import { Calendar } from 'src/entities/calendar/calendar.entity';
import { ICalendarService } from '../interfaces/calendar-service.interface';

@Injectable()
export class CalendarService implements ICalendarService {
  private readonly logger: Logger;
  constructor(@Inject(CalendarRepositoryKey) private readonly repository: ICalendarRepository) {}

  async register(pycUser: PycUser, range: FromToDTO, title: string, content: string): Promise<void> {
    const { userId, name, role } = pycUser;
    await this.repository.save(Calendar.of(range.start, range.end, range.isAllDay, title, content, userId, name, role));
  }

  async findCalendarsByMonth(year: number, month: number, options?: { offset: number; limit: number }): Promise<[Calendar[], number]> {
    return await this.repository.findAllByMonth(year, month, options);
  }

  async findCalendarId(id: number): Promise<Calendar> {
    return await this.findById(id);
  }

  async modify(pycUser: PycUser, id: number, range: FromToDTO, title: string, content: string): Promise<void> {
    const calendar = await this.findById(id);
    const { userId, name, role } = pycUser;
    calendar.updateCalendar(range.start, range.end, range.isAllDay, title, content, userId, name, role);
    await this.repository.save(calendar);
  }

  async deleteById(id: number): Promise<void> {
    await this.repository.deleteById(id);
  }

  private async findById(id: number): Promise<Calendar> {
    const calendar = await this.repository.findById(id);
    if (!calendar) {
      this.logger.warn(`Could not find calendar with Id: ${id}`);
      throw new NotFoundException('일정을 찾을 수 없습니다.');
    }
    return calendar;
  }
}
