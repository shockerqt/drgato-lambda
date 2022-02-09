import axios from 'axios';
// import { scrap } from './scraper';

const run = async () => {
  const response = await axios('https://data.drgato.com/remedies.json');
  console.log('remedies', response.data.remedies);
  // const scrapPromises = pharmacies.map(({ slug, url }) => scrap(slug, url));

  // Promise.all(scrapPromises);
};

run();
