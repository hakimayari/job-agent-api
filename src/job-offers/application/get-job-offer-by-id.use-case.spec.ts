import { it, jest, describe, beforeEach, expect } from '@jest/globals';
import { GetJobOfferByIdUseCase } from './get-job-offer-by-id.use-case';
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';

describe('GetJobOfferByIdUseCase', () => {
  let useCase: GetJobOfferByIdUseCase;
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

    useCase = new GetJobOfferByIdUseCase(repository);
  });

  it('doit retourner une offre si elle existe', async () => {
    const jobOffer = new JobOffer(
      1,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    repository.findById.mockResolvedValue(jobOffer);

    const result = await useCase.execute(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(jobOffer);
  });
    it("doit retourner null si l'offre n'existe pas", async () => {
  repository.findById.mockResolvedValue(null);

  const result = await useCase.execute(999);

  expect(repository.findById).toHaveBeenCalledWith(999);
  expect(result).toBeNull();
});
});