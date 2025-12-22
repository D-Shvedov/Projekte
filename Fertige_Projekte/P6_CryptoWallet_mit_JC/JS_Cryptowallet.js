
// Konto anlegen Funktion
async function kontoAnlegen(name, password) {
    const kontoanlegenmessage = document.getElementById("KontoAnlegenMessage");
    const tastekontoerstellen = document.getElementById("createBtn");

    if (kontoanlegenmessage) kontoanlegenmessage.innerText = "Warte...";
    if (tastekontoerstellen) tastekontoerstellen.disabled = true;

    try {
        const res = await fetch("/api/konto-anlegen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, password })
        });

        const data = await res.json();

        if (kontoanlegenmessage) {
            kontoanlegenmessage.style.color = res.ok ? "green" : "red";
            kontoanlegenmessage.innerText = res.ok ? "Erstellt." : (data.error || 'Fehler');
        }

        // Bei Erfolg kurz warten und zur Login-Seite
        if (res.ok) {
            setTimeout(() => { window.location.href = 'Login_Cryptowallet.html'; }, 1200);
        }
    } catch (e) {
        if (kontoanlegenmessage) { kontoanlegenmessage.style.color = "red"; kontoanlegenmessage.innerText = "Netzwerkfehler."; }
    } finally {
        if (tastekontoerstellen) tastekontoerstellen.disabled = false;
    }
}

// Konto anlegen Funktion
document.addEventListener("DOMContentLoaded", function () {
    const kontoForm = document.getElementById("kontoForm");

    if (kontoForm) {
        kontoForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const password = document.getElementById("password").value;

            kontoAnlegen(name, password);
        });
    }
});


// Login Funktion
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const name = document.getElementById("loginName").value;
            const password = document.getElementById("loginPassword").value;
            login(name, password);
        });
    }
});

// Login Funktion
function login(name, password) {

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("loginError").innerText = data.error;
                return;
            }

            sessionStorage.setItem("token", data.token);
            localStorage.setItem("name", name);
            localStorage.setItem("kontoId", data.id);
            localStorage.setItem("btc", data.adress_btc);
            localStorage.setItem("eth", data.adress_eth);
            localStorage.setItem("xrp", data.adress_xrp);

            window.location.href = "index.html";
        })
        .catch(err => console.error(err));
}

// Begrüßung anzeigen
document.addEventListener("DOMContentLoaded", () => {
    const greet = document.getElementById("greeting");
    if (greet) {
        greet.innerText = "Hallo " + localStorage.getItem("name");
    }
    console.log(localStorage.getItem("btc"))
});

// Adressen anzeigen
function showAddress() {
    const addressDiv = document.querySelector(".addresse");
    const isVisible = addressDiv && addressDiv.style.display && addressDiv.style.display !== "none";
    closeAllWindows();
    if (!isVisible) {
        console.log("Die Adresse sind angekommen");
        if (document.getElementById("btc_balance")) document.getElementById("btc_balance").innerText = localStorage.getItem("btc");
        if (document.getElementById("eth_balance")) document.getElementById("eth_balance").innerText = localStorage.getItem("eth");
        if (document.getElementById("xrp_balance")) document.getElementById("xrp_balance").innerText = localStorage.getItem("xrp");
        if (addressDiv) addressDiv.style.display = "block";
    }
}


// Kontostände anzeigen
function showBalance() {
    const id_konto = localStorage.getItem("kontoId");
    const balanceDiv = document.querySelector(".balance");
    const isVisible = balanceDiv && balanceDiv.style.display && balanceDiv.style.display !== 'none';
    closeAllWindows();
    if (!isVisible) {
    fetch(`/api/show-balance/${id_konto}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log("Die Daten wurden nicht empfangen.");
                return;
            }

            console.log("Die Kontostände sind angekommen");

            const tbody = document.querySelector(".balance tbody");
            tbody.innerHTML = "";

            for (let coin in data) {
                tbody.innerHTML += `
                    <tr>
                        <td>${coin}</td>
                        <td>${data[coin]}</td>
                    </tr>
                `;
            }

                if (balanceDiv) balanceDiv.style.display = "block";
        })
        .catch(error => console.error("Fehler:", error));
            }
}


// Überweisungsformular anzeigen
function transferform() {
    const select = document.getElementById("coin");
    const transferDiv = document.querySelector(".transfer-form");
    const isVisible = transferDiv && transferDiv.style.display && transferDiv.style.display !== 'none';
    // prepare select
    select.innerHTML = "";

    select.innerHTML += `<option value="BTC">Bitcoin</option>`;
    select.innerHTML += `<option value="ETH">Ethereum</option>`;
    select.innerHTML += `<option value="XRP">XRP</option>`;

    closeAllWindows();
    if (!isVisible) {
        if (transferDiv) transferDiv.style.display = "block";
    }
}

// Überweisung durchführen
function transfer() {

    const coin_transfer = document.getElementById("coin").value;
    const payment_transfer = parseFloat(document.getElementById("payment").value);
    const recipient_transfer = document.getElementById("recipient").value;
    const id_konto = localStorage.getItem("kontoId");


    fetch(`/api/transfer/${id_konto}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coin_transfer, payment_transfer, recipient_transfer })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("message_transfer").innerText = data.error;
                return;
            }
            else {
                console.log("Die Überweisung wurde erfolgreich durchgeführt");
                document.getElementById("message_transfer").innerText = "Die Überweisung wurde erfolgreich durchgeführt";
            }
        })
        .catch(err => console.error(err));
}

// Transaktionsverlauf anzeigen
function showTransactionHistory() {
    const id_konto = localStorage.getItem("kontoId");
    const historyDiv = document.querySelector(".transaction_tabelle");
    const isVisible = historyDiv && historyDiv.style.display && historyDiv.style.display !== 'none';
    fetch(`/api/show-transaction/${id_konto}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log("Die Daten wurden nicht empfangen.");
                return;
            }
            console.log("Transactionhistory sind angekommen");

            const tbody = document.querySelector(".transaction_tabelle tbody");
            tbody.innerHTML = "";

            data.forEach(data => {
                tbody.innerHTML += `
                <tr>
                    <td>${data.coin}</td>
                    <td>${data.amount}</td>
                    <td>${data.address}</td>
                    <td>${data.date}</td>
                </tr>
                `;
            });
            
            closeAllWindows();
            if (!isVisible) {
                if (historyDiv) historyDiv.style.display = "block";
            }
        }
        );
}


// Wechselkurse anzeigen
async function showBitcoinPrice() {

    const div = document.getElementById("btc_price");
    div.innerText = "Lade Bitcoin Kurs...";

    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur"
        );

        const data = await response.json();

        const priceUSD = data.bitcoin.usd;
        const priceEUR = data.bitcoin.eur;

        div.innerHTML = `
        <h3>Bitcoin Preis</h3>
        <p>USD: <strong>${priceUSD} $</strong></p>
        <p>EUR: <strong>${priceEUR} €</strong></p>
    `;
    }
    catch (err) {
        div.innerText = "Fehler beim Laden.";
        console.error(err);
    }
}

// Wechselkurse anzeigen
async function showEthPrice() {

    const div = document.getElementById("eth_price");
    div.innerText = "Lade Ethereum Kurs...";

    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,eur"
        );

        const data = await response.json();

        const priceUSD = data.ethereum.usd;
        const priceEUR = data.ethereum.eur;

        div.innerHTML = `
        <h3>Ethereum Preis</h3>
        <p>USD: <strong>${priceUSD} $</strong></p>
        <p>EUR: <strong>${priceEUR} €</strong></p>
    `;
    }
    catch (err) {
        div.innerText = "Fehler beim Laden.";
        console.error(err);
    }
}

// Wechselkurse anzeigen
async function showXrpPrice() {

    const div = document.getElementById("xrp_price");
    div.innerText = "Lade XRP Kurs...";

    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd,eur"
        );

        const data = await response.json();

        const priceUSD = data.ripple.usd;
        const priceEUR = data.ripple.eur;

        div.innerHTML = `
        <h3>XRP Preis</h3>
        <p>USD: <strong>${priceUSD} $</strong></p>
        <p>EUR: <strong>${priceEUR} €</strong></p>
    `;
    }
    catch (err) {
        div.innerText = "Fehler beim Laden.";
        console.error(err);
    }
}

// Wechselkurse anzeigen
function showWechselkurse() {
    const btc = document.getElementById("btc_price");
    const eth = document.getElementById("eth_price");
    const xrp = document.getElementById("xrp_price");
    const isVisible = (btc && btc.style.display && btc.style.display !== 'none') ||
        (eth && eth.style.display && eth.style.display !== 'none') ||
        (xrp && xrp.style.display && xrp.style.display !== 'none');

    closeAllWindows();
    if (!isVisible) {
        if (btc) btc.style.display = 'block';
        if (eth) eth.style.display = 'block';
        if (xrp) xrp.style.display = 'block';

        showBitcoinPrice();
        showEthPrice();
        showXrpPrice();
    }
}

function closeAllWindows() {
    const windows = [
        document.querySelector(".addresse"),
        document.querySelector(".balance"),
        document.querySelector(".transfer-form"),
        document.querySelector(".transaction_tabelle"),
        document.getElementById("btc_price"),
        document.getElementById("eth_price"),
        document.getElementById("xrp_price"),
    ];

    windows.forEach(w => {
        if (w) w.style.display = "none";
    })
}


// Logout Funktion
function auslogen() {
    window.location.href = "Login_Cryptowallet.html";
}

// --- Support / Chat (Socket.IO client) ---
let supportSocket = null;

function chatanfangen() {
    const form = document.getElementById("supportForm");
    if (!form) return;

    // Toggle Anzeige
    form.style.display = form.style.display === "none" ? "block" : "none";

    // Wenn Socket noch nicht verbunden ist, verbinden
    if (!supportSocket) {
        try {
            supportSocket = io();

            supportSocket.on('connect', () => {
                console.log('Support Socket verbunden', supportSocket.id);
            });

            supportSocket.on('chat:message', (payload) => {
                const chatDiv = document.getElementById('chat');
                if (!chatDiv) return;

                const id_konto = localStorage.getItem('kontoId');

                // Wenn die Nachricht von uns selbst kommt (gleiche Konto-ID),
                // dann nicht noch einmal anzeigen (Entduplizieren).
                if (payload && payload.from && id_konto && String(payload.from) === String(id_konto)) {
                    return;
                }

                const msgElem = document.createElement('div');
                msgElem.className = 'support-message';
                const sender = payload.from || 'support';
                msgElem.innerText = `[${sender}] ${payload.text}`;
                chatDiv.appendChild(msgElem);
                chatDiv.scrollTop = chatDiv.scrollHeight;
            });
        }
        catch (e) {
            console.error('Socket.IO init failed', e);
        }
    }
}

function sendMessage() {
    const input = document.getElementById('msg');
    const chatDiv = document.getElementById('chat');
    if (!input || !chatDiv) return;

    const text = String(input.value || '').trim();
    if (!text) return;

    // Zeige eigene Nachricht (mit Konto-ID wenn vorhanden)
    const ownElem = document.createElement('div');
    ownElem.className = 'support-own';
    const id_konto = localStorage.getItem('kontoId') || 'Du';
    ownElem.innerText = `[${id_konto}] ${text}`;
    chatDiv.appendChild(ownElem);
    chatDiv.scrollTop = chatDiv.scrollHeight;

    // Sende an Server (als Objekt mit Konto-ID)
    if (supportSocket && supportSocket.connected) {
        supportSocket.emit('chat:message', { from: id_konto, text });
    } else {
        console.warn('Nicht mit Support verbunden');
    }

    input.value = '';
}