// server.js
const express = require("express");
const http = require("http");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

const Gun = require("gun");

Gun({
  web: server,
  file: false,
  axe: false,
  multicast: false
});

const PORT = 8765;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`App:   http://localhost:${PORT}/`);
  console.log(`Relay: http://localhost:${PORT}/gun`);
});
