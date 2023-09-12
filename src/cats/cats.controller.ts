import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateCatDto } from './createCatDto';

@Controller('cats')
export class CatsController {
  @Get()
  meow() {
    return 'meow 🐱';
  }

  @Get()
  findAll() {
    return 'find all cats';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `cats 'id' is ${id}`;
  }

  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'this action will create a new cat ' + createCatDto;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() createCatDto: CreateCatDto) {
    return `update ${id} cat will be ${createCatDto}`;
  }

  @Delete(':id')
  delete(@Param() id: string) {
    return `delete ${id}`;
  }
}
