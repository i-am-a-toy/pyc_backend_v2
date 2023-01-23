import { Gender } from 'src/common/types/gender/gender.type';
import { ValueTransformer } from 'typeorm';

export class GenderTransformer implements ValueTransformer {
  to(value: Gender): string {
    return value.gender;
  }

  from(gender: string): Gender | null {
    if (!gender) return null;
    return Gender.valueByName(gender);
  }
}
