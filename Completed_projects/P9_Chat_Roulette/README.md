Lastenheft:

Funktionalität

1. Einen Konto anlegen
2. In den KOnto rein kommen
3. Passwörter haschen
4. Authentifizierung für den Seiten benutzen  
5. Das alles im WAN machen 
6. Profil daten sammeln 
7. Eine Taste drücken und mit jemandem verrbinden, der auch auf die Verbindung wartet.
8. Einen chat erstellen zwischen Leute + Videochat gleichzeitug
9. Eine Taste nächste 
10. Eine Taste raus 

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
3. Express + Socket.io einrichten +
4. Datenbank anlegen +
5. Tabelle erstellen - users (id, login, password_hash) +
6. Anmeldung-Mechanismus Frontend-Backend-Hashing-Datenbank
7.


process.env.DATABASE_URL
process.env.SALT_ROUNDS
port = process.env.PORT
process.env.METERED_USER
process.env.METERED_PASS

Backlog: WebRTC Logik schreiben 

PGPASSWORD=doGEMdzwQUFmOVyaIH5ckV2aGefbEPYO psql -h dpg-d60rbucoud1c73fv838g-a.frankfurt-postgres.render.com -U roulette_user roulette_database