
import { Company } from './company.entity';

export interface CompanyRepository {
  findAll(): Promise<Company[]>;

  findById(id: number): Promise<Company | null>;

  findByName(name: string): Promise<Company | null>;

  create(company: Company): Promise<Company>;

  update(company: Company): Promise<Company>;

  delete(id: number): Promise<void>;
}