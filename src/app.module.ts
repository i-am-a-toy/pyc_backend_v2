import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/code.module';
import { AuthModule } from './modules/auth/auth.module';

const applicationModule = [AuthModule];

@Module({
  imports: [CoreModule, ...applicationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
