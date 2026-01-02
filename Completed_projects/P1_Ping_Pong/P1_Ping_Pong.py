# Import bibliothek
import pygame

# Initialize Pygame
pygame.init()
clock = pygame.time.Clock()

# Wir erstellen ein Fenster
monitor_size = (1280, 720)
fenster = pygame.display.set_mode(monitor_size, flags=0, depth=0, display=0, vsync=0)
pygame.display.set_caption("Ping Pong")

# Variablen für das obere Rechteck
oben_x = 500
oben_y = 0
oben_breite = 300
oben_hoehe = 20

# Variablen für das untere Rechteck
unten_x = 500
unten_y = 700
unten_breite = 300
unten_hoehe = 20    

# Variablen für den Ball
ball_x = 630
ball_y = 250

# Ändern Sie die Geschwindigkeit des Balls
bewegen_breit = 6
bewegen_hoch = 6

# Punkte 
oben_score = 0
unten_score = 0

# Navigation der Programs 
im_menü = True
running = True
final = False

# Music
pygame.mixer.music.load(r"C:\Users\Shvedov\Music\Lied.mp3")
pygame.mixer.music.play()

# time
pygame.time.Clock()
pygame.time.get_ticks()


# Schriftart
font = pygame.font.Font(None, 36)  # System-Font, Größe 36

# Ich mache das Fenster ständig sichtbar und reagiere auf Tastatureingaben und 
print("Funktioniert:", pygame.get_init())
def fenster_anzeigen():
    global running, final, oben_score, unten_score, im_menü, fenster, oben_x, oben_y, oben_breite, oben_hoehe, unten_x, unten_y, unten_breite, unten_hoehe, ball_x, ball_y, bewegen_breit, bewegen_hoch, play_taste, clock
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        if im_menü and event.type == pygame.MOUSEBUTTONDOWN:
            if play_taste.collidepoint(event.pos):
                im_menü = False  # Menü verlassen, Spiel starten
        elif im_menü: 
            tastatur = pygame.key.get_pressed()
            if tastatur[pygame.K_s]:
                im_menü = False  # Menü verlassen, Spiel starten
        fenster.fill((0, 0, 0))
        if im_menü:
            play_taste = pygame.draw.rect(fenster, (54, 237, 9), (575, 325, 150, 50), border_radius=30)
            text_play = font.render("Play", True, (13, 0, 0))  # Schwarzer Text
            text_rect = text_play.get_rect(center=play_taste.center)
            fenster.blit(text_play, text_rect)
        elif final:
            text_final = font.render(f"Gewinner: {gewinner}", True, (251, 255, 0))
            fenster.blit(text_final, (550, 300))
        else:
            # timer = fenster.time.set_timer()
            # text_timer = font.render(f"Gewinner: {timer}", True, (251, 255, 0))
            # fenster.blit(text_timer, (550, 300))
            tastatur = pygame.key.get_pressed()
            if tastatur[pygame.K_RIGHT]:
                unten_x += 10
            elif tastatur[pygame.K_LEFT]:
                unten_x -= 10
            if tastatur[pygame.K_d]:
                oben_x += 10
            elif tastatur[pygame.K_a]:
                oben_x -= 10

            # Ich erstelle die Objekte
            ball = pygame.draw.rect(fenster, (255, 13, 13), (ball_x, ball_y, 15, 15))
            oben = pygame.draw.rect(fenster, (58, 235, 13), (oben_x, oben_y, oben_breite, oben_hoehe))
            unten = pygame.draw.rect(fenster, (58, 235, 13), (unten_x, unten_y, unten_breite, unten_hoehe))
            center = pygame.draw.line(fenster, (255, 255, 255), (0, 360), (1280, 360), 5)

            # Bewege den Ball
            ball_x += bewegen_breit
            ball_y += bewegen_hoch

            if ball_x <= 0 and bewegen_breit == -6 and bewegen_hoch == 6:
                bewegen_breit *= -1
            elif ball_x <= 0 and bewegen_breit == -6 and bewegen_hoch == -6:
                bewegen_breit *= -1
            elif ball_x >= 1280 and bewegen_breit == 6 and bewegen_hoch == 6:
                bewegen_breit *= -1
            elif ball_x >= 1280 and bewegen_breit == 6 and bewegen_hoch == -6:
                bewegen_breit *= -1
            elif oben.colliderect(ball) and bewegen_breit == 6 and bewegen_hoch == -6:
                bewegen_hoch *= -1
            elif oben.colliderect(ball) and bewegen_breit == -6 and bewegen_hoch == -6:
                bewegen_hoch *= -1
            elif unten.colliderect(ball) and bewegen_breit == -6 and bewegen_hoch == 6:
                bewegen_hoch *= -1
            elif unten.colliderect(ball) and bewegen_breit == 6 and bewegen_hoch == 6:
                bewegen_hoch *= -1    

            # Noch ein Rund
            def start_position():
                global ball_x, ball_y, bewegen_breit, bewegen_hoch
                ball_x = 630
                ball_y = 250
                bewegen_breit = 6
                bewegen_hoch = 6


            if ball_y <= 0:
                oben_score += 1
                start_position()
                pygame.time.delay(1000)
                continue
            elif ball_y >= 720:
               unten_score += 1
               start_position()
               pygame.time.delay(1000)
               continue

            gewinner = ""

            if oben_score >= 10:
                gewinner = "Unten"
                final = True
            if unten_score >= 10:
                gewinner = "Oben"
                final = True
            

            score_text = font.render(f"Oben: {oben_score}  Unten: {unten_score}", True, (255, 255, 255))  # Weißer Text
            fenster.blit(score_text, (10, 10))
        
        clock.tick(60)
        pygame.display.update()
        
fenster_anzeigen()
# Das Fenster schließen
pygame.quit()


