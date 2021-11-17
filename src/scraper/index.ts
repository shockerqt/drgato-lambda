import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

interface Price {
  normal?: number;
  sale?: number;
}

interface Scrapers {
  [pharmacy: string]: (document: HTMLElement) => Price;
}

const scrapers: Scrapers = {
  'cruz-verde': (document: HTMLElement): Price => {
    const data = document.querySelector('script[type="application/ld+json"]');
    if (!data) throw new Error('Coldn\'t parse price from Cruz Verde');
    const price = JSON.parse(data.innerHTML);
    return price;
  },
};

export const scrap = async (pharmacySlug: string, url: string) => {
  const response = await axios(url);

  const document = parse(response.data);

  console.log(scrapers[pharmacySlug](document));

};

scrap('cruz-verde', 'https://www.cruzverde.cl/neohysticlar-desloratadina-5-mg-30-comprimidos-recubierto/251267.html');
