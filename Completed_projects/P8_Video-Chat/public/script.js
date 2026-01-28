const socket = io();
const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "myRoom";

const peerConnections = new Map();      // remoteUserId -> RTCPeerConnection
const pendingIce = new Map();           // remoteUserId -> RTCIceCandidate[]

let localStream;

async function ensureLocalStream() {
  if (localStream) return localStream;
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById("localVideo").srcObject = localStream;
  return localStream;
}

async function getOrCreatePC(remoteUserId) {
  await ensureLocalStream();

  if (peerConnections.has(remoteUserId)) return peerConnections.get(remoteUserId);

  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("iceCandidate", { candidate: event.candidate, to: remoteUserId });
    }
  };

  pc.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };

  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  peerConnections.set(remoteUserId, pc);
  pendingIce.set(remoteUserId, []);
  return pc;
}

socket.on("connect", () => socket.emit("joinRoom", room));

socket.on("existingUsers", async (users) => {
  // Nur der neu beigetretene ruft Offers an bestehende Teilnehmer raus
  for (const userId of users) {
    const pc = await getOrCreatePC(userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("offer", { offer, to: userId });
  }
});

socket.on("userJoined", async (userId) => {
  // Bestehende Clients warten – sie bekommen gleich ein Offer vom Neuen über existingUsers-Logik
  // (So vermeidest du Offer-Glare.)
  console.log("New user joined:", userId);
});

socket.on("offer", async ({ offer, from }) => {
  const pc = await getOrCreatePC(from);
  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  // Buffered ICE flushen
  const buf = pendingIce.get(from) || [];
  while (buf.length) await pc.addIceCandidate(buf.shift());
  pendingIce.set(from, buf);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", { answer, to: from });
});

socket.on("answer", async ({ answer, from }) => {
  const pc = peerConnections.get(from);
  if (!pc) return;
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("iceCandidate", async ({ candidate, from }) => {
  const pc = peerConnections.get(from);
  if (!pc || !pc.remoteDescription) {
    const buf = pendingIce.get(from) || [];
    buf.push(candidate);
    pendingIce.set(from, buf);
    return;
  }
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

ensureLocalStream().catch(console.error);
