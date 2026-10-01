import {Body, Controller, Get, Req, Post} from "@nestjs/common";
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';
import { RequirePermissions } from "../auth/guards/permissions.decorator";
import { CreateUserDTO } from "./dto/createUser.dto";
import { UsersService } from "./users.service";


@Controller('user')
export class UsersController{
    constructor(private readonly usersService:UsersService){}
    // @Get('me')
    // getMyProfile(@Req() request){
    //     return request['user'];
    // }
    @RequirePermissions('user:manage')
    @Post()
    async registrationEmployee(@Req() req,@Body() dto:CreateUserDTO){
        const tenantID = req.user.tenantID;
        return this.usersService.createUser(tenantID,dto);
    }
}