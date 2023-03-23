import { Inject, Injectable, Logger } from '@nestjs/common';
import { Role } from '../../../common/types/role/role.type';
import { Transactional } from '../../../core/decorator/transactional.decorator';
import { EntityNotFoundException, ResourceNotAllowed } from '../../../core/exception/service.exception';
import { GroupRepositoryKey, IGroupRepository } from '../../../entities/group/group-repository.interface';
import { Group } from '../../../entities/group/group.entity';
import { IUserRepository, UserRepositoryKey } from '../../../entities/user/user-repository.interface';
import { IGroupService } from '../interfaces/group-service.interface';

@Injectable()
export class GroupService implements IGroupService {
  private readonly logger: Logger = new Logger(GroupService.name);

  constructor(
    @Inject(UserRepositoryKey) private readonly userRepository: IUserRepository,
    @Inject(GroupRepositoryKey) private readonly groupRepository: IGroupRepository,
  ) {}

  @Transactional()
  async register(leaderId: number, name: string, creatorId: number): Promise<void> {
    const leader = await this.findLeaderById(leaderId);
    const group = Group.openCeremony(leader, name, creatorId);
    await this.groupRepository.save(group);
  }

  async findGroupById(id: number): Promise<Group> {
    return await this.findById(id);
  }

  async findGroupList(offset: number, limit: number): Promise<[Group[], number]> {
    return await this.groupRepository.findAll(offset, limit);
  }

  // TODO: 변경되는 셀리더의 그룹 변경 및 이전 리더의 셀의 존재 여부 판단하여 처리하기 & TestCode (추 후 Cell Module이 추가 되었을 때)
  @Transactional()
  async modify(id: number, leaderId: number, name: string, modifierId: number): Promise<void> {
    const target = await this.findById(id, { withLeader: true });

    // * Update group name
    if (name !== target.name && leaderId === target.leaderId) {
      this.logger.log(`Change Name ${target.name} to ${name}`);
      await this.groupRepository.updateName(target.id, name);
    }

    // * Update group Leader
    const newLeader = await this.findLeaderById(leaderId);
    target.changeLeader(newLeader, name, modifierId);
    await this.groupRepository.save(target);
  }

  // TODO: 그룹에 속한 셀이 있는 경우 삭제할 수 없는 처리 필요 & TestCode (추 후 Cell Module이 추가 되었을 때)
  @Transactional()
  async deleteById(id: number): Promise<void> {
    const target = await this.findById(id, { withLeader: true });
    if (!target) return;

    target.leader.appoint(Role.MEMBER);
    await this.userRepository.save(target.leader);
    await this.groupRepository.remove(target);
  }

  private async findLeaderById(leaderId: number) {
    const leader = await this.userRepository.findById(leaderId);
    if (!leader) {
      this.logger.warn(`Could not find groupLeader by Id: ${leaderId}`);
      throw EntityNotFoundException('리더를 찾을 수 없습니다.');
    }

    if (!leader.role.isToBeGroupLeader()) {
      this.logger.warn(`Group leader should be above or enquire leader role currentRole: ${leader.role.enumName}`);
      throw ResourceNotAllowed('선택한 유저의 권한이 부족합니다.');
    }
    return leader;
  }

  private async findById(id: number, options?: { withLeader?: boolean }) {
    const group = await this.groupRepository.findById(id, options);
    if (!group) {
      this.logger.warn(`Could not find group by Id: ${id}`);
      throw EntityNotFoundException('그룹을 찾을 수 없습니다.');
    }
    return group;
  }
}
