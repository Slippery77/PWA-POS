import { Body, Controller , Post, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginEmailDto } from './dto/login-with-email.dto';

// Controller สำหรับจัดการ endpoint ที่เกี่ยวกับการยืนยันตัวตนของผู้ใช้
@Controller('auth')
export class AuthController {
    // Inject AuthService เพื่อให้ controller สามารถเรียกใช้ logic การ login ได้
    constructor(private readonly authService: AuthService) {}

    // กำหนดให้ response ของ endpoint นี้คืนสถานะ HTTP 200 เมื่อ login สำเร็จ
    @HttpCode(HttpStatus.OK)
    // Route สำหรับการเข้าสู่ระบบที่อยู่ที่ /auth/login
    @Post('login')
    async login(@Body() dto: LoginDto) {
        // รับข้อมูล login จาก client แล้วส่งต่อไปยัง AuthService เพื่อทำการตรวจสอบ
        return this.authService.signIn(dto);
    }
    // @Post('login-with-email')
    // async loginWithEmail(@Body() dto: LoginEmailDto){
    //     return this.authService.signInWithEmail(dto);
    // } 
}