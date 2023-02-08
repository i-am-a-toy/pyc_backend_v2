import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/code.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

const applicationModule = [AuthModule, UserModule];

@Module({
  imports: [CoreModule, ...applicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
