const express = require('express');
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// export pool for testing
module.exports = pool;

// Number.parseInt (..., 10) string in dezimalsystem
const SALT_ROUNDS = Number.parseInt(process.env.SALT_ROUNDS ?? "12", 10);
const port = process.env.PORT || 3000;

app.use(express.static("public"));
// Middleware zum Parsen von JSON- und URL-kodierten Daten
app.use(express.json());
// Middleware zum Parsen von URL-kodierten Daten (z.B. aus HTML-Formularen)
app.use(express.urlencoded({ extended: false }));

// hashing password
async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// Sign up
app.post("/api/sign_up", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ error: "Login and Password are required" });
        }

        const password_hash = await hashPassword(password);

        await pool.query(
            "INSERT INTO accounts (login, password_hash) VALUES ($1, $2)",
            [login, password_hash]
        );

        return res.status(201).json({ message: "Created" });
    } catch (err) {
        console.error(err);


        if (err.code === "23505") {
            return res.status(409).json({ error: "Login already exists" });
        }

        return res.status(500).json({ error: "Server error" });
    }
});

// Sign in
app.post("/api/sign_in", async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ error: "Login and Password are required" });
        }

        const dbRes = await pool.query(
            "SELECT password_hash, nickname, birthday, location FROM accounts WHERE login = $1",
            [login]
        );

        if (dbRes.rows.length === 0) {
            return res.status(401).json({ error: "Invalid login or password" });
        }

        const ok = await bcrypt.compare(password, dbRes.rows[0].password_hash);

        if (!ok) {
            return res.status(401).json({ error: "Invalid login or password" });
        }

        const user = dbRes.rows[0];

        return res.status(200).json({
            nickname: user.nickname,
            birthday: user.birthday,
            location: user.location,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Save profile
app.post("/api/profile", async (req, res) => {
    try {
        const { nickname, birthday, location, login } = req.body


        if (!login) {
            return res.status(400).json({ error: "Login required" });
        }

        if (!nickname && !birthday && !location) {
            return res.status(400).json({ error: "Nothing to update" });
        }

        await pool.query(
            `
            UPDATE accounts
            SET
                nickname = $1,
                birthday = $2,
                location = $3
            WHERE login = $4
            `,
            [nickname, birthday, location, login]
        );

        return res.status(200).json({ message: "Profile was saved" })


    } catch (err) {
        return res.status(500).json({ error: "Server error" })
    }
})

// Verbindung mit STUN und TURN Server
app.get('/ice', (req, res) => {
    const username = process.env.METERED_USER
    const credential = process.env.METERED_PASS

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


// socket-Verbindung einrichten
io.on("connection", (socket) => {
    console.log("Client id:", socket.id);

    socket.emit("message", "Connection established with server");

    socket.on("contact", () => {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                socket.leave(room);
            }
        }

        let i = 1;

        while (true) {
            const roomName = "room" + i;
            // Überprüfen, wie viele Sockets sich bereits in diesem Raum befinden
            const roomSet  = io.sockets.adapter.rooms.get(roomName);
            const size = roomSet  ? roomSet.size : 0;

            if (size < 2) {
                socket.join(roomName);
                socket.emit("roomName", roomName);
                console.log(`${socket.id} joined ${roomName}`);
                break;
            }

            i++;
        }
    });

    // Nachricht im Raum erhalten und an alle im Raum senden
    socket.on("roomName:msg", ({ roomName, msg }) => {
        if (!roomName || !msg) return;
        io.to(roomName).emit("roomName:msg", {
            roomName,
            msg,
            from: socket.id
        });
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

server.listen(port, () => console.log("Server listening on", port));
