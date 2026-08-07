import { Module } from '@nestjs/common';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { UsersModule } from '../users/users.module';
import { TenantsModule } from '../tenants/tenants.module';
import { RolesModule } from '../roles/roles.module';

@Module({
    // ใช้บริการจาก Users, Tenants และ Roles ในการลงทะเบียน
    imports: [UsersModule, TenantsModule, RolesModule],
    // เพิ่ม RegisterService ให้ module นี้ใช้งานได้
    providers: [RegisterService],
    // Controller ที่รับ request สำหรับการสมัครสมาชิก
    controllers: [RegisterController],
    // เปิดให้ service นี้ถูกใช้จาก module อื่นได้
    exports: [RegisterService],
})
export class RegistersModule {}