# Video-Chat (Learning Project #8)

> A simple WebRTC video chat app that establishes real-time video and audio between two users.

![This is the schema](images/Video-chat.jpg)

## Project characteristics

- **Name:** Video-Chat
- **Type:** Web Application  
- **Languages:** JavaScript, HTML, CSS
- **Hosting:** Render PaaS
- **Framework:** Express.js
- **Library:** Socket.IO
- **Database:** -
- **Additional technology:** WebRtc-protokol, Metered NaaS (TURN-Server)

## Description

To enable a peer-to-peer connection over the Internet, I deployed the app to Render and configured these environment variables:

- `METERED_USER`
- `METERED_PASS`
- `PORT` (provided by Render)

`METERED_USER` and `METERED_PASS` are used to authenticate with Metered’s TURN servers. TURN is required when a direct peer-to-peer connection is blocked by NAT or firewalls.

Socket.IO is used for signaling messages such as:

- `offer`
- `answer`
- `iceCandidate`

### ICE candidates (Host / STUN / TURN)

**ICE candidates** are possible network paths that WebRTC tries to use for data transmission.

- **Host candidate:** The device’s local IP address. Works best on the same local network. Often fails over the public Internet due to NAT/firewalls.
- **STUN candidate:** Uses a STUN server to discover the device’s public address so peers can try a direct connection. STUN does not relay media.
- **TURN candidate:** Uses a TURN server to relay all media traffic when a direct connection is not possible. More reliable but adds latency and costs.


## Requirements

- Node.js 18+  
- Express.js  
- Socket.IO  

## Installation

```bash
npm install express socket.io
npm express
npm socket.io
