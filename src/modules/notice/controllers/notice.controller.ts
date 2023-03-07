import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { CreateNoticeRequest } from 'src/common/requests/notice/create-notice.request';
import { FindNoticeListRequest } from 'src/common/requests/notice/find-notice-list.request';
import { UpdateNoticeRequest } from 'src/common/requests/notice/update-notice.request';
import { NoticeListResponse } from 'src/common/responses/notice/notice-list.response';
import { NoticeResponse } from 'src/common/responses/notice/notice.response';
import { PycContext } from 'src/core/decorator/pyc-context.decorator';
import { Role } from '../../../common/types/role/role.type';
import { AllowRole } from '../../../core/decorator/roles.decorator';
import { RoleGuard } from '../../../core/guard/role.guard';
import { INoticeService, NoticeServiceKey } from '../interfaces/notice-service.interface';

@Controller('/notices')
export class NoticeController {
  constructor(@Inject(NoticeServiceKey) private readonly service: INoticeService) {}

  @Get()
  async findNotices(@Query() query: FindNoticeListRequest): Promise<NoticeListResponse> {
    const [entities, count] = await this.service.findNotices(query.offset, query.limit);
    return new NoticeListResponse(entities, count);
  }

  @Get('/:id')
  async findNotice(@Param('id', ParseIntPipe) id: number): Promise<NoticeResponse> {
    const notice = await this.service.findNoticeById(id);
    return new NoticeResponse(notice);
  }

  @UseGuards(RoleGuard)
  @AllowRole(Role.GROUP_LEADER)
  @Post()
  async write(@PycContext() pycUser: PycUser, @Body() body: CreateNoticeRequest): Promise<void> {
    await this.service.write(pycUser, body.title, body.content);
  }

  @UseGuards(RoleGuard)
  @AllowRole(Role.GROUP_LEADER)
  @Put('/:id')
  async modify(@PycContext() pycUser: PycUser, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateNoticeRequest): Promise<void> {
    await this.service.modify(pycUser, id, body.title, body.content);
  }

  @UseGuards(RoleGuard)
  @AllowRole(Role.GROUP_LEADER)
  @Delete('/:id')
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(id);
  }
}
