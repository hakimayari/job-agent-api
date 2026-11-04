import { Module } from '@nestjs/common';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { COMPANY_REPOSITORY } from './domain/company-repository.token';
import { CompanyRepository } from './domain/company.repository';
import { GetCompanyByIdUseCase } from './application/get-company-by-id.use-case';
import { PrismaCompanyRepository } from './infrastructure/prisma-company.repository';
import { CompaniesController } from './presentation/companies.controller';

import { CreateCompanyUseCase } from './application/create-company.use-case';
import { GetAllCompaniesUseCase } from './application/get-all-companies.use-case';
import { UpdateCompanyUseCase } from './application/update-company.use-case';
import { DeleteCompanyUseCase } from './application/delete-company.use-case';
import { DiscoverCompaniesUseCase } from './application/discover-companies.use-case';
import { RegisterDiscoveredCompaniesUseCase } from './application/register-discovered-companies.use-case';
import { DiscoverAndRegisterCompaniesUseCase } from './application/discover-and-register-companies.use-case';

import { ConfigService } from '@nestjs/config';
import { TavilyCompanyDiscoveryProvider } from './infrastructure/tavily-company-discovery.provider';

@Module({
  imports: [DatabaseModule],
  providers: [
    {
      provide: COMPANY_REPOSITORY,
      useClass: PrismaCompanyRepository,
    },
    {
      provide: GetCompanyByIdUseCase,
      useFactory: (repository: CompanyRepository) =>
        new GetCompanyByIdUseCase(repository),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: CreateCompanyUseCase,
      useFactory: (repository: CompanyRepository) =>
        new CreateCompanyUseCase(repository),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: GetAllCompaniesUseCase,
      useFactory: (repository: CompanyRepository) =>
        new GetAllCompaniesUseCase(repository),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: UpdateCompanyUseCase,
      useFactory: (repository: CompanyRepository) =>
        new UpdateCompanyUseCase(repository),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: DeleteCompanyUseCase,
      useFactory: (repository: CompanyRepository) =>
        new DeleteCompanyUseCase(repository),
      inject: [COMPANY_REPOSITORY],
    },
    {
      provide: TavilyCompanyDiscoveryProvider,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.getOrThrow<string>('TAVILY_API_KEY');

        return new TavilyCompanyDiscoveryProvider(apiKey);
      },
      inject: [ConfigService],
    },
    {
      provide: DiscoverCompaniesUseCase,
      useFactory: (provider: TavilyCompanyDiscoveryProvider) =>
        new DiscoverCompaniesUseCase(provider),
      inject: [TavilyCompanyDiscoveryProvider],
    },
    {
      provide: RegisterDiscoveredCompaniesUseCase,
      useFactory: (repository: CompanyRepository) =>
        new RegisterDiscoveredCompaniesUseCase(repository),
      inject: [COMPANY_REPOSITORY],
    },
    {
  provide: DiscoverAndRegisterCompaniesUseCase,
  useFactory: (
    discoverCompaniesUseCase: DiscoverCompaniesUseCase,
    registerDiscoveredCompaniesUseCase: RegisterDiscoveredCompaniesUseCase,
  ) =>
    new DiscoverAndRegisterCompaniesUseCase(
      discoverCompaniesUseCase,
      registerDiscoveredCompaniesUseCase,
    ),
  inject: [
    DiscoverCompaniesUseCase,
    RegisterDiscoveredCompaniesUseCase,
  ],
},
  ],
  exports: [
    GetCompanyByIdUseCase,
    GetAllCompaniesUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
    DiscoverCompaniesUseCase,
    RegisterDiscoveredCompaniesUseCase,
    DiscoverAndRegisterCompaniesUseCase,
  ],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
