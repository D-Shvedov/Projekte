const sqlite3 = require('sqlite3').verbose();

// Verbindung zur Datenbank herstellen
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {

  // Tabelle: Kontos
  db.run(`CREATE TABLE IF NOT EXISTS kontos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      password_hash TEXT,
      adress_btc TEXT,
      btc_balance REAL  DEFAULT 0.5,
      adress_eth TEXT,
      eth_balance REAL DEFAULT 50,
      adress_xrp TEXT,
      xrp_balance REAL DEFAULT 500
  );`);

  // Tabelle: Transaktion
  db.run(`CREATE TABLE IF NOT EXISTS transaktion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      coin TEXT,
      amount REAL,
      address TEXT,
      date TEXT,
      status BLOB
  );`);

});

module.exports = db;
