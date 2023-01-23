import { BaseTimeEntity } from 'src/core/database/typeorm/base-time.entity';
import { Entity } from 'typeorm';

@Entity({ name: 'cells' })
export class Cell extends BaseTimeEntity {}
