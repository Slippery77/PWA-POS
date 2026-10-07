import { Controller, Body, Param, Post, Patch, ParseUUIDPipe, Get, Put } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CategoryDTO } from './dto/category.dto';
import { AnyAuthenticated, RequirePermissions } from '../auth/guards/permissions.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiCreatedResponse, ApiBadRequestResponse,ApiForbiddenResponse } from '@nestjs/swagger';
import { MenuItemDTO } from './dto/menu.dto';
import { UpdateMenuItemDTO } from './dto/update_menuItem.dto';
import { ModifierGroupDTO } from './dto/modifier-group.dto';
import { ItemModifierDTO } from './dto/modifier_items.dto';
import { ReplaceMenuItemModifierGroupsDTO } from './dto/replaceMenuItemModifierGroups.dto';

@ApiBearerAuth()
@ApiTags('Menu')
@ApiResponse({status:401 ,description: 'ไม่มี token หรือ token หมดอายุ' })
@Controller('menu')
export class MenuController {
    constructor(private readonly menuService : MenuService){}
    
    @ApiOperation({
        summary: 'สร้างหมวดหมู่เมนู',
        description: 'สร้างหมวดหมู่เมนูใหม่ โดยต้องมีสิทธิ์ menu:edit และต้องชื่อไม่ซ้ำกับหมวดหมู่ที่มีอยู่แล้ว'
    })
    @ApiResponse({status:201, description:'หมวดหมู่ถูกสร้างเรียบร้อย'})
    @ApiResponse({status:400, description: 'ข้อมูลไม่ถูกต้อง' })
    @ApiResponse({status:403, description:'ไม่มีสิทธิ์ในการสร้าง menu'})
    @ApiResponse({status:409, description:'มีหมวดหมู่ชื่อนี้ที่ใช้งานอยู่แล้ว'})
    @RequirePermissions('menu:edit')
    @Post('category')
    async createCategory(@Body() dto: CategoryDTO, ){
        return this.menuService.createCategory(dto);
    }

    @ApiOperation({
        summary: 'ปิดการใช้งานหมวดหมู่เมนู',
        description: 'ปิดการใช้งานหมวดหมู่เมนูที่ระบุ โดยผู้ใช้งานต้องมีสิทธิ์ menu:edit และหมวดหมู่จะไม่สามารถใช้งานได้จนกว่าจะเปิดใช้งานอีกครั้ง'
    })
    @ApiResponse({status:200, description:'ปิดการใช้งานหมวดหมู่เรียบร้อยแล้ว'})
    @ApiResponse({status:400, description:'ข้อมูลไม่ถูกต้อง' })
    @ApiResponse({status:403, description:'ไม่มีสิทธิ์ในการแก้ไขหมวดหมู่เมนู'})
    @ApiResponse({status:404, description:'ไม่พบหมวดหมู่เมนูที่ระบุ'})
    @RequirePermissions('menu:edit')
    @Patch('category/:category_id/disable')
    async disableCategory(@Param('category_id', ParseUUIDPipe) categoryId:string){
        return this.menuService.setCategoryActive(categoryId,false);
    }

    @ApiOperation({
        summary: 'เปิดการใช้งานหมวดหมู่เมนู',
        description: 'เปิดการใช้งานหมวดหมู่เมนูที่ระบุ โดยผู้ใช้งานต้องมีสิทธิ์ menu:edit '
    })
    @ApiResponse({status:200, description:'เปิดใช้งานหมวดหมู่เรียบร้อยแล้ว'})
    @ApiResponse({status:400, description:'ข้อมูลไม่ถูกต้อง' })
    @ApiResponse({status:403, description:'ไม่มีสิทธิ์ในการแก้ไขหมวดหมู่เมนู'})
    @ApiResponse({status:404, description:'ไม่พบหมวดหมู่เมนูที่ระบุ'})
    @ApiResponse({status:409, description:'หมวดหมู่เมนูถูกเปิดการใช้งานอยู่แล้ว'})
    @RequirePermissions('menu:edit')
    @Patch('category/:category_id/enable')
    async enableCategory(@Param('category_id', ParseUUIDPipe) categoryId:string){
        return this.menuService.setCategoryActive(categoryId,true);
    }

    @ApiOperation({
        summary:'เปลี่ยนชื่อหมวดหมู',
        description:'เปลี่ยนชื่อหมวดหมู่',
    })
    @ApiResponse({status: 200,description: 'เปลี่ยนชื่อหมวดหมู่เรียบร้อยแล้ว'})
    @ApiResponse({status: 400,description: 'ข้อมูลไม่ถูกต้อง'})
    @ApiResponse({status: 403,description: 'ไม่มีสิทธิ์ในการแก้ไขหมวดหมู่เมนู'})
    @ApiResponse({status: 404,description: 'ไม่พบหมวดหมู่เมนูที่ระบุ'})
    @ApiResponse({status: 409,description: 'มีหมวดหมู่ชื่อนี้ที่ใช้งานอยู่แล้ว'})
    @RequirePermissions('menu:edit')
    @Patch('category/:category_id')
    async renameCategory(@Param('category_id',ParseUUIDPipe) categoryId:string, @Body() dto:CategoryDTO){
        return this.menuService.renameCategory(categoryId, dto);
    }

    @ApiOperation({ summary: 'ดึงหมวดหมู่เมนูทั้งหมด' })
    @ApiOkResponse({ description: 'ดึงข้อมูลเรียบร้อยแล้ว' })
    @AnyAuthenticated()
    @Get('category')                                    // ← เดิม @Get() ได้ GET /menu
    async listCategories() {
        return this.menuService.listCategories();
    }

    //ส่วนเมนู
    @ApiOperation({ summary: 'สร้างเมนูใหม่ในหมวดหมู่ที่ระบุ' })
    @ApiCreatedResponse({ description: 'สร้างเมนูเรียบร้อยแล้ว' })
    @ApiBadRequestResponse({ description: 'ข้อมูลไม่ถูกต้อง หรือไม่พบหมวดหมู่ที่ระบุ' })
    @ApiConflictResponse({ description: 'มีเมนูชื่อนี้ขายอยู่แล้ว' })
    @RequirePermissions('menu:edit')
    @Post('items')
    async createMenuItems(@Body() dto:MenuItemDTO){
        return this.menuService.createMenu(dto);
    }

    @ApiOperation({ summary: 'กลับมาขายเมนูอีกครั้ง' })
    @ApiOkResponse({ description: 'เปิดขายเมนูเรียบร้อยแล้ว' })
    @ApiNotFoundResponse({ description: 'ไม่พบเมนูที่ระบุ' })
    @ApiConflictResponse({ description: 'มีเมนูชื่อนี้ขายอยู่แล้ว' })
    @RequirePermissions('menu:edit')
    @Patch('items/:menu_item_id/enable')
    async enableMenuItem(@Param('menu_item_id', ParseUUIDPipe) menuItemId: string) {
        return this.menuService.setMenuItemActive(menuItemId, true);
    }

    @ApiOperation({ summary: 'ปิดการขายเมนู' })
    @ApiOkResponse({ description: 'ปิดขายเมนูเรียบร้อยแล้ว' })
    @ApiNotFoundResponse({ description: 'ไม่พบเมนูที่ระบุ' })
    @RequirePermissions('menu:edit')
    @Patch('items/:menu_item_id/disable')
    async disableMenuItem(@Param('menu_item_id', ParseUUIDPipe) menuItemId: string) {
        return this.menuService.setMenuItemActive(menuItemId, false);
    }

     @ApiOperation({
        summary: 'แก้ไขเมนู',
        description: 'ส่งเฉพาะช่องที่ต้องการแก้ (name, description, price, category_id) ช่องที่ไม่ส่งจะไม่ถูกแตะ',
    })
    @ApiParam({ name: 'menu_item_id', format: 'uuid', example: 'b7e2d4f1-3c8a-4e5b-9f1d-2a6c8e0b4d7f' })
    @ApiOkResponse({ description: 'แก้ไขเมนูเรียบร้อยแล้ว' })
    @ApiBadRequestResponse({ description: 'ไม่ได้ส่งข้อมูล ข้อมูลผิดรูป หรือไม่พบหมวดหมู่ที่ระบุ' })
    @ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์ menu:edit' })
    @ApiNotFoundResponse({ description: 'ไม่พบเมนูที่ระบุ' })
    @ApiConflictResponse({ description: 'มีเมนูชื่อนี้ขายอยู่แล้ว' })
    @RequirePermissions('menu:edit')
    @Patch('items/:menu_item_id')
    async updateItem(@Param('menu_item_id', ParseUUIDPipe) menuItemId:string,@Body() dto:UpdateMenuItemDTO ){
        return this.menuService.updateMenuItem(menuItemId,dto)
    }

    @ApiOperation({
        summary: 'สร้างกลุ่มตัวเลือก',
        description: 'เช่น ระดับความเผ็ด หรือ ของเพิ่ม · single เลือกได้ตัวเดียว multi เลือกได้หลายตัว · สร้างแล้วนำไปผูกกับหลายเมนูได้',
    })
    @ApiCreatedResponse({ description: 'สร้างกลุ่มตัวเลือกเรียบร้อยแล้ว' })
    @ApiBadRequestResponse({ description: 'ข้อมูลไม่ถูกต้อง เช่น selection_type ไม่ใช่ single หรือ multi' })
    @ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์ menu:edit' })
    @ApiConflictResponse({ description: 'มีกลุ่มตัวเลือกชื่อนี้อยู่แล้ว' })
    @RequirePermissions('menu:edit')
    @Post('modifier-groups')
    async createModifierGroup(@Body() dto:ModifierGroupDTO){
        return this.menuService.createModifierGroup(dto);
    }

    @ApiOperation({
        summary: 'สร้างตัวเลือกในกลุ่ม',
        description: 'เช่น เผ็ดน้อย หรือ ไข่ดาว +10 บาท · price_delta เป็น 0 ได้สำหรับตัวเลือกที่ไม่คิดเงิน',
    })
    @ApiCreatedResponse({ description: 'สร้างตัวเลือกเรียบร้อยแล้ว' })
    @ApiBadRequestResponse({ description: 'ข้อมูลไม่ถูกต้อง หรือไม่พบกลุ่มตัวเลือกที่ระบุ' })
    @ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์ menu:edit' })
    @ApiConflictResponse({ description: 'มีตัวเลือกชื่อนี้ในกลุ่มแล้ว' })
    @RequirePermissions('menu:edit')
    @Post('modifiers')
    async createModifierItem(@Body() dto:ItemModifierDTO){
        return this.menuService.createModifierItem(dto);
    }

    @ApiOperation({
    summary: 'กำหนดกลุ่มตัวเลือกของเมนู',
    description: 'ส่งรายการกลุ่มทั้งชุด ลำดับใน array คือลำดับที่แสดง · ส่ง [] เพื่อถอดออกทั้งหมด',
    })
    @ApiParam({ name: 'menu_item_id', format: 'uuid', example: 'b7e2d4f1-3c8a-4e5b-9f1d-2a6c8e0b4d7f' })
    @ApiOkResponse({ description: 'บันทึกเรียบร้อย คืนกลุ่มที่ผูกอยู่ตามลำดับ' })
    @ApiBadRequestResponse({ description: 'ข้อมูลไม่ถูกต้อง id ซ้ำ หรือไม่พบกลุ่มตัวเลือกบางรายการ' })
    @ApiForbiddenResponse({ description: 'ไม่มีสิทธิ์ menu:edit' })
    @ApiNotFoundResponse({ description: 'ไม่พบเมนู หรือเมนูถูกปิดขายแล้ว' })
    @RequirePermissions('menu:edit')
    @Put('items/:menu_item_id/modifier-groups')
    async replaceMenuItemModifierGroups(@Param('menu_item_id', ParseUUIDPipe) menuItemId:string , @Body() dto:ReplaceMenuItemModifierGroupsDTO){
        return this.menuService.replaceMenuItemModifierGroups(menuItemId,dto);
    }
}
