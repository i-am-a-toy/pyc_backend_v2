import { ClassProvider, Module } from '@nestjs/common';
import { UserRepositoryModule } from 'src/entities/user/user-repository.module';
import { UserController } from './controllers/user.controller';
import { UserServiceKey } from './interfaces/user-service.interface';
import { UserService } from './services/user.service';

const userService: ClassProvider = {
  provide: UserServiceKey,
  useClass: UserService,
};

@Module({
  imports: [UserRepositoryModule],
  providers: [userService],
  controllers: [UserController],
})
export class UserModule {}
