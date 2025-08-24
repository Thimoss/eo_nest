import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateJobSectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  documentId: number;
}
