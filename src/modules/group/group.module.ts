import { ClassProvider, Module } from '@nestjs/common';
import { GroupRepositoryModule } from '../../entities/group/group-repository.module';
import { UserRepositoryModule } from '../../entities/user/user-repository.module';
import { GroupController } from './controllers/group.controller';
import { GroupServiceKey } from './interfaces/group-service.interface';
import { GroupService } from './services/group.service';

const groupService: ClassProvider = {
  provide: GroupServiceKey,
  useClass: GroupService,
};

@Module({
  imports: [UserRepositoryModule, GroupRepositoryModule],
  providers: [groupService],
  exports: [groupService],
  controllers: [GroupController],
})
export class GroupModule {}
