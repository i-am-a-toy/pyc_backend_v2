import { PycUser } from 'src/common/dto/context/pyc-user.dto';
import { Notice } from 'src/entities/notice/notice.entity';

export const NoticeServiceKey = 'NoticeServiceKey';

export interface INoticeService {
  //C
  write(pycUser: PycUser, title: string, content: string): Promise<void>;

  //R
  findNoticeById(id: number): Promise<Notice>;
  findNotices(offset: number, limit: number): Promise<[Notice[], number]>;

  //U
  modify(pycUser: PycUser, id: number, title: string, content: string): Promise<void>;

  //D
  deleteById(id: number): Promise<void>;
}
