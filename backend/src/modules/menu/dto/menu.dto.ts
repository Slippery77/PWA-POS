import { IsString, IsNotEmpty } from 'class-validator';

export class MenuDto {
    @IsString()
    @IsNotEmpty()
    name!:string;
}
