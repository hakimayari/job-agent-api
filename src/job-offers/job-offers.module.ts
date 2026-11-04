
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../infrastructure/database/database.module';

import { PrismaJobOfferRepository } from './infrastructure/prisma-job-offer.repository';

import { JOB_OFFER_REPOSITORY } from './domain/job-offer-repository.token';
import { JobOfferRepository } from './domain/job-offer.repository';

import { GetAllJobOffersUseCase } from './application/get-all-job-offers.use-case';
import { GetJobOfferByIdUseCase } from './application/get-job-offer-by-id.use-case';
import { GetJobOffersByCompanyUseCase } from './application/get-job-offers-by-company.use-case';
import { CreateJobOfferUseCase } from './application/create-job-offer.use-case';
import { UpdateJobOfferUseCase } from './application/update-job-offer.use-case';
import { DeleteJobOfferUseCase } from './application/delete-job-offer.use-case';
import { JobOffersController } from './presentation/job-offers.controller';
import { GetCompanyByIdUseCase } from '../companies/application/get-company-by-id.use-case';
import { CompaniesModule } from '../companies/companies.module';

@Module({
    imports: [DatabaseModule, CompaniesModule],
    controllers: [JobOffersController],

  providers: [
    {
      provide: JOB_OFFER_REPOSITORY,
      useClass: PrismaJobOfferRepository,
    },
    {
      provide: GetAllJobOffersUseCase,
      useFactory: (repository: JobOfferRepository) =>
        new GetAllJobOffersUseCase(repository),
      inject: [JOB_OFFER_REPOSITORY],
    },
    {
      provide: GetJobOfferByIdUseCase,
      useFactory: (repository: JobOfferRepository) =>
        new GetJobOfferByIdUseCase(repository),
      inject: [JOB_OFFER_REPOSITORY],
    },
    {
      provide: GetJobOffersByCompanyUseCase,
      useFactory: (repository: JobOfferRepository) =>
        new GetJobOffersByCompanyUseCase(repository),
      inject: [JOB_OFFER_REPOSITORY],
    },
    {
      provide: CreateJobOfferUseCase,
      useFactory: (repository: JobOfferRepository, getCompanyByIdUseCase: GetCompanyByIdUseCase) =>
        new CreateJobOfferUseCase(repository, getCompanyByIdUseCase),
      inject: [JOB_OFFER_REPOSITORY, GetCompanyByIdUseCase],
    },
    {
      provide: UpdateJobOfferUseCase,
      useFactory: (repository: JobOfferRepository, getCompanyByIdUseCase: GetCompanyByIdUseCase) =>
        new UpdateJobOfferUseCase(repository, getCompanyByIdUseCase),
      inject: [JOB_OFFER_REPOSITORY, GetCompanyByIdUseCase],
    },
    {
      provide: DeleteJobOfferUseCase,
      useFactory: (repository: JobOfferRepository) =>
        new DeleteJobOfferUseCase(repository),
      inject: [JOB_OFFER_REPOSITORY],
    },
  ],

  exports: [
    JOB_OFFER_REPOSITORY,
    GetAllJobOffersUseCase,
    GetJobOfferByIdUseCase,
    GetJobOffersByCompanyUseCase,
    CreateJobOfferUseCase,
    UpdateJobOfferUseCase,
    DeleteJobOfferUseCase,
  ],
})
export class JobOffersModule {}
