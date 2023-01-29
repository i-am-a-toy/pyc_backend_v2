import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordRequest {
  @IsString()
  @IsNotEmpty()
  readonly prevPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}
