import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNoticeRequest {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;
}
