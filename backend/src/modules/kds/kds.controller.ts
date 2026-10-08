import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { KdsService } from './kds.service';
import { UpdateKdsStatusDto } from './dto/update-kds-status.dto';
import {
  KdsQueueResponseDto,
  KdsItemResponseDto,
} from './dto/kds-response.dto';
import { RequirePermissions } from '../auth/guards/permissions.decorator';

@ApiBearerAuth()
@ApiTags('KDS (Kitchen Display System)')
@ApiResponse({ status: 401, description: 'ไม่มี token หรือ token หมดอายุ' })
@Controller('kds')
export class KdsController {
  constructor(private readonly kdsService: KdsService) {}

  /**
   * GET /kds/queue
   * ดึงรายการคิวอาหารในครัวที่ต้องทำ (สถานะ queued, preparing, ready)
   * หมายเหตุ: ใช้ Polling ทุกช่วงเวลา (ไม่ใช่ WebSocket/SSE)
   * Permission: kds:mark_ready
   */
  @ApiOperation({
    summary: 'ดึงรายการคิวอาหารในครัว (KDS Queue)',
    description:
      'ดึงรายการอาหารที่อยู่ในสถานะรอทำ (queued), กำลังทำ (preparing), และพร้อมเสิร์ฟ (ready) สำหรับแสดงผลบนจอครัว (ฝั่ง Frontend ใช้ Polling)',
  })
  @ApiOkResponse({
    description: 'ดึงรายการคิวอาหารสำเร็จ',
    type: KdsQueueResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'ไม่มีสิทธิ์ kds:mark_ready ในการเข้าถึงจอครัว',
  })
  @RequirePermissions('kds:mark_ready')
  @Get('queue')
  async getQueue() {
    return this.kdsService.getQueue();
  }

  /**
   * PATCH /kds/items/:id/status
   * เปลี่ยนสถานะของรายการอาหารในครัว (5 สถานะ: queued, preparing, ready, served, voided)
   * Permission: kds:mark_ready
   */
  @ApiOperation({
    summary: 'อัปเดตสถานะรายการอาหารบนจอครัว',
    description:
      'เปลี่ยนสถานะอาหารตาม 5 สถานะ (queued, preparing, ready, served, voided) ตามขั้นตอนของครัว',
  })
  @ApiParam({
    name: 'id',
    description: 'รหัสรายการอาหาร (order_item_id เป็น UUID)',
    format: 'uuid',
    example: 'a6000000-0000-0000-0000-000000000001',
  })
  @ApiOkResponse({
    description: 'อัปเดตสถานะสำเร็จ',
    type: KdsItemResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'ข้อมูลไม่ถูกต้อง สถานะไม่อยู่ใน 5 สถานะที่กำหนด หรือขั้นตอนการเปลี่ยนสถานะข้ามขั้นผิดกฎ (State Machine)',
  })
  @ApiForbiddenResponse({
    description:
      'ไม่มีสิทธิ์ kds:mark_ready หรือไม่มีสิทธิ์ void:approve เมื่อยกเลิกรายการที่กำลังทำ',
  })
  @ApiNotFoundResponse({
    description: 'ไม่พบรายการอาหารที่ระบุ',
  })
  @RequirePermissions('kds:mark_ready')
  @Patch('items/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateKdsStatusDto: UpdateKdsStatusDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.sub;
    return this.kdsService.updateStatus(id, updateKdsStatusDto, userId);
  }
}
