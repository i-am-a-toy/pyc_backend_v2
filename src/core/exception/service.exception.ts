import { ENTITY_NOT_FOUND, ErrorCode, INVALID_REQUEST_BODY, RESOURCE_NOT_ALLOWED } from '../../common/dto/error/error-code.dto';

// ENTITY NOT FOUND SERVICE EXCEPTION
export const EntityNotFoundException = (message?: string): ServiceException => {
  return new ServiceException(ENTITY_NOT_FOUND, message);
};

// INVALID REQUEST BODY SERVICE EXCEPTION
export const InvalidRequestBodyException = (message?: string): ServiceException => {
  return new ServiceException(INVALID_REQUEST_BODY, message);
};

// RESOURCE NOT ALLOWED
export const ResourceNotAllowed = (message?: string): ServiceException => {
  return new ServiceException(RESOURCE_NOT_ALLOWED, message);
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
