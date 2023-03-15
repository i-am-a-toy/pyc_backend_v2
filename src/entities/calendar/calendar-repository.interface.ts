import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { Calendar } from './calendar.entity';

export const CalendarRepositoryKey = 'CalendarRepositoryKey';

export interface ICalendarRepository extends GenericRepository<Calendar> {
  findAllByRange(start: Date, end: Date, options?: { offset?: number; limit?: number }): Promise<[Calendar[], number]>;
  deleteById(id: number): Promise<void>;
}
