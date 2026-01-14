# GUN P2P Chat - Server 2

Dieser Server ist ein GUN.js Relay für Peer-to-Peer Chat.

## Deployment auf Render

### Schritt 1: GitHub Repository
Push diesen Ordner zu GitHub. Z.B.: `P7_Peer_to_peer_Chat_Server2`

### Schritt 2: Render Deployment
1. Gehe zu [render.com](https://render.com)
2. Klicke auf "New" → "Web Service"
3. Verbinde dein GitHub Repository
4. **Name**: `gun-peer-2`
5. **Runtime**: Node
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. Klicke "Create Web Service"

Deine URL wird sein: `https://gun-peer-2.onrender.com/`

## Features
- GUN Relay Server 2
- Verbunden mit Server 1 für Redundanz
- Statische HTML/CSS/JS Dateien
- Sichere Dateiserver

## Lokal starten
```bash
npm install
npm start
```

Öffne dann http://localhost:8766 im Browser (unterschiedlicher Port von Server 1)
