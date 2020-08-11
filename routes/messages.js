const express = require("express");
const { create, get } = require("../controllers/messages");
const { protected } = require("../utils/authorization");

const router = express.Router();

// Debug 
if (process.env.NODE_ENV === "development")
    router.get("/", protected, get);
    
router.post("/", protected, create);

module.exports = router;