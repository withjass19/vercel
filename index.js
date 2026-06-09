const express = require("express")

const app = express();

const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello world");
})

module.exports = app;