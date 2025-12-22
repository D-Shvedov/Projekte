import socket, threading

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("127.0.0.1", 4999))
server.listen(1)
print("Server läuft auf 127.0.0.1:4999")
aktiv = True

def get_message(komm, addr):
    while aktiv:    
        data = komm.recv(1024)
        if not data:
            komm.close()
            break
        print("[{0}] {1}".format(addr[0], data.decode()))

def send_message(komm):
    global aktiv
    while aktiv:
        nachricht = input("Antwort: ")
        komm.send(bytes(nachricht, "utf-8"))
        if nachricht == "stop":
            aktiv = False


while aktiv:
    komm, addr = server.accept()
    print(f"Verbindung von {addr} akzeptiert")
    threading.Thread(target=get_message, args=(komm, addr), daemon=True).start()
    threading.Thread(target=send_message, args=(komm,), daemon=True).start()

server.close()


"""
import socket
import select

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("localhost", 5000))
server.listen(1)
clients = [] # Wie viel Sockets
try:
    while True:
        lesen, schreiben, oob = select.select([server] + clients, [], []) # wartet auf eine aktivierte Socket
        for sock in lesen: 
            if sock is server:
                client, addr = server.accept()
                clients.append(client)
                print("+++ Client {0} verbunden".format(addr[0]))
            else:
                nachricht = sock.recv(1024)
                ip = sock.getpeername()[0] # ip-address from Client
                if nachricht:
                    print("[{0}] {1}".format(ip, nachricht.decode()))
                else:
                    print("+++ Verbindung zu {0} beendet".format(ip))
                    sock.close()
                    clients.remove(sock)
finally:
    for c in clients:
        c.close()
    server.close()
"""

"""
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 5000))
server.listen(1)
try:
    while True:
        komm, addr = server.accept()
        while True:
            data = komm.recv(1024)
            if not data:
                komm.close()
                break
            print("[{0}] {1}".format(addr[0], data.decode()))
            nachricht = input("Antwort: ")
            komm.send(bytes(nachricht, "utf-8"))
finally:
    server.close()
"""
