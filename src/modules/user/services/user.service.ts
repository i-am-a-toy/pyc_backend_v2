import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IUserRepository, UserRepositoryKey } from 'src/entities/user/user-repository.interface';
import { User } from 'src/entities/user/user.entity';
import { IUserService } from '../interfaces/user-service.interface';

@Injectable()
export class UserService implements IUserService {
  private readonly logger: Logger = new Logger(UserService.name);
  constructor(@Inject(UserRepositoryKey) private readonly repository: IUserRepository) {}

  async findById(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      this.logger.warn(`Could not find User By Id: ${id}`);
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    return user;
  }

  search(q: string, offset: number, limit: number): Promise<[User[], number]> {
    return this.repository.search(q, offset, limit);
  }
}
