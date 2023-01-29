import { ForbiddenException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { hashSync } from 'bcrypt';
import { IUserRepository } from 'src/entities/user/user-repository.interface';
import { UserRepository } from 'src/entities/user/user.repository';
import { ITokenService, TokenServiceKey } from '../../../core/token/interfaces/token-service.interface';
import { IAuthService } from '../interfaces/auth-service.interface';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger: Logger = new Logger(AuthService.name);

  constructor(
    @Inject(TokenServiceKey) private readonly tokenService: ITokenService,
    @Inject(UserRepository) private readonly repository: IUserRepository,
  ) {}

  /**
   * isValidated
   *
   * @description Request로 받은 Token이 유효한지 Validation하는 method
   * 토큰이 존재하지 않는 경우, 토큰이 유효하지 않는 경우: false
   * 토큰이 유효한 경우: true
   */
  isValidated(token: string): boolean {
    try {
      if (!token || token === '') {
        this.logger.warn('Token Should be exists');
        return false;
      }

      return !!this.tokenService.verifiedToken(token);
    } catch (e) {
      return false;
    }
  }

  /**
   * login
   *
   * @description 유저의 ID와 비밀번호를 입력받아 해당 유저의 인증절차를 처리하는 method
   * @throws 유저가 존재하지 않는 경우 {@link NotFoundException}
   * @throws 유저의 Role이 Leader이상이 아닌 경우(비밀번호가 존재하지 않는 경우) {@link ForbiddenException}
   * @throws 입력한 비밀번호와 유저의 비밀번호가 다른 경우 {@link UnauthorizedException}
   * @returns [AccessToken, RefreshToken]
   */
  async login(name: string, password: string): Promise<string[]> {
    const user = await this.repository.findOneByName(name);
    if (!user) {
      this.logger.warn(`Could not find user by Name: ${name}`);
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.role.isLeader() || !user.password) {
      this.logger.warn(`Only leaders and above can login`);
      throw new ForbiddenException('권한이 없습니다.');
    }

    if (!user.isValidPassword(password)) {
      this.logger.warn(`${name} password is different.`);
      throw new UnauthorizedException('비밀번호가 다릅니다.');
    }

    return this.tokenService.createToken(user);
  }

  /**
   * logout
   *
   * @description AccessToken을 요청받아 해당 Token의 ID로 생성된 RefreshToken을 삭제한다.
   */
  async logout(accessToken: string): Promise<void> {
    await this.tokenService.removeToken(accessToken);
  }

  /**
   * refresh
   *
   * @description AccessToken과 RefreshToken을 요청받아 새로운 AccessToken과 RefreshToken을 생성한다.
   * 해당 method의 Exception 목록은 {@link tokenService}의 refresh method 참고
   * @returns [AccessToken, RefreshToken]
   */
  refresh(accessToken: string, refreshToken: string): Promise<string[]> {
    return this.tokenService.refresh(accessToken, refreshToken);
  }

  /**
   * changePassword
   *
   * @description ID와 이전 비밀번호, 새로운 비밀번호를 입력받아 비밀번호를 변경한다.
   * @throws 유저가 존재하지 않는 경우 {@link NotFoundException}
   * @throws 유저의 Role이 Leader이상이 아닌 경우(비밀번호가 존재하지 않는 경우) {@link ForbiddenException}
   * @throws 입력한 비밀번호와 기존 유저의 비밀번호가 다른 경우 {@link UnauthorizedException}
   */
  async changePassword(id: number, prevPassword: string, newPassword: string): Promise<void> {
    const user = await this.repository.findById(id);
    if (!user) {
      this.logger.warn(`Could not find user by Id: ${id}`);
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.role.isLeader() || !user.password) {
      this.logger.warn(`Only leaders and above can login`);
      throw new ForbiddenException('권한이 없습니다.');
    }

    if (!user.isValidPassword(prevPassword)) {
      this.logger.warn(`${id} password is different.`);
      throw new UnauthorizedException('비밀번호가 다릅니다.');
    }

    user.updatePassword(hashSync(newPassword, 10));
    await this.repository.save(user);
  }
}
