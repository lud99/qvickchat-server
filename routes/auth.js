const express = require("express");
const { google } = require("../controllers/auth");

const router = express.Router();

router.route("/google").get(google);

module.exports = router;