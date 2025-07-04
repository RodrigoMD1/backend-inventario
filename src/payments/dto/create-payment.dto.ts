/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNumber, IsString, IsDateString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  status: string; // pending, paid, failed

  @IsDateString()
  date: string;

  @IsNumber()
  subscriptionId: number;
}
