import { Injectable } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';
import { PoolClient } from 'pg';

@Injectable()
export class TenantsService {
    constructor(
        private readonly tenantsRepository : TenantsRepository 
    ){}
    async createTenant (
        client:PoolClient,
        restaurant_name:string, 
        tenant_slug:string,
        phone:string,
        house_number:string,
        village:string,
        soi:string,
        road:string,
        subdistrict:string,
        district:string,
        province:string,
        postal_code:string
    ){
        return this.tenantsRepository.createTenant(
            client,
            restaurant_name,
            tenant_slug,
            phone,house_number,
            village,
            soi,
            road,
            subdistrict,
            district,
            province,
            postal_code
        );
    }
    async findTenantSlug(tenant_slug:string){
        return this.tenantsRepository.findTenantSlug(tenant_slug);
    }
}