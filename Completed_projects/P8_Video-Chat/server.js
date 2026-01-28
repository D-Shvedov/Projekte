const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000; // Use environment variable or default to 3000

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("joinRoom", async (room) => {
    // Erst schauen, wie viele schon drin sind (ohne dass der neue joint)
    const socketsInRoom = await io.in(room).fetchSockets();

    if (socketsInRoom.length >= 2) {
      socket.emit("roomFull");
      return;
    }

    // Jetzt erst beitreten
    socket.join(room);

    // "others" = alle bisherigen Teilnehmer (max 1)
    const others = socketsInRoom.map(s => s.id);

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
});



server.listen(port);