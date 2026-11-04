
import { Company } from '../domain/company.entity';
import { CompanyRepository } from '../domain/company.repository';
import { DiscoveredCompany } from '../domain/company-discovery.provider';

export class RegisterDiscoveredCompaniesUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    discoveredCompanies: DiscoveredCompany[],
  ): Promise<Company[]> {
    const registeredCompanies: Company[] = [];

    for (const discoveredCompany of discoveredCompanies) {
      const existingCompany = await this.companyRepository.findByName(
        discoveredCompany.name,
      );

      if (existingCompany) {
        registeredCompanies.push(existingCompany);
        continue;
      }

      const company = new Company(
        null,
        discoveredCompany.name,
        discoveredCompany.careersUrl,
        discoveredCompany.websiteUrl,
        'web_discovery',
      );

      const createdCompany = await this.companyRepository.create(company);

      registeredCompanies.push(createdCompany);
    }

    return registeredCompanies;
  }
}
