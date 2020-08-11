const express = require("express");
const { getUsers, register } = require("../controllers/users");
const { protected } = require("../utils/authorization");

const router = express.Router();

// Debug 
if (process.env.NODE_ENV === "development")
    router.get("/", getUsers);

router.post("/register", protected, register);

// Debug 
if (process.env.NODE_ENV === "development")
    router.get("/sessions", async (req, res) => {
        const Session = require("../modules/SessionSchema");

        res.json({
            success: true,
            data: await Session.find()
        })
    })

module.exports = router;