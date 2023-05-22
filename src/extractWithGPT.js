const { Configuration, OpenAIApi } = require("openai");
const config = require("../config");

const configuration = new Configuration({
  apiKey: config.API_KEY,
});

const openai = new OpenAIApi(configuration);

function createPrompt(item) {
  return `
    Ich gebe dir nun eine Nachricht aus einer Reihe an Forenbeiträgen, wo die Nutzer ihre Gehälter und weitere
    Informationen rund um ihre Anstellung veröffentlichen. Betrachte die folgende Nachricht:

    ${item.content}

    Gehe diese Nachricht Zeile für Zeile sorgfältig durch.

    Ich möchte aus diesen unstrukturierten Daten ein valides JSON-Objekt gemäß der JSON-Spezifikation. Ich benötige
    folgende fachlichen Informationen aus dem Text:

    - Berufserfahrung in Monaten (Zahl)
    - Gesamtjahresbrutto (Zahl)
    - Anzahl der Urlaubstage (Zahl)
    - Alter (Zahl)

    Ebenfalls benötige ich eine Konfidenz zwischen 0 und 1 mit zwei Nachkommastellen, wie sicher du dir bist, dass du
    die Informationen aus dem Beitrag extrahieren konntest. Bei 1 konntest du die Werte perfekt extrahieren, bei 0 nicht.

    Ich benötige die Antwort in folgendem JSON-Format:

    {
        "berufserfahrung": <wert>,
        "gesamtjahresbrutto": <wert>,
        "anzahlDerUrlaubstage": <wert>,
        "alter": <wert>,
        "konfizenz": <wert zwischen 0 und 1, zwei nachkommastellen>,
        "fehlerbegruendung": [<wenn die konfidenz unter 0.5 ist, gebe an warum. falls es mehrere gründe gibt, füge es als item in diesem array hinzu. ergänze dieses feld nur, wenn es tatsächlich eine begründung für ein feld gibt.>]
    }

    Gebe ausschließlich die Antwort in JSON zurück. Schreibe unter keinen Umständen zusätzliche Informationen. Nur das JSON-Objekt,
    das ist ganz wichtig.
`;
}

async function extractWithGPT(item, maxRetries = 3, retryDelay = 1000) {
  const requestWithRetry = async (item, currentRetry) => {
    console.log("ask gpt");

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Du bist GehaltGPT. Du extrahierst Gehaltsinformationen aus Forenbeiträgen in deutscher Sprache.",
          },
          {
            role: "user",
            content: createPrompt(item),
          },
        ],
      });

      console.log("finished asking");

      const extractedResult = JSON.parse(
        response.data.choices[0].message.content
      );

      return {
        initialItem: item,
        extractedResult,
      };
    } catch (e) {
      console.log(`Request failed: ${e.message}`);

      if (currentRetry >= maxRetries) {
        console.log("Max retries reached");
        return null;
      }

      console.log(
        `Retrying after ${retryDelay}ms (attempt ${currentRetry + 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return requestWithRetry(item, currentRetry + 1);
    }
  };

  return requestWithRetry(item, 0);
}

module.exports = {
  extractWithGPT,
};
