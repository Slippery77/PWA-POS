import { IsString, IsNotEmpty } from 'class-validator';

export class CategoryDTO{
    @IsString()
    @IsNotEmpty()
    name!:string;
}