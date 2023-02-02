import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { TokenPayload } from 'src/common/dto/token';
import { Role } from 'src/common/types/role/role.type';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { TransactionManager } from '../database/typeorm/transaction-manager';
import { ITokenService } from '../token/interfaces/token-service.interface';
import { TokenService } from '../token/services/token.service';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let jwtService: JwtService;
  let tokenService: ITokenService;

  beforeAll(() => {
    jwtService = new JwtService({
      secret: 'test',
      signOptions: {
        issuer: 'pyc',
        expiresIn: 60 * 60,
      },
    });
    tokenService = new TokenService(jwtService, new RefreshTokenRepository(new TransactionManager()));
    guard = new AuthorizationGuard(tokenService);
  });

  it('Should be defined', () => {
    //given
    //when
    //then
    expect(guard).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  it('Authorization Guard - path가 whiteList에 걸리는 경우', async () => {
    //given
    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              path: '/auth/login',
            } as Request;
          },
        };
      },
    } as unknown as ExecutionContext;

    //when
    const result = await guard.canActivate(context);

    //then
    expect(result).toBe(true);
  });

  it('Authorization Guard - Token이 존재하지 않는 경우', async () => {
    //given
    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              path: '/test',
              headers: {},
            } as Request;
          },
        };
      },
    } as unknown as ExecutionContext;

    //when
    //then
    await expect(guard.canActivate(context)).rejects.toThrowError(new UnauthorizedException('인증정보가 없습니다.'));
  });

  it('Authorization Guard - Token 형식이 옯바르지 않는 경우', async () => {
    //given
    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              path: '/test',
              headers: {
                authorization: 'Bearer',
              },
            } as Request;
          },
        };
      },
    } as unknown as ExecutionContext;

    //when
    //then
    await expect(guard.canActivate(context)).rejects.toThrowError(new UnauthorizedException('인증정보가 형식이 옳바르지 않습니다'));
  });

  it('Authorization Guard - 토큰이 유효하지 않는 경우', async () => {
    //given
    const token = jwtService.sign(new TokenPayload('1', 1, 'userA', Role.LEADER.enumName).toPlain(), { secret: 'foobar' });

    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              path: '/test',
              headers: {
                authorization: `Bearer ${token}`,
              },
            } as Request;
          },
        };
      },
    } as unknown as ExecutionContext;

    //when
    //then
    await expect(guard.canActivate(context)).rejects.toThrowError(new UnauthorizedException('인증 정보가 유효하지 않습니다.'));
  });

  it('Authorization Guard - Role이 유효하지 않은 경우', async () => {
    //given
    const token = jwtService.sign(new TokenPayload('1', 1, 'userA', 'InvalidRole').toPlain());

    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              path: '/test',
              headers: {
                authorization: `Bearer ${token}`,
              },
            } as Request;
          },
        };
      },
    } as unknown as ExecutionContext;

    //when
    //then
    await expect(guard.canActivate(context)).rejects.toThrowError(new UnauthorizedException('유효하지 않은 Role입니다.'));
  });

  it('Authorization Guard - Role이 유효하지 않은 경우2 (Member일 때)', async () => {
    //given
    const token = jwtService.sign(new TokenPayload('1', 1, 'userA', Role.MEMBER.enumName).toPlain());

    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => {
            return {
              path: '/test',
              headers: {
                authorization: `Bearer ${token}`,
              },
            } as Request;
          },
        };
      },
    } as unknown as ExecutionContext;

    //when
    //then
    await expect(guard.canActivate(context)).rejects.toThrowError(new UnauthorizedException('유효하지 않은 Role입니다.'));
  });

  it('Authorization Guard', async () => {
    //given
    const token = jwtService.sign(new TokenPayload('1', 1, 'userA', Role.LEADER.enumName).toPlain());
    const request = {
      path: '/test',
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;

    const context: ExecutionContext = {
      switchToHttp: () => {
        return {
          getRequest: () => request,
        };
      },
    } as unknown as ExecutionContext;

    //when
    const result = await guard.canActivate(context);

    //then
    expect(result).toBe(true);
    const pycUser = Reflect.get(request, 'pycUser');
    expect(pycUser).toStrictEqual(new PycUser('1', 1, 'userA', Role.LEADER));
  });
});
