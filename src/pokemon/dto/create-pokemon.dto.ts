import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePokemonDto {
  @IsInt()
  @IsPositive()
  @Min(1)
  public readonly no: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  public readonly name: string;
}
