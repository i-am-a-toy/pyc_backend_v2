import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';

export const NoticeCommentServiceKey = 'NoticeCommentServiceKey ';

export interface INoticeCommentService {
  //C
  comment(pycUser: PycUser, noticeId: number, comment: string): Promise<NoticeComment>;

  //R
  findByNoticeId(noticeId: number, offset: number, limit: number): Promise<[NoticeComment[], number]>;
  findCommentById(id: number): Promise<NoticeComment>;

  //U
  modify(pycUser: PycUser, id: number, comment: string): Promise<NoticeComment>;

  //D
  deleteById(id: number): Promise<void>;
}
