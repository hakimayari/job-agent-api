import { Injectable } from '@nestjs/common';
import { Company as CompanyEntity } from '../domain/company.entity';
import { CompanyRepository } from '../domain/company.repository';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CompanyAlreadyExistsError } from '../domain/errors/company-already-exists.error';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CompanyEntity[]> {
    const companies = await this.prisma.company.findMany();

    return companies.map((company) => this.toDomain(company));
  }

  async findById(id: number): Promise<CompanyEntity | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    return company ? this.toDomain(company) : null;
  }

  async findByName(name: string): Promise<CompanyEntity | null> {
    const company = await this.prisma.company.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    return company ? this.toDomain(company) : null;
  }
async create(company: CompanyEntity): Promise<CompanyEntity> {
  try {
    const created = await this.prisma.company.create({
      data: {
        name: company.name,
        careersUrl: company.careersUrl,
        websiteUrl: company.websiteUrl,
        sourceType: company.sourceType,
        isActive: company.isActive,
      },
    });

    return this.toDomain(created);
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new CompanyAlreadyExistsError();
    }

    throw error;
  }
}

  async update(company: CompanyEntity): Promise<CompanyEntity> {
    if (company.id === null) {
      throw new Error(
        'Impossible de modifier une entreprise sans identifiant.',
      );
    }

    const updated = await this.prisma.company.update({
      where: { id: company.id },
      data: {
        name: company.name,
        careersUrl: company.careersUrl,
        websiteUrl: company.websiteUrl,
        sourceType: company.sourceType,
        isActive: company.isActive,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.company.delete({
      where: { id },
    });
  }

  private toDomain(record: {
    id: number;
    name: string;
    careersUrl: string | null;
    websiteUrl: string | null;
    sourceType: string | null;
    isActive: boolean;
  }): CompanyEntity {
    return new CompanyEntity(
      record.id,
      record.name,
      record.careersUrl,
      record.websiteUrl,
      record.sourceType,
      record.isActive,
    );
  }
}
