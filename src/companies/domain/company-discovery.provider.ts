
export interface CompanyDiscoveryCriteria {
  keywords: string[];
  location: string;
}

export interface DiscoveredCompany {
  name: string;
  websiteUrl: string;
  careersUrl: string;
}

export interface CompanyDiscoveryProvider {
  discover(
    criteria: CompanyDiscoveryCriteria,
  ): Promise<DiscoveredCompany[]>;
}
