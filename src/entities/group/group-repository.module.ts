import { ClassProvider, Module } from '@nestjs/common';
import { GroupRepositoryKey } from './group-repository.interface';
import { GroupRepository } from './group.repository';

const groupRepository: ClassProvider = {
  provide: GroupRepositoryKey,
  useClass: GroupRepository,
};

@Module({
  providers: [groupRepository],
  exports: [groupRepository],
})
export class GroupRepositoryModule {}
