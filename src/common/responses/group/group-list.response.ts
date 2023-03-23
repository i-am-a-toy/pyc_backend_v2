import { Group } from '../../../entities/group/group.entity';
import { BaseListResponse } from '../common/base-list.response';
import { GroupResponse } from './group.response';

export class GroupListResponse extends BaseListResponse<GroupResponse> {
  constructor(groupList: Group[], count: number) {
    const rows = groupList.map((g) => new GroupResponse(g));
    super(rows, count);
  }
}
