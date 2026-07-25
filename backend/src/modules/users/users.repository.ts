import { Inject,Injectable } from "@nestjs/common";
import {Pool} from 'pg';
import {PG_POOL} from '../../database/database.module';

@Injectable()
export class UsersRepository{
    constructor(@Inject(PG_POOL) private pool : Pool){}
    //tenantID:string
    async findByUsernameAndTenantID(username:string , tenantID:string ){
        const sql = `SELECT users_id ,username, role_id, tenant_id 
                    FROM users 
                    where username = $1 AND tenant_id = $2;`
        const result = await this.pool.query(sql,[username,tenantID]);
        return result.rows[0]??null; 
    }
    // function ใส่ข้อมูลเข้าไปในตาราง tenants
    async createRestuarant(restaurant_name:string, branch_name:string, tax_id:string, phone:string , email:string, address:string){
        const sql = `
            INSERT INTO tenants (restaurant_name, branch_name, tax_id , phone , email, address)
            value ($1, $2, $3, $4, $5, $6);`
        const result = await this.pool.query(sql,[restaurant_name,branch_name,tax_id,phone,email,address]);
        return result.rows[0]??null;
    }
    // function ใส่ข้อมูลเข้าไปในตาราง users
    async createUser(role:string , tenant:string ,username:string, password:string, ){
        const sql = `
            INSERT INTO users (role_id, tenant_id, username, password_hash)
                VALUES ($1 ,$2 ,$3 ,$4);
            `
        const result = await this.pool.query(sql,[role,tenant,username,password])
        return result.rows[0]??null;
    }  
}
 