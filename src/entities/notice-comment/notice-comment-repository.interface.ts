import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { NoticeComment } from './notice-comment.entity';

export const NoticeCommentRepositoryKey = 'NoticeCommentRepositoryKey';

export interface INoticeCommentRepository extends GenericRepository<NoticeComment> {
  findAllByNoticeId(noticeId: number, offset: number, limit: number): Promise<[NoticeComment[], number]>;
  deleteById(id: number): Promise<void>;
}
