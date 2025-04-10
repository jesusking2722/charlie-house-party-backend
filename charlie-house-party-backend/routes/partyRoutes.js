const express = require('express');
const router = express.Router();
const {getAllParties} = require("../controller/partyController");

router.get("/all", getAllParties);

module.exports = router;
