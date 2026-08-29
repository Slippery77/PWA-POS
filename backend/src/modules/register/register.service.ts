import { RegisterOwnerDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { TenantsService } from '../tenants/tenants.service';
import { Injectable, Inject, ConflictException, InternalServerErrorException } from '@nestjs/common';
import {Pool} from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class RegisterService {
    constructor(
        private userService: UsersService,
        private rolesService: RolesService,
        private tenantsService: TenantsService,
        @Inject(PG_POOL)
        private readonly pool: Pool,
    ) {}

    async registration(dto: RegisterOwnerDto) {
        // ตรวจสอบว่า tenant slug นี้ถูกใช้ไปแล้วหรือยัง
        const tenantSlugExisted = await this.tenantsService.findTenantSlug(dto.tenant_slug);
        if (tenantSlugExisted) {
            throw new ConflictException('Tenant Slug already exist!');
        }

        // ตรวจสอบว่าอีเมลนี้ถูกใช้แล้วหรือยัง
        const emailExisted = await this.userService.findEmail(dto.email);
        if (emailExisted) {
            throw new ConflictException('Email already exist!');
        }

        // แปลงรหัสผ่านเป็น hash เพื่อความปลอดภัยก่อนเก็บในฐานข้อมูล
        const hash_password = await bcrypt.hash(dto.password, 10);

        // ค้นหา role ของ owner เพื่อใช้เป็นบทบาทเริ่มต้นของผู้สร้าง tenant
        const roleOwner = await this.rolesService.findRoleName('owner');
        if (!roleOwner) {
            throw new InternalServerErrorException('Owner role not found!');
        }

        // ใช้ transaction เพื่อให้การสร้าง tenant และ owner ถูกต้องพร้อมกัน
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const tenant = await this.tenantsService.createTenant(
                client,
                dto.restaurant_name,
                dto.tenant_slug,
                dto.phone,
                dto.house_number,
                dto.moo,
                dto.soi,
                dto.road,
                dto.subdistrict,
                dto.district,
                dto.province,
                dto.postal_code,
            );

            await this.userService.createOwner(
                client,
                tenant.tenant_id,
                roleOwner.role_id,
                dto.username,
                dto.email,
                hash_password,
            );

            await client.query('COMMIT');
            return { message: 'Register Successfully!' };
        } catch (err) {
            // ถ้าสomething ผิดพลาดให้ rollback เพื่อไม่ให้ข้อมูลกึ่งสำเร็จค้างอยู่
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}