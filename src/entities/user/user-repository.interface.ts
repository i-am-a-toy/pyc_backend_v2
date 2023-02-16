import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { User } from './user.entity';

export const UserRepositoryKey = 'UserRepositoryKey';

export interface IUserRepository extends GenericRepository<User> {
  findOneByName(name: string): Promise<User | null>;
  search(q: string, offset: number, limit: number): Promise<[User[], number]>;
}
