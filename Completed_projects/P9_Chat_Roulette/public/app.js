//  Help function
function setStatusReg(text) {
    document.getElementById("status_registration").textContent = text;
}

function showApp() {
    document.querySelector(".regestration").style.display = "none";
    document.querySelector(".profil").style.display = "block";
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
            setStatusReg("Succeeded");
            localStorage.setItem("login", login);
            showApp()
        } else {
            setStatusReg(data.error || 'Error');
        }
    } catch (err) {
        setStatusReg("Network error")
    }
});


