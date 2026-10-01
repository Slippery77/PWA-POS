import { Injectable , ConflictException, NotFoundException} from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { MenuDto } from './dto/menu.dto';
import { CategoryDTO } from './dto/category.dto';

@Injectable()
export class MenuService {
    constructor(
        private readonly menuRepository:MenuRepository,
    ){}

    async createCategory(tenant_id:string, dto: CategoryDTO){  
        const existingCategory = await this.menuRepository.findCategoryByTenantAndName(tenant_id, dto.name);
        if(existingCategory){
            throw new ConflictException(`Category with name ${dto.name} already exists.`);
        }
        const result = await this.menuRepository.createCategory(tenant_id,dto.name)
        return {
            status:"success",
            data: {
                category_id: result.category_id,
                tenant_id: result.tenant_id,
                name: result.name,
                sort_order: result.sort_order,
                is_active: result.is_active,
                created_at: result.created_at,
                updated_at: result.updated_at
            }
        };
    }

    async disableCategory(tenant_id:string, dto:CategoryDTO){
        const existingCategory = await this.menuRepository.findCategoryByTenantAndName(tenant_id, dto.name);
        if(!existingCategory){
            throw new NotFoundException(`Category with name ${dto.name} does not exist.`);
        }

        const result = await this.menuRepository.disableCategoryByTenantAndName(tenant_id,dto.name)
        return {
            status:"success",
            data:{
                category_id: result.category_id,
                tenant_id: result.tenant_id,
                name: result.name,
                sort_order: result.sort_order,
                is_active: result.is_active,
                created_at: result.created_at,
                updated_at: result.updated_at   
            }
        }
    }
    
    async enableCategory(tenant_id:string,dto:CategoryDTO){
        const existingCategory = await this.menuRepository.findCategoryByTenantAndName(tenant_id, dto.name);
        if(!existingCategory){
            throw new NotFoundException(`Category with name ${dto.name} does not exist.`);
        }

        const result = await this.menuRepository.enableCategoryByTenantAndName(tenant_id,dto.name)
        return{
            status:"success",
            data:{
                category_id: result.category_id,
                tenant_id: result.tenant_id,
                name: result.name,
                sort_order: result.sort_order,
                is_active: result.is_active,
                created_at: result.created_at,
                updated_at: result.updated_at  
            }
        };
    }
}
