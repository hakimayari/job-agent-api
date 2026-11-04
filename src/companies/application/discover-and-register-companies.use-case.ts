
import { Company } from '../domain/company.entity';
import { CompanyDiscoveryCriteria } from '../domain/company-discovery.provider';
import { DiscoveredCompany } from '../domain/company-discovery.provider';
import { DiscoverCompaniesUseCase } from './discover-companies.use-case';
import { RegisterDiscoveredCompaniesUseCase } from './register-discovered-companies.use-case';

interface CompanyDiscovery {
  execute(criteria: CompanyDiscoveryCriteria): Promise<DiscoveredCompany[]>;
}

interface DiscoveredCompanyRegistration {
  execute(companies: DiscoveredCompany[]): Promise<Company[]>;
}

export class DiscoverAndRegisterCompaniesUseCase {
  constructor(
    private readonly discoverCompaniesUseCase: CompanyDiscovery,
    private readonly registerDiscoveredCompaniesUseCase: DiscoveredCompanyRegistration,
  ) {}

  async execute(
    criteria: CompanyDiscoveryCriteria,
  ): Promise<Company[]> {
    const discoveredCompanies =
      await this.discoverCompaniesUseCase.execute(criteria);

    if (discoveredCompanies.length === 0) {
      return [];
    }

    return this.registerDiscoveredCompaniesUseCase.execute(
      discoveredCompanies,
    );
  }
}
