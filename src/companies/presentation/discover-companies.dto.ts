
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ArrayUnique,
} from 'class-validator';

export class DiscoverCompaniesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  keywords!: string[];

  @IsString()
  @IsNotEmpty()
  location!: string;
}
