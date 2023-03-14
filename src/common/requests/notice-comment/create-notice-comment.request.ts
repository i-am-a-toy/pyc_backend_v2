import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoticeCommentRequest {
  @IsString()
  @IsNotEmpty()
  comment: string;
}
