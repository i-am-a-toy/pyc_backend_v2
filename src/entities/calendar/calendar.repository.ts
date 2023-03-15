import { Injectable } from '@nestjs/common';
import { getMonthFirstDay, getPrevMonthLastDay } from 'src/common/utils/date';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget, SelectQueryBuilder } from 'typeorm';
import { ICalendarRepository } from './calendar-repository.interface';
import { Calendar } from './calendar.entity';

@Injectable()
export class CalendarRepository extends GenericTypeOrmRepository<Calendar> implements ICalendarRepository {
  getName(): EntityTarget<Calendar> {
    return Calendar.name;
  }

  async findAllByRange(start: Date, end: Date, options?: { offset?: number; limit?: number }): Promise<[Calendar[], number]> {
    return await this.getList(start, end, options);
  }

  async deleteById(id: number): Promise<void> {
    await this.getRepository().delete({ id });
  }

  private async getList(start: Date, end: Date, options?: { offset?: number; limit?: number }): Promise<[Calendar[], number]> {
    return await this.getDefaultSelectQueryBuild(start, end)
      .orderBy('calendar.start', 'ASC')
      .addOrderBy('calendar.end', 'ASC')
      .offset(options?.offset)
      .limit(options?.limit)
      .getManyAndCount();
  }

  private getDefaultSelectQueryBuild(start: Date, end: Date): SelectQueryBuilder<Calendar> {
    return this.getRepository()
      .createQueryBuilder('calendar')
      .orWhere(
        `("calendar"."start" >= :start AND "calendar"."end" <= :end) OR
       ("calendar"."start" <= :start AND :end <= "calendar"."end") OR
       ("calendar"."start" <= :start AND ("calendar"."end" >= :start AND "calendar"."end" <= :end)) OR
       (("calendar"."start" >= :start AND "calendar"."start" <= :end) AND :end <= "calendar"."end")
      `,
        { start, end },
      );
  }
}
