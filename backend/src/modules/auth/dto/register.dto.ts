import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUsers {
    @IsString()
    @IsNotEmpty()
    restuarant_name : string;

    @IsString()
    @IsNotEmpty()
    branch_name : string;

    @IsString()
    @IsNotEmpty()
    tax_id : string;

    @IsString()
    @IsNotEmpty()
    phone : string;

    @IsString()
    @IsNotEmpty()
    email:string;

    @IsString()
    @IsNotEmpty()
    address : string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    roles:string;

    @IsString()
    @IsNotEmpty()
    tenant:string;
}