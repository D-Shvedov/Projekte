//  Help function
function setStatusReg(text) {
    document.getElementById("status_registration").textContent = text;
}

//  Help function
function setStatusProfile(text) {
    document.getElementById("status_profil").textContent = text;
}

function showApp() {
    document.querySelector(".regestration").style.display = "none";
    document.querySelector(".profile").style.display = "block";
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
            localStorage.setItem("birthday", birthday);
            localStorage.setItem("location", location);

            document.getElementById("nickname").textContent = localStorage.getItem("nickname")
            document.getElementById("birthday").textContent = localStorage.getItem("birthday")
            document.getElementById("location").textContent = localStorage.getItem("location")

            showApp()
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

