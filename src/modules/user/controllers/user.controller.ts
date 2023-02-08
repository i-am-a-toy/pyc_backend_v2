import { Controller, Get, Inject } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { PycContext } from 'src/core/decorator/pyc-context.decorator';
import { IUserService, UserServiceKey } from '../interfaces/user-service.interface';

@Controller('users')
export class UserController {
  constructor(@Inject(UserServiceKey) private readonly service: IUserService) {}

  @Get('/:id')
  findUserById(@PycContext() pycUser: PycUser) {
    // TODO: UserResponse 정의 후 Return
    const user = this.service.findById(pycUser.userId);
  }
}
