
import { JobOfferRepository } from '../domain/job-offer.repository';

export class DeleteJobOfferUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const existingOffer = await this.jobOfferRepository.findById(id);

    if (!existingOffer) {
      throw new Error('Offre d’emploi introuvable.');
    }

    await this.jobOfferRepository.delete(id);
  }
}
