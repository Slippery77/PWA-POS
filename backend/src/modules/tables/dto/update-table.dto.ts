import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateTableDto {
  @IsString()
  @IsOptional()
  tableNumber?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  floor?: number;
}
