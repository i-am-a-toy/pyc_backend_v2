import { Enum, EnumType } from 'ts-jenum';

@Enum('gender')
export class Gender extends EnumType<Gender>() {
  static readonly MALE = new Gender(1, 'MALE', '남성');
  static readonly FEMALE = new Gender(2, 'FEMALE', '여성');
  static readonly NONE = new Gender(3, 'NONE', '선택안함');

  private constructor(readonly code: number, readonly gender: string, readonly name: string) {
    super();
  }
}
