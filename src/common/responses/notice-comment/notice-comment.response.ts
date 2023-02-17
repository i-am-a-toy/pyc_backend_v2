import { CreatorDTO, LastModifierDTO } from 'src/common/dto/user';
import { NoticeComment } from 'src/entities/notice-comment/notice-comment.entity';

export class NoticeCommentResponse {
  readonly id: number;
  readonly content: string;
  readonly creator: CreatorDTO;
  readonly createdAt: Date;
  readonly lastModifier: LastModifierDTO;
  readonly lastModifiedAt: Date;

  constructor(comment: NoticeComment) {
    const { creator, lastModifier } = comment;
    this.id = comment.id;
    this.content = comment.content;
    this.creator = new CreatorDTO(creator.id, creator.name, creator.role.name);
    this.createdAt = comment.createdAt;
    this.lastModifier = new LastModifierDTO(lastModifier.id, lastModifier.name, lastModifier.role.name);
    this.lastModifiedAt = comment.lastModifiedAt;
  }
}
