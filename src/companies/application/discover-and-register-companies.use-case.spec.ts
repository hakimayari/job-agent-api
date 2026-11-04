
import { it, jest, describe, beforeEach, expect } from '@jest/globals';

import { DiscoverAndRegisterCompaniesUseCase } from './discover-and-register-companies.use-case';

import {
  CompanyDiscoveryCriteria,
  DiscoveredCompany,
} from '../domain/company-discovery.provider';

import { Company } from '../domain/company.entity';

describe('DiscoverAndRegisterCompaniesUseCase', () => {
  let useCase: DiscoverAndRegisterCompaniesUseCase;

  let discoverCompaniesUseCase: {
    execute: jest.Mock<
      (criteria: CompanyDiscoveryCriteria) => Promise<DiscoveredCompany[]>
    >;
  };

  let registerDiscoveredCompaniesUseCase: {
    execute: jest.Mock<
      (companies: DiscoveredCompany[]) => Promise<Company[]>
    >;
  };

  beforeEach(() => {
    discoverCompaniesUseCase = {
      execute: jest.fn<
        (criteria: CompanyDiscoveryCriteria) => Promise<DiscoveredCompany[]>
      >(),
    };

    registerDiscoveredCompaniesUseCase = {
      execute: jest.fn<
        (companies: DiscoveredCompany[]) => Promise<Company[]>
      >(),
    };

    useCase = new DiscoverAndRegisterCompaniesUseCase(
      discoverCompaniesUseCase,
      registerDiscoveredCompaniesUseCase,
    );
  });

  it('doit découvrir puis enregistrer les entreprises trouvées', async () => {
    const criteria: CompanyDiscoveryCriteria = {
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    };

    const discoveredCompanies: DiscoveredCompany[] = [
      {
        name: 'Esker',
        websiteUrl: 'https://www.esker.com',
        careersUrl: 'https://www.esker.com/company/careers/',
      },
    ];

    const registeredCompanies: Company[] = [
      new Company(
        1,
        'Esker',
        'https://www.esker.com/company/careers/',
        'https://www.esker.com',
        'web_discovery',
      ),
    ];

    discoverCompaniesUseCase.execute.mockResolvedValue(discoveredCompanies);

    registerDiscoveredCompaniesUseCase.execute.mockResolvedValue(
      registeredCompanies,
    );

    const result = await useCase.execute(criteria);

    expect(discoverCompaniesUseCase.execute).toHaveBeenCalledWith(criteria);

    expect(
      registerDiscoveredCompaniesUseCase.execute,
    ).toHaveBeenCalledWith(discoveredCompanies);

    expect(result).toEqual(registeredCompanies);
  });

  it('ne doit pas enregistrer des entreprises si aucune n’a été découverte', async () => {
    const criteria: CompanyDiscoveryCriteria = {
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    };

    discoverCompaniesUseCase.execute.mockResolvedValue([]);

    const result = await useCase.execute(criteria);

    expect(discoverCompaniesUseCase.execute).toHaveBeenCalledWith(criteria);

    expect(
      registerDiscoveredCompaniesUseCase.execute,
    ).not.toHaveBeenCalled();

    expect(result).toEqual([]);
  });
});
