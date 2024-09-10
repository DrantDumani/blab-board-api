const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT;

const app = express();
app.use(logger("dev"));

app.listen(port, () => {
  console.log(`Currently running on port ${port}`);
});
