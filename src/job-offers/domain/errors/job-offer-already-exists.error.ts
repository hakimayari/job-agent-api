export class JobOfferAlreadyExistsError extends Error {
  constructor() {
    super("Cette offre d’emploi existe déjà.");
    this.name = 'JobOfferAlreadyExistsError';
  }
}