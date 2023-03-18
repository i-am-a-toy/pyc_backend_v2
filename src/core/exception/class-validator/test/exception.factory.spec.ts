import { ValidationError } from 'class-validator';
import { InvalidRequestBodyException } from '../../service.exception';
import { ClassValidatorExceptionFactory } from '../exception.factory';

describe('ClassValidatorExceptionFactory Test', () => {
  const factory = new ClassValidatorExceptionFactory();

  it('인자로 넘어온 Errors가 빈 배열인 경우', () => {
    //given
    const errors: ValidationError[] = [];

    //when
    //then
    expect(() => factory.throw()(errors)).not.toThrowError();
  });

  it('인자로 넘어온 Errors가 존재하는 경우', () => {
    //given
    const errors: ValidationError[] = [
      {
        property: 'foobar',
        constraints: {
          isString: 'foobar must be string',
        },
      },
    ];

    //when
    //then
    expect(() => factory.throw()(errors)).toThrowError(
      InvalidRequestBodyException('유효하지 않은 데이터입니다. 확인 후 다시 요청해주세요.'),
    );
  });
});
