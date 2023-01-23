import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule as OrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmDataSourceOptions } from './props/typeorm.props';

const entityPath = path.join(__dirname + './../../../entities/*/*.entity.js');
const migrationPath = path.join(__dirname + './../../../migrations/*.js');

export class TypeOrmModule {
  static forRoot(props: TypeOrmDataSourceOptions): DynamicModule {
    return OrmModule.forRoot({
      type: props.type,
      port: props.port,
      database: props.database,
      username: props.username,
      password: props.password,
      synchronize: props.synchronize,
      entities: [props.entityPath],
      logging: process.env.NODE_ENV === 'production' ? ['error'] : true,
      namingStrategy: new SnakeNamingStrategy(),
      migrationsTableName: 'migrations',
      migrationsRun: true,
      migrations: [migrationPath],
      migrationsTransactionMode: 'all',
      // connection pool option
      // https://github.com/typeorm/typeorm/issues/3388
      // https://node-postgres.com/api/pool
      extra: {
        max: 5,
      },
    });
  }
}

export const getTypeOrmModule = (): DynamicModule => {
  return TypeOrmModule.forRoot({
    type: 'postgres',
    database: process.env.DATABASE,
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    synchronize: false,
    entityPath,
  });
};
