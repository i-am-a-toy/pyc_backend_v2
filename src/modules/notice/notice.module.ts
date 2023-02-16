import { ClassProvider, Module } from '@nestjs/common';
import { NoticeCommentRepositoryModule } from 'src/entities/notice-comment/notice-comment-repository.module';
import { NoticeRepositoryModule } from 'src/entities/notice/notice-repository.module';
import { NoticeController } from './controllers/notice.controller';
import { NoticeCommentServiceKey } from './interfaces/notice-comment-service.interface';
import { NoticeServiceKey } from './interfaces/notice-service.interface';
import { NoticeCommentService } from './services/notice-comment.service';
import { NoticeService } from './services/notice.service';

const noticeService: ClassProvider = {
  provide: NoticeServiceKey,
  useClass: NoticeService,
};

const noticeCommentService: ClassProvider = {
  provide: NoticeCommentServiceKey,
  useClass: NoticeCommentService,
};

@Module({
  imports: [NoticeRepositoryModule, NoticeCommentRepositoryModule],
  providers: [noticeService, noticeCommentService],
  exports: [noticeService, noticeCommentService],
  controllers: [NoticeController],
})
export class NoticeModule {}
