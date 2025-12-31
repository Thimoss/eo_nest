import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRecapitulationLocationDto {
  @IsString()
  @IsNotEmpty()
  recapitulationLocation: string;
}
