import { Injectable } from '@nestjs/common';
import { getMonthFirstDay, getPrevMonthLastDay } from 'src/common/utils/date';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget } from 'typeorm';
import { ICalendarRepository } from './calendar-repository.interface';
import { Calendar } from './calendar.entity';

@Injectable()
export class CalendarRepository extends GenericTypeOrmRepository<Calendar> implements ICalendarRepository {
  getName(): EntityTarget<Calendar> {
    return Calendar.name;
  }

  findAllByMonth(
    year: number,
    month: number,
    options?: { offset?: number | undefined; limit?: number | undefined } | undefined,
  ): Promise<[Calendar[], number]> {
    const date = new Date(`${year}-${month}-1`);
    const first = getPrevMonthLastDay(date);
    const last = getMonthFirstDay(new Date(date.setMonth(date.getMonth() + 1)));

    return this.getRepository()
      .createQueryBuilder('calendar')
      .orWhere(
        `
          ("calendar"."start" >= :first AND "calendar"."end" <= :last) OR
          ("calendar"."start" <= :first AND :last <= "calendar"."end") OR
          ("calendar"."start" <= :first AND ("calendar"."end" >= :first AND "calendar"."end" <= :last)) OR
          (("calendar"."start" >= :first AND "calendar"."start" <= :last) AND :last <= "calendar"."end")`,
        { first, last },
      )
      .orderBy('calendar.start', 'ASC')
      .addOrderBy('calendar.end', 'ASC')
      .offset(options?.offset)
      .limit(options?.limit)
      .getManyAndCount();
  }

  async deleteById(id: number): Promise<void> {
    await this.getRepository().delete({ id });
  }
}
