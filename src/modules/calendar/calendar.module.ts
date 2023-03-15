import { ClassProvider, Module } from '@nestjs/common';
import { CalendarRepositoryModule } from 'src/entities/calendar/calendar-repository.module';
import { CalendarController } from './controllers/calendar-controller';
import { CalendarServiceKey } from './interfaces/calendar-service.interface';
import { CalendarService } from './services/calendar.service';

export const calendarService: ClassProvider = {
  provide: CalendarServiceKey,
  useClass: CalendarService,
};

@Module({
  imports: [CalendarRepositoryModule],
  providers: [calendarService],
  exports: [calendarService],
  controllers: [CalendarController],
})
export class CalendarModule {}
