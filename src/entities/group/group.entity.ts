import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from '../../common/types/role/role.type';
import { BaseTimeEntity } from '../../core/database/typeorm/base-time.entity';
import { BigintTransformer } from '../../core/database/typeorm/transformer';
import { User } from '../user/user.entity';

@Entity({ name: 'groups' })
export class Group extends BaseTimeEntity {
  @Column({ name: 'leader_id', type: 'bigint', nullable: false, comment: '리더 ID', transformer: new BigintTransformer() })
  leaderId!: number;

  @ManyToOne(() => User, { nullable: false, cascade: ['insert', 'update', 'remove'] })
  @JoinColumn({ name: 'leader_id', referencedColumnName: 'id' })
  leader!: User;

  @Column({ type: 'varchar', nullable: false, comment: '그룹 명' })
  name!: string;

  @Column({ type: 'bigint', nullable: false, comment: '생성자', transformer: new BigintTransformer() })
  createdBy!: number;

  @Column({ type: 'bigint', nullable: false, comment: '수정자', transformer: new BigintTransformer() })
  lastModifiedBy!: number;

  /**
   * openCeremony
   *
   * @description: 그룹의 리더에게 {@link Role.GROUP_LEADER}를 임명
   * TODO: 그룹 리더가 셀리더인지 여부 판단하여 추가적인 로직 필요
   */
  static openCeremony(leader: User, name: string, creatorId: number): Group {
    const group = new Group();
    group.leader = leader;
    group.name = name;
    group.createdBy = creatorId;
    group.lastModifiedBy = creatorId;

    leader.appoint(Role.GROUP_LEADER);
    return group;
  }

  /**
   * changeLeader
   *
   * @description: 이전 리더의 Role을 변경하고 새로운 리더에게 {@link Role.GROUP_LEADER}를 임명
   * TODO: 이전 리더가 셀리더인지 여부 판단하여 추가적인 로직 필요
   */
  changeLeader(newLeader: User, name: string, modifierId: number): void {
    this.leader.appoint(Role.MEMBER);
    newLeader.appoint(Role.GROUP_LEADER);
    this.name = name;
    this.lastModifiedBy = modifierId;
  }
}
