from test_1 import Konto

konto_1 = Konto("Daniil", "wqdwq21321d", 100)
status = True

while True:
    print("Operationen:")
    print("1. Prüfen Balance")
    print("2. Limit stellen")
    print("3. Einzahlen")
    print("4. Auszahlen")
    print("5. Anzahl der Konten")

    try:
        choice = int(input("Was möchten Sie tun? "))
    except ValueError:
        print("Ungültige Eingabe! Bitte eine Zahl eingeben.")
        continue

    if choice == 1:
        print(f"Den Kontostand beträgt: {konto_1.get_balance()} Euro")
    elif choice == 2:
        wert = int(input("Welches Limit wollen Sie einsetzen? "))
        konto_1.daily_limit = wert
        print(f"Neues Limit ist {konto_1.daily_limit} Euro")
    elif choice == 3:
        sum = int(input("Schreiben Sie die Summe: "))
        konto_1.deposit(sum)
    elif choice == 4:
        sum = int(input("Schreiben Sie die Summe: "))
        konto_1.withdrawal(sum)
    elif choice == 5:
        Konto.show_wallets()
    else:
        print("Ungültige Eingabe")
        continue

    while True:
        continue_question = input(
            "Gibt es noch fragen? (Ja oder Nein) ").strip()
        if continue_question.lower() == "ja":
            break
        elif continue_question.lower() == "nein":
            status = False
            break
        else:
            print("Ungültige Eingabe")

    if not status:
        break
