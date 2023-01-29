import { Injectable } from '@nestjs/common';
import { GenericTypeOrmRepository } from 'src/core/database/typeorm/generic-typeorm.repository';
import { EntityTarget } from 'typeorm';
import { IRefreshTokenRepository } from './refresh-token-repository.interface';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends GenericTypeOrmRepository<RefreshToken> implements IRefreshTokenRepository {
  getName(): EntityTarget<RefreshToken> {
    return RefreshToken.name;
  }

  findOneByTokens(accessTokenId: string, token: string): Promise<RefreshToken | null> {
    return this.getRepository().findOneBy({ accessTokenId, token });
  }

  async deleteByTokenId(tokenId: string): Promise<void> {
    await this.getRepository().delete({ accessTokenId: tokenId });
  }
}
