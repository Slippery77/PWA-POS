import { Inject,Injectable } from "@nestjs/common";
import {Pool, PoolClient} from 'pg';
import {PG_POOL} from '../../database/database.module';

@Injectable()
export class UsersRepository{
    constructor(@Inject(PG_POOL) private pool : Pool){}
    // async findByUsernameAndTenantID(username:string , tenantID:string ){
    //     const sql = `SELECT role_id, tenant_id ,users_id ,username, password_hash
    //                 FROM users 
    //                 where username = $1 AND tenant_id = $2;`
    //     const result = await this.pool.query(sql,[username,tenantID]);
    //     return result.rows[0]??null; 
    // }
    async createOwner(
        client : PoolClient,
        tenant_id:string,
        role_id:string,
        username : string , 
        email : string ,
        password:string,
        display_name:string
    ) {
        const sql = `INSERT INTO users (tenant_id, role_id, username ,email, password_hash, display_name)
                    VALUES ($1,$2,$3,$4,$5,$6);
        `
        const result = await client.query(sql,[tenant_id,role_id,username,email,password,display_name]);
        return result.rows[0];
    }

    async findEmail(email:string){
        const sql =  `
            SELECT email from users where email = $1;
        `
        const result = await this.pool.query(sql,[email]);
        return result.rows[0] ?? null;
    }

    async findUsernameAndTenantID(tenantID:string,username:string){
        const sql = `
            SELECT username 
            from users 
            where tenant_id = $1 and username = $2;
        `
        const result = await this.pool.query(sql,[tenantID,username]);
        return result.rows[0] ?? null;
    }

    async findByUsernameAndTenantSlug(username:string, tenantSlug:string){
        const sql = `
            SELECT u.users_id ,u.role_id, u.tenant_id, u.username, u.password_hash, u.is_active
            FROM users u 
            join tenants t on u.tenant_id = t.tenant_id
            where u.username = $1 AND t.tenant_slug = $2;
        `
        const result = await this.pool.query(sql,[username, tenantSlug]);
        return result.rows[0]??null;
    }

    async createUser( tenantID:string, roleID:string, username:string, password:string, pin?:string|null, displayName?:string ){
        const sql = `
            INSERT INTO users(tenant_id,role_id,username,password_hash,pin_hash,display_name) 
            VALUES($1,$2,$3,$4,$5,$6)
            RETURNING *;
        `;
        const result = await this.pool.query(sql,[tenantID,roleID,username,password,pin,displayName])
        return result.rows[0];
    }
}
 