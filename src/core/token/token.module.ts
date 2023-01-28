import { ClassProvider, Module } from '@nestjs/common';
import { TokenServiceKey } from './interfaces/token-service.interface';
import { TokenService } from './services/token.service';

const tokenService: ClassProvider = {
  provide: TokenServiceKey,
  useClass: TokenService,
};

@Module({
  providers: [tokenService],
  exports: [tokenService],
})
export class TokenModule {}
