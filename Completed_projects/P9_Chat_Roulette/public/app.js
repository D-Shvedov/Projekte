const socket = io();

// WebRTC state
const peerConnections = new Map(); // remoteUserId -> RTCPeerConnection
const pendingIce = new Map(); // remoteUserId -> RTCIceCandidate[]
let localStream;

//  Help function
function setStatusReg(text) {
    document.getElementById("status_registration").textContent = text;
}

//  Help function
function setStatusProfile(text) {
    document.getElementById("status_profile").textContent = text;
}

//  Help function
function showApp() {
    document.querySelector(".regestration").style.display = "none";
    document.querySelector(".profile").style.display = "block";
}

// socket connection
socket.on("connect", () => {
    console.log("Connected to server", socket.id);
});

socket.on("message", (msg) => {
    console.log("📨 from server:", msg);
});

async function fetchIceServers() {
    const res = await fetch("/ice");
    if (!res.ok) throw new Error("Failed to fetch /ice");
    const data = await res.json();
    return data.iceServers;
}

async function ensureLocalStream() {
    if (localStream) return localStream;

    localStream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 640 },
            height: { ideal: 360 },
            frameRate: { max: 15 },
        },
        audio: true,
    });

    const localVideo = document.getElementById("localVideo");
    if (localVideo) {
        localVideo.srcObject = localStream;
        localVideo.muted = true;
        await localVideo.play().catch(() => { });
    }

    return localStream;
}

async function getOrCreatePC(remoteUserId) {
    await ensureLocalStream();

    if (peerConnections.has(remoteUserId)) return peerConnections.get(remoteUserId);

    const iceServers = await fetchIceServers();
    const pc = new RTCPeerConnection({ iceServers });

    pc.onconnectionstatechange = () => {
        console.log("connectionState", remoteUserId, pc.connectionState);
    };
    pc.oniceconnectionstatechange = () => {
        console.log("iceConnectionState", remoteUserId, pc.iceConnectionState);
    };
    pc.onsignalingstatechange = () => {
        console.log("signalingState", remoteUserId, pc.signalingState);
    };

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("iceCandidate", { candidate: event.candidate, to: remoteUserId });
        }
    };

    pc.ontrack = (event) => {
        const remoteVideo = document.getElementById("remoteVideo");
        const stream = event.streams[0];
        if (remoteVideo && remoteVideo.srcObject !== stream) {
            remoteVideo.srcObject = stream;
            remoteVideo.play().catch(() => { });
        }
    };

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    peerConnections.set(remoteUserId, pc);
    if (!pendingIce.has(remoteUserId)) pendingIce.set(remoteUserId, []);
    return pc;
}

function resetWebRTC() {
    for (const pc of peerConnections.values()) pc.close();
    peerConnections.clear();
    pendingIce.clear();
    const remoteVideo = document.getElementById("remoteVideo");
    if (remoteVideo?.srcObject) remoteVideo.srcObject = null;
}

function stopLocalStream() {
    if (!localStream) return;
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
    const localVideo = document.getElementById("localVideo");
    if (localVideo?.srcObject) localVideo.srcObject = null;
}

// Sign_up
document.getElementById("sign_up").addEventListener("submit", async (e) => {
    e.preventDefault();

    const login = document.getElementById("login_up").value;
    const password = document.getElementById("password_up").value;

    setStatusReg("Wait...");

    try {
        const res = await fetch("/api/sign_up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password })
        });

        const data = await res.json();

        if (res.ok) {
            setStatusReg("Created");
        } else {
            setStatusReg(data.error || 'Error');
        }
    } catch (err) {
        setStatusReg("Network error")
    }
});


// Sign_in
document.getElementById("sign_in").addEventListener("submit", async (e) => {
    e.preventDefault();

    const login = document.getElementById("login_in").value;
    const password = document.getElementById("password_in").value;

    setStatusReg("Wait...");

    try {
        const res = await fetch("/api/sign_in", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password })
        });

        const data = await res.json()

        if (res.ok) {
            const { nickname, birthday, location } = data;
            setStatusReg("Succeeded");
            localStorage.setItem("login", login);
            localStorage.setItem("nickname", nickname);
            localStorage.setItem("location", location);
            localStorage.setItem("birthday", (birthday || "").slice(0, 10));

            if (!socket.connected) {
                socket.connect();
            }

            // value nicht textContent
            document.getElementById("nickname").value = localStorage.getItem("nickname") || "";
            document.getElementById("location").value = localStorage.getItem("location") || "";
            document.getElementById("birthday").value = (localStorage.getItem("birthday") || "").slice(0, 10);
            showApp();
        } else {
            setStatusReg(data.error || 'Error');
        }
    } catch (err) {
        setStatusReg("Network error")
    }
});

// Save profile
document.getElementById("profile_entries").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nickname = document.getElementById("nickname").value
    const birthday = document.getElementById("birthday").value
    const location = document.getElementById("location").value
    const login = localStorage.getItem("login");

    try {
        const res = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, birthday, location, login })
        })

        const data = await res.json();

        if (res.ok) {
            setStatusProfile("The profile has been saved");
        } else {
            setStatusProfile(data.error || 'Error');
        }
    }
    catch (err) {
        setStatusProfile("Network error")
    }
});

let roomName = null;

// Contact buttom
document.getElementById("play_btn").addEventListener("click", async (e) => {
    e.preventDefault();
    resetWebRTC();
    // reset current room 
    roomName = null;
    socket.emit("contact");
})

// Break: leave room but keep socket connected
document.getElementById("break_btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    socket.emit("break");
    resetWebRTC();
    stopLocalStream();
    roomName = null;
});

// 
socket.on("roomName", (name) => {
    roomName = name;
    console.log("Joined room:", roomName);
    ensureLocalStream().catch((e) => console.error("getUserMedia failed", e));
});

// WebRTC signaling
socket.on("existingUsers", async (users) => {
    for (const userId of users) {
        const pc = await getOrCreatePC(userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { offer, to: userId });
    }
});

socket.on("userJoined", (userId) => {
    console.log("New user joined:", userId);
});

socket.on("offer", async ({ offer, from }) => {
    const pc = await getOrCreatePC(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

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
    try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
        console.warn("addIceCandidate failed", e);
    }
});

socket.on("userLeft", (userId) => {
    console.log("userLeft:", userId);
    const pc = peerConnections.get(userId);
    if (pc) pc.close();
    peerConnections.delete(userId);
    pendingIce.delete(userId);
    const remoteVideo = document.getElementById("remoteVideo");
    if (remoteVideo?.srcObject) remoteVideo.srcObject = null;
});


document.getElementById("chat").addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputEl = document.getElementById("message");
    let correspondence = document.getElementById("correspondence")
    correspondence.textContent += `\n${inputEl.value}`;
    const msg = inputEl.value.trim();

    if (!msg) return;
    if (!roomName) return;

    socket.emit("roomName:msg", { roomName, msg });
    inputEl.value = "";
});

const correspondence = document.getElementById("correspondence");


// Receive messages
socket.on("roomName:msg", ({ roomName, msg, from }) => {
    correspondence.textContent += `\n[${roomName}] ${from}: ${msg}`;
});

// Break
document.getElementById("break_btn").addEventListener("click", async (e) => {
    e.preventDefault();
    resetWebRTC();
    stopLocalStream();
    socket.disconnect();
})

// Exit 
function exit() {
    localStorage.clear();
    sessionStorage.clear();
    resetWebRTC();
    stopLocalStream();
    socket.disconnect();
    roomName = null;

    setStatusProfile("");
    setStatusReg("");

    document.querySelectorAll("input").forEach(input => input.value = "");

    document.querySelector(".regestration").style.display = "block";
    document.querySelector(".profile").style.display = "none";
}

