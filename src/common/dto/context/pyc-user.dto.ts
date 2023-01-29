import { Role } from 'src/common/types/role/role.type';

export class PycUser {
  constructor(readonly id: string, readonly userId: number, readonly name: string, readonly role: Role) {}
}
