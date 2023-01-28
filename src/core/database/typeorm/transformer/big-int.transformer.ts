import { ValueTransformer } from 'typeorm';

export class BigintTransformer implements ValueTransformer {
  to(value: number): string {
    return value.toString();
  }

  from(value: string): number {
    return Number(value);
  }
}
