import { Injectable ,  Inject} from '@nestjs/common';
import {Pool, PoolClient} from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class TenantsRepository{
    constructor(@Inject(PG_POOL) private pool : Pool){}
    async createTenant(
        client: PoolClient,
        restaurant_name:string,
        tenant_slug:string,
        phone:string,
        house_number:string,
        moo:string,
        soi:string,
        road:string,
        subdistrict:string,
        district:string,
        province:string,
        postal_code:string
    ){
        const sql = `INSERT INTO tenants (
        restaurant_name, tenant_slug , phone , house_number, moo, soi, road, subdistrict, district, province, postal_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING tenant_id;
        `
        const result = await client.query(sql,[restaurant_name,tenant_slug,phone,house_number,moo,soi,road,subdistrict,district,province,postal_code]);
        return  result.rows[0];
    }
    
   async findTenantSlug(tenant_slug:string){
        const sql = `SELECT tenant_id from tenants where tenant_slug =$1;`
        const result = await this.pool.query(sql,[tenant_slug]);
        return result.rows[0]
   }
}