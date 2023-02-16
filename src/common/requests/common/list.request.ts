import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { numberTransfrom } from '../transform/number.transform';

export abstract class ListRequest {
  @IsNumber()
  @Transform(numberTransfrom)
  readonly offset: number = 0;

  @IsNumber()
  @Transform(numberTransfrom)
  readonly limit: number = 20;
}
