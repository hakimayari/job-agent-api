
import { it, jest, describe, beforeEach, expect } from '@jest/globals';
import { RegisterDiscoveredCompaniesUseCase } from './register-discovered-companies.use-case';
import { CompanyRepository } from '../domain/company.repository';
import { Company } from '../domain/company.entity';
import { DiscoveredCompany } from '../domain/company-discovery.provider';

describe('RegisterDiscoveredCompaniesUseCase', () => {
  let useCase: RegisterDiscoveredCompaniesUseCase;
  let companyRepository: jest.Mocked<CompanyRepository>;

  beforeEach(() => {
    companyRepository = {
      findAll: jest.fn<() => Promise<Company[]>>(),
      findById: jest.fn<(id: number) => Promise<Company | null>>(),
      findByName: jest.fn<(name: string) => Promise<Company | null>>(),
      create: jest.fn<(company: Company) => Promise<Company>>(),
      update: jest.fn<(company: Company) => Promise<Company>>(),
      delete: jest.fn<(id: number) => Promise<void>>(),
    };

    useCase = new RegisterDiscoveredCompaniesUseCase(companyRepository);
  });

  it('doit enregistrer une entreprise qui n’existe pas encore', async () => {
    const discoveredCompany: DiscoveredCompany = {
      name: 'Nouvelle entreprise',
      websiteUrl: 'https://entreprise.fr',
      careersUrl: 'https://entreprise.fr/carrieres',
    };

    companyRepository.findByName.mockResolvedValue(null);
    companyRepository.create.mockImplementation(async (company) => company);

    const result = await useCase.execute([discoveredCompany]);

    expect(companyRepository.findByName).toHaveBeenCalledWith(
      'Nouvelle entreprise',
    );
    expect(companyRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: null,
        name: 'Nouvelle entreprise',
        websiteUrl: 'https://entreprise.fr',
        careersUrl: 'https://entreprise.fr/carrieres',
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('ne doit pas enregistrer une entreprise déjà existante', async () => {
    const discoveredCompany: DiscoveredCompany = {
      name: 'Esker',
      websiteUrl: 'https://www.esker.com',
      careersUrl: 'https://www.esker.com/company/careers/',
    };

    const existingCompany = new Company(
      1,
      'Esker',
      'https://www.esker.com/company/careers/',
      'https://www.esker.com',
    );

    companyRepository.findByName.mockResolvedValue(existingCompany);

    const result = await useCase.execute([discoveredCompany]);

    expect(companyRepository.findByName).toHaveBeenCalledWith('Esker');
    expect(companyRepository.create).not.toHaveBeenCalled();
    expect(result).toEqual([existingCompany]);
  });
});
