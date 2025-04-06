const express = require("express");
const router = express.Router();
const { fetchOpenAiResponse } = require("../controller/openAiController");

router.post("/create-party", fetchOpenAiResponse);

module.exports = router;
