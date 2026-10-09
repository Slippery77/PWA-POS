import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export enum KdsItemStatus {
  QUEUED = 'queued',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  VOIDED = 'voided',
}

export class UpdateKdsStatusDto {
  @ApiProperty({
    description: 'สถานะใหม่ของรายการอาหารในครัว (5 สถานะ: queued, preparing, ready, served, voided)',
    enum: KdsItemStatus,
    example: KdsItemStatus.PREPARING,
  })
  @IsEnum(KdsItemStatus, {
    message: 'สถานะต้องเป็นหนึ่งใน: queued, preparing, ready, served, voided',
  })
  @IsNotEmpty({ message: 'กรุณาระบุสถานะ' })
  status: KdsItemStatus;

  @ApiPropertyOptional({
    description: 'เหตุผลการยกเลิก (จำเป็นเมื่อเปลี่ยนสถานะเป็น voided)',
    example: 'ลูกค้าขอยกเลิก',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  voidReason?: string;
}
