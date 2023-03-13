import { ENTITY_NOT_FOUND, ErrorCode } from '../../common/dto/error/error-code.dto';

// ENTITY NOT FOUND SERVICE EXCEPTION
export const EntityNotFoundException = (message?: string): ServiceException => {
  return new ServiceException(ENTITY_NOT_FOUND, message);
};

interface HttpExceptionResponse {
  readonly status: number;
  readonly message: string;
  readonly path: string;
}

export class ServiceException extends Error {
  constructor(readonly errorCode: ErrorCode, message?: string) {
    if (!message) {
      message = errorCode.message;
    }

    super(message);
  }

  toHttpExceptionResponse(path?: string): HttpExceptionResponse {
    return {
      status: this.errorCode.status,
      message: this.message,
      path: path ?? '',
    };
  }
}
