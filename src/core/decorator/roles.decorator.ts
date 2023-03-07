import { SetMetadata } from '@nestjs/common';
import { Role as UserRole } from '../../common/types/role/role.type';

export const AllowRole = (role: UserRole) => SetMetadata('role', role);
