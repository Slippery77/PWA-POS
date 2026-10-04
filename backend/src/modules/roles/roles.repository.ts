import { Injectable, Inject } from "@nestjs/common";
import { Pool } from 'pg';
import { DbContextService } from "../../database/db-context.service";

@Injectable()
export class RolesRepository{
    constructor(private readonly db: DbContextService){}
    async findRoleByName(role_name:string){
        const sql = `
                SELECT role_id 
                FROM roles
                WHERE role_name = $1;
        `;
        const result = await this.db.referenceQuery(sql,[role_name]);
        return result.rows[0]??null;
    }
    async findRoleByID(role_id : string){
        const sql = `
                SELECT role_name
                FROM roles
                WHERE role_id = $1;
        `;
        const result = await this.db.referenceQuery(sql,[role_id]);
        return result.rows[0]??null;
    }

    async listPermission(){
        const sql = `
            SELECT r.role_name ,p.permission_key
            FROM role_permissions rp 
            JOIN roles r on rp.role_id = r.role_id
            JOIN permissions p on rp.permission_id = p.permission_id;
        `;
        const result = await this.db.referenceQuery(sql);
        return result.rows;
    }
}