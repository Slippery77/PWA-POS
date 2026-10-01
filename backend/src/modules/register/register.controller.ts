import { Body, Controller , Post, HttpCode, HttpStatus,Req } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterOwnerDto } from './dto/registerOwner.dto';
import { Public} from '../auth/guards/public.decorator';
import { RequirePermissions } from '../auth/guards/permissions.decorator';

@Controller('register')
export class RegisterController{
    constructor(private readonly registersService : RegisterService){}
    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('')
    async registrationOwner(@Body() dto: RegisterOwnerDto){
        return this.registersService.registrationOwner(dto);
    }
}