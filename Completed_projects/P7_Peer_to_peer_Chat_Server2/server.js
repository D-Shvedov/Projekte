const http = require("http");
const fs = require("fs");
const path = require("path");
const Gun = require("gun");

const server = http.createServer((req, res) => {
  // Serve static files from public directory
  let filePath = path.join(__dirname, "public", req.url === "/" ? "sign.html" : req.url);
  let extname = path.extname(filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(path.join(__dirname, "public"))) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("Not Found");
      } else {
        res.writeHead(500);
        res.end("Server Error");
      }
    } else {
      let contentType = "text/plain";
      if (extname === ".html") contentType = "text/html";
      else if (extname === ".css") contentType = "text/css";
      else if (extname === ".js") contentType = "application/javascript";
      else if (extname === ".json") contentType = "application/json";

      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

// GUN Server 2 - connects to Server 1
Gun({
  web: server,
  peers: ["https://gun-peer-1.onrender.com/gun"]
});

const PORT = process.env.PORT || 8766;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`GUN Relay Server 2 running on port ${PORT}`);
  console.log(`Connected to peer: https://gun-peer-1.onrender.com/gun`);
});
