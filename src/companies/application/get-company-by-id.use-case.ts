
import { Company } from '../domain/company.entity';
import { CompanyRepository } from '../domain/company.repository';
export interface GetCompanyById {
  execute(id: number): Promise<Company | null>;
}


export class GetCompanyByIdUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: number): Promise<Company | null> {
    return this.companyRepository.findById(id);
  }
}