import { Injectable, OnModuleInit } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class PermissionCacheService implements OnModuleInit {
    private cache: Map<string, Set<string>> = new Map();

    constructor(
        private readonly roleService:RolesService
    ) {}

    async onModuleInit() {
        await this.loadPermissions();
    }

    private async loadPermissions() {
        const permis = await this.roleService.listPermission();
        const map = new Map<string, Set<string>>();
        for (const row of permis) {
            if (!map.has(row.role_name)) map.set(row.role_name, new Set());
            map.get(row.role_name)!.add(row.permission_key);
        }
        this.cache = map;
    }

    hasPermission(role: string, permission: string): boolean {
        return this.cache.get(role)?.has(permission) ?? false;
    }

    hasAllPermissions(role: string, permissions: string[]): boolean {
        return permissions.every(p => this.hasPermission(role, p));
    }

    // เผื่ออนาคตทำ Admin Endpoint สั่ง Refresh โดยไม่ต้อง Restart
    async refresh() {
        await this.loadPermissions();
    }
}