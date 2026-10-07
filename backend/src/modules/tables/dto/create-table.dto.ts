import { IsNotEmpty, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  floor?: number;
}
