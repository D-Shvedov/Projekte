# This is my sixth learning project

This project is a web application that simulates cryptocurrency wallet operations for individual users.  
All operations are simulated — no real blockchain transactions or real cryptocurrency are involved.

## Project characteristics

- **Name:** CryptoWallet (JS)  
- **Type:** Web Application  
- **Languages:** JavaScript, HTML, CSS, SQL  
- **Framework:** Express.js  
- **Library:** Socket.IO  
- **Database:** SQLite  
- **Additional technology:** Express server, TCP server for terminal communication, JWT (JSON Web Token), 

## Description

This web application allows users to register, log in, and manage a simulated cryptocurrency wallet.

Each user has a virtual balance and can send funds to other users by specifying their crypto address.  
Crypto addresses for Bitcoin, Ethereum, and XRP are generated via an API.

All actions (registration, transfers, balance updates) are stored in the database.

The goal of this project is to learn backend development with Node.js and Express, authentication with JWT, real-time communication using Socket.IO, and database handling with SQLite.

## Requirements

- Node.js 18+  
- npm  
- Express.js  
- Socket.IO  
- SQLite3  
- jsonwebtoken (JWT support)  


## Installation

Install dependencies from `package.json`:

```bash
npm install
```

## Start
```bash
node .\app.js
```