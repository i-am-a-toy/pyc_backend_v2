import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getTypeOrmModule } from './database/typeorm/typeorm.module';
import { TransactionMiddleware } from './middleware/transaction.middleware';
import { ShutDownManager } from './util/shutdown.manager';

@Global()
@Module({
  imports: [getTypeOrmModule()],
  providers: [ShutDownManager],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('*');
  }
}
