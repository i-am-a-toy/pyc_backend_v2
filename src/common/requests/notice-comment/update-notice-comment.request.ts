import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNoticeCommentRequest {
  @IsString()
  @IsNotEmpty()
  readonly comment: string;
}
