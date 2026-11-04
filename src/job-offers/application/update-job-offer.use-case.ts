
import { JobOffer } from '../domain/job-offer.entity';
import { JobOfferRepository } from '../domain/job-offer.repository';
import { GetCompanyById } from '../../companies/application/get-company-by-id.use-case';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';

export class UpdateJobOfferUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly getCompanyByIdUseCase: GetCompanyById,
  ) {}

  async execute(jobOffer: JobOffer): Promise<JobOffer> {
    if (jobOffer.id === null) {
      throw new Error(
        'Impossible de modifier une offre sans identifiant.',
      );
    }

    const existingOffer = await this.jobOfferRepository.findById(
      jobOffer.id,
    );

    if (!existingOffer) {
      throw new Error('Offre d’emploi introuvable.');
    }

    const company = await this.getCompanyByIdUseCase.execute(
      jobOffer.companyId,
    );

    if (!company) {
      throw new CompanyNotFoundError();
    }

    const existingOfferWithSameUrl =
      await this.jobOfferRepository.findByUrl(jobOffer.url);

    if (
      existingOfferWithSameUrl &&
      existingOfferWithSameUrl.id !== jobOffer.id
    ) {
      throw new Error(
        'Une autre offre utilise déjà cette URL.',
      );
    }

    return this.jobOfferRepository.update(jobOffer);
  }
}
