export class CompanyAlreadyExistsError extends Error {
  constructor() {
    super('Une entreprise avec ce nom existe déjà.');
    this.name = 'CompanyAlreadyExistsError';
  }
}