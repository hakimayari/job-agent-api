import { Company } from '../domain/company.entity';
import { CompanyRepository } from '../domain/company.repository';

export class GetAllCompaniesUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}
