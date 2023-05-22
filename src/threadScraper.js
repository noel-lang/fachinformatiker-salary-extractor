const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeThreadData(url) {
  try {
    console.log("Start scraping process");
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const postsData = [];

    $(".cPost").each((index, postElement) => {
      const username = $(postElement)
        .find(".cAuthorPane_author a")
        .text()
        .trim();

      const content = $(postElement)
        .find(".cPost_contentWrap .ipsType_normal")
        .html();

      const date = $(postElement)
        .find(".ipsComment_meta > div.ipsType_reset > a > time")
        .attr("datetime");

      // https://www.fachinformatiker.de/topic/114321-wie-viel-verdient-ihr/?do=findComment&comment=1036333
      const postId = $(postElement).attr("id").replace("elComment_", "");

      postsData.push({ postId, username, content, date: new Date(date) });
    });

    return postsData;
  } catch (error) {
    throw new Error(
      "An error occurred while fetching thread data:",
      error.message
    );
  }
}

module.exports = {
  scrapeThreadData,
};
