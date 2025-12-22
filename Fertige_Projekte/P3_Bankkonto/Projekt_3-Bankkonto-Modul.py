class Konto:
    total_wallets = 0

    def __init__(self, owner, wallet_id, balance, daily_limit=1000.0, spent_today=0.0):
        self.owner = owner
        self.wallet_id = wallet_id
        self.__balance = balance
        self._daily_limit = float(daily_limit)
        self.spent_today = float(spent_today)
        Konto.total_wallets += 1

    def __del__(self):
        Konto.total_wallets -= 1

    def get_balance(self):  # Getter
        return self.__balance

    @property
    def daily_limit(self):
        return self._daily_limit

    @daily_limit.setter
    def daily_limit(self, wert):
        if 100 <= wert <= 5000:
            self._daily_limit = float(wert)  # Setter
        else:
            print("Fehler: Limit darf nur von 100 bis 5000 sein!")

    def deposit(self, sum):
        if sum > 0:
            self.__balance += sum
            print(f"{sum} € eingezahlt. Neuer Kontostand: {self.__balance:.2f} €")
        else:
            print("Fehler: Weniger als 1 Euro")

    def withdrawal(self, betrag):
        if betrag <= 0:
            print("Fehler: Betrag muss größer als 0 sein.")
        elif betrag > self.__balance:
            print("Fehler: Nicht genug Guthaben.")
        elif self.spent_today + betrag > self.daily_limit:
            print("Fehler: Tageslimit überschritten.")
        else:
            self.__balance -= betrag
            self.spent_today += betrag
            print(f"{betrag} € ausgezahlt. Neuer Kontostand: {self.__balance:.2f} €")

    def show_wallets():
        print("Anzahl der Konten:", Konto.total_wallets)
