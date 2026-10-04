import { Injectable } from '@nestjs/common';
import { DbContextService } from '../../database/db-context.service';

@Injectable()
export class TenantsRepository{
    constructor(private readonly db: DbContextService){}
    async createTenant(
        tenant_id:string,
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
        tenant_id, restaurant_name, tenant_slug , phone , house_number, moo, soi, road, subdistrict, district, province, postal_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING tenant_id;
        `
        const result = await this.db.query(sql,[tenant_id, restaurant_name, tenant_slug, phone, house_number, moo, soi, road, subdistrict, district, province, postal_code]);
        return  result.rows[0];
    }
    
   async findTenantSlug(tenant_slug:string){
        // resolve_tenant เป็น SECURITY DEFINER จึงข้าม RLS ได้
        // ใช้ referenceQuery เพราะตอน login ยังไม่มี context
        const sql = `SELECT tenant_id, is_active FROM resolve_tenant($1)`;    
    
        //const sql = `SELECT tenant_id from tenants where tenant_slug =$1;`
        const result = await this.db.referenceQuery(sql,[tenant_slug]);
        return result.rows[0]
   }
}