export class DayEventDTO {
  readonly day: Date;
  readonly isExist: boolean;

  constructor(day: Date, isExist: boolean) {
    this.day = day;
    this.isExist = isExist;
  }
}
