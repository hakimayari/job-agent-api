export class CompanyNotFoundError extends Error {
  constructor() {
    super('Entreprise introuvable.');
    this.name = 'CompanyNotFoundError';
  }
}