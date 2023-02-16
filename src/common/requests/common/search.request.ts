import { IsNotEmpty, IsString } from 'class-validator';
import { ListRequest } from './list.request';

export class SearchRequest extends ListRequest {
  @IsString()
  @IsNotEmpty()
  q: string;
}
