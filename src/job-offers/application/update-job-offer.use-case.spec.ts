
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { UpdateJobOfferUseCase } from './update-job-offer.use-case';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOffer } from '../domain/job-offer.entity';
import { GetCompanyByIdUseCase } from '../../companies/application/get-company-by-id.use-case';
import { Company } from '../../companies/domain/company.entity';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';

describe('UpdateJobOfferUseCase', () => {
  let useCase: UpdateJobOfferUseCase;
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

    useCase = new UpdateJobOfferUseCase(
      repository,
      getCompanyByIdUseCase ,
    );
  });

  it('doit mettre à jour une offre existante', async () => {
    const jobOffer = new JobOffer(
      1,
      'Développeur TypeScript confirmé',
      'https://entreprise.fr/jobs/123',
      1,
    );

    repository.findById.mockResolvedValue(jobOffer);
    getCompanyByIdUseCase.execute.mockResolvedValue({ id: 1 } as Company);
    repository.findByUrl.mockResolvedValue(null);
    repository.update.mockResolvedValue(jobOffer);

    const result = await useCase.execute(jobOffer);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(getCompanyByIdUseCase.execute).toHaveBeenCalledWith(1);
    expect(repository.update).toHaveBeenCalledWith(jobOffer);
    expect(result).toEqual(jobOffer);
  });

  it("doit refuser la mise à jour si l'offre n'existe pas", async () => {
    const jobOffer = new JobOffer(
      999,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute(jobOffer)).rejects.toThrow(
      'Offre d’emploi introuvable.',
    );

    expect(getCompanyByIdUseCase.execute).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('doit refuser une URL déjà utilisée par une autre offre', async () => {
    const jobOffer = new JobOffer(
      1,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    const anotherOffer = new JobOffer(
      2,
      'Développeur Angular',
      'https://entreprise.fr/jobs/456',
      1,
    );

    repository.findById.mockResolvedValue(jobOffer);
    getCompanyByIdUseCase.execute.mockResolvedValue({ id: 1 } as Company);
    repository.findByUrl.mockResolvedValue(anotherOffer);

    await expect(useCase.execute(jobOffer)).rejects.toThrow(
      'Une autre offre utilise déjà cette URL.',
    );

    expect(repository.update).not.toHaveBeenCalled();
  });

  it("doit autoriser la mise à jour si l'offre conserve sa propre URL", async () => {
    const jobOffer = new JobOffer(
      1,
      'Nouveau titre',
      'https://entreprise.fr/jobs/123',
      1,
    );

    repository.findById.mockResolvedValue(jobOffer);
    getCompanyByIdUseCase.execute.mockResolvedValue({ id: 1 } as Company);
    repository.findByUrl.mockResolvedValue(jobOffer);
    repository.update.mockResolvedValue(jobOffer);

    const result = await useCase.execute(jobOffer);

    expect(repository.findById).toHaveBeenCalledWith(1);
    expect(repository.findByUrl).toHaveBeenCalledWith(jobOffer.url);
    expect(repository.update).toHaveBeenCalledWith(jobOffer);
    expect(result).toEqual(jobOffer);
  });

  it("doit refuser la mise à jour si l'offre n'a pas d'identifiant", async () => {
    const jobOffer = new JobOffer(
      null,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    await expect(useCase.execute(jobOffer)).rejects.toThrow(
      'Impossible de modifier une offre sans identifiant.',
    );

    expect(repository.findById).not.toHaveBeenCalled();
    expect(getCompanyByIdUseCase.execute).not.toHaveBeenCalled();
    expect(repository.findByUrl).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("doit refuser la mise à jour si l'entreprise n'existe pas", async () => {
    const jobOffer = new JobOffer(
      1,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      999,
    );

    repository.findById.mockResolvedValue(jobOffer);
    getCompanyByIdUseCase.execute.mockResolvedValue(null);

    await expect(useCase.execute(jobOffer)).rejects.toBeInstanceOf(
      CompanyNotFoundError,
    );

    expect(getCompanyByIdUseCase.execute).toHaveBeenCalledWith(999);
    expect(repository.findByUrl).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
  });
});
