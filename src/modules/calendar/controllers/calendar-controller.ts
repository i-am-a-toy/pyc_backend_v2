import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { CreateCalendarRequest } from 'src/common/requests/calendar/create-calendar.request';
import { FindCalendarByIdRequest } from 'src/common/requests/calendar/find-calendar-by-id.request';
import { FindCalendarsByMonthRequest } from 'src/common/requests/calendar/find-calendars-by-month.request';
import { FindCalendarsByRange } from 'src/common/requests/calendar/find-calendars-by-range.request';
import { UpdateCalendarRequest } from 'src/common/requests/calendar/update-calendar.request';
import { CalendarDayEventListResponse } from 'src/common/responses/calendar/calendar-day-event-list.response';
import { CalendarListResponse } from 'src/common/responses/calendar/calendar-list-response';
import { CalendarResponse } from 'src/common/responses/calendar/calendar-response';
import { getMonthLastDay } from 'src/common/utils/date';
import { PycContext } from 'src/core/decorator/pyc-context.decorator';
import { CalendarServiceKey, ICalendarService } from '../interfaces/calendar-service.interface';

@Controller('calendars')
export class CalendarController {
  constructor(@Inject(CalendarServiceKey) private readonly service: ICalendarService) {}

  @Get()
  async findCalendarsByRange(@Query() query: FindCalendarsByRange): Promise<CalendarListResponse> {
    const { offset, limit } = query;
    return await this.getCalendarsByRange(query.getStartDate(), query.getEndDate(), offset, limit);
  }

  @Get('/year/:year/month/:month')
  async findCalendarsByMonth(@Param() param: FindCalendarsByMonthRequest): Promise<CalendarListResponse> {
    const start = new Date(`${param.getYear()}-${param.getMonth()}-01`);
    const end = getMonthLastDay(start);

    return await this.getCalendarsByRange(start, end, param.offset, param.limit);
  }

  @Get('/year/:year/month/:month/events')
  async findCalendarEventsByMonth(@Param() param: FindCalendarsByMonthRequest): Promise<CalendarDayEventListResponse> {
    const start = new Date(`${param.getYear()}-${param.getMonth()}-01`);
    const end = getMonthLastDay(start);

    const dayEvents = await this.service.findCalendarDayEvents(start, end);
    return new CalendarDayEventListResponse(dayEvents, dayEvents.length);
  }

  @Get('/:id')
  async findCalendarById(@Param() param: FindCalendarByIdRequest): Promise<CalendarResponse> {
    const calendar = await this.service.findCalendarId(param.id);
    return new CalendarResponse(calendar);
  }

  @Post()
  async register(@PycContext() pycUser: PycUser, @Body() body: CreateCalendarRequest) {
    await this.service.register(pycUser, body.getRange(), body.title, body.content);
  }

  @Put('/:id')
  async modify(
    @PycContext() PycUser: PycUser,
    @Param() param: FindCalendarByIdRequest,
    @Body() body: UpdateCalendarRequest,
  ): Promise<void> {
    await this.service.modify(PycUser, param.id, body.getRange(), body.title, body.content);
  }

  private async getCalendarsByRange(start: Date, end: Date, offset: number, limit: number) {
    const [entities, count] = await this.service.findCalendarsByRange(new Date(start), new Date(end), { offset, limit });
    return new CalendarListResponse(entities, count);
  }
}
