import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { FromToDTO } from 'src/common/dto/from-to/from-to.dto';
import { Calendar } from 'src/entities/calendar/calendar.entity';

export const CalendarServiceKey = 'CalendarServiceKey';

export interface ICalendarService {
  // C
  register(pycUser: PycUser, range: FromToDTO, title: string, content: string): Promise<void>;

  // R
  findCalendarsByMonth(year: number, month: number, options?: { offset: number; limit: number }): Promise<[Calendar[], number]>;
  findCalendarId(id: number): Promise<Calendar>;

  // U
  modify(pycUser: PycUser, id: number, range: FromToDTO, title: string, content: string): Promise<void>;

  // D
  deleteById(id: number): Promise<void>;
}
