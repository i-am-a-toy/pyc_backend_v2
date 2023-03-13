import { ClassProvider, Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TransactionManager } from './database/typeorm/transaction-manager';
import { getTypeOrmModule } from './database/typeorm/typeorm.module';
import { ServiceHttpExceptionFilter } from './filter/service-http-exception.filter';
import { AuthorizationGuard } from './guard/authorization.guard';
import { TransactionMiddleware } from './middleware/transaction.middleware';
import { TokenModule } from './token/token.module';
import { ShutDownManager } from './util/shutdown.manager';

const modules = [TokenModule];
const providers = [TransactionManager];
const guards: ClassProvider[] = [{ provide: APP_GUARD, useClass: AuthorizationGuard }];
const filters: ClassProvider[] = [{ provide: APP_FILTER, useClass: ServiceHttpExceptionFilter }];

@Global()
@Module({
  imports: [getTypeOrmModule(), ...modules],
  providers: [ShutDownManager, ...guards, ...filters, ...providers],
  exports: [...modules, ...providers],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('*');
  }
}
