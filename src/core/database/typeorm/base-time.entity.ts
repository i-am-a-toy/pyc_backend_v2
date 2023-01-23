import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RootEntity } from '../generic/root.entity';

export abstract class BaseTimeEntity extends RootEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @CreateDateColumn({ nullable: false, name: 'created_at', type: 'timestamptz', comment: '데이터 생성 일자' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'last_modified_at', type: 'timestamptz', comment: '데이터 업데이트 일자' })
  lastModifiedAt: Date;
}
