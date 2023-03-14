import { ExecutionContext, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PycUser } from '../../common/dto/context/pyc-user.dto';
import { Role } from '../../common/types/role/role.type';
import { RoleGuard } from './role.guard';

// MOCK
export class mockNoReturnRoleReflect extends Reflector {
  get<TResult = Role | null, TKey = string>(_: TKey, __: Function): TResult {
    return null as TResult;
  }
}

export class mockReturnGroupLeaderRoleReflect extends Reflector {
  get<TResult = Role | null, TKey = string>(_: TKey, __: Function): TResult {
    return Role.GROUP_LEADER as TResult;
  }
}

describe('RoleGuard Test', () => {
  it('RoleGuard 생성 테스트', () => {
    //given
    //when
    //then
    expect(new RoleGuard(new Reflector())).toBeDefined();
  });

  it('RoleGuard에 Role이 존재하지 않는 경우', () => {
    //given
    const roleGuard = new RoleGuard(new mockNoReturnRoleReflect());

    //when
    //then
    expect(() => roleGuard.canActivate({ getHandler: () => {} } as ExecutionContext)).toThrowError(
      new InternalServerErrorException('서버에 이상이 있습니다. 관리자에게 문의해주세요.'),
    );
  });

  it('ExecutionContext에 pycUser가 존재하지 않는 경우', () => {
    //given
    const roleGuard = new RoleGuard(new mockReturnGroupLeaderRoleReflect());

    const request = { path: '/test' } as Request;
    const context: ExecutionContext = {
      getHandler: () => {},
      switchToHttp: () => {
        return {
          getRequest: () => request,
        };
      },
    } as ExecutionContext;

    //when
    //then
    expect(() => roleGuard.canActivate(context)).toThrowError(new UnauthorizedException('인증정보가 없습니다.'));
  });

  it('유저의 Role을 가지고 MetaData의 Role의 isEqualOrAbove 실행했을 때 false일 경우', () => {
    //given
    const roleGuard = new RoleGuard(new mockReturnGroupLeaderRoleReflect());

    const request = { path: '/test', pycUser: new PycUser('tokenId', 1, 'userA', Role.LEADER) };
    const context: ExecutionContext = {
      getHandler: () => {},
      switchToHttp: () => {
        return {
          getRequest: () => request,
        };
      },
    } as ExecutionContext;

    //when
    //then
    expect(() => roleGuard.canActivate(context)).toThrowError(new ForbiddenException('권한이 없습니다.'));
  });

  it('권한 통과', () => {
    //given
    const roleGuard = new RoleGuard(new mockReturnGroupLeaderRoleReflect());

    const request = { path: '/test', pycUser: new PycUser('tokenId', 1, 'userA', Role.PASTOR) };
    const context: ExecutionContext = {
      getHandler: () => {},
      switchToHttp: () => {
        return {
          getRequest: () => request,
        };
      },
    } as ExecutionContext;

    //when
    const result = roleGuard.canActivate(context);

    //then
    expect(result).toBe(true);
  });
});
