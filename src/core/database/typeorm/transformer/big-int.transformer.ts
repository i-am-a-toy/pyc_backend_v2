import { ValueTransformer } from 'typeorm';

export class BigintTransformer implements ValueTransformer {
  to(value: string): number {
    return Number(value);
  }
  from(value: number): string {
    return value.toString();
  }
}
