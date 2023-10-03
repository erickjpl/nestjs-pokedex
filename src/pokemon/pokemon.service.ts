import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = this.configService.get<number>(
      'defaultPaginationLimit',
    );
  }

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemonDto = {
      ...createPokemonDto,
      name: createPokemonDto.name.toLocaleLowerCase(),
    };

    try {
      const pokemon = await this.pokemonModel.create(pokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;
    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(filter: string) {
    let pokemon: Pokemon;
    if (!isNaN(Number(filter)))
      pokemon = await this.pokemonModel.findOne({ no: filter });

    // MongoId
    if (!pokemon && isValidObjectId(filter))
      pokemon = await this.pokemonModel.findById(filter);

    // Name
    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({
        name: filter.toLowerCase().trim(),
      });

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no ${filter} not found`,
      );
    }

    return pokemon;
  }

  async update(filter: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(filter);
    const pokemonDto = { ...updatePokemonDto };

    if (pokemonDto.name) pokemonDto.name = pokemonDto.name.toLocaleLowerCase();

    try {
      await pokemon.updateOne(pokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...pokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // Doble consulta (No recomendado)
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    // genera falso positivo si el id no existe
    // const result = await this.pokemonModel.findByIdAndDelete(id);

    // Valida si el id existe y lo elimina (recomendado)
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id ${id} not found`);

    return true;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists ${JSON.stringify(error.keyValue)}`,
      );
    }

    console.error(error);

    throw new InternalServerErrorException(
      `Can't create Pokemon - Check server logs`,
    );
  }
}
