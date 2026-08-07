import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor( private readonly jwtService : JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token){
            throw new UnauthorizedException('No token provided!');
        }

        try{
            // 💡 Here the JWT secret key that's used for verifying the payload 
            // is the key that was passed in the JwtModule
            const payload = await this.jwtService.verifyAsync(token);
            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers
            request['user'] = payload;   // แนบข้อมูล user เข้า request (ตามที่คุยกันไปว่าทำไมต้องมี)
        }catch{
            throw new UnauthorizedException();
        }
        return true;
    }
    
    private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
// Bearer คือมาตรฐานของ authorization ซึ่ง Authorization รองรับได้หลายแบบ ไม่ใช่แค่ JWT เท่านั้น
//ทำไม extractTokenFromHeader ต้องเช็ค type === 'Bearer' ด้วย ทำไมไม่เอาค่าหลัง space ตัวแรกมาใช้เป็น token เลยเฉยๆ (ไม่ต้องสนใจว่าคำแรกคืออะไร)
//ถ้าไม่เช็ค type === 'Bearer' แล้วมีคนส่ง header แบบอื่นมาโดยไม่ได้ตั้งใจ (เช่น เผลอส่ง Authorization: Basic xxxxx มา) โค้ดจะเอาคำว่า "xxxxx" (ส่วนหลัง space) ไปพยายาม verify เป็น JWT ทันที ทั้งที่มันไม่ใช่ JWT เลย — จะได้ error ที่สับสน (บอกว่า "invalid token" ทั้งที่จริงๆ ปัญหาคือ "ส่งผิดประเภทมาตั้งแต่ต้น")
//การเช็ค type === 'Bearer' คือการยืนยันว่า "รูปแบบที่ส่งมาตรงตามที่เราคาดหวังจริงไหม" ก่อนจะเอาไปประมวลผลต่อ — ถ้าไม่ตรง ให้ปฏิเสธตั้งแต่ต้นทาง (คืน undefined แล้ว throw UnauthorizedException ทันที) แทนที่จะปล่อยให้ไปพังตอน verifyAsync แบบไม่ชัดเจนว่าปัญหาคืออะไร