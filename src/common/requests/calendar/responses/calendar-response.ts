import { CreatorDTO, LastModifierDTO } from 'src/common/dto/user';
import { Calendar } from 'src/entities/calendar/calendar.entity';

export class CalendarResponse {
  readonly start: Date;
  readonly end: Date;
  readonly isAllDay: boolean;
  readonly title: string;
  readonly content: string;
  readonly creator: CreatorDTO;
  readonly createdAt: Date;
  readonly lastModifier: LastModifierDTO;
  readonly lastModifiedAt: Date;

  constructor(calendar: Calendar) {
    this.start = calendar.range.start;
    this.end = calendar.range.end;
    this.isAllDay = calendar.range.isAllDay;
    this.title = calendar.title;
    this.content = calendar.content;
    this.creator = new CreatorDTO(calendar.creator.id, calendar.creator.role.enumName, calendar.creator.name);
    this.createdAt = calendar.createdAt;
    this.lastModifier = new LastModifierDTO(calendar.lastModifier.id, calendar.lastModifier.name, calendar.lastModifier.role.name);
    this.lastModifiedAt = calendar.lastModifiedAt;
  }
}
