
export class Company {
  constructor(
    public readonly id: number | null,
    public name: string,
    public careersUrl: string | null = null,
    public websiteUrl: string | null = null,
    public sourceType: string | null = null,
    public isActive: boolean = true,
  ) {}
}