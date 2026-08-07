import { IsString, IsNotEmpty, IsEmail, IsOptional} from 'class-validator';

export class RegisterOwnerDto {
    @IsString()
    @IsNotEmpty()
    restaurant_name!:string

    @IsString()
    @IsNotEmpty()
    tenant_slug!:string

    @IsString()
    @IsNotEmpty()
    phone!:string

    @IsString()
    @IsNotEmpty()
    house_number!:string

    @IsString()
    @IsOptional()
    village!:string

    @IsString()
    @IsOptional()
    soi!:string

    @IsString()
    @IsOptional()
    road!:string

    @IsString()
    @IsNotEmpty()
    subdistrict!:string

    @IsString()
    @IsNotEmpty()
    district!:string

    @IsString()
    @IsNotEmpty()
    province!:string

    @IsString()
    @IsNotEmpty()
    postal_code!:string

    @IsEmail()
    @IsNotEmpty()
    email! : string;

    @IsString()
    @IsNotEmpty()
    username! :string;

    @IsString()
    @IsNotEmpty()
    password! : string;
}