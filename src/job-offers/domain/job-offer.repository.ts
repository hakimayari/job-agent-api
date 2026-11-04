import { JobOffer } from './job-offer.entity';
import { JobOfferFilters } from './job-offer-filters';
import { JobOfferPagination } from './job-offer-pagination';

export interface JobOfferRepository {
  findAll(
    filters?: JobOfferFilters,
    pagination?: JobOfferPagination,
  ): Promise<JobOffer[]>;

  findById(id: number): Promise<JobOffer | null>;

  findByUrl(url: string): Promise<JobOffer | null>;

  findByCompanyId(companyId: number): Promise<JobOffer[]>;

  create(jobOffer: JobOffer): Promise<JobOffer>;

  update(jobOffer: JobOffer): Promise<JobOffer>;

  delete(id: number): Promise<void>;
}
