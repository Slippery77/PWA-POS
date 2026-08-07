import { Injectable, Inject } from "@nestjs/common";
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class RolesRepository{
    constructor(@Inject(PG_POOL) private pool:Pool){}
    async findRoleByName(role_name:string){
        const sql = `
                SELECT role_id 
                FROM roles
                WHERE role_name = $1;
        `
        const result = await this.pool.query(sql,[role_name]);
        return result.rows[0]??null;
    }
    async findRoleByID(role_id : string){
        const sql = `
                SELECT role_name
                FROM roles
                WHERE role_id = $1;
        `
        const result = await this.pool.query(sql,[role_id]);
        return result.rows[0]??null;
    }
}