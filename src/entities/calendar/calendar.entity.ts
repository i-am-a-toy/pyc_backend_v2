import { Role } from 'src/common/types/role/role.type';
import { BaseTimeEntity } from 'src/core/database/typeorm/base-time.entity';
import { Column, Entity } from 'typeorm';
import { CreatorVO } from '../vo/creator.vo';
import { FromToVO } from '../vo/from-to.vo';
import { LastModifierVO } from '../vo/last-modifier.vo';

@Entity({ name: 'calendars' })
export class Calendar extends BaseTimeEntity {
  @Column(() => FromToVO, { prefix: false })
  range!: FromToVO;

  @Column({ type: 'varchar', nullable: false })
  title!: string;

  @Column({ type: 'varchar', nullable: false })
  content!: string;

  @Column(() => CreatorVO, { prefix: false })
  creator!: CreatorVO;

  @Column(() => LastModifierVO, { prefix: false })
  lastModifier!: LastModifierVO;

  static of(
    start: Date,
    end: Date,
    isAllDay: boolean,
    title: string,
    content: string,
    userId: number,
    userName: string,
    userRole: Role,
  ): Calendar {
    const e = new Calendar();
    e.range = new FromToVO(start, end, isAllDay);
    e.title = title;
    e.content = content;
    e.creator = new CreatorVO(userId, userName, userRole);
    e.lastModifier = new LastModifierVO(userId, userName, userRole);
    return e;
  }

  updateCalendar(
    start: Date,
    end: Date,
    isAllDay: boolean,
    title: string,
    content: string,
    userId: number,
    userName: string,
    userRole: Role,
  ) {
    this.range = new FromToVO(start, end, isAllDay);
    this.title = title;
    this.content = content;
    this.lastModifier = new LastModifierVO(userId, userName, userRole);
  }
}
