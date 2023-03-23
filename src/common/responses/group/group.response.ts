import { Group } from '../../../entities/group/group.entity';

export class GroupResponse {
  readonly id: number;
  readonly leaderId: number;
  readonly name: string;
  readonly createdBy: number;
  readonly createdAt: Date;
  readonly lastModifiedBy: number;
  readonly lastModifiedAt: Date;

  constructor(group: Group) {
    this.id = group.id;
    this.leaderId = group.leaderId;
    this.name = group.name;
    this.createdBy = group.createdBy;
    this.createdAt = group.createdAt;
    this.lastModifiedBy = group.lastModifiedBy;
    this.lastModifiedAt = group.lastModifiedAt;
  }
}
