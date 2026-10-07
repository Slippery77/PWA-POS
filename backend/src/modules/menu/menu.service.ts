import { Injectable , ConflictException, NotFoundException, BadRequestException} from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { CategoryDTO } from './dto/category.dto';
import { toCategoryResponse, toItemModifierResponse, toMenuItemModifierGroupResponse, toMenuItemResponse, toModifierGroupResponse} from './mapper/menu.mapper';
import { MenuItemDTO } from './dto/menu.dto';
import { UpdateMenuItemDTO } from './dto/update_menuItem.dto';
import { ModifierGroupDTO } from './dto/modifier-group.dto';
import { ItemModifierDTO } from './dto/modifier_items.dto';
import { ReplaceMenuItemModifierGroupsDTO } from './dto/replaceMenuItemModifierGroups.dto';

@Injectable()
export class MenuService {
    constructor(
        private readonly menuRepository:MenuRepository,
    ){}

    async createCategory(dto: CategoryDTO){  
        try{
            const result = await this.menuRepository.createCategory(dto.name)
        return {
            status:"success",
            data: toCategoryResponse(result)
        };
        }catch(err:any){
            if(err.code === '23505'){
                throw new ConflictException(`มีหมวดหมู่ชื่อ "${dto.name}" ที่ใช้งานอยู่แล้ว`);
            }
            throw err;
        }
    }

    async setCategoryActive(categoryId:string,is_active:boolean){
            const result = await this.menuRepository.setCategoryActive(categoryId,is_active );
            if(!result){
                throw new NotFoundException('ไม่พบหมวดหมู่นี้');
            }
            return {
            status:"success",
            data:toCategoryResponse(result)
        }
    }

    async renameCategory(categoryId:string, dto:CategoryDTO){
        let result;
        try{
            result = await this.menuRepository.renameCategory(categoryId, dto.name);
        }catch(err:any){
            if(err.code === '23505'){
                throw new ConflictException(`มีหมวดหมู่ชื่อ "${dto.name}" ที่ใช้งานอยู่แล้ว`);
            }
            throw err;
        }
        if(!result){
            throw new NotFoundException('ไม่พบหมวดหมู่ที่ระบุ')
        }
        return{
            status:'success',
            data:toCategoryResponse(result)
        };

    }

    async listCategories(){
        const result = await this.menuRepository.listCategories();
        return {
            status:'success',
            data:result.map(toCategoryResponse)
        }
    }
    // ส่วนของ Menu
    // สร้างเมนูใหม่
    async createMenu(dto:MenuItemDTO){
            try {
            const result = await this.menuRepository.createMenuItem(dto.category_id,dto.name,dto.description??null,dto.price,);
            return { status: 'success', data: toMenuItemResponse(result) };
            } catch (err: any) {
            if (err.code === '23505') {
                throw new ConflictException(`มีเมนูชื่อ "${dto.name}" ที่ขายอยู่แล้ว`);
            }
            if (err.code === '23503') {
                // composite FK (tenant_id, category_id) ปฏิเสธ
                // ทั้งกรณีหมวดหมู่ไม่มีจริง และกรณีเป็นของร้านอื่น
                throw new BadRequestException('ไม่พบหมวดหมู่นี้');
            }
            throw err;
        }
    }

    async setMenuItemActive(menuItemId:string,is_active:boolean){
 
        const result = await this.menuRepository.setMenuItemsActive(menuItemId,is_active );
        if(!result){
            throw new NotFoundException('ไม่พบเมนูนี้');
        }
        return {
            status:"success",
            data:toMenuItemResponse(result)
        }
    }

    async updateMenuItem(menuItemId:string, dto:UpdateMenuItemDTO){
       const fields = Object.keys(dto).filter(
            (k) => dto[k as keyof UpdateMenuItemDTO] !== undefined 
        );
        if(fields.length===0){
            throw new BadRequestException('ข้อมูลที่ส่งมาว่าง');
        }
        let result;
        try{
            result = await this.menuRepository.updateMenuItem(menuItemId,dto,fields)
        } catch (err: any) {
            if (err.code === '23505') {
                throw new ConflictException(`มีเมนูชื่อ "${dto.name}" ที่ขายอยู่แล้ว`);
            }
            if (err.code === '23503') {
                // composite FK (tenant_id, category_id) ปฏิเสธ
                // ทั้งกรณีหมวดหมู่ไม่มีจริง และกรณีเป็นของร้านอื่น
                throw new BadRequestException('ไม่พบหมวดหมู่นี้');
            }
            throw err;
        }
        if(!result){
            throw new NotFoundException('ไม่พบเมนูนี้')
        }
        return {
            status:'success',
            data:toMenuItemResponse(result)
        }
    }

    //ส่วน Item Modifier 
    async createModifierGroup(dto:ModifierGroupDTO){
        try{
            const result = await this.menuRepository.createModifierGroup(dto.name,dto.selection_type,dto.is_required??false);
            return {
                status:'success',
                data:toModifierGroupResponse(result)
            }
        }catch(err:any){
            if (err.code ==='23505'){
                throw new ConflictException(`มีกลุ่มตัวเลือกชื่อ ${dto.name} ที่ขายอยู่แล้ว`);
            }
            throw err;
        }
    }

    async createModifierItem(dto:ItemModifierDTO){
        try{
            const result = await this.menuRepository.createModifierItem(dto.modifier_group_id,dto.name,dto.price_delta)
            return {
                status:'success',
                data:toItemModifierResponse(result)
            }
        }catch(err:any){
            if(err.code === '23505'){
                throw new ConflictException(`มีชื่อ "${dto.name} แล้ว`);
            }
            if (err.code === '23503') {
                throw new BadRequestException('ไม่พบกลุ่มตัวเลือกนี้');
            }
            throw err;
        }
    }
    
    async replaceMenuItemModifierGroups(menuItemId:string,dto:ReplaceMenuItemModifierGroupsDTO){
        const item = await this.menuRepository.touchMenuItem(menuItemId);
        if(!item){
            throw new NotFoundException('ไม่พบเมนูนี้')
        }
        try{
            await this.menuRepository.deleteMenuItemModifierGroups(menuItemId);
            await this.menuRepository.insertMenuItemModifierGroups(menuItemId,dto.modifier_group_ids);
        }catch(err:any){
            if (err.code === '23503'){
                throw new BadRequestException('ไม่พบกลุ่มตัวเลือกบางรายการ')
            }
            throw err
        }
        const result = await this.menuRepository.listMenuItemModifierGroups(menuItemId)
        return {
            status:'success',
            data:result.map(toMenuItemModifierGroupResponse)
        }
    }
}
