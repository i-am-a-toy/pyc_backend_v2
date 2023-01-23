export interface TypeOrmDataSourceOptions {
  type: 'postgres';
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  synchronize: boolean;
  entityPath: string;
}
