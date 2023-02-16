import { ClassProvider, Module } from '@nestjs/common';
import { NoticeRepositoryModule } from 'src/entities/notice/notice-repository.module';
import { NoticeController } from './controllers/notice.controller';
import { NoticeServiceKey } from './interfaces/notice-service.interface';
import { NoticeService } from './services/notice.service';

const noticeService: ClassProvider = {
  provide: NoticeServiceKey,
  useClass: NoticeService,
};

@Module({
  providers: [noticeService],
  exports: [noticeService],
  imports: [NoticeRepositoryModule],
  controllers: [NoticeController],
})
export class NoticeModule {}
