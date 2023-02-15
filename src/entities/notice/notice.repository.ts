import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget } from 'typeorm';
import { INoticeRepository } from './notice-repository.interface';
import { Notice } from './notice.entity';

@Injectable()
export class NoticeRepository extends GenericTypeOrmRepository<Notice> implements INoticeRepository {
  getName(): EntityTarget<Notice> {
    return Notice.name;
  }
}
