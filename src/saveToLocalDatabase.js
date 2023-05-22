const fs = require("fs");

async function saveToLocalDatabase(allResults) {
  fs.writeFile(
    "results.json",
    JSON.stringify(allResults, null, 2),
    "utf8",
    (error) => {
      if (error) {
        console.error("Error while writing the JSON file:", error);
      } else {
        console.log("Successfully saved the JSON array to results.json");
      }
    }
  );
}

module.exports = {
  saveToLocalDatabase,
};
