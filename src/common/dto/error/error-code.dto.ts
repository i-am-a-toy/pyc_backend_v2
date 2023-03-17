import { HttpStatus } from '@nestjs/common';

class ErrorCodeDTO {
  constructor(readonly status: number, readonly message: string) {}
}
export type ErrorCode = ErrorCodeDTO;

export const ENTITY_NOT_FOUND = new ErrorCodeDTO(HttpStatus.NOT_FOUND, 'Entity Not Found');
export const INVALID_REQUEST_BODY = new ErrorCodeDTO(HttpStatus.BAD_REQUEST, 'RequestBody is invalid');
