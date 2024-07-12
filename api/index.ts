const express = require("express");
const app = express();

app.get("/", (req, res) => res.render("login"));

app.listen(3300, () => console.log("Server ready on port 3300."));

module.exports = app;
