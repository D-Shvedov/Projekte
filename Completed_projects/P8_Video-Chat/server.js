const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

/**
 * ✅ ICE config endpoint (TURN Credentials bleiben serverseitig)
 * Setze in Render ENV:
 *   METERED_USER=...
 *   METERED_PASS=...
 */
app.get("/ice", (req, res) => {
  const username = process.env.METERED_USER;
  const credential = process.env.METERED_PASS;

  if (!username || !credential) {
    return res.status(500).json({ error: "TURN credentials missing (METERED_USER/METERED_PASS)" });
  }

  res.json({
    iceServers: [
      { urls: "stun:stun.relay.metered.ca:80" },
      { urls: "turn:de.relay.metered.ca:80", username, credential },
      { urls: "turn:de.relay.metered.ca:80?transport=tcp", username, credential },
      { urls: "turn:de.relay.metered.ca:443", username, credential },
      { urls: "turns:de.relay.metered.ca:443?transport=tcp", username, credential },
    ],
  });
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async (room) => {
    // ✅ 1:1 limit (check BEFORE join)
    const socketsInRoom = await io.in(room).fetchSockets();
    if (socketsInRoom.length >= 2) {
      socket.emit("roomFull");
      return;
    }

    socket.join(room);

    // existing users (max 1)
    const others = socketsInRoom.map((s) => s.id);
    socket.emit("existingUsers", others);

    socket.to(room).emit("userJoined", socket.id);
  });

  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("iceCandidate", ({ candidate, to }) => {
    io.to(to).emit("iceCandidate", { candidate, from: socket.id });
  });

  // ✅ notify on leave
  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.to(room).emit("userLeft", socket.id);
    }
  });
});

server.listen(port, () => console.log("Server listening on", port));
