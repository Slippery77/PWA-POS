import { IsString, IsNotEmpty, MinLength,IsIn, Matches, IsOptional} from 'class-validator';

export class CreateUserDTO{
    @IsString()
    @IsNotEmpty()
    username!:string;

    @IsString()
    @IsNotEmpty()
    //@MinLength(8,{message:'Password must contain at least 8 characters'})
    password!:string;

    // ^ คือ เริ่มต้นข้อความ | \d คือตัวเลข 0-9 | {6} คือมีจำนวน 6 ตัว | $ คือ สิ้นสุด
    @Matches(/^\d{6}$/, { message: 'PIN must be 6 digits' })
    @IsOptional()
    pin!:string;

    @IsString()
    @IsOptional()
    display_name!:string;

    @IsIn(['employee','manager'])
    role_name!:'employee' | 'manager';
}