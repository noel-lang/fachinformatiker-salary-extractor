const { scrapeThreadData } = require("./src/threadScraper");
const { cleanEntry } = require("./src/cleanEntry");
const { extractWithGPT } = require("./src/extractWithGPT");
const { saveToLocalDatabase } = require("./src/saveToLocalDatabase");

const numbers = Array.from({ length: 35 }, (_, i) => i + 1);

const url =
  "https://www.fachinformatiker.de/topic/114321-wie-viel-verdient-ihr/page";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  const pages = numbers.map((number) => `${url}/${number}`);
  const allResults = [];

  for (const pageUrl of pages) {
    console.log(`Fetch ${pageUrl}...`);

    const scrapedResults = await scrapeThreadData(pageUrl);
    const cleanedResults = scrapedResults.map(cleanEntry);

    console.log("Ask GPT...");
    const resultPromises = cleanedResults.map(extractWithGPT);
    const results = await Promise.all(resultPromises);
    console.log("Finished asking GPT...");

    allResults.push(...results);

    console.log("Sleep for some time...");
    await sleep(1000);
  }

  console.log(`Fetched ${allResults.length} items`);

  saveToLocalDatabase(allResults);
})();
