// Importiere die benötigten Module
const express = require("express");
// HTTP-Modul von Node.js
const http = require("http");
// Importiert die Socket.IO
const { Server } = require("socket.io");

const app = express();
// Erstelle einen HTTP-Server basierend auf der Express-App
const server = http.createServer(app);
// Erstelle eine neue Socket.IO-Instanz, die den HTTP-Server verwendet
const io = new Server(server);

// Port aus Umgebungsvariable oder Standardport 3000 
const port = process.env.PORT || 3000;

// lädt automatisch public/index.html. Macht den Ordner public/ öffentlich erreichbar
app.use(express.static("public"));

// Endpoint zum Abrufen der ICE-Server-Konfiguration
app.get("/ice", (req, res) => {
  const username = process.env.METERED_USER;
  const credential = process.env.METERED_PASS;

  if (!username || !credential) {
    return res.status(500).json({ error: "TURN credentials missing (METERED_USER/METERED_PASS)" });
  }

  res.json({
    iceServers: [
      // STUN und TURN Server von metered.ca
      { urls: "stun:stun.relay.metered.ca:80" },
      { urls: "turn:de.relay.metered.ca:80", username, credential },
      { urls: "turn:de.relay.metered.ca:80?transport=tcp", username, credential },
      { urls: "turn:de.relay.metered.ca:443", username, credential },
      { urls: "turns:de.relay.metered.ca:443?transport=tcp", username, credential },
    ],
  });
});

// Socket.IO-Verbindungen behandeln
io.on("connection", (socket) => {
  socket.on("joinRoom", async (room) => {
    const socketsInRoom = await io.in(room).fetchSockets();
    if (socketsInRoom.length >= 2) {
      socket.emit("roomFull");
      return;
    }

    socket.join(room);

    // Informiere den neuen Teilnehmer über bestehende Nutzer
    const others = socketsInRoom.map((s) => s.id);
    socket.emit("existingUsers", others);

    socket.to(room).emit("userJoined", socket.id);
  });
  // Weiterleitung von WebRTC-Signalisierungsnachrichten
  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });
  // Antwortnachrichten weiterleiten
  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });
  // ICE-Kandidaten weiterleiten
  socket.on("iceCandidate", ({ candidate, to }) => {
    io.to(to).emit("iceCandidate", { candidate, from: socket.id });
  });

  // Benachrichtige andere Nutzer im Raum, wenn ein Nutzer den Raum verlässt
  socket.on("disconnecting", () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.to(room).emit("userLeft", socket.id);
    }
  });
});

// Starte den Server
server.listen(port, () => console.log("Server listening on", port));
