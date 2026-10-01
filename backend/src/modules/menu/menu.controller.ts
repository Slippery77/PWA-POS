import { Controller, Body, Param, Get, Post, HttpStatus, HttpCode , UseGuards, Req, Patch} from '@nestjs/common';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { CategoryDTO } from './dto/category.dto';
import { RequirePermissions } from '../auth/guards/permissions.decorator';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService : MenuService){}
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('menu:edit')
    @Post('category')
    async createCategory(@Req() req , @Body() dto: CategoryDTO, ){
        const tenantID = req.user.tenantID; // Assuming the tenant_id is part of the JWT payload
        return this.menuService.createCategory(tenantID,dto);
    }

    @HttpCode(HttpStatus.OK)
    @RequirePermissions('menu:edit')
    @Patch('category/:category_id/disable')
    async disableCategory(@Req() req, @Body() dto:CategoryDTO){
        const tenantID = req.user.tenantID;
        return this.menuService.disableCategory(tenantID,dto);
    }

    @HttpCode(HttpStatus.OK)
    @RequirePermissions('menu:edit')
    @Patch('category/:category_id/enable')
    async enableCategory(@Req() req, @Body() dto:CategoryDTO){
        const tenantID = req.user.tenantID;
        return this.menuService.enableCategory(tenantID,dto);
    }
}
