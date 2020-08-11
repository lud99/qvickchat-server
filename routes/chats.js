const express = require("express");
const { create, getAll, getOne } = require("../controllers/chats");
const { protected } = require("../utils/authorization");

require("../modules/MessageSchema");

const router = express.Router();

router.get("/", protected, getAll);
router.post("/", protected, create);
router.get("/:name", protected, getOne);

module.exports = router;