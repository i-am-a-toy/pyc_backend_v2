import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getNamespace } from 'cls-hooked';
import { PYC_ENTITY_MANAGER, PYC_NAMESPACE } from 'src/core/middleware/namespace.constant';
import { EntityManager } from 'typeorm';

/**
 * TransactionManager
 *
 * @description Middleware에서 setting 된 EntityManager를 꺼내오는 helper 역할
 * @throws namespace가 존재하지 않거나 active 상태가 아닌 경우 {@link InternalServerErrorException}
 */
@Injectable()
export class TransactionManager {
  getEntityManager(): EntityManager {
    const nameSpace = getNamespace(PYC_NAMESPACE);
    if (!nameSpace || !nameSpace.active) throw new InternalServerErrorException(`${PYC_NAMESPACE} is not active`);
    return nameSpace.get(PYC_ENTITY_MANAGER);
  }
}
