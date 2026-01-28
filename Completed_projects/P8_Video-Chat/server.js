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
    socket.join(room);

    // Sende dem neuen Client die Liste der bereits im Raum befindlichen Sockets
    const socketsInRoom = await io.in(room).fetchSockets();
    const others = socketsInRoom
      .map(s => s.id)
      .filter(id => id !== socket.id);

    socket.emit("existingUsers", others);

    // Informiere die anderen, dass ein neuer da ist
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