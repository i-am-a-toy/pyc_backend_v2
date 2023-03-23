import { Group } from '../../../entities/group/group.entity';

export const GroupServiceKey = 'GroupServiceKey';

export interface IGroupService {
  // C
  register(leaderId: number, name: string, creatorId: number): Promise<void>;

  // R
  findGroupById(id: number): Promise<Group>;
  findGroupList(offset: number, limit: number): Promise<[Group[], number]>;

  // U
  modify(id: number, leaderId: number, name: string, modifierId: number): Promise<void>;

  // D
  deleteById(id: number): Promise<void>;
}
