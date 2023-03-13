import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { CreateNoticeCommentRequest } from 'src/common/requests/notice-comment/create-notice-comment.request';
import { FindNoticeCommentListRequest } from 'src/common/requests/notice-comment/find-notice-comment-list.request';
import { UpdateNoticeCommentRequest } from 'src/common/requests/notice-comment/update-notice-comment.request';
import { NoticeCommentListResponse } from 'src/common/responses/notice-comment/notice-comment-list.response';
import { NoticeCommentResponse } from 'src/common/responses/notice-comment/notice-comment.response';
import { PycContext } from 'src/core/decorator/pyc-context.decorator';
import { INoticeCommentService, NoticeCommentServiceKey } from '../interfaces/notice-comment-service.interface';

@Controller('notice-comments')
export class NoticeCommentController {
  constructor(@Inject(NoticeCommentServiceKey) private readonly service: INoticeCommentService) {}

  @Get('/notices/:id')
  async findCommentsByNoticeId(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: FindNoticeCommentListRequest,
  ): Promise<NoticeCommentListResponse> {
    const [comments, count] = await this.service.findByNoticeId(id, query.offset, query.limit);
    return new NoticeCommentListResponse(comments, count);
  }

  @Get('/:id')
  async findComment(@Param('id', ParseIntPipe) id: number): Promise<NoticeCommentResponse> {
    const comment = await this.service.findCommentById(id);
    return new NoticeCommentResponse(comment);
  }

  @Post('/notices/:id')
  async comment(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateNoticeCommentRequest,
  ): Promise<NoticeCommentResponse> {
    const comment = await this.service.comment(pycUser, id, body.comment);
    return new NoticeCommentResponse(comment);
  }

  @Put('/:id')
  async modify(
    @PycContext() pycUser: PycUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateNoticeCommentRequest,
  ): Promise<NoticeCommentResponse> {
    const comment = await this.service.modify(pycUser, id, body.comment);
    return new NoticeCommentResponse(comment);
  }

  @Delete('/:id')
  async deleteById(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.service.deleteById(id);
  }
}
