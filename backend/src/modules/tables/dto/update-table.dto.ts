import { IsOptional, IsString, IsInt, Min, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTableDto {
  @ApiPropertyOptional({
    description: 'เลขหรือชื่อโต๊ะใหม่ (ไม่ซ้ำกับโต๊ะอื่นในร้าน)',
    example: 'T01-A',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  tableNumber?: string;

  @ApiPropertyOptional({
    description: 'จำนวนที่นั่งต่อโต๊ะ (ต้องมากกว่า 0)',
    example: 6,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'ชั้นที่โต๊ะตั้งอยู่',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  floor?: number;
}
