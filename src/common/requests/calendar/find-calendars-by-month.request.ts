import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { ListRequest } from '../common/list.request';
import { numberTransform } from '../transform/number.transform';

export class FindCalendarsByMonthRequest extends ListRequest {
  @IsNumber()
  @Transform(numberTransform)
  readonly year: number;

  @IsNumber()
  @Transform(numberTransform)
  readonly month: number;

  getYear(): string {
    return this.year.toString();
  }

  getMonth(): string {
    if (this.month < 10) {
      return `0${this.month}`;
    }
    return this.month.toString();
  }
}
