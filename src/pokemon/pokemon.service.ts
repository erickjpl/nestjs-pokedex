import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    const pokemonDto = {
      name: createPokemonDto.name.toLocaleLowerCase(),
      ...createPokemonDto,
    };

    try {
      const pokemon = await this.pokemonModel.create(pokemonDto);

      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(filter: string) {
    let pokemon: Pokemon;

    if (isNaN(Number(filter)))
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
    const pokemon = await this.findOne(id);

    await pokemon.deleteOne();
    // this.pokemonModel
    return `This action removes a #${id} pokemon`;
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
