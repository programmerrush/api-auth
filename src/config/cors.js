require("dotenv").config();

const cors = require("cors");

// console.log(process.env.CORS_WHITELIST);

const corsOptions = {
  origin: process.env.CORS_WHITELIST
    ? process.env.CORS_WHITELIST.split(",")
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

module.exports = cors(corsOptions);
