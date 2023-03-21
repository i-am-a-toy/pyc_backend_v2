import { Injectable } from '@nestjs/common';
import { EntityTarget } from 'typeorm';
import { GenericTypeOrmRepository } from '../../core/database/typeorm/generic-typeorm.repository';
import { IGroupRepository } from './group-repository.interface';
import { Group } from './group.entity';

@Injectable()
export class GroupRepository extends GenericTypeOrmRepository<Group> implements IGroupRepository {
  getName(): EntityTarget<Group> {
    return Group.name;
  }
}
