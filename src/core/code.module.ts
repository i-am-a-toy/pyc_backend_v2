import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TransactionManager } from './database/typeorm/transaction-manager';
import { getTypeOrmModule } from './database/typeorm/typeorm.module';
import { TransactionMiddleware } from './middleware/transaction.middleware';
import { TokenModule } from './token/token.module';
import { ShutDownManager } from './util/shutdown.manager';

const modules = [TokenModule];
const providers = [TransactionManager];

@Global()
@Module({
  imports: [getTypeOrmModule(), ...modules],
  providers: [ShutDownManager, ...providers],
  exports: [...modules, ...providers],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('*');
  }
}
