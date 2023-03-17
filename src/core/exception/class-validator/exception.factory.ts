import { Logger, ValidationError } from '@nestjs/common';
import { InvalidRequestBodyException } from '../service.exception';

export class ClassValidatorExceptionFactory {
  private readonly logger: Logger = new Logger(ClassValidatorExceptionFactory.name);

  handle(): (errors: ValidationError[]) => void {
    return (errors: ValidationError[]): void => {
      if (!errors.length) return;

      errors.forEach((e) => {
        const { property, constraints } = e;
        this.logger.warn(`Invalid property name: ${property}, error: ${constraints ? Object.values(constraints).join(', ') : ''}`);
      });
      throw InvalidRequestBodyException('유효하지 않은 데이터입니다. 확인 후 다시 요청해주세요.');
    };
  }

  // handle(errors: ValidationError[]): void {
  //   // const logger: Logger = new Logger(ClassValidatorExceptionFactory.name);
  //   errors.forEach((e) => {
  //     const { property, constraints } = e;
  //     this.logger.warn(`Invalid property name: ${property}, error: ${JSON.stringify(constraints)}`);
  //   });
  //   throw InvalidRequestBodyException('유효하지 않은 데이터입니다. 확인 후 다시 요청해주세요.');
  // }
}
