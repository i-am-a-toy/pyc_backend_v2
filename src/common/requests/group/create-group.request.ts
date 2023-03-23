import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGroupRequest {
  @IsNumber()
  leaderId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
