import { it, jest, describe, beforeEach, expect } from '@jest/globals';

import { DiscoverCompaniesUseCase } from './discover-companies.use-case';
import {
  CompanyDiscoveryCriteria,
  CompanyDiscoveryProvider,
  DiscoveredCompany,
} from '../domain/company-discovery.provider';

describe('DiscoverCompaniesUseCase', () => {
  let useCase: DiscoverCompaniesUseCase;
  let companyDiscoveryProvider: jest.Mocked<CompanyDiscoveryProvider>;

  beforeEach(() => {
    companyDiscoveryProvider = {
      discover: jest.fn<
        (criteria: CompanyDiscoveryCriteria) => Promise<DiscoveredCompany[]>
      >(),
    };

    useCase = new DiscoverCompaniesUseCase(companyDiscoveryProvider);
  });

  it('doit retourner les entreprises découvertes par le fournisseur', async () => {
    const companies: DiscoveredCompany[] = [
      {
        name: 'Esker',
        websiteUrl: 'https://www.esker.com',
        careersUrl: 'https://www.esker.com/company/careers/',
      },
      {
        name: 'Inetum',
        websiteUrl: 'https://www.inetum.com',
        careersUrl: 'https://www.inetum.com/careers',
      },
    ];

    companyDiscoveryProvider.discover.mockResolvedValue(companies);

    const criteria: CompanyDiscoveryCriteria = {
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    };

    const result = await useCase.execute(criteria);

    expect(companyDiscoveryProvider.discover).toHaveBeenCalledWith(criteria);
    expect(result).toEqual(companies);
  });


it('doit propager l’erreur si le fournisseur de découverte échoue', async () => {
  const error = new Error('Le moteur de recherche est indisponible');

  companyDiscoveryProvider.discover.mockRejectedValue(error);

  await expect(
    useCase.execute({
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    }),
  ).rejects.toThrow('Le moteur de recherche est indisponible');
});

});
