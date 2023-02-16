import { Role } from 'src/common/types/role/role.type';
import { BaseTimeEntity } from 'src/core/database/typeorm/base-time.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Notice } from '../notice/notice.entity';
import { CreatorVO } from '../vo/creator.vo';
import { LastModifierVO } from '../vo/last-modifier.vo';

@Entity({ name: 'notice_comments' })
export class NoticeComment extends BaseTimeEntity {
  @Column({ name: 'notice_id', type: 'bigint', nullable: false })
  noticeId: number;

  @ManyToOne(() => Notice, { nullable: false, cascade: ['remove'] })
  @JoinColumn({ name: 'notice_id', referencedColumnName: 'id' })
  notice: Notice;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column(() => CreatorVO, { prefix: false })
  creator: CreatorVO;

  @Column(() => LastModifierVO, { prefix: false })
  lastModifier: LastModifierVO;

  static of(notice: Notice, content: string, userId: number, userName: string, userRole: Role): NoticeComment {
    const e = new NoticeComment();
    e.notice = notice;
    e.content = content;
    e.creator = new CreatorVO(userId, userName, userRole);
    e.lastModifier = new LastModifierVO(userId, userName, userRole);
    return e;
  }

  update(comment: string, userId: number, userName: string, userRole: Role) {
    this.content = comment;
    this.lastModifier = new LastModifierVO(userId, userName, userRole);
  }
}
