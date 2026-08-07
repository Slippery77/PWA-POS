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
        password:string
    ){
        const sql = `INSERT INTO users (tenant_id, role_id, username ,email, password_hash)
                    VALUES ($1,$2,$3,$4,$5);
        `
        const result = await client.query(sql,[tenant_id,role_id,username,email,password]);
        return result.rows[0];
    }
    async findEmail(email:string){
        const sql =  `
            SELECT email from users where email = $1;
        `
        const result = await this.pool.query(sql,[email]);
        return result.rows[0] ?? null;
    }
    async findUser(username:string){
        const sql = `
            SELECT username from users where username = $1;
        `
        const result = await this.pool.query(sql,[username]);
        return result.rows[0] ?? null;
    }

    async findByUsernameAndTenantSlug(username:string, tenantSlug:string){
        const sql = `
            SELECT u.users_id ,u.role_id, u.tenant_id, u.username, u.password_hash
            FROM users u 
            join tenants t on u.tenant_id = t.tenant_id
            where u.username = $1 AND t.tenant_slug = $2;
        `
        const result = await this.pool.query(sql,[username, tenantSlug]);
        return result.rows[0]??null;
    }
}
 