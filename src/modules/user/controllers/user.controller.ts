import { Controller, Get, Inject, Query } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { SearchRequest } from 'src/common/requests/common/search.request';
import { UserListResponse } from 'src/common/responses/user/user-list.response';
import { UserResponse } from 'src/common/responses/user/user.response';
import { PycContext } from 'src/core/decorator/pyc-context.decorator';
import { IUserService, UserServiceKey } from '../interfaces/user-service.interface';

@Controller('users')
export class UserController {
  constructor(@Inject(UserServiceKey) private readonly service: IUserService) {}

  @Get('/me')
  async findUserById(@PycContext() pycUser: PycUser): Promise<UserResponse> {
    const user = await this.service.findById(pycUser.userId);
    return new UserResponse(user);
  }

  @Get('/search')
  async search(@Query() query: SearchRequest): Promise<UserListResponse> {
    const { q, offset, limit } = query;
    const [users, count] = await this.service.search(q, offset, limit);
    return new UserListResponse(users, count);
  }
}
