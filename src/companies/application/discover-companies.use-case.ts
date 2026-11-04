
import {
  CompanyDiscoveryCriteria,
  CompanyDiscoveryProvider,
  DiscoveredCompany,
} from '../domain/company-discovery.provider';

export class DiscoverCompaniesUseCase {
  constructor(
    private readonly companyDiscoveryProvider: CompanyDiscoveryProvider,
  ) {}

  async execute(
    criteria: CompanyDiscoveryCriteria,
  ): Promise<DiscoveredCompany[]> {
    return this.companyDiscoveryProvider.discover(criteria);
  }
}
