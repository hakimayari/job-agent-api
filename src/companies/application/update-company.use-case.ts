
import { Company } from '../domain/company.entity';
import { CompanyRepository } from '../domain/company.repository';
import { CompanyAlreadyExistsError } from '../domain/errors/company-already-exists.error';
import { CompanyNotFoundError } from '../domain/errors/company-not-found.error';

export interface UpdateCompanyInput {
  id: number;
  name?: string;
  careersUrl?: string;
  websiteUrl?: string;
  sourceType?: string;
  isActive?: boolean;
}

export class UpdateCompanyUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(input: UpdateCompanyInput): Promise<Company> {
    const existingCompany = await this.companyRepository.findById(input.id);

   if (!existingCompany) {
  throw new CompanyNotFoundError();
}

    if (input.name !== undefined) {
      const name = input.name.trim();

      if (!name) {
        throw new Error('Le nom de l’entreprise ne peut pas être vide.');
      }

      const companyWithSameName =
        await this.companyRepository.findByName(name);

      if (
        companyWithSameName &&
        companyWithSameName.id !== existingCompany.id
      ) {
        throw new CompanyAlreadyExistsError();
      }

      existingCompany.name = name;
    }

    if (input.careersUrl !== undefined) {
      existingCompany.careersUrl = input.careersUrl;
    }

    if (input.websiteUrl !== undefined) {
      existingCompany.websiteUrl = input.websiteUrl;
    }

    if (input.sourceType !== undefined) {
      existingCompany.sourceType = input.sourceType;
    }

    if (input.isActive !== undefined) {
      existingCompany.isActive = input.isActive;
    }

    return this.companyRepository.update(existingCompany);
  }
}
