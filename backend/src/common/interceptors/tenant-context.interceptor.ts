import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, firstValueFrom, from } from 'rxjs';
import { DbContextService } from '../../database/db-context.service';
//firstValueFrom ทำอะไร — next.handle() คืนค่าเป็น Observable (รูปแบบของ RxJS) แต่ runInTransaction ต้องการ Promise ตัวนี้คือตัวแปลง Observable เป็น Promise เพื่อให้ await ได้
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
    constructor(private readonly db: DbContextService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;   // JwtAuthGuard ใส่ไว้ให้แล้ว

        // route สาธารณะ (login, register) ไม่มี user
        // ปล่อยผ่านไปเลย ให้ service จัดการ transaction เอง
        if (!user?.tenantID) {
            return next.handle();
        }

        return from(
            this.db.runInTransaction(
                {
                    tenantId: user.tenantID,
                    userId: user.sub ?? null,
                    role: user.role ?? null,
                    clientIp: request.ip ?? 'unknown',
                    deviceInfo: request.headers['user-agent'] ?? 'unknown',
                },
                // แปลง Observable ของ controller เป็น Promise
                // เพื่อให้ transaction ครอบตลอดจนงานเสร็จ ไม่ commit ก่อน
                // รอให้ controller ทำงานจนจบ แล้วค่อย COMMIT
                () => firstValueFrom(next.handle()),
            ),
        );
    }
}