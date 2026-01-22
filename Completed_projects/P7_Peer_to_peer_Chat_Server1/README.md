# This is my seventh learning project

P2P-Chat is a web application that demonstrates a peer-to-peer chat architecture using GUN.js.
The application allows multiple peers to exchange messages directly via a relay, without a central database or server-side storage.

> Currently works in a local environment.

## Project characteristics

- **Name:** P2P-Chat 
- **Type:** Web Application  
- **Languages:** JavaScript, HTML, CSS
- **Framework:** Express.js (Relay only)
- **Library:** Gun.js
- **Database:** IndexedDB / localStorage
- **Additional technology:** SEA (encryption, authentication), JQuery

## Description

This application allows users to establish a peer-to-peer connection and exchange messages in real time.

An Express server is used only as a relay:

1. it does not store data

2. it cannot read encrypted user data

3. it only forwards messages between peers

All persistent data is stored locally in the browser (IndexedDB / localStorage).
Users can open multiple browser tabs or incognito windows to simulate multiple peers.

A second relay server can be enabled for higher availability, but it is currently disabled.

## Requirements

- Node.js 18+  
- Express.js  
- Gun.js
- Jquery


## Installation

Installation
```bash git clone https://github.com/your-username/p2p-chat.git
cd p2p-chat
npm install
node server_1.js
```

Open in browser:
```bash
http://localhost:8765
```