
import { Company } from '../domain/company.entity';
import { CompanyRepository } from '../domain/company.repository';
import { CompanyAlreadyExistsError } from '../domain/errors/company-already-exists.error';

export interface CreateCompanyInput {
  name: string;
  careersUrl?: string;
  websiteUrl?: string;
  sourceType?: string;
}

export class CreateCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: CreateCompanyInput): Promise<Company> {
    const name = input.name.trim();
    const existingCompany = await this.companyRepository.findByName(
      name,
    );

    if (existingCompany) {
      throw new CompanyAlreadyExistsError();
    }

    const company = new Company(
      null,
      input.name.trim(),
      input.careersUrl ?? null,
      input.websiteUrl ?? null,
      input.sourceType ?? null,
      true,
    );

    return this.companyRepository.create(company);
  }
}