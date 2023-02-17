import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget } from 'typeorm';
import { ICalendarRepository } from './calendar-repository.interface';
import { Calendar } from './calendar.entity';

@Injectable()
export class CalendarRepository extends GenericTypeOrmRepository<Calendar> implements ICalendarRepository {
  getName(): EntityTarget<Calendar> {
    return Calendar.name;
  }
}
