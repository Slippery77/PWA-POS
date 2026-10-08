import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KdsRepository } from './kds.repository';
import { UpdateKdsStatusDto } from './dto/update-kds-status.dto';

@Injectable()
export class KdsService {
  constructor(private readonly kdsRepository: KdsRepository) {}

  /**
   * ดึงรายการคิวอาหารในครัวทั้งหมด
   * Polling ทุกช่วงเวลาจากฝั่ง Frontend
   */
  async getQueue() {
    // TODO: เรียก kdsRepository.getQueue() และจัดรูปแบบข้อมูลตามต้องการ
    const items = await this.kdsRepository.getQueue();
    return {
      status: 'success',
      data: items,
    };
  }

  /**
   * อัปเดตสถานะของรายการอาหารในครัว (5 สถานะ)
   * คำแนะนำตาม backend-coding-standard.md:
   * - จัดการ error จาก DB trigger เช่น state transition ไม่ถูกต้อง หรือสิทธิ์ไม่พอ
   */
  async updateStatus(
    id: string,
    dto: UpdateKdsStatusDto,
    userId?: string,
  ) {
    try {
      // TODO: ตรวจสอบเงื่อนไขเพิ่มเติม หรือเรียก kdsRepository.updateStatus
      const updated = await this.kdsRepository.updateStatus(
        id,
        dto.status,
        userId,
        dto.voidReason,
      );

      if (!updated) {
        throw new NotFoundException('ไม่พบรายการอาหารที่ระบุ');
      }

      return {
        status: 'success',
        data: updated,
      };
    } catch (err: any) {
      if (err instanceof NotFoundException) {
        throw err;
      }

      // ดักจับ error จาก Database Trigger (trg_order_item_state)
      if (err.message?.includes('invalid order_item transition')) {
        throw new BadRequestException(`ไม่สามารถเปลี่ยนสถานะไปยัง ${dto.status} ได้`);
      }
      if (err.message?.includes('requires void:approve')) {
        throw new ForbiddenException('การยกเลิกรายการที่กำลังทำ ต้องมีสิทธิ์ void:approve');
      }

      throw err;
    }
  }
}
