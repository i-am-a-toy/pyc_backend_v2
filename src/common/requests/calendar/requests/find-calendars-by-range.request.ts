import { IsDateString } from 'class-validator';
import { ListRequest } from '../../common/list.request';

export class FindCalendarsByRange extends ListRequest {
  @IsDateString()
  readonly start: string;

  @IsDateString()
  readonly end: string;

  getStartDate(): Date {
    return new Date(this.start);
  }

  getEndDate(): Date {
    return new Date(this.end);
  }
}
