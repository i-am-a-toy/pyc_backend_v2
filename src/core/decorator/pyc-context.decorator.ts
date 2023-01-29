import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';

export const PycContext = createParamDecorator((_: unknown, ctx: ExecutionContext): PycUser => {
  const req = ctx.switchToHttp().getRequest();
  return plainToInstance(PycUser, req.pycUser);
});
