
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { DeleteJobOfferUseCase } from './delete-job-offer.use-case';
import { JobOfferRepository } from '../domain/job-offer.repository';

describe('DeleteJobOfferUseCase', () => {
  let useCase: DeleteJobOfferUseCase;
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

    useCase = new DeleteJobOfferUseCase(repository);
  });

  it('doit supprimer une offre existante', async () => {
    repository.findById.mockResolvedValue({
      id: 1,
    } as Awaited<ReturnType<JobOfferRepository['findById']>>);

    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(1);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.delete).toHaveBeenCalledWith(1);
  });

  it("doit refuser la suppression si l'offre n'existe pas", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow();

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
