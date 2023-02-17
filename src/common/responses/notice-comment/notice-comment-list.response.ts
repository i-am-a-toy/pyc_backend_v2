import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { BaseListResponse } from '../common/base-list.response';
import { NoticeCommentResponse } from './notice-comment.response';

export class NoticeCommentListResponse extends BaseListResponse<NoticeCommentResponse> {
  constructor(entities: NoticeComment[], count: number) {
    const rows = entities.map((e) => new NoticeCommentResponse(e));
    super(rows, count);
  }
}
