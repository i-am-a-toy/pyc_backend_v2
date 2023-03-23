import { Body, Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { Put } from '@nestjs/common/decorators';
import { Delete, Get } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { Query } from '@nestjs/common/decorators/http/route-params.decorator';
import { PycUser } from '../../../common/dto/context/pyc-user.dto';
import { CreateGroupRequest } from '../../../common/requests/group/create-group.request';
import { FindGroupListRequest } from '../../../common/requests/group/find-group-list.request';
import { UpdateGroupRequest } from '../../../common/requests/group/update-group.request';
import { GroupListResponse } from '../../../common/responses/group/group-list.response';
import { GroupResponse } from '../../../common/responses/group/group.response';
import { PycContext } from '../../../core/decorator/pyc-context.decorator';
import { GroupServiceKey, IGroupService } from '../interfaces/group-service.interface';

@Controller('groups')
export class GroupController {
  constructor(@Inject(GroupServiceKey) private readonly service: IGroupService) {}

  @Get('/:id')
  async findGroup(@Param('id', ParseIntPipe) id: number): Promise<GroupResponse> {
    const group = await this.service.findGroupById(id);
    return new GroupResponse(group);
  }

  @Get()
  async findGroupList(@Query() query: FindGroupListRequest): Promise<GroupListResponse> {
    const [groupList, count] = await this.service.findGroupList(query.offset, query.limit);
    return new GroupListResponse(groupList, count);
  }

  @Post()
  async register(@PycContext() pycUser: PycUser, @Body() body: CreateGroupRequest): Promise<void> {
    await this.service.register(body.leaderId, body.name, pycUser.userId);
  }

  @Put('/:id')
  async modify(@PycContext() pycUser: PycUser, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateGroupRequest): Promise<void> {
    await this.service.modify(id, body.leaderId, body.name, pycUser.userId);
  }

  @Delete('/:id')
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(id);
  }
}
