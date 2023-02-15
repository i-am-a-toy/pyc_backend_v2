import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget } from 'typeorm';
import { INoticeCommentRepository } from './notice-comment-repository.interface';
import { NoticeComment } from './notice-comment.entity';

@Injectable()
export class NoticeCommentRepository extends GenericTypeOrmRepository<NoticeComment> implements INoticeCommentRepository {
  getName(): EntityTarget<NoticeComment> {
    return NoticeComment.name;
  }
}
