import { ClassProvider, Module } from '@nestjs/common';
import { NoticeRepositoryKey } from './notice-repository.interface';
import { NoticeRepository } from './notice.repository';

const noticeRepository: ClassProvider = {
  provide: NoticeRepositoryKey,
  useClass: NoticeRepository,
};

@Module({
  providers: [noticeRepository],
  exports: [noticeRepository],
})
export class NoticeRepositoryModule {}
