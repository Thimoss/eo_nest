import { IsInt, Min } from 'class-validator';

export class UpdatePercentageDto {
  @IsInt()
  @Min(0)
  percentageBenefitsAndRisks: number;
}
