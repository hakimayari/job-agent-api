
import { CompanyRepository } from '../domain/company.repository';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';

export class DeleteCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new CompanyNotFoundError();
    }

    await this.companyRepository.delete(id);
  }
}
