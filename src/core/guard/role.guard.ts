import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { PycUser } from '../../common/dto/context/pyc-user.dto';
import { Role } from '../../common/types/role/role.type';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger: Logger = new Logger(RoleGuard.name);
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const role: Role = this.reflector.get<Role>('role', context.getHandler());
    if (!role) {
      this.logger.error('Could not define role where metaData');
      throw new InternalServerErrorException('서버에 이상이 있습니다. 관리자에게 문의해주세요.');
    }

    const request = context.switchToHttp().getRequest();
    if (!request.pycUser) throw new UnauthorizedException('인증정보가 없습니다.');

    const currentUser = plainToInstance(PycUser, request.pycUser);
    const isAllow = role.isEqualOrAbove(currentUser.role);
    if (isAllow) return true;

    throw new ForbiddenException('권한이 없습니다.');
  }
}
