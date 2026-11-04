
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { JobOfferAlreadyExistsError } from '../domain/errors/job-offer-already-exists.error';
import { GetCompanyByIdUseCase } from 'src/companies/application/get-company-by-id.use-case';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';

export class CreateJobOfferUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
     private readonly getCompanyByIdUseCase: GetCompanyByIdUseCase,
  ) {}

  async execute(jobOffer: JobOffer): Promise<JobOffer> {
     const company = await this.getCompanyByIdUseCase.execute(
      jobOffer.companyId,
    );

    if (!company) {
        throw new CompanyNotFoundError();
    }
    const existingOffer = await this.jobOfferRepository.findByUrl(
      jobOffer.url,
    );

    if (existingOffer) {
      throw new JobOfferAlreadyExistsError();
    }

    return this.jobOfferRepository.create(jobOffer);
  }
}
