import {
  CompanyDiscoveryCriteria,
  CompanyDiscoveryProvider,
  DiscoveredCompany,
} from '../domain/company-discovery.provider';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
}

interface TavilySearchResponse {
  results: TavilySearchResult[];
}

export class TavilyCompanyDiscoveryProvider implements CompanyDiscoveryProvider {
  private readonly excludedDomains = [
    'hellowork.com',
    'indeed.com',
    'linkedin.com',
    'apec.fr',
    'welcometothejungle.com',
    'free-work.com',
    'cadremploi.fr',
    'lesjeudis.com',
    'engineering.jobs',
    'stackjobs.com',
    'getyourjob.pro',
    'lyon-emplois.com',
    'nostalentsnosemplois.auvergnerhonealpes.fr',
    'urbanlinker.com',
  ];

  constructor(private readonly apiKey: string) {}

  async discover(
    criteria: CompanyDiscoveryCriteria,
  ): Promise<DiscoveredCompany[]> {
    const queries = [
      `entreprises informatique ESN qui recrutent développeurs ${criteria.location} site carrière officiel`,
      `recrutement ${criteria.keywords.join(' ')} ${criteria.location} site officiel entreprise`,
      `offres emploi développeur CDI ${criteria.location} espace carrières entreprise`,
      `entreprises tech ${criteria.location} recrutement développeurs carrière`,
    ];

    const candidatesByUrl = new Map<string, { name: string; careersUrl: string }>();

    for (const query of queries) {
      const data = await this.searchTavily(query, 10);
      const candidates = this.extractCandidates(data.results);

      for (const candidate of candidates) {
        const key = candidate.careersUrl.toLowerCase();

        if (!candidatesByUrl.has(key)) {
          candidatesByUrl.set(key, candidate);
        }
      }
    }

    const candidates = Array.from(candidatesByUrl.values());
    const companies: DiscoveredCompany[] = [];

    for (const candidate of candidates) {
      const websiteUrl = await this.findOfficialWebsite(
        candidate.name,
        criteria.location,
      );

      if (!websiteUrl) {
        continue;
      }

      companies.push({
        name: candidate.name,
        websiteUrl,
        careersUrl: candidate.careersUrl,
      });
    }

    return companies;
  }

  private async searchTavily(
    query: string,
    maxResults: number,
  ): Promise<TavilySearchResponse> {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: 'basic',
        max_results: maxResults,
        include_answer: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erreur Tavily : ${response.status} ${response.statusText}`,
      );
    }

    return (await response.json()) as TavilySearchResponse;
  }

  private extractCandidates(
    results: TavilySearchResult[],
  ): Array<{ name: string; careersUrl: string }> {
    const candidates = new Map<string, { name: string; careersUrl: string }>();

    for (const result of results) {
      if (!this.isLikelyCareerPage(result)) {
        continue;
      }

      let hostname: string;

      try {
        const url = new URL(result.url);

        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          continue;
        }

        hostname = url.hostname.toLowerCase();
      } catch {
        continue;
      }

      const name = this.extractCompanyName(result.title, hostname);

      if (!name) {
        continue;
      }

      const key = name.toLowerCase();

      if (!candidates.has(key)) {
        candidates.set(key, {
          name,
          careersUrl: result.url,
        });
      }
    }

    return Array.from(candidates.values());
  }

  private async findOfficialWebsite(
    companyName: string,
    location: string,
  ): Promise<string | null> {
    const query = `"${companyName}" site officiel entreprise ${location}`;

    const data = await this.searchTavily(query, 5);

    for (const result of data.results) {
      let url: URL;

      try {
        url = new URL(result.url);
      } catch {
        continue;
      }

      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        continue;
      }

      const hostname = url.hostname.toLowerCase();

      if (this.isExcludedDomain(hostname)) {
        continue;
      }

      // Éviter de retenir une page carrière comme site principal.
      const text = `${result.title} ${url.pathname}`;

      if (
        /carri[eè]re|careers?|recruitment|recrutement|\/jobs?(\/|$)/i.test(text)
      ) {
        continue;
      }

      return `${url.origin}/`;
    }

    return null;
  }

  private extractCompanyName(title: string, hostname: string): string {
    const cleanedTitle = title
      .replace(/\s*[-|–—]\s*(careers?|carrières?|jobs?|emplois?)\s*.*$/i, '')
      .trim();

    // Un titre long ressemble souvent à une annonce plutôt
    // qu'à un nom d'entreprise.
    if (cleanedTitle && cleanedTitle.length <= 60) {
      return cleanedTitle;
    }

    const ignoredSubdomains = new Set([
      'www',
      'careers',
      'career',
      'carrieres',
      'carriere',
      'jobs',
      'job',
      'talent',
      'recrutement',
      'recruitment',
      'recruit',
      'emploi',
    ]);

    const labels = hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .split('.')
      .filter((label) => !ignoredSubdomains.has(label));

    const companyLabel = labels[0];

    if (!companyLabel) {
      return '';
    }

    return companyLabel.charAt(0).toUpperCase() + companyLabel.slice(1);
  }

  private isExcludedDomain(hostname: string): boolean {
    return this.excludedDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
  }

  private isLikelyCareerPage(result: TavilySearchResult): boolean {
    const text = `${result.title} ${result.url} ${result.content}`;

    let hostname: string;

    try {
      hostname = new URL(result.url).hostname.toLowerCase();
    } catch {
      return false;
    }

    if (this.isExcludedDomain(hostname)) {
      return false;
    }

    return /career|carri[eè]re|recrut|jobs?|emploi|talent/i.test(text);
  }
}
