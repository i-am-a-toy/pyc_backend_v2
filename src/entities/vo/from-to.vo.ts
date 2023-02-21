import { Column } from 'typeorm';

export class FromToVO {
  @Column({ type: 'timestamptz', nullable: false })
  start!: Date;

  @Column({ type: 'timestamptz', nullable: false })
  end!: Date;

  @Column({ name: 'is_all_day', type: 'boolean', nullable: false, default: true })
  isAllDay!: boolean;

  constructor(start: Date, end: Date, isAllDay: boolean) {
    this.start = start;
    this.end = end;
    this.isAllDay = isAllDay;
  }
}
