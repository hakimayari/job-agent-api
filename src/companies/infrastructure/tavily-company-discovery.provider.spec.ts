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
  it('doit exclure les domaines de jobboards et les annuaires', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: 'Développeur Angular - Meteojob',
            url: 'https://www.meteojob.com/offres/developpeur-angular',
            content: 'Offres de recrutement.',
          },
          {
            title: 'Développeur TypeScript - Adzuna',
            url: 'https://www.adzuna.fr/offres/developpeur-typescript',
            content: 'Offres d emploi.',
          },
        ],
      },
      {
        results: [
          {
            title: 'Selescope - Careers',
            url: 'https://www.rocketreach.co/careers',
            content: 'Recrutement chez Selescope.',
          },
        ],
      },
      { results: [] },
      { results: [] },
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

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('ne doit pas considérer un article sur le recrutement comme une page carrière', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: 'Acme - Les meilleurs sites de recrutement',
            url: 'https://www.acme.fr/blog/meilleurs-sites-recrutement',
            content:
              'Découvrez notre classement des meilleurs sites pour trouver un emploi.',
          },
        ],
      },
      { results: [] },
      { results: [] },
      { results: [] },
    ];

    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => {
        const nextResponse = tavilyResponses.shift();

        if (!nextResponse) {
          return {
            ok: true,
            json: async () => ({ results: [] }),
          } as Response;
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

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('ne doit pas associer une entreprise à un site tiers', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: 'Esker - Careers',
            url: 'https://www.esker.com/company/careers/',
            content: 'Opportunités chez Esker.',
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
            url: 'https://esker-officiel.example/',
            content: 'Site officiel présenté comme celui d’Esker.',
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

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });


it('ne doit pas accepter un domaine qui usurpe le nom de l’entreprise', async () => {
  const tavilyResponses = [
    {
      results: [
        {
          title: 'Esker - Careers',
          url: 'https://www.esker.com/company/careers/',
          content: 'Opportunités chez Esker.',
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
          url: 'https://esker-recrutement-autre-societe.com/',
          content: 'Site présenté comme le site officiel d’Esker.',
        },
      ],
    },
  ];

  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockImplementation(async () => {
      const response = tavilyResponses.shift();

      if (!response) {
        throw new Error('Réponse Tavily de test manquante');
      }

      return {
        ok: true,
        json: async () => response,
      } as Response;
    });

  const result = await provider.discover({
    keywords: ['développeur TypeScript'],
    location: 'Lyon',
  });

  expect(result).toEqual([]);
  expect(fetchMock).toHaveBeenCalledTimes(5);
});


it('doit accepter le domaine officiel avec une extension .co.uk', async () => {
  const tavilyResponses = [
    {
      results: [
        {
          title: 'Acme - Careers',
          url: 'https://jobs.acme.co.uk/careers/',
          content: 'Opportunités chez Acme.',
        },
      ],
    },
    { results: [] },
    { results: [] },
    { results: [] },
    {
      results: [
        {
          title: 'Acme - Official website',
          url: 'https://www.acme.co.uk/',
          content: 'Official website of Acme.',
        },
      ],
    },
  ];

  jest.spyOn(global, 'fetch').mockImplementation(async () => {
    const response = tavilyResponses.shift();

    if (!response) {
      throw new Error('Réponse Tavily de test manquante');
    }

    return {
      ok: true,
      json: async () => response,
    } as Response;
  });

  const result = await provider.discover({
    keywords: ['développeur TypeScript'],
    location: 'Lyon',
  });

  expect(result).toContainEqual({
    name: 'Acme',
    websiteUrl: 'https://www.acme.co.uk/',
    careersUrl: 'https://jobs.acme.co.uk/careers/',
  });
});

it('doit accepter le domaine officiel avec une extension .com.au', async () => {
  const tavilyResponses = [
    {
      results: [
        {
          title: 'Acme - Careers',
          url: 'https://jobs.acme.com.au/careers/',
          content: 'Opportunités chez Acme.',
        },
      ],
    },
    { results: [] },
    { results: [] },
    { results: [] },
    {
      results: [
        {
          title: 'Acme - Official website',
          url: 'https://www.acme.com.au/',
          content: 'Official website of Acme.',
        },
      ],
    },
  ];

  jest.spyOn(global, 'fetch').mockImplementation(async () => {
    const response = tavilyResponses.shift();

    if (!response) {
      throw new Error('Réponse Tavily de test manquante');
    }

    return {
      ok: true,
      json: async () => response,
    } as Response;
  });

  const result = await provider.discover({
    keywords: ['développeur TypeScript'],
    location: 'Lyon',
  });

  expect(result).toContainEqual({
    name: 'Acme',
    websiteUrl: 'https://www.acme.com.au/',
    careersUrl: 'https://jobs.acme.com.au/careers/',
  });
});



it('ne doit pas associer deux entreprises différentes ayant la même extension de domaine', async () => {
  const tavilyResponses = [
    {
      results: [
        {
          title: 'Acme - Careers',
          url: 'https://jobs.acme.co.uk/careers/',
          content: 'Opportunités chez Acme.',
        },
      ],
    },
    { results: [] },
    { results: [] },
    { results: [] },
    {
      results: [
        {
          title: 'Acme - Official website',
          url: 'https://www.other-company.co.uk/',
          content: 'Site officiel présenté comme celui d’Acme.',
        },
      ],
    },
  ];

  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockImplementation(async () => {
      const response = tavilyResponses.shift();

      if (!response) {
        throw new Error('Réponse Tavily de test manquante');
      }

      return {
        ok: true,
        json: async () => response,
      } as Response;
    });

  const result = await provider.discover({
    keywords: ['développeur TypeScript'],
    location: 'Lyon',
  });

  expect(result).toEqual([]);
  expect(fetchMock).toHaveBeenCalledTimes(5);
});


  it('doit extraire le nom lorsque Careers est après le nom de l’entreprise', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: 'Sanofi - Careers',
            url: 'https://careers.sanofi.com/careers/',
            content: 'Découvrez les opportunités chez Sanofi.',
          },
        ],
      },
      { results: [] },
      { results: [] },
      { results: [] },
      {
        results: [
          {
            title: 'Sanofi - Site officiel',
            url: 'https://www.sanofi.com/',
            content: 'Site officiel de Sanofi.',
          },
        ],
      },
    ];

    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      const response = tavilyResponses.shift();

      if (!response) {
        throw new Error('Réponse Tavily de test manquante');
      }

      return {
        ok: true,
        json: async () => response,
      } as Response;
    });

    const result = await provider.discover({
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    });

    expect(result).toContainEqual({
      name: 'Sanofi',
      websiteUrl: 'https://www.sanofi.com/',
      careersUrl: 'https://careers.sanofi.com/careers/',
    });
  });

  it('doit extraire le nom lorsque Careers est avant le nom de l’entreprise', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: 'Careers - Sanofi',
            url: 'https://careers.sanofi.com/careers/',
            content: 'Découvrez les opportunités chez Sanofi.',
          },
        ],
      },
      { results: [] },
      { results: [] },
      { results: [] },
      {
        results: [
          {
            title: 'Sanofi - Site officiel',
            url: 'https://www.sanofi.com/',
            content: 'Site officiel de Sanofi.',
          },
        ],
      },
    ];

    jest.spyOn(global, 'fetch').mockImplementation(async () => {
      const response = tavilyResponses.shift();

      if (!response) {
        throw new Error('Réponse Tavily de test manquante');
      }

      return {
        ok: true,
        json: async () => response,
      } as Response;
    });

    const result = await provider.discover({
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    });

    expect(result).toContainEqual({
      name: 'Sanofi',
      websiteUrl: 'https://www.sanofi.com/',
      careersUrl: 'https://careers.sanofi.com/careers/',
    });
  });

  it('ne doit pas considérer un titre d’article comme un nom d’entreprise', async () => {
    const tavilyResponses = [
      {
        results: [
          {
            title: "Les meilleures offres d'emploi chez Sanofi",
            url: 'https://www.sanofi.com/careers/meilleurs-sites-recrutement',
            content: 'Un article présentant des offres et des conseils.',
          },
        ],
      },
      { results: [] },
      { results: [] },
      { results: [] },
    ];

    const fetchMock = jest.spyOn(global, 'fetch').mockImplementation(async () => {
      const response = tavilyResponses.shift() ?? { results: [] };

      return {
        ok: true,
        json: async () => response,
      } as Response;
    });

    const result = await provider.discover({
      keywords: ['développeur TypeScript'],
      location: 'Lyon',
    });

    expect(result).toEqual([]);
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
