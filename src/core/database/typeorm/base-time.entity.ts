import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { RootEntity } from '../generic/root.entity';
import { BigintTransformer } from './transformer';

export abstract class BaseTimeEntity extends RootEntity {
  @PrimaryColumn({ type: 'bigint', transformer: new BigintTransformer() })
  id: number;

  @CreateDateColumn({ nullable: false, name: 'created_at', type: 'timestamptz', comment: '데이터 생성 일자' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'last_modified_at', type: 'timestamptz', comment: '데이터 업데이트 일자' })
  lastModifiedAt: Date;
}
