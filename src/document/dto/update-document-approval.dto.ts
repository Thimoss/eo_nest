import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentApprovalDto {
  @IsString()
  @IsOptional()
  recapitulationLocation: string;

  @IsString()
  @IsOptional()
  preparedByName: string;

  @IsString()
  @IsOptional()
  preparedByPosition: string;

  @IsString()
  @IsOptional()
  checkedByName: string;

  @IsString()
  @IsOptional()
  checkedByPosition: string;

  @IsString()
  @IsOptional()
  confirmedByName: string;

  @IsString()
  @IsOptional()
  confirmedByPosition: string;
}
