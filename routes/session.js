const express = require("express");
const { getUsers, register } = require("../controllers/users");
const { protected } = require("../utils/authorization");

const router = express.Router();

router.get("/", protected, (req, res) => {
    res.json({ success: true, data: req.session });
});


module.exports = router;