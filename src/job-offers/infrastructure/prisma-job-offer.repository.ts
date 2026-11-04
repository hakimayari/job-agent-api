import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOfferFilters } from '../domain/job-offer-filters';
import { JobOfferPagination } from '../domain/job-offer-pagination';

@Injectable()
export class PrismaJobOfferRepository implements JobOfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filters?: JobOfferFilters,
    pagination?: JobOfferPagination,
  ): Promise<JobOffer[]> {
    const offers = await this.prisma.jobOffer.findMany({
      where: {
        ...(filters?.title && {
          title: {
            contains: filters.title,
            mode: 'insensitive',
          },
        }),

        ...(filters?.location && {
          location: {
            contains: filters.location,
            mode: 'insensitive',
          },
        }),
        ...(filters?.contractType && {
          contractType: filters.contractType,
        }),
        ...(filters?.experienceLevel && {
          experienceLevel: filters.experienceLevel,
        }),
        ...(filters?.remotePolicy && {
          remotePolicy: filters.remotePolicy,
        }),
      },
      orderBy: {
        discoveredAt: 'desc',
      },
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination?.limit,
    });

    return offers.map(
      (offer) =>
        new JobOffer(
          offer.id,
          offer.title,
          offer.url,
          offer.companyId,
          offer.description,
          offer.location,
          offer.contractType,
          offer.experienceLevel,
          offer.remotePolicy,
          offer.salaryMin,
          offer.salaryMax,
          offer.currency,
          offer.publishedAt,
          offer.discoveredAt,
          offer.isActive,
        ),
    );
  }

  async findById(id: number): Promise<JobOffer | null> {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { id },
    });

    if (!offer) {
      return null;
    }

    return new JobOffer(
      offer.id,
      offer.title,
      offer.url,
      offer.companyId,
      offer.description,
      offer.location,
      offer.contractType,
      offer.experienceLevel,
      offer.remotePolicy,
      offer.salaryMin,
      offer.salaryMax,
      offer.currency,
      offer.publishedAt,
      offer.discoveredAt,
      offer.isActive,
    );
  }

  async findByUrl(url: string): Promise<JobOffer | null> {
    const offer = await this.prisma.jobOffer.findUnique({
      where: { url },
    });

    if (!offer) {
      return null;
    }

    return new JobOffer(
      offer.id,
      offer.title,
      offer.url,
      offer.companyId,
      offer.description,
      offer.location,
      offer.contractType,
      offer.experienceLevel,
      offer.remotePolicy,
      offer.salaryMin,
      offer.salaryMax,
      offer.currency,
      offer.publishedAt,
      offer.discoveredAt,
      offer.isActive,
    );
  }

  async findByCompanyId(companyId: number): Promise<JobOffer[]> {
    const offers = await this.prisma.jobOffer.findMany({
      where: { companyId },
      orderBy: {
        discoveredAt: 'desc',
      },
    });

    return offers.map(
      (offer) =>
        new JobOffer(
          offer.id,
          offer.title,
          offer.url,
          offer.companyId,
          offer.description,
          offer.location,
          offer.contractType,
          offer.experienceLevel,
          offer.remotePolicy,
          offer.salaryMin,
          offer.salaryMax,
          offer.currency,
          offer.publishedAt,
          offer.discoveredAt,
          offer.isActive,
        ),
    );
  }

  async create(jobOffer: JobOffer): Promise<JobOffer> {
    const offer = await this.prisma.jobOffer.create({
      data: {
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
        discoveredAt: jobOffer.discoveredAt,
        isActive: jobOffer.isActive,
      },
    });

    return new JobOffer(
      offer.id,
      offer.title,
      offer.url,
      offer.companyId,
      offer.description,
      offer.location,
      offer.contractType,
      offer.experienceLevel,
      offer.remotePolicy,
      offer.salaryMin,
      offer.salaryMax,
      offer.currency,
      offer.publishedAt,
      offer.discoveredAt,
      offer.isActive,
    );
  }

  async update(jobOffer: JobOffer): Promise<JobOffer> {
    if (jobOffer.id === null) {
      throw new Error('Impossible de modifier une offre sans identifiant.');
    }

    const offer = await this.prisma.jobOffer.update({
      where: { id: jobOffer.id },
      data: {
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
        discoveredAt: jobOffer.discoveredAt,
        isActive: jobOffer.isActive,
      },
    });

    return new JobOffer(
      offer.id,
      offer.title,
      offer.url,
      offer.companyId,
      offer.description,
      offer.location,
      offer.contractType,
      offer.experienceLevel,
      offer.remotePolicy,
      offer.salaryMin,
      offer.salaryMax,
      offer.currency,
      offer.publishedAt,
      offer.discoveredAt,
      offer.isActive,
    );
  }

  async delete(id: number): Promise<void> {
    await this.prisma.jobOffer.delete({
      where: { id },
    });
  }
}
