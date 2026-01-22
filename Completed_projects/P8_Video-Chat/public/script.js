const socket = io("http://localhost:3000");
const room = "myRoom";

let peerConnection;
let localStream;

// ICE candidates that arrive before remoteDescription is set
const pendingIce = [];

// Get user media
async function ensureLocalStream() {
  if (localStream) return localStream;

  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = localStream;

  return localStream;
}

// Socket.io signaling handlers
socket.on("connect", () => {
  console.log("Connected to signaling server");
  socket.emit("joinRoom", room);
});

// When a new user joins the room
socket.on("userJoined", (userId) => {
  console.log(`User ${userId} joined the room`);
  createOffer(userId);
});

// Create Peer Connection
async function createPeerConnection(remoteUserId) {
  await ensureLocalStream();

  peerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("ICE candidate:", event.candidate);
      socket.emit("iceCandidate", event.candidate, room);
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("Track event:", event);
    const remoteVideo = document.getElementById("remoteVideo");
    remoteVideo.srcObject = event.streams[0];
  };

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  return peerConnection;
}

// Receive ICE
socket.on("iceCandidate", async (candidate, userId) => {
  console.log("Received ICE candidate from " + userId);

  if (!peerConnection || !peerConnection.remoteDescription) {
    pendingIce.push(candidate);
    return;
  }

  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.error("Error adding received ice candidate", e);
  }
});

// Create and send offer
async function createOffer(remoteUserId) {
  const pc = await createPeerConnection(remoteUserId);
  peerConnection = pc;

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("offer", offer, room);
}

socket.on("offer", async (offer, userId) => {
  console.log("Received offer from " + userId);

  const pc = await createPeerConnection(userId);
  peerConnection = pc;

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  // Add buffered ICE
  while (pendingIce.length) {
    const c = pendingIce.shift();
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(c));
    } catch (e) {
      console.error("Error adding buffered ice candidate", e);
    }
  }

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  socket.emit("answer", answer, room);
});

// Receive answer
socket.on("answer", async (answer, userId) => {
  console.log("Received answer from " + userId);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// start camera immediately (optional, ensureLocalStream also does this)
ensureLocalStream().catch((e) => console.error("getUserMedia failed", e));
