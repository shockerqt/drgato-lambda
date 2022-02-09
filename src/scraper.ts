import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

interface Remedies {
  [remedy: string]: Remedy;
}

interface Remedy {
  name: string;
  category: string;
  dose?: string;
  activePrinciple: string;
  laboratory: string;
  netContent?: number;
  netContentUnit?: string;
  format?: string;
  vendors: {
    [pharmacy: string]: {
      url: string;
      lastPrice: number | null;
    }
  }
}

interface Scrapers {
  [pharmacy: string]: (document: HTMLElement) => number | null;
}

const scrapers: Scrapers = {
  'farmacias-cruz-verde': (document: HTMLElement) => {
    const data = document.querySelector('script[type="application/ld+json"]');
    if (!data) throw new Error('Coldn\'t parse price from Cruz Verde');
    const product = JSON.parse(data.innerHTML);
    return parseInt(product.offers.price) || null;
  },
  'farmacias-salcobrand': (document: HTMLElement) => {
    const data = document.querySelector('[itemprop=price]');
    if (!data) throw new Error('Coldn\'t parse price from Cruz Verde');
    return parseInt(data.getAttribute('content') || '') || null;
  },
};

const scrap = async (pharmacySlug: string, url: string): Promise<number | null> => {
  const response = await axios(url);
  const document = parse(response.data);
  console.log('PHARMACYSLUG', pharmacySlug, url);
  return scrapers[pharmacySlug](document);

};

const run = async () => {
  const response = await axios('https://data.drgato.com/remedies.json');
  const remedies: Remedies = { ...response.data.remedies };
  // console.log('remedies', remedies);
  Object.entries(remedies).forEach(([slug, remedy]) => {
    Object.entries(remedy.vendors).forEach(async ([pharmacy, { url }]) => {
      if (url?.length > 5 && Object.keys(scrapers).includes(pharmacy)) {
        const price = await scrap(pharmacy, url);
        remedies[slug].vendors[pharmacy].lastPrice = price;
        // remedies = {
        //   ...remedies,
        //   [slug]: {
        //     ...remedies[slug],
        //     vendors: {
        //       ...remedies[slug].vendors,
        //       [pharmacy]: {
        //         url,
        //         lastPrice: price,
        //       },
        //     },
        //   },
        // };
        console.log(remedies[slug].vendors[pharmacy]);
      }
    });
  });
  // const scrapPromises = pharmacies.map(({ slug, url }) => scrap(slug, url));

  // Promise.all(scrapPromises);
};

run();

// scrap('cruz-verde', 'https://www.cruzverde.cl/neohysticlar-desloratadina-5-mg-30-comprimidos-recubierto/251267.html');
// scrap('salcobrand', 'https://salcobrand.cl/products/adrisin-50-comprimidos-sublinguales');
