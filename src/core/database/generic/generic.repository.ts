import { RootEntity } from './root.entity';

/**
 * GenericRepository
 *
 * @description Database가 변경되더라도 해당 GenericRepository를 구현하여 Repository Layer구현
 */
export interface GenericRepository<T extends RootEntity> {
  save(t: T | T[]): Promise<void>;
  findById(id: number): Promise<T | null>;
  remove(t: T | T[]): Promise<void>;
}
