import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsNotEmpty()
    'tenantCode': string;

    @IsString()
    @IsNotEmpty()
    'username': string;

    @IsString()
    @IsNotEmpty()
    'password': string;
}