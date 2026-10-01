import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class MenuRepository{
    constructor( @Inject(PG_POOL) private readonly pool: Pool){}
    
    async createCategory(tenant_id:string,name:string){
        const sql = `
            INSERT INTO categories(tenant_id, name, sort_order)
            VALUES(
                $1, $2,
                COALESCE((SELECT MAX(sort_order)+1 FROM categories WHERE tenant_id=$1), 0)
            )
            RETURNING *;
        `;
        const result = await this.pool.query(sql,[tenant_id,name]);
        return result.rows[0];
    }

    async createMenu(){
        const sql = `
            INSERT INTO menu_items(name,description,price,is_available,is_active)
        `;
        const result = await this.pool.query(sql);
        return result.rows;
    }

    async findCategoryByTenantAndName(tenant_id:string,name:string){
        const sql = `
            SELECT name 
            FROM categories
            WHERE tenant_id = $1 AND name = $2;
        `;
        const result = await this.pool.query(sql,[tenant_id,name]);
        return result.rows[0]??null;
    }

    async disableCategoryByTenantAndName(tenant_id:string,name:string){
        const sql = `
            UPDATE categories
            SET is_active = false   
            WHERE tenant_id = $1 AND name = $2
            RETURNING *;
        `;
        const result = await this.pool.query(sql,[tenant_id,name]);
        return result.rows[0]??null;
    }

    async enableCategoryByTenantAndName(tenant_id:string,name:string){
        const sql = `
            UPDATE categories
            set is_active = true
            where tenant_id = $1 and name = $2
            RETURNING *;
        `;
        const result = await this.pool.query(sql,[tenant_id,name]);
        return result.rows[0]??null;
    }
}