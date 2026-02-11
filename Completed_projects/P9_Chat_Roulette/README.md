Lastenheft:

Funktionalität

1. Einen Konto anlegen + 
2. In den KOnto rein kommen + 
3. Passwörter haschen +
4. Authentifizierung für den Seiten benutzen  
5. Das alles im WAN machen + 
6. Profil daten sammeln + 
7. Eine Taste drücken und mit jemandem verrbinden, der auch auf die Verbindung wartet. 
8. Einen chat erstellen zwischen Leute + Videochat gleichzeitug
9. Eine Taste nächste 
10. Eine Taste raus 
11. Eine Taste Exit + 

Pflichtenheft:

Chat-Roulette
Frontend - JS,HTML,CSS
Backend - Node.js, Express, Socket.IO
Hosting: Render Paas (wascheinlich)
Database: Postgeress SQL (wascheinlich)
Zuständige Technology: WebRtc-protokol, Metered NaaS (TURN-Server), JWT (JSON Web Token), Hashing

Reihenfolge: 
1. Node.js einstellen +
2. HTML Seite + 
3. Express + Socket.io in Backend erstellen +
4. Datenbank anlegen +
5. Tabelle erstellen - users (id, login, password_hash) +
6. Anmeldung-Mechanismus Frontend-Backend-Hashing-Datenbank +
7. Profil-Daten +
9. Sockei.IO einrichten 
8. Chat zwischen Profile erstellen, die auf die Taste (Contact) geklickt haben + 
9. Turn Server anlegen +
9. WebRTC Verbindung erstellen + 
10. JWT Token
11. Css style +
12. Tests


process.env.DATABASE_URL
process.env.SALT_ROUNDS
port = process.env.PORT
process.env.METERED_USER
process.env.METERED_PASS
process.env.JWT_SECRET

Backlog: WebRTC Logik schreiben 

PGPASSWORD=doGEMdzwQUFmOVyaIH5ckV2aGefbEPYO psql -h dpg-d60rbucoud1c73fv838g-a.frankfurt-postgres.render.com -U roulette_user roulette_database

CREATE TABLE accounts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    birthday DATE,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);