// app.js
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

// Bibliotheken für Krypto-Adressen
const bitcoin = require("bitcoinjs-lib");
const xrpl = require("xrpl");
const { ethers } = require("ethers");

// JWT für Authentifizierung
const jwt = require("jsonwebtoken");
const db = require("./database.js");

// Express App initialisieren
const app = express();
app.use(express.json());

// 👉 Pfad zu deinem Ordner
const staticPath = __dirname;

// Statische Dateien
app.use(express.static(staticPath, { index: false }));

// HTTP Server + Socket.IO
const server = http.createServer(app);
const io = new Server(server);


// ERSTE ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(staticPath, "Login_Cryptowallet.html"));
});


io.on("connection", (socket) => {
  // Verbindung hergestellt (Log entfernt auf Wunsch)

  socket.on("chat:message", (payload) => {
    let text = "";
    let from = socket.id;

    if (typeof payload === 'string') {
      text = payload;
    } else if (payload && typeof payload === 'object') {
      text = String(payload.text ?? '');
      if (payload.from) from = payload.from;
    }

    const clean = String(text).trim();
    if (!clean) return;

    console.log(`💬 [${from}]`, clean);
    io.emit("chat:message", { from, text: clean });
  });
});

// Terminal -> Browser
process.stdin.setEncoding("utf8");
console.log(" Tippe im Terminal und Enter -> Nachricht an Browser");

process.stdin.on("data", (input) => {
  const text = input.trim();
  if (!text) return;

  console.log(" [Terminal]", text);
  io.emit("chat:message", { from: "terminal", text });
});


// Konto anlegen
app.post('/api/konto-anlegen', (req, res) => {
  console.log('POST /api/konto-anlegen body:', req.body);
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Name und Passwort sind erforderlich' });
  }

  // Prüfen, ob Nutzer existiert
  db.get(
    `SELECT * FROM kontos WHERE name = ? AND password = ?`,
    [name, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Konto existiert bereits' });

      // ETH-Adresse
      const ethWallet = ethers.Wallet.createRandom();
      const ethAddress = ethWallet.address;

      // BTC-Adresse (bitcoinjs-lib v5.x!)
      const keyPairBTC = bitcoin.ECPair.makeRandom();
      const { address: btcAddress } = bitcoin.payments.p2pkh({
        pubkey: keyPairBTC.publicKey,
      });

      // XRP-Adresse
      const xrpWallet = xrpl.Wallet.generate();
      const xrpAddress = xrpWallet.classicAddress;

      // In Datenbank speichern
      db.run(
        `INSERT INTO kontos (name, password, adress_btc, adress_eth, adress_xrp)
         VALUES (?, ?, ?, ?, ?)`,
        [name, password, btcAddress, ethAddress, xrpAddress],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          res.status(201).json({
            id: this.lastID,
            name,
            adress_btc: btcAddress,
            adress_eth: ethAddress,
            adress_xrp: xrpAddress
          })
        }
      )
    }
  )
})


// Login
app.post('/api/login', (req, res) => {
  console.log('POST /api/login body:', req.body);
  const { name, password } = req.body;

  db.get(`SELECT * FROM kontos WHERE name = ?`, [name], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(400).json({ error: 'Benutzer nicht gefunden' });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: 'Falsches Passwort' });
    }

    // Token generieren
    const token = jwt.sign(
      { id: user.id, name: user.name },
      'geheimeschluessel',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      id: user.id,          // ✔ Konto-ID zurücksenden
      name: user.name,
      adress_btc: user.adress_btc,
      adress_eth: user.adress_eth,
      adress_xrp: user.adress_xrp
    })
  })
})

// Balance abfragen
app.get('/api/show-balance/:id', (req, res) => {
  const id = req.params.id;
  db.get("SELECT btc_balance, eth_balance, xrp_balance FROM kontos WHERE id = ?", [id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: "Konto nicht gefunden" });
    }
    return res.json({
      btc_balance: user.btc_balance,
      eth_balance: user.eth_balance,
      xrp_balance: user.xrp_balance
    });
  }
  )
});

app.post("/api/transfer/:id", (req, res) => {
  const id = Number(req.params.id);
  const { coin_transfer, payment_transfer, recipient_transfer } = req.body;

  // Basics prüfen
  const amount = Number(payment_transfer);
  if (!coin_transfer || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "Ungültiger Betrag oder Coin." });
  }

  if (!recipient_transfer || String(recipient_transfer).trim() === "") {
    return res.status(400).json({ error: "Empfänger-Adresse fehlt." });
  }

  const coinMap = {
    BTC: "btc_balance",
    ETH: "eth_balance",
    XRP: "xrp_balance",
  };

  const addressMap = {
    BTC: "adress_btc",
    ETH: "adress_eth",
    XRP: "adress_xrp",
  };

  const column = coinMap[coin_transfer];
  if (!column) {
    return res.status(400).json({ error: "Unbekannter Coin." });
  }

  const addressColumn = addressMap[coin_transfer];

  // Aktuellen Kontostand abrufen (Sender)
  db.get(`SELECT name, ${column} FROM kontos WHERE id = ?`, [id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "Konto nicht gefunden" });

    if (user[column] < amount) {
      return res.status(400).json({ error: "Nicht genügend Guthaben." });
    }

    const newBalance = user[column] - amount;

    // Balance beim Sender aktualisieren
    db.run(`UPDATE kontos SET ${column} = ? WHERE id = ?`, [newBalance, id], err2 => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Empfänger über Adresse suchen
      db.get(
        `SELECT id FROM kontos WHERE ${addressColumn} = ?`,
        [recipient_transfer],
        (errR, recipient) => {
          if (errR) return res.status(500).json({ error: errR.message });

          // Danach Transaktion speichern + Antwort zurückgeben
          const saveTxAndRespond = () => {
            db.run(
              `INSERT INTO transaktion (sender_id, coin, amount, address, date, status)
               VALUES (?, ?, ?, ?, datetime('now'), ?)`,
              [id, coin_transfer, amount, recipient_transfer, 1],
              err3 => {
                if (err3) return res.status(500).json({ error: err3.message });

                return res.json({
                  success: true,
                  newBalance,
                  internalTransfer: Boolean(recipient),
                })
              }
            )
          }

          // Wenn Empfänger existiert -> Guthaben erhöhen, dann speichern
          if (recipient) {
            // optional: Selbstüberweisung verhindern
            if (Number(recipient.id) === id) {
              return res.status(400).json({ error: "Du kannst nicht an dich selbst überweisen." });
            }

            db.run(
              `UPDATE kontos SET ${column} = ${column} + ? WHERE id = ?`,
              [amount, recipient.id],
              errUp => {
                if (errUp) return res.status(500).json({ error: errUp.message });
                saveTxAndRespond();
              }
            );
          } else {
            // Empfänger nicht in DB -> nur Transaktion speichern
            saveTxAndRespond();
          }
        }
      )
    })
  })
})

// Show Transaktion
app.get('/api/show-transaction/:id', (req, res) => {
  const senderId = Number(req.params.id);

  db.all(
    `SELECT coin, amount, address, date
     FROM transaktion
     WHERE sender_id = ?
     ORDER BY date DESC
     LIMIT 10`,
    [senderId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json(rows); // <-- Array zurückgeben
    }
  );
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});