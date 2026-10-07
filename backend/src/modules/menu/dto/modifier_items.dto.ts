import {IsNumber, IsString, IsNotEmpty, IsUUID,Min,Max,MaxLength} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';

export class ItemModifierDTO{
    @ApiProperty({ description: 'กลุ่มที่ตัวเลือกนี้สังกัด', format: 'uuid', example: 'a3f1c8e2-4b7d-4e91-8c2a-1f5e9d3b7a60' })    
    @IsUUID()
    @IsNotEmpty()
    modifier_group_id!:string;
    
    @ApiProperty({ description: 'ชื่อตัวเลือก', example: 'ไข่ดาว', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!:string;

    @ApiProperty({ description: 'ราคาที่บวกเพิ่ม 0 ได้ถ้าไม่คิดเงิน', example: 10 })
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(99999999.99)
    price_delta!:number;
}