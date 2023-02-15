import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { Notice } from './notice.entity';

export const NoticeRepositoryKey = 'NoticeRepositoryKey';
export interface INoticeRepository extends GenericRepository<Notice> {}
