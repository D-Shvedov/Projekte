const socket = io();


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

/*
// Contact buttom
document.getElementById("play_btn").addEventListener("click", async (e) => {
    e.pre
    try  {


    }
}) 
*/

// Exit
function exit() {
    localStorage.clear();
    sessionStorage.clear();
    socket.disconnect();
    setStatusProfile("");
    setStatusReg("");
    document.getElementById("nickname").value = "";
    document.getElementById("birthday").value = "";
    document.getElementById("location").value = "";
    document.querySelector(".regestration").style.display = "block";
    document.querySelector(".profile").style.display = "none";

}

