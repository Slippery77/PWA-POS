import { Injectable } from '@nestjs/common';
import { TenantsRepository } from './tenants.repository';

@Injectable()
export class TenantsService {
    constructor(
        private readonly tenantsRepository : TenantsRepository 
    ){}
    async createTenant (
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
        return this.tenantsRepository.createTenant(
            tenant_id,
            restaurant_name,
            tenant_slug,
            phone,
            house_number,
            moo,
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