import {Body, Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from '../auth/guards/jwtAuth.guard';

@Controller('user')
export class UsersController{
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMyProfile(@Req() request){
        return request['user'];
    }
}