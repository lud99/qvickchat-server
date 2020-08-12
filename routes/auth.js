const express = require("express");
const { google } = require("../controllers/auth");

const router = express.Router();

router.get("/google", google);

module.exports = router;