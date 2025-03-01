// @ts-check
const router = require("express").Router();

router.get("/", (req, res) => {
    res.send({ msg: "Pong!" });
});

module.exports = router;