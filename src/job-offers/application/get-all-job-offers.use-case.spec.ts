
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { GetAllJobOffersUseCase } from './get-all-job-offers.use-case';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferFilters } from '../domain/job-offer-filters';

describe('GetAllJobOffersUseCase', () => {
  let useCase: GetAllJobOffersUseCase;
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

    useCase = new GetAllJobOffersUseCase(repository);
  });

  it('doit retourner toutes les offres sans filtre', async () => {
    const jobOffers = [
      new JobOffer(
        1,
        'Développeur TypeScript',
        'https://entreprise.fr/jobs/123',
        1,
        undefined,
        'Lyon',
        'CDI',
      ),
      new JobOffer(
        2,
        'Développeur Angular',
        'https://entreprise.fr/jobs/456',
        2,
        undefined,
        'Paris',
        'Freelance',
      ),
    ];

    repository.findAll.mockResolvedValue(jobOffers);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(jobOffers);
  });

  it('doit retourner un tableau vide si aucune offre existe', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

    it('doit transmettre les critères de recherche au repository', async () => {
  const filters: JobOfferFilters = {
    location: 'Lyon',
    contractType: 'CDI',
  };

  repository.findAll.mockResolvedValue([]);

  await useCase.execute(filters);

  expect(repository.findAll).toHaveBeenCalledWith(filters);
});

it('doit transmettre les filtres facultatifs lorsqu’un seul critère est fourni', async () => {
  const filters: JobOfferFilters = {
    remotePolicy: 'REMOTE',
  };

  repository.findAll.mockResolvedValue([]);

  await useCase.execute(filters);

  expect(repository.findAll).toHaveBeenCalledWith(filters);
});

it('doit transmettre le titre recherché au repository', async () => {
  const filters = { title: 'TypeScript' };

  repository.findAll.mockResolvedValue([]);

  await useCase.execute(filters);

  expect(repository.findAll).toHaveBeenCalledWith(filters);
});


it('doit transmettre les paramètres de pagination au repository', async () => {
  const filters = { title: 'TypeScript' };
  const pagination = { page: 2, limit: 10 };

  repository.findAll.mockResolvedValue([]);

  await useCase.execute(filters, pagination);

  expect(repository.findAll).toHaveBeenCalledWith(
    filters,
    pagination,
  );
});

});
