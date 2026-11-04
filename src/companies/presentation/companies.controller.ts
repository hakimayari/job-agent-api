import {
  Controller,
  Get,
  NotFoundException,
  ConflictException,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetCompanyByIdUseCase } from '../application/get-company-by-id.use-case';
import { CreateCompanyUseCase } from '../application/create-company.use-case';
import { GetAllCompaniesUseCase } from '../application/get-all-companies.use-case';
import { DeleteCompanyUseCase } from '../application/delete-company.use-case';

import { CreateCompanyDto } from './create-company.dto';
import { UpdateCompanyUseCase } from '../application/update-company.use-case';
import { UpdateCompanyDto } from './update-company.dto';
import { DiscoverAndRegisterCompaniesUseCase } from '../application/discover-and-register-companies.use-case';
import { DiscoverCompaniesDto } from './discover-companies.dto';

import { CompanyAlreadyExistsError } from '../domain/errors/company-already-exists.error';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly getCompanyByIdUseCase: GetCompanyByIdUseCase,
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly getAllCompaniesUseCase: GetAllCompaniesUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly discoverAndRegisterCompaniesUseCase: DiscoverAndRegisterCompaniesUseCase,
  ) {}

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const company = await this.getCompanyByIdUseCase.execute(id);

    if (!company) {
      throw new NotFoundException(
        `Entreprise avec l'identifiant ${id} introuvable`,
      );
    }

    return company;
  }

  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    try {
      return await this.createCompanyUseCase.execute(dto);
    } catch (error) {
      if (error instanceof CompanyAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Get()
  async findAll() {
    return this.getAllCompaniesUseCase.execute();
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
  ) {
    try {
      return await this.updateCompanyUseCase.execute({
        id,
        ...dto,
      });
    } catch (error) {
      if (error instanceof CompanyAlreadyExistsError) {
        throw new ConflictException(error.message);
      }
      if (
        error instanceof CompanyNotFoundError
      ) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.deleteCompanyUseCase.execute(id);
    } catch (error) {
      if (error instanceof CompanyNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Post('discover')
async discover(
  @Body() dto: DiscoverCompaniesDto,
) {
  return this.discoverAndRegisterCompaniesUseCase.execute({
    keywords: dto.keywords,
    location: dto.location,
  });
}
}
