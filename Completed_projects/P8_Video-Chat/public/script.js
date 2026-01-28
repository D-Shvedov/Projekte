const socket = io();

// Raum aus URL-Parameter oder Standardwert
const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "myRoom";

socket.on("roomFull", () => {
  alert("Room ist voll (max 2 Teilnehmer).");
  // optional:
  // window.location.href = "/";
});

// Verwaltung der Peer-Verbindungen und ICE-Kandidaten
const peerConnections = new Map(); // remoteUserId -> RTCPeerConnection
const pendingIce = new Map(); // remoteUserId -> RTCIceCandidate[]

// Lokaler Medienstream
let localStream;

// ICE-Server vom Server abrufen
async function fetchIceServers() {
  const res = await fetch("/ice");
  if (!res.ok) throw new Error("Failed to fetch /ice");
  const data = await res.json();
  return data.iceServers;
}

async function ensureLocalStream() {
  if (localStream) return localStream;

  // ✅ Bandbreite reduzieren 
  localStream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 640 },
      height: { ideal: 360 },
      frameRate: { max: 15 },
    },
    audio: true,
  });
  // Anzeige des lokalen Videos
  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = localStream;
  localVideo.muted = true; // wichtig für autoplay
  await localVideo.play().catch(() => { });

  return localStream;
}

// PeerConnection für einen Remote-Nutzer abrufen oder erstellen
async function getOrCreatePC(remoteUserId) {
  await ensureLocalStream();

  if (peerConnections.has(remoteUserId)) return peerConnections.get(remoteUserId);

  // ICE-Server abrufen
  const iceServers = await fetchIceServers();

  // Neue RTCPeerConnection erstellen
  const pc = new RTCPeerConnection({ iceServers });

  // Verbindungsstatus protokollieren
  pc.onconnectionstatechange = () => {
    console.log("connectionState", remoteUserId, pc.connectionState);
  };
  pc.oniceconnectionstatechange = () => {
    console.log("iceConnectionState", remoteUserId, pc.iceConnectionState);
  };
  pc.onsignalingstatechange = () => {
    console.log("signalingState", remoteUserId, pc.signalingState);
  };

  // ICE-Kandidaten sammeln und senden
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("iceCandidate", { candidate: event.candidate, to: remoteUserId });
    }
  };

  // Remote-Stream empfangen
  pc.ontrack = (event) => {
    const remoteVideo = document.getElementById("remoteVideo");
    const stream = event.streams[0];
    console.log("ontrack fired from", remoteUserId);

    // ✅ verhindert AbortError
    if (remoteVideo.srcObject !== stream) {
      remoteVideo.srcObject = stream;
      remoteVideo.play().catch(() => { });
    }
  };

  // add local tracks
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  // Verbindung speichern
  peerConnections.set(remoteUserId, pc);
  if (!pendingIce.has(remoteUserId)) pendingIce.set(remoteUserId, []);
  return pc;
}

// Socket.IO-Ereignisse behandeln
socket.on("connect", () => {
  console.log("connected:", socket.id);
  socket.emit("joinRoom", room);
});

// Bestehende Nutzer im Raum
socket.on("existingUsers", async (users) => {
  // only the new joiner creates offers to existing users
  for (const userId of users) {
    const pc = await getOrCreatePC(userId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", { offer, to: userId });
  }
});

// Neuer Nutzer ist dem Raum beigetreten
socket.on("userJoined", (userId) => {
  console.log("New user joined:", userId);
  // existing side does nothing (avoids offer glare)
});

// Angebot vom Remote-Nutzer empfangen
socket.on("offer", async ({ offer, from }) => {
  const pc = await getOrCreatePC(from);
  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  // Verarbeitete zwischengespeicherte ICE-Kandidaten
  const buf = pendingIce.get(from) || [];
  while (buf.length) {
    const c = buf.shift();
    try {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    } catch (e) {
      console.warn("addIceCandidate (buffer) failed", e);
    }
  }
  pendingIce.set(from, buf);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("answer", { answer, to: from });
});

// Antwort vom Remote-Nutzer empfangen
socket.on("answer", async ({ answer, from }) => {
  const pc = peerConnections.get(from);
  if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
});

// ICE-Kandidat vom Remote-Nutzer empfangen
socket.on("iceCandidate", async ({ candidate, from }) => {
  const pc = peerConnections.get(from);

  if (!pc || !pc.remoteDescription) {
    const buf = pendingIce.get(from) || [];
    buf.push(candidate);
    pendingIce.set(from, buf);
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.warn("addIceCandidate failed", e);
  }
});

// Nutzer hat den Raum verlassen
socket.on("userLeft", (userId) => {
  console.log("userLeft:", userId);

  const pc = peerConnections.get(userId);
  if (pc) pc.close();

  peerConnections.delete(userId);
  pendingIce.delete(userId);

  const remoteVideo = document.getElementById("remoteVideo");
  if (remoteVideo?.srcObject) remoteVideo.srcObject = null;
});

// start camera
ensureLocalStream().catch((e) => console.error("getUserMedia failed", e));
