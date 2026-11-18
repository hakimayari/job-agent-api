import {
  CompanyDiscoveryCriteria,
  CompanyDiscoveryProvider,
  DiscoveredCompany,
} from '../domain/company-discovery.provider';

import { getDomain } from 'tldts';

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
    // Jobboards et plateformes d'emploi
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
    'meteojob.com',
    'adzuna.fr',
    'adzuna.com',
    'francetravail.fr',
    'pole-emploi.fr',
    'optioncarriere.com',

    // Annuaires et bases de données d'entreprises
    'rocketreach.co',
    'cbinsights.com',
    'studyrama.com',
    'mapquest.com',
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

    const candidatesByUrl = new Map<
      string,
      { name: string; careersUrl: string }
    >();

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
        candidate.careersUrl,
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

  const normalize = (value: string): string =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  for (const result of results) {
    if (!this.isLikelyCareerPage(result)) {
      continue;
    }

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

    const name = this.extractCompanyName(result.title, hostname);

    if (!name) {
      continue;
    }

    // Vérifier que le nom de l'entreprise correspond au domaine.
    const normalizedName = normalize(name);

 const rootDomain = getDomain(hostname);

if (!rootDomain) {
  continue;
}

const companyDomainLabel = normalize(rootDomain.split('.')[0]);

const hasMatchingDomainLabel =
  companyDomainLabel.length >= 4 &&
  (normalizedName.includes(companyDomainLabel) ||
    companyDomainLabel.includes(normalizedName));

    if (!hasMatchingDomainLabel) {
      continue;
    }

    const key = normalizedName;

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
    careersUrl: string,
  ): Promise<string | null> {
    const query = `"${companyName}" site officiel ${location}`;

    const data = await this.searchTavily(query, 10);

    const normalize = (value: string): string =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const normalizedCompanyName = normalize(companyName);

    let careersHostname: string;

    try {
      careersHostname = new URL(careersUrl).hostname
        .toLowerCase()
        .replace(/^www\./, '');
    } catch {
      return null;
    }

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

      const hostname = url.hostname.toLowerCase().replace(/^www\./, '');

      if (this.isExcludedDomain(hostname)) {
        continue;
      }

      const text = `${result.title} ${hostname}`;

      if (!normalize(text).includes(normalizedCompanyName)) {
        continue;
      }

      if (
        /carri[eè]re|careers?|recruitment|recrutement|\/jobs?(\/|$)/i.test(
          `${result.title} ${url.pathname}`,
        )
      ) {
        continue;
      }

      // Le site officiel doit appartenir au même domaine
      // que la page carrière ou à son domaine parent.
      const careersRootDomain = getDomain(careersHostname);
const officialRootDomain = getDomain(hostname);

const sameDomain =
  careersRootDomain !== null &&
  officialRootDomain !== null &&
  careersRootDomain === officialRootDomain;

      if (!sameDomain) {
        continue;
      }

      return `${url.origin}/`;
    }

    return null;
  }

  private extractCompanyName(title: string, hostname: string): string {
    const careerPrefixPattern =
      /^\s*(careers?|carrières?|jobs?|emplois?)\s*[-|–—]\s*/i;

    const careerSuffixPattern =
      /\s*[-|–—]\s*(careers?|carrières?|jobs?|emplois?)\s*$/i;

    const cleanedTitle = title
      .replace(careerPrefixPattern, '')
      .replace(careerSuffixPattern, '')
      .trim();

    // Écarter les titres qui ressemblent à des articles
    // ou à des contenus éditoriaux plutôt qu'à des noms d'entreprise.
    const invalidTitlePattern =
      /\b(offres?\s+d['’]?emploi|meilleures?\s+offres?|meilleurs?\s+sites|comment|guide|actualités?|développeurs?|développeuses?|ingénieurs?|ingénieures?)\b/i;

    if (invalidTitlePattern.test(cleanedTitle)) {
      return '';
    }

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
    let url: URL;

    try {
      url = new URL(result.url);
    } catch {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    if (this.isExcludedDomain(hostname)) {
      return false;
    }

    const title = result.title.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    // Les pages carrière doivent être identifiables par leur titre
    // ou par leur chemin URL, pas simplement par leur contenu.
    const careerPattern =
      /career|carri[eè]re|recrutement|recruitment|jobs?|emploi|talent/i;

    const articlePattern =
      /\/(blog|actualites|actualités|news|articles?|ressources|guides?)(\/|$)/i;

    if (articlePattern.test(pathname)) {
      return false;
    }

    return careerPattern.test(title) || careerPattern.test(pathname);
  }
}
