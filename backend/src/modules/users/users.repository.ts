import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findbyUsernameAndTenantCode(
    username: string,
    tenantCode: string,
  ): Promise<User | null> {
    const query = `
            SELECT 
                u.users_id AS id,
                u.username,
                u.password_hash AS "passwordHash",
                u.is_active AS "isActive",
                r.role_name AS role,
                t.tenant_id::text AS "tenantCode"
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            JOIN tenants t ON u.tenant_id = t.tenant_id
            WHERE u.username = $1 
              AND (t.tenant_id::text = $2 OR t.restaurant_name = $2)
            LIMIT 1;
        `;
    const result = await this.pool.query(query, [username, tenantCode]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as User;
  }
}
