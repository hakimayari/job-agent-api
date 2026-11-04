
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOfferFilters } from '../domain/job-offer-filters';
import { JobOfferPagination } from '../domain/job-offer-pagination';

export class GetAllJobOffersUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
  ) {}

  async execute(
    filters?: JobOfferFilters,
    pagination?: JobOfferPagination
  ): Promise<JobOffer[]> {
    if (pagination) {
  return this.jobOfferRepository.findAll(filters, pagination);
}

    return this.jobOfferRepository.findAll(filters);
  }
}
