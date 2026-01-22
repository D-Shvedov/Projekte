const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
    socket.to(room).emit("userJoined", socket.id);
  });

  socket.on("offer", (offer, room) => {
    socket.to(room).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, room) => {
    socket.to(room).emit("answer", answer, socket.id);
  });

  socket.on("iceCandidate", (iceCandidate, room) => {
    socket.to(room).emit("iceCandidate", iceCandidate, socket.id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server running on port: http://localhost:${port}/`);
});
