import { BaseTimeEntity } from 'src/core/database/typeorm/base-time.entity';
import { BigintTransformer } from 'src/core/database/typeorm/transformer';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken extends BaseTimeEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'bigint', name: 'user_id', nullable: false, transformer: new BigintTransformer() })
  userId!: number;

  @Column({ type: 'varchar', nullable: false })
  accessTokenId!: string;

  @Column({ type: 'varchar', nullable: false })
  token!: string;

  @Column({ type: 'timestamptz', nullable: false })
  expiredAt!: Date;

  @Column({ type: 'bigint', nullable: false, transformer: new BigintTransformer() })
  createdBy!: number;

  @Column({ type: 'bigint', nullable: false, transformer: new BigintTransformer() })
  lastModifiedBy: number;

  static of(user: User, accessTokenId: string, token: string, expiredAt: Date): RefreshToken {
    const e = new RefreshToken();
    e.user = user;
    e.accessTokenId = accessTokenId;
    e.token = token;
    e.expiredAt = expiredAt;
    e.createdBy = user.id;
    e.lastModifiedBy = user.id;
    return e;
  }

  tokenRotate(newToken: string, userId: number) {
    this.token = newToken;
    this.lastModifiedBy = userId;
  }
}
