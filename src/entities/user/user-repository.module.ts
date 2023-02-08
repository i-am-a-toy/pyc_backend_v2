import { ClassProvider, Module } from '@nestjs/common';
import { UserRepositoryKey } from './user-repository.interface';
import { UserRepository } from './user.repository';

export const userRepository: ClassProvider = {
  provide: UserRepositoryKey,
  useClass: UserRepository,
};

@Module({
  providers: [userRepository],
  exports: [userRepository],
})
export class UserRepositoryModule {}
