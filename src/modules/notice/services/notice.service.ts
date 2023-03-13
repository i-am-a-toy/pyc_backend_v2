import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { INoticeRepository, NoticeRepositoryKey } from 'src/entities/notice/notice-repository.interface';
import { Notice } from 'src/entities/notice/notice.entity';
import { ENTITY_NOT_FOUND } from '../../../common/dto/error/error-code.dto';
import { ServiceException } from '../../../core/exception/service.exception';
import { INoticeService } from '../interfaces/notice-service.interface';

@Injectable()
export class NoticeService implements INoticeService {
  private readonly logger: Logger = new Logger(NoticeService.name);

  constructor(@Inject(NoticeRepositoryKey) private readonly repository: INoticeRepository) {}

  /**
   * write
   *
   * @description 공지사항을 작성할 때 제목, 본문 및 작성자의 정보를 받아 공지사항 등록
   */
  async write(pycUser: PycUser, title: string, content: string): Promise<void> {
    const { userId, name, role } = pycUser;
    await this.repository.save(Notice.of(title, content, userId, name, role));
  }

  /**
   * findNoticeById
   *
   * @description id를 받아 해당하는 공지사항을 검색
   */
  async findNoticeById(id: number): Promise<Notice> {
    return await this.findById(id);
  }

  /**
   * findNotices
   *
   * @description Pagination에 필요한 offset, limit을 파라미터로 받아 공지사항 리스트 조회
   */
  findNotices(offset: number, limit: number): Promise<[Notice[], number]> {
    return this.repository.findAll(offset, limit);
  }

  /**
   * modify
   *
   * @description 공지사항을 작성할 때 제목, 본문 및 수정자의 정보를 받아 공지사항 수정
   */
  async modify(pycUser: PycUser, id: number, title: string, content: string): Promise<void> {
    const notice = await this.findById(id);

    const { userId, name, role } = pycUser;
    notice.updateNotice(title, content, userId, name, role);
    await this.repository.save(notice);
  }

  /**
   * deleteById
   *
   * @description id를 받아 해당하는 공지사항 삭제, 공지사항이 삭제될 때 공지사항에 작성된
   * 댓글은 같이 삭제된다 (cascade)
   */
  async deleteById(id: number): Promise<void> {
    await this.repository.deleteById(id);
  }

  /**
   * findById
   *
   * @description id를 이용하여 해당하는 공지사항 조회
   * @throws id에 해당하는 공지사항이 없는 경우 {@link NotFoundException}
   */
  private async findById(id: number) {
    const notice = await this.repository.findById(id);
    if (!notice) {
      this.logger.warn(`Could not find Notice By Id: ${id}`);
      throw new ServiceException(ENTITY_NOT_FOUND, '공지사항을 찾을 수 없습니다.');
    }
    return notice;
  }
}
