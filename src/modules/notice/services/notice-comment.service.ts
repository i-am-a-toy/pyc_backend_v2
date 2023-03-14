import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { Transactional } from 'src/core/decorator/transactional.decorator';
import { INoticeCommentRepository, NoticeCommentRepositoryKey } from 'src/entities/notice-comment/notice-comment-repository.interface';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';
import { INoticeRepository, NoticeRepositoryKey } from 'src/entities/notice/notice-repository.interface';
import { ENTITY_NOT_FOUND } from '../../../common/dto/error/error-code.dto';
import { ServiceException } from '../../../core/exception/service.exception';
import { INoticeCommentService } from '../interfaces/notice-comment-service.interface';

@Injectable()
export class NoticeCommentService implements INoticeCommentService {
  private readonly logger: Logger = new Logger(NoticeCommentService.name);

  constructor(
    @Inject(NoticeRepositoryKey) private readonly noticeRepository: INoticeRepository,
    @Inject(NoticeCommentRepositoryKey) private readonly commentRepository: INoticeCommentRepository,
  ) {}

  @Transactional()
  async comment(pycUser: PycUser, noticeId: number, comment: string): Promise<NoticeComment> {
    const notice = await this.noticeRepository.findById(noticeId);
    if (!notice) {
      this.logger.warn(`Could not find notice with Id: ${noticeId}`);
      throw new ServiceException(ENTITY_NOT_FOUND, '공지사항을 찾을 수 없습니다.');
    }

    const { userId, name, role } = pycUser;
    const [newComment] = await this.commentRepository.save(NoticeComment.of(notice, comment, userId, name, role));
    return newComment;
  }

  findByNoticeId(noticeId: number, offset: number, limit: number): Promise<[NoticeComment[], number]> {
    return this.commentRepository.findAllByNoticeId(noticeId, offset, limit);
  }

  async findCommentById(id: number): Promise<NoticeComment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      this.logger.warn(`Could not find comment with Id: ${id}`);
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment;
  }

  @Transactional()
  async modify(pycUser: PycUser, id: number, comment: string): Promise<NoticeComment> {
    const target = await this.findById(id);
    const { userId, name, role } = pycUser;

    target.update(comment, userId, name, role);
    const [updated] = await this.commentRepository.save(target);
    return updated;
  }

  @Transactional()
  async deleteById(id: number): Promise<void> {
    await this.commentRepository.deleteById(id);
  }

  private async findById(id: number) {
    const target = await this.commentRepository.findById(id);
    if (!target) {
      this.logger.warn(`Could not find comment with Id: ${id}`);
      throw new ServiceException(ENTITY_NOT_FOUND, '댓글을 찾을 수 없습니다.');
    }
    return target;
  }
}
