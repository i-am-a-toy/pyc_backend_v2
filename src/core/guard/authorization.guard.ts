import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { Role } from 'src/common/types/role/role.type';
import { ITokenService, TokenServiceKey } from '../token/interfaces/token-service.interface';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(@Inject(TokenServiceKey) private readonly tokenService: ITokenService) {}

  //1. write WHITELIST
  private readonly WHITELIST = [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    //  '/auth/token/validate'
  ];

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // check whitelist
    const result = this.WHITELIST.find((path) => req.path.includes(path));
    if (result) return true;

    // check token
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || authorizationHeader === '') throw new UnauthorizedException('인증정보가 없습니다.');

    const headerArray = authorizationHeader.split(' ');
    if (headerArray.length != 2) throw new UnauthorizedException('인증정보가 형식이 옳바르지 않습니다');

    try {
      const [_, token] = headerArray;
      const accessClaim = this.tokenService.verifiedToken(token);

      const role = Role.find(accessClaim.role);
      if (!role || !role.isLeader()) throw new UnauthorizedException('유효하지 않은 Role입니다.');

      const pycUser = new PycUser(accessClaim.id, accessClaim.userId, accessClaim.name, role!);
      Object.assign(req, { pycUser });
      return true;
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
