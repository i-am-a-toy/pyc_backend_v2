import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { Calendar } from './calendar.entity';

export const CalendarRepositoryKey = 'CalendarRepositoryKey';

export interface ICalendarRepository extends GenericRepository<Calendar> {}
