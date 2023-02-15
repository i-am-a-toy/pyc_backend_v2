import { User } from 'src/entities/user/user.entity';
import { BaseListResponse } from '../common/base-list.response';
import { UserResponse } from './user.response';

export class UserListResponse extends BaseListResponse<UserResponse> {
  constructor(entities: User[], count: number) {
    const rows = entities.map((e) => new UserResponse(e));
    super(rows, count);
  }
}
