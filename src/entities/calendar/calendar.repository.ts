import { Injectable } from '@nestjs/common';
import { getMonthLastDay, getPrevMonthLastDay } from 'src/common/utils/date';
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
    const last = getMonthLastDay(date);

    return this.getRepository()
      .createQueryBuilder('calendar')
      .orWhere(
        `
        ("calendar"."start" >= :first AND "calendar"."end" <= :last) OR -- 월 안에 있는
        ("calendar"."start" <= :first AND :last <= "calendar"."end") OR -- start end 둘다 월 밖에 있을 경우
        ("calendar"."start" <= :first AND ("calendar"."end" >= :first AND "calendar"."end" <= :last)) OR -- start는 월 밖에 end는 월 안에
        (("calendar"."start" >= :first AND "calendar"."start" <= :last) AND :last <= "calendar"."end") -- start는 월 안에 end는 월 밖에
      )`,
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
