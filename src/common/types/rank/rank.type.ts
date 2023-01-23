import { Enum, EnumType } from 'ts-jenum';

@Enum('rank')
export class Rank extends EnumType<Rank>() {
  static readonly INCOMING = new Rank(1, 'INCOMING', '원입');
  static readonly INFANT_BAPTISM = new Rank(2, 'INFANT_BAPTISM', '유아세례');
  static readonly ADMISSION = new Rank(3, 'ADMISSION', '입교');
  static readonly NONE = new Rank(4, 'NONE', '선택안함');

  private constructor(readonly code: number, readonly rank: string, readonly name: string) {
    super();
  }
}
