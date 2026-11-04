
export class JobOffer {
  constructor(
    public readonly id: number | null,
    public title: string,
    public url: string,
    public companyId: number,
    public description: string | null = null,
    public location: string | null = null,
    public contractType: string | null = null,
    public experienceLevel: string | null = null,
    public remotePolicy: string | null = null,
    public salaryMin: number | null = null,
    public salaryMax: number | null = null,
    public currency: string = 'EUR',
    public publishedAt: Date | null = null,
    public discoveredAt: Date = new Date(),
    public isActive: boolean = true,
  ) {}
}
