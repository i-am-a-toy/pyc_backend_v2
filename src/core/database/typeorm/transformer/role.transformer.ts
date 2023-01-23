import { Role } from 'src/common/types/role/role.type';
import { ValueTransformer } from 'typeorm';

export class RoleTransformer implements ValueTransformer {
  to(value: Role): string {
    return value.enumName;
  }

  from(value: string): Role | null {
    if (!value) return null;
    return Role.valueByName(value);
  }
}
