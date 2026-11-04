import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Body,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Put,
  Query,
} from '@nestjs/common';
import { CreateJobOfferUseCase } from '../application/create-job-offer.use-case';
import { JobOffer } from '../domain/job-offer.entity';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';
import { JobOfferAlreadyExistsError } from '../domain/errors/job-offer-already-exists.error';

import { GetAllJobOffersUseCase } from '../application/get-all-job-offers.use-case';
import { GetJobOfferByIdUseCase } from '../application/get-job-offer-by-id.use-case';
import { GetJobOffersByCompanyUseCase } from '../application/get-job-offers-by-company.use-case';
import { UpdateJobOfferUseCase } from '../application/update-job-offer.use-case';

import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Controller('job-offers')
export class JobOffersController {
  constructor(
    private readonly getAllJobOffersUseCase: GetAllJobOffersUseCase,
    private readonly getJobOfferByIdUseCase: GetJobOfferByIdUseCase,
    private readonly getJobOffersByCompanyUseCase: GetJobOffersByCompanyUseCase,
    private readonly createJobOfferUseCase: CreateJobOfferUseCase,
    private readonly updateJobOfferUseCase: UpdateJobOfferUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('title') title?: string,
    @Query('location') location?: string,
    @Query('contractType') contractType?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('remotePolicy') remotePolicy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (page !== undefined) {
  const parsedPage = Number(page);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    throw new BadRequestException(
      'Le paramètre page doit être un entier supérieur ou égal à 1.',
    );
  }
}

if (limit !== undefined) {
  const parsedLimit = Number(limit);

 if (
  !Number.isInteger(parsedLimit) ||
  parsedLimit < 1 ||
  parsedLimit > 100
) {
  throw new BadRequestException(
    'Le paramètre limit doit être un entier compris entre 1 et 100.',
  );
}
}
    if (page !== undefined || limit !== undefined) {
      return this.getAllJobOffersUseCase.execute(
        {
          title,
          location,
          contractType,
          experienceLevel,
          remotePolicy,
        },
        {
          page: page === undefined ? 1 : Number(page),
          limit: limit === undefined ? 10 : Number(limit),
        },
      );
    }
    return this.getAllJobOffersUseCase.execute({
      title,
      location,
      contractType,
      experienceLevel,
      remotePolicy,
    });
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.getJobOffersByCompanyUseCase.execute(companyId);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const jobOffer = await this.getJobOfferByIdUseCase.execute(id);
    if (!jobOffer) {
      throw new NotFoundException(`Job offer with ID ${id} not found`);
    }
    return jobOffer;
  }

  @Post()
  async create(@Body() body: CreateJobOfferDto) {
    try {
      return await this.createJobOfferUseCase.execute(
        new JobOffer(
          null,
          body.title,
          body.url,
          body.companyId,
          body.description ?? null,
          body.location ?? null,
          body.contractType ?? null,
          body.experienceLevel ?? null,
          body.remotePolicy ?? null,
          body.salaryMin ?? null,
          body.salaryMax ?? null,
          body.currency ?? 'EUR',
          body.publishedAt ? new Date(body.publishedAt) : null,
        ),
      );
    } catch (error) {
      if (error instanceof CompanyNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof JobOfferAlreadyExistsError) {
        throw new ConflictException(error.message);
      }

      throw error;
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateJobOfferDto,
  ) {
    const existingJobOffer = await this.getJobOfferByIdUseCase.execute(id);

    if (!existingJobOffer) {
      throw new NotFoundException(`Job offer with ID ${id} not found`);
    }

    const updatedJobOffer = new JobOffer(
      existingJobOffer.id,
      body.title ?? existingJobOffer.title,
      body.url ?? existingJobOffer.url,
      body.companyId ?? existingJobOffer.companyId,
      body.description ?? existingJobOffer.description,
      body.location ?? existingJobOffer.location,
      body.contractType ?? existingJobOffer.contractType,
      body.experienceLevel ?? existingJobOffer.experienceLevel,
      body.remotePolicy ?? existingJobOffer.remotePolicy,
      body.salaryMin ?? existingJobOffer.salaryMin,
      body.salaryMax ?? existingJobOffer.salaryMax,
      body.currency ?? existingJobOffer.currency,
      body.publishedAt
        ? new Date(body.publishedAt)
        : existingJobOffer.publishedAt,
    );

    return this.updateJobOfferUseCase.execute(updatedJobOffer);
  }
}
