
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { GetJobOffersByCompanyUseCase } from './get-job-offers-by-company.use-case';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOffer } from '../domain/job-offer.entity';

describe('GetJobOffersByCompanyUseCase', () => {
  let useCase: GetJobOffersByCompanyUseCase;
  let repository: jest.Mocked<JobOfferRepository>;

  beforeEach(() => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUrl: jest.fn(),
      findByCompanyId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetJobOffersByCompanyUseCase(repository);
  });

  it('doit retourner les offres de l’entreprise demandée', async () => {
    const jobOffers = [
      new JobOffer(
        1,
        'Développeur TypeScript',
        'https://entreprise.fr/jobs/123',
        5,
      ),
      new JobOffer(
        2,
        'Développeur Angular',
        'https://entreprise.fr/jobs/456',
        5,
      ),
    ];

    repository.findByCompanyId.mockResolvedValue(jobOffers);

    const result = await useCase.execute(5);

    expect(repository.findByCompanyId).toHaveBeenCalledWith(5);
    expect(result).toEqual(jobOffers);
  });

  it('doit retourner un tableau vide si l’entreprise n’a aucune offre', async () => {
    repository.findByCompanyId.mockResolvedValue([]);

    const result = await useCase.execute(5);

    expect(repository.findByCompanyId).toHaveBeenCalledWith(5);
    expect(result).toEqual([]);
  });
});
