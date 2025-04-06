const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
  apiKey: process.env.OEPNAI_API,
});

const getOpenAiResponse = async (content) => {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content }],
  });
  return completion.choices[0].message.content;
};

module.exports = { getOpenAiResponse };
