import { User } from 'src/entities/user/user.entity';

export class UserResponse {
  readonly id: number;
  readonly cellId: number | null;
  readonly role: string;
  readonly gender: string;
  readonly rank: string;
  readonly name: string;
  readonly age: number | null;
  readonly birth: Date | null;
  readonly zipCode: string | null;
  readonly address: string | null;
  readonly isLongAbsence: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.cellId = user.cell?.id ?? null;
    this.role = user.role.name;
    this.gender = user.gender.name;
    this.rank = user.rank.name;
    this.age = user.age;
    this.birth = user.birth;
    this.zipCode = user.address.zipCode;
    this.address = user.address.address;
    this.isLongAbsence = user.isLongAbsence;
  }
}
