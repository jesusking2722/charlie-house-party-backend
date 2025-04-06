const { getOpenAiResponse } = require("../services/openaiService");

const fetchOpenAiResponse = async (req, res) => {
  try {
    const { content } = req.body;
    const response = await getOpenAiResponse(content);
    if (!response) {
      return res.status(404).json({ ok: false, message: "Response not found" });
    }
    res.json({ ok: true, data: { content: response } });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { fetchOpenAiResponse };
