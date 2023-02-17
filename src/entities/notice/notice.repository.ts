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

  findAll(offset: number, limit: number): Promise<[Notice[], number]> {
    return this.getRepository().findAndCount({ skip: offset, take: limit });
  }

  async deleteById(id: number): Promise<void> {
    await this.getRepository().delete({ id });
  }
}
