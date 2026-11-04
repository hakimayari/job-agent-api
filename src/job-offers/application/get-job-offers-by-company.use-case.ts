
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';

export class GetJobOffersByCompanyUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
  ) {}

  async execute(companyId: number): Promise<JobOffer[]> {
    return this.jobOfferRepository.findByCompanyId(companyId);
  }
}
