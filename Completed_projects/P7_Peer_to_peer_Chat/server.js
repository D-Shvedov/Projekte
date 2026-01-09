const http = require("http");
const Gun = require("gun");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("GUN relay running");
});

Gun({ web: server });

const PORT = process.env.PORT || 8765;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`GUN relay on /gun (port ${PORT})`);
});
