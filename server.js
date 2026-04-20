// server.js
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Slang API is running.");
});

// check API key
if (!process.env.GROQ_API_KEY) {
  console.warn("Missing GROQ_API_KEY environment variable.");
}

// Groq client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// translate
app.get("/translate", async (req, res) => {
  try {
    const text = req.query.text;

    if (!text) {
      return res.status(400).send("error: no text provided");
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).send("error: missing api key");
    }

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 1.2,
      top_p: 0.95,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content: `
YOU ARE AN EXTREME STREET SLANG TRANSLATOR.

RULES (STRICT):
- Convert Indonesian → aggressive English street slang
- NEVER use formal English
- MUST sound like hood / gangster speech
- KEEP SAME MEANING
- MAX 1 SHORT sentence only
- NO explanations
- NO polite tone
- NO grammar perfection

FORBIDDEN:
- formal English
- textbook sentences

EXAMPLES:

"lu ngapain disini"
→ "yo what the hell you doin here"

"gua mau pergi"
→ "I’m outta here right now"

"jangan ganggu aku"
→ "don’t fuck with me"

"kalian pergi saja"
→ "y’all just bounce outta here"

NOW TRANSLATE:
`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const output = response?.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return res.status(500).send("error: empty response");
    }

    res.send(output);

  } catch (err) {
    console.error(err);
    res.status(500).send("error: api failed");
  }
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
