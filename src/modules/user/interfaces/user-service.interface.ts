import { User } from 'src/entities/user/user.entity';

export const UserServiceKey = 'UserServiceKey';

export interface IUserService {
  findById(id: number): Promise<User>;
}
