import { Body, Controller , Post, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterOwnerDto } from './dto/register.dto';

@Controller('register')
export class RegisterController{
    constructor(private readonly registersService : RegisterService){}
    @HttpCode(HttpStatus.OK)
    @Post('registerOwner')
    async registration(@Body() dto: RegisterOwnerDto){
        return this.registersService.registration(dto);
    }
}