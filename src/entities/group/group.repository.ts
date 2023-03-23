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

  async findById(id: number, options?: { withLeader?: boolean }): Promise<Group | null> {
    return await this.getRepository().findOne({ where: { id }, relations: options?.withLeader ? ['leader'] : undefined });
  }

  async findAll(offset: number, limit: number): Promise<[Group[], number]> {
    return this.getRepository().findAndCount({ skip: offset, take: limit });
  }

  async updateName(id: number, name: string): Promise<void> {
    await this.getRepository().update({ id }, { name });
  }
}
