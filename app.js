const axios = require("axios");
const cheerio = require("cheerio");

const { scrapeThreadData } = require("./src/threadScraper");
const { cleanEntry } = require("./src/cleanEntry");

const url =
  "https://www.fachinformatiker.de/topic/114321-wie-viel-verdient-ihr/";

(async () => {
  const results = await scrapeThreadData(url);
  const cleanedResults = results.map(cleanEntry);
  console.log(cleanedResults);
})();
