import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PermissionCacheService } from '../permission-cache.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private permissionCache: PermissionCacheService,
    ) {}
    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[
            context.getHandler  (),
            context.getClass(),
        ])
        
        if (isPublic){
            return true;
        }

        const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // ตรงนี้เอาไว้เช็คว่าลืมแปะ decorator หรือป่าว
        if (!required) {
            throw new ForbiddenException('Access denied');
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user?.role) throw new ForbiddenException('No role in token');

        if (!this.permissionCache.hasAllPermissions(user.role, required)) {
            throw new ForbiddenException(`Missing permission: ${required.join(', ')}`);
        }
        return true;
    }
}