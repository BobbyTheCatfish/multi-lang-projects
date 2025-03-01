// @ts-check
const router = require("express").Router();
const path = require("path")
const config = require("../config-.json");
const ping = require("./ping");

router.use("/ping", ping);

router.get("/", (req, res) => {
    const msg = `Hey, you made it! Try going to ${config.backend}/ping.`;
    res.sendFile(path.resolve("../readme.md"));
});

module.exports = router;