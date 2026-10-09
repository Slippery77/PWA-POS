import { ApiProperty } from '@nestjs/swagger';
import{ ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReplaceMenuItemModifierGroupsDTO{
    @ApiProperty({ description: 'รหัสกลุ่มตัวเลือกเรียงตามลำดับที่จะแสดง ส่ง [] เพื่อถอดทั้งหมด',
    type: [String], format: 'uuid',
    example: ['a3f1c8e2-4b7d-4e91-8c2a-1f5e9d3b7a60'], })
    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(20)
    @IsUUID('all',{each:true})
    modifier_group_ids!:string[];
}