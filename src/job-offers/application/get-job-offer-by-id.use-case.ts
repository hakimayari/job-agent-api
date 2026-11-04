
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';

export class GetJobOfferByIdUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
  ) {}

  async execute(id: number): Promise<JobOffer | null> {
    return this.jobOfferRepository.findById(id);
  }
}
