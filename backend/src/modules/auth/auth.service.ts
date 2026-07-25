import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import  { LoginDto } from '../auth/dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    // Inject repository สำหรับค้นหาข้อมูลผู้ใช้ และ JwtService สำหรับสร้าง token
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) {}

    // ฟังก์ชันสำหรับการเข้าสู่ระบบ
    async signIn(dto: LoginDto) {
        // ค้นหาผู้ใช้งานจาก username และ tenantID ที่รับมาจาก client
        const user = await this.userService.findByUsernameAndTenantID(dto.username, dto.tenantID);

        // ถ้าไม่พบผู้ใช้ ให้ยกเลิกคำขอและส่ง error 401 Unauthorized
        if (!user) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        // ตรวจสอบว่ารหัสผ่านที่ผู้ใช้ใส่ตรงกับรหัสผ่านที่เก็บไว้ในฐานข้อมูลหรือไม่
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        // สร้าง payload สำหรับ JWT โดยใส่ข้อมูลสำคัญของผู้ใช้
        const payLoad = { sub: user.id, username: user.username, tenantID: user.tenant_id, role: user.role_id };

        // สร้าง access token จาก payload ที่เตรียมไว้
        const accessToken = await this.jwtService.signAsync(payLoad);

        // คืนค่า response ที่ประกอบด้วย token และข้อมูลผู้ใช้
        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role_id,
                tenantID: user.tenant_id,
            }
        };
    }
}

// async createUser(dto: CreateUsers ){
//         const existUser = await this.usersRepository.findByUsernameAndTenantID(dto.username,dto.tenant);

//         if (existUser){
//             throw new BadRequestException('Username already exist');
//         }
//         // กลับมาทำ hash ต่อ
//     }  
