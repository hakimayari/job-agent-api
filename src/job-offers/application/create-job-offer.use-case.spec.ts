
import { it, jest, describe, beforeEach, expect } from '@jest/globals';
import { CreateJobOfferUseCase } from './create-job-offer.use-case';
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOfferAlreadyExistsError } from '../domain/errors/job-offer-already-exists.error';
import { GetCompanyByIdUseCase } from '../../companies/application/get-company-by-id.use-case';
import { Company } from '../../companies/domain/company.entity';

describe('CreateJobOfferUseCase', () => {
  let useCase: CreateJobOfferUseCase;
  let repository: jest.Mocked<JobOfferRepository>;
  let getCompanyByIdUseCase: jest.Mocked<
    Pick<GetCompanyByIdUseCase, 'execute'>
  >;

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

    getCompanyByIdUseCase = {
      execute: jest.fn(),
    };

    useCase = new CreateJobOfferUseCase(
      repository,
      getCompanyByIdUseCase as unknown as GetCompanyByIdUseCase,
    );
  });

  it("doit créer une offre si son URL n'existe pas encore", async () => {
    const jobOffer = new JobOffer(
      null,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    getCompanyByIdUseCase.execute.mockResolvedValue(
      { id: 1 } as Company,
    );
    repository.findByUrl.mockResolvedValue(null);
    repository.create.mockResolvedValue(
      new JobOffer(
        1,
        jobOffer.title,
        jobOffer.url,
        jobOffer.companyId,
      ),
    );

    const result = await useCase.execute(jobOffer);

    expect(getCompanyByIdUseCase.execute).toHaveBeenCalledWith(1);
    expect(repository.findByUrl).toHaveBeenCalledWith(jobOffer.url);
    expect(repository.create).toHaveBeenCalledWith(jobOffer);
    expect(result.id).toBe(1);
    expect(result.title).toBe('Développeur TypeScript');
  });

  it('doit refuser de créer une offre si son URL existe déjà', async () => {
    const jobOffer = new JobOffer(
      null,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    getCompanyByIdUseCase.execute.mockResolvedValue(
      { id: 1 } as Company,
    );
    repository.findByUrl.mockResolvedValue(jobOffer);

    await expect(useCase.execute(jobOffer)).rejects.toBeInstanceOf(
      JobOfferAlreadyExistsError,
    );

    expect(repository.create).not.toHaveBeenCalled();
  });

  it("doit refuser de créer une offre si l'entreprise n'existe pas", async () => {
    const jobOffer = new JobOffer(
      null,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      999,
    );

    getCompanyByIdUseCase.execute.mockResolvedValue(null);

    await expect(useCase.execute(jobOffer)).rejects.toThrow(
      'Entreprise introuvable.',
    );

    expect(repository.findByUrl).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });
});
