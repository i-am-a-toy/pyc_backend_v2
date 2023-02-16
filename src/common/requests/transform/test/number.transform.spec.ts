import { BadRequestException } from '@nestjs/common';
import { TransformFnParams } from 'class-transformer';
import { numberTransfrom } from '../number.transform';

describe('numberTransform Test', () => {
  it('Number가 아닌 값이 들어올 경우', () => {
    //given
    const transformFnParams = {
      key: 'offset',
      value: 'foobar',
    } as TransformFnParams;

    //when
    //then
    expect(() => numberTransfrom(transformFnParams)).toThrowError(new BadRequestException(`offset must be Number`));
  });

  it('NumberString이 들어올 경우', () => {
    //given
    const transformFnParams = {
      key: 'offset',
      value: '0',
    } as TransformFnParams;

    //when
    const result = numberTransfrom(transformFnParams);

    //then
    expect(result).toBe(0);
  });
});
