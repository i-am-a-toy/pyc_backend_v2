import { Module } from '@nestjs/common';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  providers: [RefreshTokenRepository],
  exports: [RefreshTokenRepository],
})
export class RefreshTokenRepositoryModule {}
