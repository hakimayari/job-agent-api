import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { PrismaJobOfferRepository } from './prisma-job-offer.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';

describe('PrismaJobOfferRepository', () => {
  let repository: PrismaJobOfferRepository;
  let prisma: {
    jobOffer: {
      findMany: jest.Mock<(args: any) => Promise<any[]>>;
    };
  };

  beforeEach(() => {
    prisma = {
      jobOffer: {
        findMany: jest.fn<(args: any) => Promise<any[]>>(),
      },
    };

    repository = new PrismaJobOfferRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('doit récupérer toutes les offres sans filtre et les trier par date de découverte décroissante', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    const result = await repository.findAll();

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: {
        discoveredAt: 'desc',
      },
    });

    expect(result).toEqual([]);
  });

  it('doit filtrer les offres par localisation sans tenir compte de la casse', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findAll({
      location: 'Lyon',
    });

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {
        location: {
          contains: 'Lyon',
          mode: 'insensitive',
        },
      },
      orderBy: {
        discoveredAt: 'desc',
      },
    });
  });

  it('doit filtrer les offres par type de contrat', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findAll({
      contractType: 'CDI',
    });

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {
        contractType: 'CDI',
      },
      orderBy: {
        discoveredAt: 'desc',
      },
    });
  });

  it('doit combiner plusieurs critères de recherche', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findAll({
      location: 'Lyon',
      contractType: 'CDI',
      experienceLevel: 'CONFIRMED',
      remotePolicy: 'REMOTE',
    });

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {
        location: {
          contains: 'Lyon',
          mode: 'insensitive',
        },
        contractType: 'CDI',
        experienceLevel: 'CONFIRMED',
        remotePolicy: 'REMOTE',
      },
      orderBy: {
        discoveredAt: 'desc',
      },
    });
  });

  it('doit filtrer les offres par titre sans tenir compte de la casse', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findAll({ title: 'TypeScript' });

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {
        title: {
          contains: 'TypeScript',
          mode: 'insensitive',
        },
      },
      orderBy: {
        discoveredAt: 'desc',
      },
    });
  });

  it('doit limiter le nombre d’offres retournées', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findAll(undefined, {
      page: 1,
      limit: 10,
    });

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: {
        discoveredAt: 'desc',
      },
      skip: 0,
      take: 10,
    });
  });

  it('doit calculer le décalage pour la deuxième page', async () => {
    prisma.jobOffer.findMany.mockResolvedValue([]);

    await repository.findAll(undefined, {
      page: 2,
      limit: 10,
    });

    expect(prisma.jobOffer.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: {
        discoveredAt: 'desc',
      },
      skip: 10,
      take: 10,
    });
  });
});
