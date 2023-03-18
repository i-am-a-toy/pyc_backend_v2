import { Logger, ValidationError } from '@nestjs/common';
import { InvalidRequestBodyException } from '../service.exception';

export class ClassValidatorExceptionFactory {
  private readonly logger: Logger = new Logger(ClassValidatorExceptionFactory.name);

  /**
   * handle
   *
   * @description class-validator를 이용하여 유효성 검증 시 발생한 Error를 처리하는 method
   * ClassValidatorExceptionFactory의 지역변수 인 logger를 참조하지 못하는 상황이 발생하여
   * 클로저 패턴을 이용하여 logger를 참조할 수 있도록 처리
   */
  throw(): (errors: ValidationError[]) => void {
    return (errors: ValidationError[]): void => {
      if (!errors.length) return;

      errors.forEach((e) => {
        const { property, constraints } = e;
        this.logger.warn(`Invalid property name: ${property}, error: ${constraints ? Object.values(constraints).join(', ') : ''}`);
      });
      throw InvalidRequestBodyException('유효하지 않은 데이터입니다. 확인 후 다시 요청해주세요.');
    };
  }
}
