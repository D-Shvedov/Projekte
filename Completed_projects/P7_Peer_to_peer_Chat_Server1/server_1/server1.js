const express = require("express");
const Gun = require("gun");
const path = require("path");
const http = require("http");

const app = express();
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sign.html"));
});

const server = http.createServer(app);

Gun({
  web: server,
  file: path.join(__dirname, "radata")
});

server.listen(8765, "0.0.0.0", () => {
  console.log("GUN Server 1 running on http://localhost:8765");
});
