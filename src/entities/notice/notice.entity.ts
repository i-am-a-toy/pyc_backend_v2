import { Role } from 'src/common/types/role/role.type';
import { BaseTimeEntity } from 'src/core/database/typeorm/base-time.entity';
import { Column, Entity } from 'typeorm';
import { CreatorVO } from '../vo/creator.vo';
import { LastModifierVO } from '../vo/last-modifier.vo';

@Entity({ name: 'notices' })
export class Notice extends BaseTimeEntity {
  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column(() => CreatorVO, { prefix: false })
  creator: CreatorVO;

  @Column(() => LastModifierVO, { prefix: false })
  lastModifier: LastModifierVO;

  static of(title: string, content: string, userId: number, userName: string, userRole: Role): Notice {
    const e = new Notice();
    e.title = title;
    e.content = content;
    e.creator = new CreatorVO(userId, userName, userRole);
    e.lastModifier = new LastModifierVO(userId, userName, userRole);
    return e;
  }

  updateNotice(title: string, content: string, userId: number, userName: string, userRole: Role): void {
    this.title = title;
    this.content = content;
    this.lastModifier = new LastModifierVO(userId, userName, userRole);
  }
}
