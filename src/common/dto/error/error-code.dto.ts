import { HttpStatus } from '@nestjs/common';

interface ErrorResponse {
  readonly status: number;
  readonly message: string;
  readonly path: string;
}

class ErrorCodeDTO {
  constructor(readonly status: number, readonly message: string) {}
}
export type ErrorCode = ErrorCodeDTO;

export const ENTITY_NOT_FOUND = new ErrorCodeDTO(HttpStatus.NOT_FOUND, 'Entity Not Found');
