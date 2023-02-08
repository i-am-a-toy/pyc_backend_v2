import { Controller, Get, Inject } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
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
}
