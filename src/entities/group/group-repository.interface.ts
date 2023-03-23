import { GenericRepository } from '../../core/database/generic/generic.repository';
import { Group } from './group.entity';

export const GroupRepositoryKey = 'GroupRepositoryKey';

export interface IGroupRepository extends GenericRepository<Group> {
  findById(id: number, options?: { withLeader?: boolean }): Promise<Group | null>;
  findAll(offset: number, limit: number): Promise<[Group[], number]>;
  updateName(id: number, name: string): Promise<void>;
}
