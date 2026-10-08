import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KdsModifierDto {
  @ApiProperty({
    description: 'รหัสตัวเลือก/ท็อปปิ้ง (UUID)',
    format: 'uuid',
    example: 'a4000000-0000-0000-0000-000000000001',
  })
  modifier_id: string;

  @ApiProperty({
    description: 'ชื่อตัวเลือกหรือท็อปปิ้ง ณ เวลาที่สั่ง',
    example: 'ไข่ดาวไม่สุก',
  })
  name: string;

  @ApiProperty({
    description: 'ส่วนต่างราคา ณ เวลาที่สั่ง',
    example: 10,
  })
  price_delta: number;
}

export class KdsItemDto {
  @ApiProperty({
    description: 'รหัสรายการอาหาร (UUID)',
    format: 'uuid',
    example: 'a6000000-0000-0000-0000-000000000001',
  })
  order_item_id: string;

  @ApiProperty({
    description: 'รหัสบิลที่สังกัด (UUID)',
    format: 'uuid',
    example: 'a5000000-0000-0000-0000-000000000001',
  })
  order_id: string;

  @ApiPropertyOptional({
    description: 'เลขออเดอร์ประจำวัน',
    example: 12,
  })
  order_number?: number | null;

  @ApiPropertyOptional({
    description: 'เลขหรือชื่อโต๊ะ (ถ้ามี)',
    example: 'T01',
  })
  table_number?: string | null;

  @ApiProperty({
    description: 'ชื่อเมนู ณ เวลาที่สั่ง',
    example: 'ข้าวกะเพราไก่ไข่ดาว',
  })
  item_name_snapshot: string;

  @ApiProperty({
    description: 'สถานะรายการอาหารในครัว',
    enum: ['draft', 'queued', 'preparing', 'ready', 'served', 'voided'],
    example: 'queued',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'รหัสรอบที่ส่งเข้าครัว (ticket id)',
    format: 'uuid',
    example: 'a7000000-0000-0000-0000-000000000001',
  })
  kitchen_ticket_id?: string | null;

  @ApiPropertyOptional({
    description: 'คำขอพิเศษ (เช่น เผ็ดน้อย, ไม่ใส่ผักชี)',
    example: 'ไม่ใส่ผักชี',
  })
  special_request?: string | null;

  @ApiPropertyOptional({
    description: 'รายการตัวเลือกเพิ่มเติม / ท็อปปิ้ง',
    type: [KdsModifierDto],
  })
  modifiers?: KdsModifierDto[];

  @ApiPropertyOptional({
    description: 'เวลาที่ส่งเข้าคิวครัว',
    example: '2026-10-08T06:30:00.000Z',
  })
  queued_at?: string | null;

  @ApiPropertyOptional({
    description: 'เวลาที่เริ่มปรุงอาหาร',
    example: '2026-10-08T06:35:00.000Z',
  })
  preparing_at?: string | null;

  @ApiPropertyOptional({
    description: 'เวลาที่อาหารปรุงเสร็จพร้อมเสิร์ฟ',
    example: '2026-10-08T06:42:00.000Z',
  })
  ready_at?: string | null;

  @ApiPropertyOptional({
    description: 'เวลาที่เสิร์ฟอาหารแล้ว',
    example: '2026-10-08T06:45:00.000Z',
  })
  served_at?: string | null;

  @ApiProperty({
    description: 'เวลาสร้างรายการ',
    example: '2026-10-08T06:30:00.000Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'เวลาแก้ไขล่าสุด',
    example: '2026-10-08T06:35:00.000Z',
  })
  updated_at: string;
}

export class KdsQueueResponseDto {
  @ApiProperty({
    description: 'สถานะผลลัพธ์',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'รายการคิวอาหารในครัว',
    type: [KdsItemDto],
  })
  data: KdsItemDto[];
}

export class KdsItemResponseDto {
  @ApiProperty({
    description: 'สถานะผลลัพธ์',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'ข้อมูลรายการอาหารหลังอัปเดต',
    type: KdsItemDto,
  })
  data: KdsItemDto;
}
