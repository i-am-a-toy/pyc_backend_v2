import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { numberTransform } from '../transform/number.transform';

export abstract class ListRequest {
  @IsNumber()
  @Transform(numberTransform)
  readonly offset: number = 0;

  @IsNumber()
  @Transform(numberTransform)
  readonly limit: number = 20;
}
