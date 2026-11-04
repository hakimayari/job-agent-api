
import { JobOffer } from './job-offer.entity';

export interface JobOfferSource {
  fetchOffers(): Promise<JobOffer[]>;
}
