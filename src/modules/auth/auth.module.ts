import { ClassProvider, Module } from '@nestjs/common';
import { getJwtModule } from 'src/core/token/configs/jwt/jwt.module';
import { RefreshTokenRepositoryModule } from 'src/entities/refresh-token/refresh-token-repository.module';
import { UserRepositoryModule } from 'src/entities/user/user-repository.module';
import { AuthController } from './controllers/auth.controller';
import { AuthServiceKey } from './interfaces/auth-service.interface';
import { AuthService } from './services/auth.service';
import { TokenService } from '../../core/token/services/token.service';

const authService: ClassProvider = {
  provide: AuthServiceKey,
  useClass: AuthService,
};

@Module({
  imports: [getJwtModule(), RefreshTokenRepositoryModule, UserRepositoryModule],
  providers: [TokenService, authService],
  controllers: [AuthController],
})
export class AuthModule {}
