import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget, Like } from 'typeorm';
import { IUserRepository } from './user-repository.interface';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends GenericTypeOrmRepository<User> implements IUserRepository {
  getName(): EntityTarget<User> {
    return User.name;
  }

  findOneByName(name: string): Promise<User | null> {
    return this.getRepository().findOneBy({ name });
  }

  search(q: string, offset: number, limit: number): Promise<[User[], number]> {
    return this.getRepository().findAndCount({ where: { name: Like(`%${q}%`) }, skip: offset, take: limit });
  }
}
