import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoticeRequest {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;
}
