
import tkinter as tk
from tkinter import ttk
from Projekt_4_Cryptowallet_Modul import Registration, Operation, Support
import socket
import threading

# Global variable to control the server loop
aktiv = True

# Hauptfenster konfigurieren
root = tk.Tk()
root.title("Cryptowallet")
menubar = tk.Menu(root)
root.config(menu=menubar)

# Fenstergröße und Position
window_width = 1200
window_height = 800
screen_width = root.winfo_screenwidth()
screen_height = root.winfo_screenheight()
center_x = int(screen_width / 2 - window_width / 2)
center_y = int(screen_height / 2 - window_height / 2)
root.geometry(f'{window_width}x{window_height}+{center_x}+{center_y}')
root.resizable(False, False)
root.attributes('-topmost', 1)

# Support-Objekt
supportroot = Support(root)

# Login-Felder
registration = {}
registration["username_label"] = ttk.Label(root, text='Username:')
registration["username_entry"] = ttk.Entry(root)
registration["password_label"] = ttk.Label(root, text='Password:')
registration["password_entry"] = ttk.Entry(root, show="*")

# Packen der Login-Felder
for field in registration.values():
    field.pack(anchor=tk.S, padx=10, pady=5, fill=tk.X)

# Operation-Objekt
operation = Operation(root)

# Registrierung
reg = Registration(registration, root, operation, supportroot)
login_btn = ttk.Button(root, text="Konto eröffnen", command=reg.check_password)
login_btn.pack(pady=10)
login_btn.bind('<Return>', reg.check_password)
registration["open_account"] = login_btn
# Exit-Button
exit_button = ttk.Button(root, text='Exit', command=root.quit)
exit_button.pack(side=tk.BOTTOM, pady=10, padx=10, anchor=tk.SE)

# Support-Button
support_button = ttk.Button(
    root, text="Support", command=supportroot.support_tasten)
support_button.pack(side=tk.BOTTOM, padx=10, anchor=tk.SE)

# Funktionen für den Chat-Server


def get_messageS(komm, addr):
    while aktiv:
        data = komm.recv(1024)
        if not data:
            komm.close()
            break
        print("[{0}] {1}".format(addr[0], data.decode()))


def send_messageS(komm):
    global aktiv
    while aktiv:
        nachricht = input("Antwort: ")
        komm.send(bytes(nachricht, "utf-8"))
        if nachricht == "stop":
            aktiv = False


def server_thread():
    global aktiv
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) # Reuse address
    server.bind(("127.0.0.1", 5001))

    server.listen(1)
    print("Server läuft auf 127.0.0.1:5001")
    aktiv = True

    while aktiv:
        komm, addr = server.accept()
        print(f"Verbindung von {addr} akzeptiert")
        threading.Thread(target=get_messageS, args=(
            komm, addr), daemon=True).start()
        threading.Thread(target=send_messageS,
                         args=(komm,), daemon=True).start()
    server.close()


# Starte den Server-Thread
threading.Thread(target=server_thread, daemon=True).start()

# Hauptloop starten
root.mainloop()
