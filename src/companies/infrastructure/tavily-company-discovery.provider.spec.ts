
import { it, jest, describe, beforeEach, expect } from '@jest/globals';

import { TavilyCompanyDiscoveryProvider } from './tavily-company-discovery.provider';

describe('TavilyCompanyDiscoveryProvider', () => {
  let provider: TavilyCompanyDiscoveryProvider;

  beforeEach(() => {
    jest.restoreAllMocks();
    provider = new TavilyCompanyDiscoveryProvider('test-api-key');
  });

  it('doit rechercher le site officiel après avoir trouvé une page carrière', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: 'Esker - Careers',
            url: 'https://www.esker.com/company/careers/',
            content: 'Découvrez les opportunités de carrière chez Esker.',
          },
          {
            title: 'Offres d emploi Développeur Angular',
            url: 'https://www.hellowork.com/fr-fr/emploi/developpeur-angular.html',
            content: 'Consultez les offres d emploi sur HelloWork.',
          },
        ],
      },
      { results: [] },
      { results: [] },
      { results: [] },
      {
        results: [
          {
            title: 'Esker - Site officiel',
            url: 'https://www.esker.com/',
            content: 'Site officiel de la société Esker.',
          },
        ],
      },
    ];

    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => {
        const nextResponse = tavilyResponses.shift();

        if (!nextResponse) {
          throw new Error('Réponse Tavily de test manquante');
        }

        return {
          ok: true,
          json: async () => nextResponse,
        } as Response;
      });

    const result = await provider.discover({
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    });

    // 4 recherches initiales + 1 recherche du site officiel d'Esker.
    expect(fetchMock).toHaveBeenCalledTimes(5);

    expect(result).toEqual([
      {
        name: 'Esker',
        websiteUrl: 'https://www.esker.com/',
        careersUrl: 'https://www.esker.com/company/careers/',
      },
    ]);
  });

  it('doit exclure les jobboards des candidats', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            title: 'Développeur Angular Lyon',
            url: 'https://fr.linkedin.com/jobs/developpeur-angular-emplois-lyon',
            content: 'Offres de recrutement sur LinkedIn Jobs.',
          },
          {
            title: 'Développeur TypeScript Lyon',
            url: 'https://fr.indeed.com/jobs?q=typescript',
            content: 'Offres d emploi sur Indeed.',
          },
        ],
      }),
    } as Response);

    const result = await provider.discover({
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    });

    expect(result).toEqual([]);

    // Les 4 requêtes initiales sont effectuées, mais aucun site
    // officiel n'est recherché puisque les candidats sont exclus.
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('doit propager une erreur HTTP de Tavily', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as Response);

    await expect(
      provider.discover({
        keywords: ['développeur TypeScript'],
        location: 'Lyon',
      }),
    ).rejects.toThrow('Erreur Tavily : 401 Unauthorized');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
