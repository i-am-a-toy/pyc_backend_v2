import { Rank } from 'src/common/types/rank/rank.type';
import { ValueTransformer } from 'typeorm';

export class RankTransformer implements ValueTransformer {
  to(value: Rank): string {
    return value.rank;
  }

  from(value: string): Rank | null {
    if (!value) return null;
    return Rank.valueByName(value);
  }
}
