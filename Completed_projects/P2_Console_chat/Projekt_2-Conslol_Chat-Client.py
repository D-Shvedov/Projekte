import socket
import threading
import time

ip = "127.0.0.1"
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((ip, 4999))
aktiv = True


def send_message():
    global aktiv, ip
    while True:
        nachricht = input("Nachricht: ")
        if nachricht == "stop":
            aktiv = False
        s.send(bytes(nachricht, "utf-8"))


def get_message():
    global aktiv, ip
    while aktiv:
        antwort = s.recv(1024)
        print("[{0}] {1}".format(ip, antwort.decode()))


try:
    threading.Thread(target=send_message, daemon=True).start()
    threading.Thread(target=get_message, daemon=True).start()
    while True:
        time.sleep(1)
        if not aktiv:
            break
finally:
    s.close()
    print("Verbindung geschlossen")