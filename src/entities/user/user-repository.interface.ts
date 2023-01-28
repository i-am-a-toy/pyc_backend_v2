import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { User } from './user.entity';

export interface IUserRepository extends GenericRepository<User> {
  findOneByName(name: string): Promise<User | null>;
}
