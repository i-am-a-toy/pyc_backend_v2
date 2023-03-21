import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseTimeEntity } from '../../core/database/typeorm/base-time.entity';
import { BigintTransformer } from '../../core/database/typeorm/transformer';
import { User } from '../user/user.entity';

@Entity({ name: 'groups' })
export class Group extends BaseTimeEntity {
  @Column({ name: 'leader_id', type: 'bigint', nullable: false, comment: '리더 ID', transformer: new BigintTransformer() })
  leaderId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'leader_id', referencedColumnName: 'id' })
  leader!: User;

  @Column({ type: 'varchar', nullable: false, comment: '그룹 명' })
  name!: string;

  @Column({ type: 'bigint', nullable: false, comment: '생성자', transformer: new BigintTransformer() })
  createdBy!: number;

  @Column({ type: 'bigint', nullable: false, comment: '수정자', transformer: new BigintTransformer() })
  lastModifiedBy!: number;

  static create(leader: User, name: string, creatorId: number): Group {
    const group = new Group();
    group.leader = leader;
    group.name = name;
    group.createdBy = creatorId;
    group.lastModifiedBy = creatorId;
    return group;
  }
}
