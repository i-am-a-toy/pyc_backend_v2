import { BadRequestException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';

export const numberTransform = (param: TransformFnParams): number => {
  const { key, value } = param;

  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) throw new BadRequestException(`${key} must be Number`);
  return numberValue;
};
