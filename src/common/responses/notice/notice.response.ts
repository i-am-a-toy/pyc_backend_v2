import { CreatorDTO, LastModifierDTO } from 'src/common/dto/user';
import { Notice } from 'src/entities/notice/notice.entity';

export class NoticeResponse {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly creator: CreatorDTO;
  readonly createdAt: Date;
  readonly lastModifier: LastModifierDTO;
  readonly lastModifiedAt: Date;

  constructor(notice: Notice) {
    this.id = notice.id;
    this.title = notice.title;
    this.content = notice.content;
    this.creator = new CreatorDTO(notice.creator.id, notice.creator.name, notice.creator.role.name);
    this.createdAt = notice.createdAt;
    this.lastModifier = new LastModifierDTO(notice.lastModifier.id, notice.lastModifier.name, notice.lastModifier.role.name);
    this.lastModifiedAt = notice.lastModifiedAt;
  }
}
