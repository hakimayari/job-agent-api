import { it, jest, describe, beforeEach, expect } from '@jest/globals';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

import { JobOffersController } from './job-offers.controller';
import { GetAllJobOffersUseCase } from '../application/get-all-job-offers.use-case';
import { GetJobOfferByIdUseCase } from '../application/get-job-offer-by-id.use-case';
import { GetJobOffersByCompanyUseCase } from '../application/get-job-offers-by-company.use-case';
import { CreateJobOfferUseCase } from '../application/create-job-offer.use-case';
import { JobOffer } from '../domain/job-offer.entity';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';
import { JobOfferAlreadyExistsError } from '../domain/errors/job-offer-already-exists.error';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferUseCase } from '../application/update-job-offer.use-case';

describe('JobOffersController', () => {
  let controller: JobOffersController;
  let getJobOfferByIdUseCase: jest.Mocked<GetJobOfferByIdUseCase>;
  let getAllJobOffersUseCase: jest.Mocked<GetAllJobOffersUseCase>;
  let getJobOffersByCompanyUseCase: jest.Mocked<GetJobOffersByCompanyUseCase>;
  let createJobOfferUseCase: jest.Mocked<CreateJobOfferUseCase>;
  let updateJobOfferUseCase: jest.Mocked<UpdateJobOfferUseCase>;

  beforeEach(() => {
    getAllJobOffersUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllJobOffersUseCase>;

    getJobOfferByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetJobOfferByIdUseCase>;

    getJobOffersByCompanyUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetJobOffersByCompanyUseCase>;

    createJobOfferUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateJobOfferUseCase>;

    updateJobOfferUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateJobOfferUseCase>;

    controller = new JobOffersController(
      getAllJobOffersUseCase,
      getJobOfferByIdUseCase,
      getJobOffersByCompanyUseCase,
      createJobOfferUseCase,
      updateJobOfferUseCase,
    );
  });

  it('doit retourner une offre si elle existe', async () => {
    const jobOffer = new JobOffer(
      1,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    getJobOfferByIdUseCase.execute.mockResolvedValue(jobOffer);

    const result = await controller.findById(1);

    expect(getJobOfferByIdUseCase.execute).toHaveBeenCalledWith(1);
    expect(result).toEqual(jobOffer);
  });

  it("doit retourner une erreur 404 si l'offre n'existe pas", async () => {
    getJobOfferByIdUseCase.execute.mockResolvedValue(null);

    await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('doit retourner toutes les offres', async () => {
    const jobOffers = [
      new JobOffer(
        1,
        'Développeur TypeScript',
        'https://entreprise.fr/jobs/123',
        1,
      ),
      new JobOffer(
        2,
        'Développeur Angular',
        'https://entreprise.fr/jobs/456',
        2,
      ),
    ];

    getAllJobOffersUseCase.execute.mockResolvedValue(jobOffers);

    const result = await controller.findAll();

    expect(getAllJobOffersUseCase.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(jobOffers);
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

    getJobOffersByCompanyUseCase.execute.mockResolvedValue(jobOffers);

    const result = await controller.findByCompany(5);

    expect(getJobOffersByCompanyUseCase.execute).toHaveBeenCalledWith(5);
    expect(result).toEqual(jobOffers);
  });

  it('doit créer une offre', async () => {
    const jobOffer = new JobOffer(
      null,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    const createdJobOffer = new JobOffer(
      1,
      'Développeur TypeScript',
      'https://entreprise.fr/jobs/123',
      1,
    );

    createJobOfferUseCase.execute.mockResolvedValue(createdJobOffer);

    const result = await controller.create({
      title: jobOffer.title,
      url: jobOffer.url,
      companyId: jobOffer.companyId,
      description: jobOffer.description ?? undefined,
      location: jobOffer.location ?? undefined,
      contractType: jobOffer.contractType ?? undefined,
      experienceLevel: jobOffer.experienceLevel ?? undefined,
      remotePolicy: jobOffer.remotePolicy ?? undefined,
      salaryMin: jobOffer.salaryMin ?? undefined,
      salaryMax: jobOffer.salaryMax ?? undefined,
      currency: jobOffer.currency,
      publishedAt: jobOffer.publishedAt?.toISOString(),
    } satisfies CreateJobOfferDto);
expect(createJobOfferUseCase.execute).toHaveBeenCalledWith(
  expect.objectContaining({
    id: null,
    title: jobOffer.title,
    url: jobOffer.url,
    companyId: jobOffer.companyId,
    description: jobOffer.description,
    location: jobOffer.location,
    contractType: jobOffer.contractType,
    experienceLevel: jobOffer.experienceLevel,
    remotePolicy: jobOffer.remotePolicy,
    salaryMin: jobOffer.salaryMin,
    salaryMax: jobOffer.salaryMax,
    currency: jobOffer.currency,
    publishedAt: jobOffer.publishedAt,
  }),
);    expect(result).toEqual(createdJobOffer);
  });

  it("doit retourner une erreur 404 si l'entreprise n'existe pas lors de la création", async () => {
    const dto: CreateJobOfferDto = {
      title: 'Développeur TypeScript',
      url: 'https://entreprise.fr/jobs/test-404',
      companyId: 999,
    };

    createJobOfferUseCase.execute.mockRejectedValue(new CompanyNotFoundError());

    await expect(controller.create(dto)).rejects.toThrow(NotFoundException);
  });

  it("doit retourner une erreur 409 si l'offre existe déjà", async () => {
    const dto: CreateJobOfferDto = {
      title: 'Développeur TypeScript',
      url: 'https://entreprise.fr/jobs/test-doublon',
      companyId: 1,
    };

    createJobOfferUseCase.execute.mockRejectedValue(
      new JobOfferAlreadyExistsError(),
    );

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
  });


it('doit mettre à jour une offre existante', async () => {
  const existingJobOffer = new JobOffer(
    1,
    'Ancien titre',
    'https://entreprise.fr/jobs/123',
    1,
  );

  const updatedJobOffer = new JobOffer(
    1,
    'Nouveau titre',
    'https://entreprise.fr/jobs/123',
    1,
  );

  getJobOfferByIdUseCase.execute.mockResolvedValue(existingJobOffer);
  updateJobOfferUseCase.execute.mockResolvedValue(updatedJobOffer);

  const result = await controller.update(1, {
    title: 'Nouveau titre',
  });

  expect(getJobOfferByIdUseCase.execute).toHaveBeenCalledWith(1);
  expect(updateJobOfferUseCase.execute).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 1,
      title: 'Nouveau titre',
      url: 'https://entreprise.fr/jobs/123',
      companyId: 1,
    }),
  );
  expect(result.title).toBe('Nouveau titre');
});


it('doit renvoyer une erreur 404 si l’offre à mettre à jour n’existe pas', async () => {
  getJobOfferByIdUseCase.execute.mockResolvedValue(null);

  await expect(
    controller.update(999, {
      title: 'Nouveau titre',
    }),
  ).rejects.toThrow('Job offer with ID 999 not found');

  expect(updateJobOfferUseCase.execute).not.toHaveBeenCalled();
});


it('doit conserver les champs non modifiés lors de la mise à jour', async () => {
  const existingJobOffer = new JobOffer(
    1,
    'Ancien titre',
    'https://entreprise.fr/jobs/123',
    1,
    'Description existante',
    'Lyon',
    'CDI',
    'Confirmé',
    'hybride',
    40000,
    45000,
    'EUR',
  );

  const updatedJobOffer = new JobOffer(
    1,
    'Nouveau titre',
    'https://entreprise.fr/jobs/123',
    1,
    'Description existante',
    'Lyon',
    'CDI',
    'Confirmé',
    'hybride',
    40000,
    45000,
    'EUR',
  );

  getJobOfferByIdUseCase.execute.mockResolvedValue(existingJobOffer);
  updateJobOfferUseCase.execute.mockResolvedValue(updatedJobOffer);

  const result = await controller.update(1, {
    title: 'Nouveau titre',
  });

  expect(result.title).toBe('Nouveau titre');
  expect(result.url).toBe('https://entreprise.fr/jobs/123');
  expect(result.companyId).toBe(1);
  expect(result.description).toBe('Description existante');
  expect(result.location).toBe('Lyon');
  expect(result.salaryMin).toBe(40000);
  expect(result.salaryMax).toBe(45000);
});

it('doit transmettre les paramètres de pagination au use case', async () => {
  getAllJobOffersUseCase.execute.mockResolvedValue([]);

  await controller.findAll(
    'TypeScript',
    undefined,
    undefined,
    undefined,
    undefined,
    '2',
    '10',
  );

  expect(getAllJobOffersUseCase.execute).toHaveBeenCalledWith(
    {
      title: 'TypeScript',
      location: undefined,
      contractType: undefined,
      experienceLevel: undefined,
      remotePolicy: undefined,
    },
    {
      page: 2,
      limit: 10,
    },
  );
});

it('doit rejeter une page inférieure à 1', async () => {
  await expect(
    controller.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '0',
      '10',
    ),
  ).rejects.toThrow(BadRequestException);
});

it('doit rejeter une limite inférieure à 1', async () => {
  await expect(
    controller.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '1',
      '0',
    ),
  ).rejects.toThrow(BadRequestException);
});

it('doit rejeter une page non numérique', async () => {
  await expect(
    controller.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      'abc',
      '10',
    ),
  ).rejects.toThrow(BadRequestException);
});

it('doit rejeter une limite non numérique', async () => {
  await expect(
    controller.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '1',
      'abc',
    ),
  ).rejects.toThrow(BadRequestException);
});


it('doit rejeter une limite supérieure à 100', async () => {
  await expect(
    controller.findAll(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      '1',
      '101',
    ),
  ).rejects.toThrow(BadRequestException);
});


});
