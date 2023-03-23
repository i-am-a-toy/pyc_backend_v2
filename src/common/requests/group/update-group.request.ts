import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateGroupRequest {
  @IsNumber()
  leaderId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
