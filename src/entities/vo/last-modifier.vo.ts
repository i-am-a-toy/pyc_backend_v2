import { Role } from 'src/common/types/role/role.type';
import { BigintTransformer, RoleTransformer } from 'src/core/database/typeorm/transformer';
import { Column } from 'typeorm';

export class LastModifierVO {
  @Column({ name: 'last_modifier_id', type: 'bigint', nullable: false, transformer: new BigintTransformer() })
  id: number;

  @Column({ name: 'last_modifier_name', type: 'varchar', nullable: false })
  name: string;

  @Column({ name: 'last_modifier_role', type: 'varchar', nullable: false, transformer: new RoleTransformer() })
  role: Role;

  constructor(id: number, name: string, role: Role) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}
