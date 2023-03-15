import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { numberTransform } from '../../transform/number.transform';

export class FindCalendarByIdRequest {
  @IsNumber()
  @Transform(numberTransform)
  readonly id: number;
}
