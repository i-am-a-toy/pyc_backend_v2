import { EntityManager, EntityTarget, FindOneOptions, Repository } from 'typeorm';
import { RootEntity } from '../generic/root.entity';
import { TransactionManager } from './transaction-manager';

/**
 * GenericTypeOrmRepository
 *
 * @description ORM을 이용하여 공통적으로 사용하는 Save, FindById, Remove를 구현한 Abstract Class
 * 모든 Entity의 Repository는 해당 Repository를 구현하여 추가적인 CRUD method를 확장할 수 있다.
 */
export abstract class GenericTypeOrmRepository<T extends RootEntity> {
  constructor(private readonly txManger: TransactionManager) {}

  /**
   * getName
   *
   * @description TypeORM에서 Repository를 EntityManager에서 가져올 때 {@link EntityTarget}을 통해 가져오게 된다.
   * EntityTarget의 Union 타입 중 Entity Name으로 Repository를 가져올 수 있다. {@link GenericTypeOrmRepository}를
   * 구현하는 Repository는 getName()만 구현하면 된다.
   */
  abstract getName(): EntityTarget<T>;

  async save(t: T | T[]): Promise<void> {
    await this.getRepository().save(Array.isArray(t) ? t : [t]);
  }

  async findById(id: number): Promise<T | null> {
    const findOption: FindOneOptions = { where: { id } };
    return this.getRepository().findOne(findOption);
  }

  async remove(t: T | T[]): Promise<void> {
    await this.getRepository().remove(Array.isArray(t) ? t : [t]);
  }

  /**
   * getRepository
   *
   * @description 구현을 하는 자식 class에서 getName()을 통해 얻어온 {@link EntityTarget}을 통해
   * {@link EntityManager}에서 Repository를 얻어온다. 해당 method는 구현한 class에서는 호출이 가능하다.
   * @returns repository {@link Repository}
   */
  protected getRepository(): Repository<T> {
    return this.txManger.getEntityManager().getRepository(this.getName());
  }
}
