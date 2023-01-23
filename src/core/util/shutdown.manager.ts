import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { destroyNamespace, getNamespace } from 'cls-hooked';
import { DataSource } from 'typeorm';
import { PYC_NAMESPACE } from '../middleware/namespace.constant';

/**
 * for NestJS Server Graceful ShutDown
 *
 * @description NestJS Application이 종료가 되었을 때 현재 사용하고 있는 리소스를 종료시켜야 한다.
 * 현재 사용중인 리소스 목록은 NameSpace, PG있다.
 */
@Injectable()
export class ShutDownManager implements OnApplicationShutdown {
  private readonly logger: Logger = new Logger(ShutDownManager.name);
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationShutdown(signal: string) {
    this.logger.log(`Start Shut Down Graceful with ${signal}`);
    await Promise.resolve().then(async () => {
      this.logger.log('Try Resources Close...');

      // namespace
      if (getNamespace(PYC_NAMESPACE)) {
        destroyNamespace(PYC_NAMESPACE);
        this.logger.log('Destroyed NameSpace :)');
      }

      // database
      if (this.dataSource.isInitialized) {
        this.dataSource.destroy();
        this.logger.log('Destroyed DataSource :)');
      }
      this.logger.log('Finish Resources Close...');
    });
  }
}
