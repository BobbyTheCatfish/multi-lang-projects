// @ts-check
const express = require("express");
const cors = require("cors");
const config = require("./config-.json");
const routes = require("./routes");
const app = express();

app.use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(cors({
        origin: config.frontend,
        credentials: true
    }));

app.use("/", routes)

app.listen(config.port, () => console.log(`Backend running on port ${config.port}\n${config.backend}`));