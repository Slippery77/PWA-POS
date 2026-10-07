import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDTO{
    @ApiProperty({
        description:'ชื่อหมวดหมู่ เช่น น้ำดื่ม อาหารจานหลัก ของหวาน',
        example:'น้ำดื่ม',
        maxLength:100
    })

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!:string;
}