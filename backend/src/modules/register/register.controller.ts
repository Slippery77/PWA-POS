import { Body, Controller , Post,Req } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterOwnerDto } from './dto/registerOwner.dto';
import { Public} from '../auth/guards/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('register')
export class RegisterController{
    constructor(private readonly registersService : RegisterService){}
    @Throttle({default:{ttl:300000, limit:3}})
    @Public()
    @Post('')
    async registrationOwner(@Body() dto: RegisterOwnerDto, @Req() req){
        return this.registersService.registrationOwner(dto, req.ip ?? 'unknown', req.headers['user-agent'] ?? 'unknown');

    }
}