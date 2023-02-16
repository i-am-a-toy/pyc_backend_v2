import { SearchRequest } from 'src/common/requests/common/search.request';
import { User } from 'src/entities/user/user.entity';

export const UserServiceKey = 'UserServiceKey';

export interface IUserService {
  findById(id: number): Promise<User>;
  search(q: string, offset: number, limit: number): Promise<[User[], number]>;
}
