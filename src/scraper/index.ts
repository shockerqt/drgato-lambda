import axios from 'axios';
import { HTMLElement, parse } from 'node-html-parser';

interface Price {
  normal?: number;
  sale?: number;
}

const scrapers = {
  'cruz-verde': (document: HTMLElement): Price => {
    const data = document.querySelectorAll('div.price span.value');
    if (!data) throw new Error('Coldn\'t parse price from Cruz Verde');
    const saleString = data[0].getAttribute('content');
    const normalString = data[1].getAttribute('content');
    const price: Price = {};
    if (saleString) price.sale = parseFloat(saleString);
    if (normalString) price.normal = parseFloat(normalString);
    return price;
  },
};

export const scrap = async (url: string) => {
  const response = await axios(url);

  const document = parse(response.data);

  console.log(scrapers['cruz-verde'](document));

};

scrap('https://www.cruzverde.cl/neohysticlar-desloratadina-5-mg-30-comprimidos-recubierto/251267.html');
