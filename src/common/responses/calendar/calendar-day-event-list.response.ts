import { DayEventDTO } from 'src/common/dto/calendar/day-event.dto';
import { BaseListResponse } from '../common/base-list.response';

export class CalendarDayEventListResponse extends BaseListResponse<DayEventDTO> {
  constructor(dayEvents: DayEventDTO[], count: number) {
    super(dayEvents, count);
  }
}
