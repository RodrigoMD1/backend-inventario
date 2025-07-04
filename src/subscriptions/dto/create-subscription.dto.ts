/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  status: string; // active, inactive, cancelled

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString({ message: 'storeId debe ser un UUID' })
  storeId: string;
}
