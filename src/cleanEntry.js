const axios = require("axios");
const cheerio = require("cheerio");

function cleanEntry(entry) {
  return {
    ...entry,
    username: getStringUntilNewline(entry.username),
  };
}

function getStringUntilNewline(inputString) {
  return inputString.split("\n")[0];
}

module.exports = {
  cleanEntry,
};
