import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../auth/dto/login.dto';
import { LoginEmailDto } from './dto/login-with-email.dto';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    // Inject repository สำหรับค้นหาข้อมูลผู้ใช้ และ JwtService สำหรับสร้าง token
    constructor(
        private userService: UsersService,
        private rolesService :RolesService,
        private jwtService: JwtService
    ) {}

    // ฟังก์ชันสำหรับการเข้าสู่ระบบ
    async signIn(dto: LoginDto) {
        // ค้นหาผู้ใช้งานจาก username และ tenantSlug ที่รับมาจาก client
        const users = await this.userService.findByUsernameAndTenantSlug(dto.username, dto.tenantSlug);

        // ถ้าไม่พบผู้ใช้ ให้ยกเลิกคำขอและส่ง error 401 Unauthorized
        if (!users) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        // ตรวจสอบว่ารหัสผ่านที่ผู้ใช้ใส่ตรงกับรหัสผ่านที่เก็บไว้ในฐานข้อมูลหรือไม่
        const isPasswordValid = await bcrypt.compare(dto.password, users.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password');
        }

        const role = await this.rolesService.findRoleByID(users.role_id);

        // สร้าง payload สำหรับ JWT โดยใส่ข้อมูลสำคัญของผู้ใช้
        const payLoad = { sub: users.users_id, username: users.username, tenantID: users.tenant_id, role: role.role_name };
        console.log(payLoad);

        // สร้าง access token จาก payload ที่เตรียมไว้
        const accessToken = await this.jwtService.signAsync(payLoad);

        // คืนค่า response ที่ประกอบด้วย token และข้อมูลผู้ใช้
        return {
            accessToken,
            user: {
                id: users.users_id,
                username: users.username,
                role: role.role_name,
                tenantID: users.tenant_id,
            }
        };
    }
    // async signInWithEmail(dto: LoginEmailDto) {
    //     // TO DO : 
    //     const user = await this.userService.findByEmailAndTenantID(dto.email, dto.password);
    //     if(!user){
    //         throw new UnauthorizedException('Invalid Credentials');
    //     }    
    //     const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    //     if(!passwordValid){
    //         throw new UnauthorizedException('Invalid password');
    //     }
    //     const payload = {sub: user.users_id, email: user.email, tenantID: user.tenant_id, role: user.role_id};
    //     console.log(payload);
    //     const accessToken = await this.jwtService.signAsync(payload);
    //     return{
    //         accessToken,
    //         user:{
    //             id: user.users_id,
    //             email: user.email,
    //             role: user.role_id,
    //             tenantID: user.tenant_id,
    //         }
    //     }
    // }
}