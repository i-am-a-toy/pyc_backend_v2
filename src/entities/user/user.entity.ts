import { compareSync } from 'bcrypt';
import { Gender } from 'src/common/types/gender/gender.type';
import { Rank } from 'src/common/types/rank/rank.type';
import { Role } from 'src/common/types/role/role.type';
import { BaseTimeEntity } from 'src/core/database/typeorm/base-time.entity';
import { GenderTransformer, RankTransformer, RoleTransformer } from 'src/core/database/typeorm/transformer';
import { Column, DeleteDateColumn, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Cell } from '../cell/cell.entity';
import { AddressVO } from '../vo/address.vo';

@Entity({ name: 'users' })
export class User extends BaseTimeEntity {
  @Column({ name: 'cell_id', nullable: true, type: 'integer', comment: '사용자가 속한 셀 ID' })
  cellId: number | null;

  @ManyToOne(() => Cell)
  @JoinColumn({ name: 'cell_id' })
  cell: Cell | null;

  @Column({ type: 'varchar', nullable: false, transformer: new RoleTransformer() })
  role!: Role;

  @Column({ type: 'varchar', nullable: false, transformer: new GenderTransformer() })
  gender!: Gender;

  @Column({ type: 'varchar', nullable: false, transformer: new RankTransformer() })
  rank!: Rank;

  @Column({ type: 'varchar', nullable: false, unique: true })
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({ type: 'integer', nullable: true })
  age: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  birth: Date | null;

  @Column(() => AddressVO, { prefix: false })
  address: AddressVO;

  @Column({ type: 'boolean', nullable: false })
  isLongAbsence!: boolean;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  isValidPassword(password: string): boolean {
    return compareSync(password, this.password!);
  }

  updatePassword(password: string): void {
    this.password = password;
  }
}
