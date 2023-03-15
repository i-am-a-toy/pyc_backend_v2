import { Module } from '@nestjs/common';
import { ClassProvider } from '@nestjs/common/interfaces/modules';
import { CalendarRepositoryKey } from './calendar-repository.interface';
import { CalendarRepository } from './calendar.repository';

const calendarRepository: ClassProvider = {
  provide: CalendarRepositoryKey,
  useClass: CalendarRepository,
};

@Module({
  providers: [calendarRepository],
  exports: [calendarRepository],
})
export class CalendarRepositoryModule {}
