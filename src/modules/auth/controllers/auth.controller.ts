import { BadRequestException, Body, Controller, Delete, Get, Headers, Inject, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { LoginRequest } from 'src/common/requests/auth/login.request';
import { RefreshRequest } from 'src/common/requests/auth/refresh.request';
import { UpdatePasswordRequest } from 'src/common/requests/auth/update-password.request';
import { TokenResponse } from 'src/common/responses/auth/token.response';
import { ValidationResponse } from 'src/common/responses/common/validation.response';
import { AuthServiceKey, IAuthService } from '../interfaces/auth-service.interface';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthServiceKey) private readonly service: IAuthService) {}

  @Get('token/validate')
  isValid(@Headers('Authorization') header: string): ValidationResponse {
    const headerArray = header.split(' ');
    if (headerArray.length != 2) throw new BadRequestException('Invalid authorization token format');
    const [_, token] = headerArray;

    return new ValidationResponse(this.service.isValidated(token));
  }

  @Post('/login')
  async login(@Body() body: LoginRequest): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await this.service.login(body.name, body.password);
    return new TokenResponse(accessToken, refreshToken);
  }

  @Put('/refresh')
  async refresh(@Body() body: RefreshRequest): Promise<TokenResponse> {
    const [accessToken, refreshToken] = await this.service.refresh(body.accessToken, body.refreshToken);
    return new TokenResponse(accessToken, refreshToken);
  }

  @Put('/:id/password/change')
  async changePassword(@Param('id', ParseIntPipe) id: number, @Body() body: UpdatePasswordRequest): Promise<void> {
    await this.service.changePassword(id, body.prevPassword, body.newPassword);
  }

  @Delete('/logout')
  async logout(@Headers('Authorization') header: string) {
    const headerArray = header.split(' ');
    if (headerArray.length != 2) throw new BadRequestException('Invalid authorization token format');
    const [_, token] = headerArray;

    return this.service.logout(token);
  }
}
