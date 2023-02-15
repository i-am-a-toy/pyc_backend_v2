import { ClassProvider, Module } from '@nestjs/common';
import { NoticeCommentRepositoryKey } from './notice-comment-repository.interface';
import { NoticeCommentRepository } from './notice-comment.repository';

const noticeCommentRepository: ClassProvider = {
  provide: NoticeCommentRepositoryKey,
  useClass: NoticeCommentRepository,
};

@Module({
  providers: [noticeCommentRepository],
  exports: [noticeCommentRepository],
})
export class NoticeCommentRepositoryModule {}
