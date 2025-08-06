import { IsString, IsOptional, IsArray, ArrayMinSize } from 'class-validator';

export class CreateApiKeyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  allowedDomains?: string[];
}
