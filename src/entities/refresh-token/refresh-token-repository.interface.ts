import { GenericRepository } from 'src/core/database/generic/generic.repository';
import { RefreshToken } from './refresh-token.entity';

export interface IRefreshTokenRepository extends GenericRepository<RefreshToken> {
  findOneByTokens(tokenId: string, refreshToken: string): Promise<RefreshToken | null>;
  deleteByTokenId(tokenId: string): Promise<void>;
}
