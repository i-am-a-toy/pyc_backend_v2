import { InternalServerErrorException } from '@nestjs/common';
import { getNamespace } from 'cls-hooked';
import { EntityManager } from 'typeorm';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from '../middleware/namespace.constant';

/**
 * Transactional
 *
 * @description 실행될 method를 Transaction callback으로 wrapping하는 데코레이터다. 해당 데코레이터가 붙어있는 method는
 * 하나의 작업단위 즉 트랜잭션 안에서 실행이 되게 된다.
 * @throws namespace가 존재하지 않거나 active상태가 아닌경우 {@link InternalServerErrorException}
 * @throws namespace 안에 EntityManager가 들어있지 않는 경우 {@link InternalServerErrorException}
 *
 * target {@link target}는 class의 ProtoType이 정의된다.
 * propertyKey {@link propertyKey}는 method의 이름이 정의된다
 * descriptor {@link descriptor}는 Target이 되는 method의 정보들이 들어있다.
 */
export function Transactional() {
  return function (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
    // save original method
    const originMethod = descriptor.value;

    // wrapped origin method with Transaction
    async function transactionWrapped(...args: unknown[]) {
      // validate nameSpace && get nameSpace
      const nameSpace = getNamespace(PYC_NAMESPACE);
      if (!nameSpace || !nameSpace.active) throw new InternalServerErrorException(`${PYC_NAMESPACE} is not active`);

      // get EntityManager
      const em = nameSpace.get(PYC_ENTITY_MANAGER) as EntityManager;
      if (!em) throw new InternalServerErrorException(`Could not find EntityManager in ${PYC_NAMESPACE} nameSpace`);

      return await em.transaction(async (tx: EntityManager) => {
        nameSpace.set<EntityManager>(PYC_ENTITY_MANAGER, tx);
        return await originMethod.apply(this, args);
      });
    }

    descriptor.value = transactionWrapped;
  };
}
