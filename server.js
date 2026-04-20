// server.js
const express = require("express");
const OpenAI = require("openai");

const app = express();

// Basic middleware
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Slang API is running.");
});

// Validate API key first
if (!process.env.GROQ_API_KEY) {
  console.warn("Missing GROQ_API_KEY environment variable.");
}

// Groq client
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Translate route
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
      temperature: 1,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content: `
You translate Indonesian into aggressive English street slang.

Rules:
- One sentence only
- Keep meaning same
- No short forms like u, r, 4, 2
- Not too long
- No explanation
- Natural street tone
`
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const output =
      response &&
      response.choices &&
      response.choices[0] &&
      response.choices[0].message &&
      response.choices[0].message.content
        ? response.choices[0].message.content.trim()
        : null;

    if (!output) {
      return res.status(500).send("error: empty response");
    }

    res.send(output);

  } catch (error) {
    console.error(error);
    res.status(500).send("error: api failed");
  }
});

// Render port
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
