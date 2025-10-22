/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    console.log('Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('User role:', user?.role);

    const hasRole = matchRoles(requiredRoles, user.role);
    console.log('Role match:', hasRole);

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission (Roles)');
    }

    return hasRole;
  }
}

// Definisikan `matchRoles`
function matchRoles(requiredRoles: string[], userRole: string): boolean {
  return requiredRoles.includes(userRole);
}
