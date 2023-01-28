import { AccessTokenClaim } from 'src/common/dto/token/access-token-claim.dto';
import { User } from 'src/entities/user/user.entity';

export const TokenServiceKey = 'TokenServiceKey';

export interface ITokenService {
  createToken(user: User): Promise<string[]>;
  verifiedToken(token: string): AccessTokenClaim;
  refresh(accessToken: string, refreshToken: string): Promise<string[]>;
  removeToken(accessToken: string): Promise<void>;
}
