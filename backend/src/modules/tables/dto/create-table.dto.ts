import { IsNotEmpty, IsString, IsInt, Min, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTableDto {
  @ApiProperty({
    description: 'เลขหรือชื่อโต๊ะ (ไม่ซ้ำกันภายในร้าน)',
    example: 'T01',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  tableNumber: string;

  @ApiProperty({
    description: 'จำนวนที่นั่งต่อโต๊ะ (ต้องมากกว่า 0)',
    example: 4,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    description: 'ชั้นที่โต๊ะตั้งอยู่ (ค่าเริ่มต้นคือ 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  floor?: number;
}
