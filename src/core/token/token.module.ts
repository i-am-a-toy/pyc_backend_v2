import { ClassProvider, Module } from '@nestjs/common';
import { RefreshTokenRepositoryModule } from 'src/entities/refresh-token/refresh-token-repository.module';
import { getJwtModule } from './configs/jwt/jwt.module';
import { TokenServiceKey } from './interfaces/token-service.interface';
import { TokenService } from './services/token.service';

const tokenService: ClassProvider = {
  provide: TokenServiceKey,
  useClass: TokenService,
};

@Module({
  imports: [getJwtModule(), RefreshTokenRepositoryModule],
  providers: [tokenService],
  exports: [tokenService],
})
export class TokenModule {}
