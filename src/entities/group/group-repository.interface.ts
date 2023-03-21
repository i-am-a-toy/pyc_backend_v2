import { GenericRepository } from '../../core/database/generic/generic.repository';
import { Group } from './group.entity';

export const GroupRepositoryKey = 'GroupRepositoryKey';

export interface IGroupRepository extends GenericRepository<Group> {}
