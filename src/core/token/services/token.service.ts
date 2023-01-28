import {
  HttpException,
  Inject,
  Injectable,
  Logger,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/common/dto/token';
import { AccessTokenClaim } from 'src/common/dto/token/access-token-claim.dto';
import { addWeek } from 'src/common/utils/date';
import { IRefreshTokenRepository } from 'src/entities/refresh-token/refresh-token-repository.interface';
import { RefreshToken } from 'src/entities/refresh-token/refresh-token.entity';
import { RefreshTokenRepository } from 'src/entities/refresh-token/refresh-token.repository';
import { User } from 'src/entities/user/user.entity';
import { v4 as uuid } from 'uuid';
import { ITokenService } from '../interfaces/token-service.interface';

/**
 * TokenService
 *
 * @description JWT Token 기반 인증처리를 위한 Service
 * @author leewoooo
 * @since 2023.01.25
 */
@Injectable()
export class TokenService implements ITokenService {
  private readonly logger: Logger = new Logger(TokenService.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(RefreshTokenRepository) private readonly repository: IRefreshTokenRepository,
  ) {}

  /**
   * createToken
   *
   * @description User를 받아 새로운 AccessToken 및 RefreshToken을 생성 후 RefreshToken은 persist
   * @returns JWT TOKEN (Access, Refresh)
   */
  async createToken(user: User): Promise<string[]> {
    this.logger.log(`Create Token with id: ${user.id}, name:${user.name}`);

    // Create Token Id & AccessToken & Refresh Token
    const accessTokenId = uuid();
    const accessToken = this.jwtService.sign(new TokenPayload(accessTokenId, user.id, user.name, user.role.enumName).toPlain());
    const refreshToken = uuid();

    const expired = process.env.REFRESH_TOKEN_EXPIRED ? +process.env.REFRESH_TOKEN_EXPIRED : 2;
    await this.repository.save(RefreshToken.of(user, accessTokenId, refreshToken, addWeek(new Date(), expired)));
    return [accessToken, refreshToken];
  }

  /**
   * verifiedToken
   *
   * @description argument로 입력받은 Token을 검증한 후 Token의 Claim을 Return
   */
  verifiedToken(token: string): AccessTokenClaim {
    try {
      return this.validate<AccessTokenClaim>(token);
    } catch (e) {
      this.logger.warn(`Token validate failed error: ${e.message}`);
      throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    }
  }

  /**
   * refresh
   *
   * @description argument로 입력받은 Token들의 유효성을 검증 후 Token의 Claim을 기반으로 새로운 AccessToken을 만든다.
   * RefreshToken 또한 재 사용을 방지하기 위하여 새로 생성하여 Update 쳐준다.
   *
   * @throws argument로 받은 Token이 유효하지 않은 경우 {@link UnauthorizedException}
   * @throws RefreshToken이 존재하지 않는 경우 {@link NotFoundException}
   * @throws RefreshToken이 만료된 경우 {@link MethodNotAllowedException}
   */
  async refresh(accessToken: string, refreshToken: string): Promise<string[]> {
    try {
      const tokenClaim = this.validate<AccessTokenClaim>(accessToken, true);
      const target = await this.repository.findOneByTokens(tokenClaim.id, refreshToken);
      if (!target) {
        this.logger.warn(`Could not find RefreshToken with tokenId: ${tokenClaim.id}, userId: ${tokenClaim.userId}`);
        throw new NotFoundException(`RefreshToken이 존재하지 않습니다.`);
      }
      if (new Date() > target.expiredAt) {
        this.logger.warn('Refresh Token already expired');
        throw new MethodNotAllowedException('RefreshToken이 이미 만료되었습니다.');
      }

      // RefreshToken Rotation
      const newToken = this.jwtService.sign(new TokenPayload(tokenClaim.id, tokenClaim.userId, tokenClaim.name, tokenClaim.role).toPlain());
      const newRefreshToken = uuid();
      target.tokenRotate(newRefreshToken, tokenClaim.userId);
      await this.repository.save(target);

      return [newToken, newRefreshToken];
    } catch (e) {
      // throw NotFoundException
      if (e instanceof HttpException) throw e;

      // throw Token Exception
      this.logger.warn(`Failed Token Refresh with Error: ${e.message}`);
      throw new UnauthorizedException(`Token Invalid`);
    }
  }

  /**
   * removeToken
   *
   * @description argument로 입력받은 Token을 기반으로 RefreshToken을 검색하여 삭제
   * 만약 이 때 RefreshToken이 존재하지 않거나 Token이 유효하지 않아도 Exception 발생 X
   */
  async removeToken(accessToken: string): Promise<void> {
    try {
      const verified = this.validate<AccessTokenClaim>(accessToken, true);
      await this.repository.deleteByTokenId(verified.id);
    } catch (e) {
      this.logger.warn(`Failed Token removeToken with Error: ${e.message}`);
    }
  }

  private validate<T extends Object>(token: string, ignoreExpiration: boolean = false): T {
    return this.jwtService.verify<T>(token, { ignoreExpiration });
  }
}
