import { IsBoolean, IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { FromToDTO } from 'src/common/dto/from-to/from-to.dto';

export class UpdateCalendarRequest {
  @IsDateString()
  readonly start: string;

  @IsDateString()
  readonly end: string;

  @IsBoolean()
  readonly isAllDay: boolean;

  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @IsNotEmpty()
  readonly content: string;

  getRange(): FromToDTO {
    return new FromToDTO(new Date(this.start), new Date(this.end), this.isAllDay);
  }
}
