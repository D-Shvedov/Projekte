import threading
import tkinter as tk
import socket
from tkinter import Menu, ttk


class Registration:
    def __init__(self, registration, root, operation, supportroot):
        self.registration = registration
        self.root = root
        self.operation = operation
        self.supportroot = supportroot


    def create_menus(self):
        menubar = Menu(self.root)

        file_menu = Menu(menubar, tearoff=0)
        operation_menu = Menu(menubar, tearoff=0)

        menubar.add_cascade(label="File", menu=file_menu)
        menubar.add_cascade(label="Operation", menu=operation_menu)

        self.root.config(menu=menubar)

        # Dann deine Commands hinzufügen
        file_menu.add_command(label="Exit", command=self.root.quit)
        file_menu.add_command(label="Support", command=self.supportroot.support_tasten)

        operation_menu.add_command(label="Show Address", command=self.operation.show_address)
        operation_menu.add_command(label="Show Balance", command=self.operation.show_balance)
        operation_menu.add_command(label="Withdraw", command=self.operation.withdrawal)
        operation_menu.add_command(label="Transaction History", command=self.operation.transaction_history)
    
    def check_password(self, event=None):
        # Keys for the registration dict in the main program
        pwd_key = "password_entry"
        user_key = "username_entry"

        # The registration dict in the main program uses the key
        pwd_widget = self.registration.get(pwd_key)
        user_widget = self.registration.get(user_key)

        # Check if the password or username is correct
        if pwd_widget.get() == "qwe" or user_widget.get() == "admin":
            for field in self.registration.values():
                try:
                    field.pack_forget()
                except Exception:
                    pass
            self.create_menus()
        else:
            try:
                pwd_widget.delete(0, tk.END)
            except Exception:
                pass
            try:
                user_widget.delete(0, tk.END)
            except Exception:
                pass
            if "password_label" in self.registration:
                try:
                    self.registration["password_label"].config(
                        text="Falsches Passwort oder Username!", foreground="red"
                    )
                except Exception:
                    pass


class Operation:
    def __init__(self, root):
        self.root = root

        self.balances = {
            'Bitcoin': 0.55555,
            'Ethereum': 3.0,
            'XRP': 1500
        }
        self.transactions = []

        self.crypto_balance_view = None
        self.address_view = None
        self.withdrawal_view = None
        self.transaction_history_view = None

    # Ansichten leeren
    def clear_views(self):
        for view in [
            self.crypto_balance_view,
            self.address_view,
            self.withdrawal_view,
            self.transaction_history_view
        ]:
            if view:
                view.destroy()

        self.crypto_balance_view = None
        self.address_view = None
        self.withdrawal_view = None
        self.transaction_history_view = None

    # Adresse anzeigen
    def show_address(self):
        self.clear_views()
        self.address_view = ttk.Frame(self.root)

        ttk.Label(self.address_view, text="ERC-20 Adresse:").pack(anchor='w')
        ttk.Label(self.address_view,
                  text="Bitcoin: 1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71").pack(anchor='w')
        ttk.Label(self.address_view,
                  text="Ethereum: 0x32Be343B94f860124dC4fEe278FDCBD38C102D88").pack(anchor='w')
        ttk.Label(self.address_view,
                  text="XRP: rDsbeomae4FXwgQTJp9Rs64Qg9vDiTCdBv").pack(anchor='w')

        self.address_view.pack(side=tk.TOP, fill=tk.X, padx=10, pady=5)

    # Kontostand anzeigen
    def show_balance(self):
        self.clear_views()
        self.crypto_balance_view = ttk.Treeview(self.root)
        self.crypto_balance_view['columns'] = ('Wert',)
        self.crypto_balance_view.column("#0", anchor=tk.W, width=120)
        self.crypto_balance_view.column("Wert", anchor=tk.W, width=120)

        self.crypto_balance_view.heading("#0", text="Währung", anchor=tk.W)
        self.crypto_balance_view.heading("Wert", text="Wert", anchor=tk.W)

        for crypto, value in self.balances.items():
            self.crypto_balance_view.insert(
                '', 'end', text=crypto, values=(f"{value}",))

        self.crypto_balance_view.pack(side=tk.TOP, fill=tk.X, padx=10, pady=5)

    # Auszahlung vorbereiten
    def withdrawal(self):
        self.clear_views()
        self.withdrawal_view = ttk.Frame(self.root)
        self.withdrawal_view.pack(padx=10, pady=5, fill=tk.X)

        ttk.Label(self.withdrawal_view,
                  text="Währung wählen:").pack(anchor='w')
        crypto_choice = ttk.Combobox(
            self.withdrawal_view, values=list(self.balances.keys()))
        crypto_choice.pack(fill=tk.X)
        crypto_choice.current(0)

        betrag = ttk.Label(self.withdrawal_view, text="Betrag eingeben:")
        betrag.pack(anchor='w')
        amount_entry = ttk.Entry(self.withdrawal_view)
        amount_entry.pack(fill=tk.X)
        amount_entry.insert(0, "0.0")
        self.betrag = betrag

        ttk.Label(self.withdrawal_view,
                  text="Adresse ERC-20:").pack(anchor='w')
        crypto_address = ttk.Entry(self.withdrawal_view)
        crypto_address.pack(fill=tk.X)

        # Auszahlung durchführen
        def perform_withdrawal():
            crypto = crypto_choice.get()
            try:
                amount = float(amount_entry.get())
                if amount <= 0:
                    betrag.config(
                        text=" Fehler: Betrag muss größer als 0 sein.", foreground="red")
                    return
                if self.balances[crypto] < amount:
                    betrag.config(
                        text=f" Nicht genügend Guthaben in {crypto}.", foreground="red")
                    return
                self.balances[crypto] -= amount
                betrag.config(text=f" {amount} {crypto} ausgezahlt.")
                self.transactions.append({
                    "crypto": crypto,
                    "amount": amount,
                    "crypto_address": crypto_address.get()
                })
                self.show_balance()
            except ValueError:
                betrag.config(text=" Ungültiger Betrag.", foreground="red")

        ttk.Button(self.withdrawal_view, text="Auszahlen",
                   command=perform_withdrawal).pack(pady=5)

    # Transaktionsverlauf anzeigen
    def transaction_history(self):
        self.clear_views()
        self.transaction_history_view = ttk.Treeview(self.root)
        self.transaction_history_view['columns'] = ('Betrag', 'Adresse')
        self.transaction_history_view.column("#0", anchor=tk.W, width=120)
        self.transaction_history_view.column("Betrag", anchor=tk.W, width=120)
        self.transaction_history_view.column("Adresse", anchor=tk.W, width=250)

        self.transaction_history_view.heading(
            "#0", text="Währung", anchor=tk.W)
        self.transaction_history_view.heading(
            "Betrag", text="Betrag", anchor=tk.W)
        self.transaction_history_view.heading(
            "Adresse", text="Adresse", anchor=tk.W)

        for transaktion in self.transactions:
            self.transaction_history_view.insert(
                '', 'end',
                text=transaktion["crypto"],
                values=(f"{transaktion['amount']}",
                        transaktion["crypto_address"])
            )

        self.transaction_history_view.pack(
            side=tk.TOP, fill=tk.X, padx=10, pady=5)


class Support:
    def __init__(self, root):
        self.root = root
        self.support_frame = None

    # Support-Ansicht leeren
    def clear_view(self):
        if self.support_frame:
            try:
                self.support_frame.destroy()
            except Exception:
                try:
                    self.support_frame.pack_forget()
                except Exception:
                    # Last resort: ignore any error while clearing the view
                    pass
            self.support_frame = None

    # Nachricht direkt senden
    def send_messageC(self, nachricht_entry, text_widget):
        nachricht = nachricht_entry.get()
        if nachricht:
            self.socket.send(nachricht.encode("utf-8"))
            text_widget.insert(
                tk.END, f"[Ich:] {nachricht}\n")
            text_widget.see(tk.END)
            nachricht_entry.delete(0, tk.END)

    def server_client(self, text_widget):
        ip = "127.0.0.1"
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((ip, 5001))
        self.aktiv = True
        self.socket = s

        def get_messageC():
            while self.aktiv:
                try:
                    antwort = s.recv(1024)
                    if antwort:
                        text_widget.insert(
                            tk.END, f"[Support:] {antwort.decode()}\n")
                        text_widget.see(tk.END)
                except:
                    break

        threading.Thread(target=get_messageC, daemon=True).start()

    # Support-Ansicht umschalten

    def support_tasten(self):
        if self.support_frame:
            self.clear_view()
            return

        self.support_frame = ttk.Frame(self.root)
        self.support_frame.pack(padx=10, pady=5, fill=tk.X)

        ttk.Label(self.support_frame,
                  text="Nachricht senden:").pack(anchor='w')

        # Eingabefeld für die Nachricht
        nachricht_entry = ttk.Entry(self.support_frame)
        nachricht_entry.pack(fill=tk.X)

        # Textfeld zur Anzeige der Nachrichten
        text_widget = tk.Text(self.support_frame, wrap=tk.WORD, height=10)
        text_widget.pack(fill=tk.BOTH, expand=True)

        # Button: sendet nur EINMAL beim Klick
        send_button = ttk.Button(
            self.support_frame,
            text="Senden",
            command=lambda: self.send_messageC(nachricht_entry, text_widget)
        )
        send_button.pack(pady=5)
        nachricht_entry.bind('<Return>', lambda event: self.send_messageC(
            nachricht_entry, text_widget))

        # Verbindung aufbauen (Start der Threads)
        self.server_client(text_widget)
