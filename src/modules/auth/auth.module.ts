import { ClassProvider, Module } from '@nestjs/common';
import { TokenModule } from 'src/core/token/token.module';
import { UserRepositoryModule } from 'src/entities/user/user-repository.module';
import { AuthController } from './controllers/auth.controller';
import { AuthServiceKey } from './interfaces/auth-service.interface';
import { AuthService } from './services/auth.service';

const authService: ClassProvider = {
  provide: AuthServiceKey,
  useClass: AuthService,
};

@Module({
  imports: [UserRepositoryModule, TokenModule],
  providers: [authService],
  controllers: [AuthController],
})
export class AuthModule {}
