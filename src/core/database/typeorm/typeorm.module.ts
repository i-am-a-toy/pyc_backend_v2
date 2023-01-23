import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule as OrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TypeOrmDataSourceOptions } from './props/typeorm.props';
import * as path from 'path';

const entityPath = path.join(__dirname + './../../../entities/*/*.entity.js');

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
    synchronize: process.env.NODE_ENV === 'production' ? false : true,
    entityPath,
  });
};
