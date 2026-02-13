# Chat-Roulette (Learning Project #9)

A web app that establishes real-time video, audio, and chat between two users. It also allows users to find a random conversation partner. This application was built to meet new friends by talking to strangers.

## Project characteristics

- **Name:** Chat-Roulette
- **Type:** Web Application  
- **Languages:** JavaScript, HTML, CSS
- **Hosting:** Render PaaS
- **Framework:** Express.js
- **Library:** Socket.IO
- **Database:** PostgreSQL
- **Additional technology:** WebRtc-protokol, Metered NaaS (TURN-Server), JWT authentication, Hashing (bcrypt)

## Description

First, you need to create the database. I use PostgreSQL and created one table:

```bash
CREATE TABLE accounts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    birthday DATE,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

You should use the following environment variables:

1. process.env.DATABASE_URL
2. process.env.SALT_ROUNDS
3. process.env.PORT
4. process.env.METERED_USER
5. process.env.METERED_PASS
6. process.env.JWT_SECRET

`METERED_USER` and `METERED_PASS` are used to authenticate with Metered’s TURN servers. TURN is required when a direct peer-to-peer connection is blocked by NAT or firewalls.

I have set up the database and deployed the web app on Render, but others can modify it as they see fit.

#### Roulette logic

Each room has two users. If all rooms are full, the user creates a new room. A user cannot rejoin the room they were in last time.

## Installation
```bash
npm install
npm install bcrypt express jsonwebtoken pg socket.io