# SIGNAL BLOOM — Gesamtspezifikation

**Stand: August 2026.** Dieses Dokument fasst die Übergabe und die Spec-Teile 6,
7 und 8 zusammen und ersetzt sie. Wer es liest, kennt den vollständigen Stand
und kann sofort weiterarbeiten.

Arbeitstitel: *SIGNAL BLOOM* (nicht endgültig, siehe Abschnitt 16).
Stand: Konzeptphase, **zwei** spielbare Prototypen mit **zwei verschiedenen
Steuerungsmodellen** (Abschnitt 2 und 14). Welches davon das Spiel wird, ist
die derzeit größte offene Entscheidung (Frage 15).

**Zuletzt geändert:** Raster-Modell aufgenommen (Abschnitte 2.2, 5.8, 14.2),
erste Kopplung um ihre Raster-Ausprägung erweitert (Abschnitt 3), neue offene
Fragen 15–18.

---

## 1. Was das Spiel ist

Ein Koop-Spiel für **genau zwei Personen an zwei getrennten Geräten** (gleicher
Raum oder remote). Mobile Webapp, Hochformat.

Ihr steuert gemeinsam eine zerbrechliche Blase durch einen Schwarm leuchtender
Kreaturen. **Keiner der beiden sieht alles, keiner kann alles bedienen.** Fast
jede Bedrohung verlangt, dass beide gleichzeitig oder abgestimmt handeln.

Vorbilder: Lovers in a Dangerous Spacetime (geteilte Rollen), Keep Talking and
Nobody Explodes (asymmetrische Information), Spaceteam (Befehl beim Falschen).

**Der Kernsatz:** Reden ist keine Hilfe, sondern die Steuerung.

### 1.1 Die Leitfrage für jede neue Idee

Nicht: „Wie kann ein Gegner schwieriger sein?"
Sondern: **„Was müssen zwei Menschen neu voneinander verstehen, um diesen
Gegner zu besiegen?"**

### 1.2 NON-NEGOTIABLE — Sprache wird nie ausgewertet

Das Spiel liest kein Mikrofon, erkennt keine Sprache, wertet weder Worte noch
Lautstärke noch Tonfall aus und prüft nicht, ob überhaupt gesprochen wurde. Es
verarbeitet ausschließlich Eingaben: welche, von wem, zu welchem lokalen
Zeitpunkt, in welcher Reihenfolge, in welchem Sync-Fenster.

Die Kommunikation bleibt menschlich, die Steuerung digital.

**Folge:** Jede Mechanik und jede Statistik, die wissen müsste, ob oder was
gesprochen wurde, ist ausgeschlossen.

---

## 2. Rollen und Steuerung

Es existieren derzeit **zwei Steuerungsmodelle** in zwei lauffähigen
Prototypen. Welches davon das Spiel wird, ist noch offen (Abschnitt 15.1,
Frage 15). Beide teilen dieselben Rollen, dieselbe Nichtverhandelbarkeit aus
1.2 und dieselbe Grundregel: keiner kann alles bedienen.

### 2.1 Freiflug-Modell (`signal-bloom-prototyp.html`)

| | Spieler 1 — PILOT | Spieler 2 — NAVIGATOR |
|---|---|---|
| Zielen (Schieberegler) | ✔ | |
| Schub | ✔ | |
| Farbe wählen und feuern | | ✔ |
| Ausweichrichtung links/rechts | | ✔ |
| Waffe umschalten | | ✔ |
| Radar: *welche* Kreaturen kommen | ✔ | |
| Radar: *wo* sie kommen | | ✔ |

- Zielen: Schwenkbereich ca. 150°, per Regler einstellbar (bis 330°)
- Feuern: Antippen einer Farbe feuert direkt in dieser Farbe (kein extra Abzug)
- Keine Munitionsbegrenzung, aber Feuertakt
- Rollenwahl vor Spielbeginn (fertiges Spiel, nicht Testphase); getrennte
  Highscores je Rollenverteilung als Anreiz zum Tauschen

### 2.2 Raster-Modell (`signal-bloom-raster.html`)

Alles rastet auf ein Schachbrett und hängt am Takt. Statt einer beweglichen
Blase gibt es **drei getrennte Elemente**: eine feststehende Hülle über die
volle Breite, eine frei verschiebbare Kanone darauf und ein Schild.

| | Spieler 1 — PILOT | Spieler 2 — NAVIGATOR |
|---|---|---|
| Kanone verschieben (Spaltenstreifen) | ✔ | |
| Schild **auslösen** | ✔ | |
| Farbe wählen und feuern | | ✔ |
| Schild **verschieben** links/rechts | | ✔ |
| Radar: *welche* Kreaturen kommen | ✔ | |
| Radar: *wo* sie kommen | | ✔ |

**Hülle.** Über die gesamte untere Breite sichtbar, nur der obere, gezackte
Rand ragt ins Bild. Sie bewegt sich nicht. Erreicht eine Kreatur sie, bricht
an genau dieser Spalte ein Stück heraus — bleibende, sichtbare Bruchstelle.

**Kanone.** Schiebt sich frei und sofort (nicht getaktet) über die Hülle und
feuert immer senkrecht nach oben durch ihre aktuelle Spalte. Die Position
rastet auf Spaltenmitten, nichts dazwischen. Bedienung: Streifen über die
volle Breite, tippen oder ziehen.

**Schild.** Verschiebt **Spieler 2 allein** — kein Zutun von Spieler 1 nötig.
Die Bewegung wird vorgemerkt und auf dem nächsten Schlag ausgeführt, hängt also
weiter am Takt. Das Schild ist **passiv wirkungslos**. Ein Meteorit wird nur
abgewehrt, wenn **Spieler 1 im Moment der Berührung auslöst**. Beides muss
zusammenkommen: richtige Spalte (Spieler 2) und richtiger Zeitpunkt
(Spieler 1). Gegen Kreaturen hilft das Schild nicht — die gehören der Kanone.

Zeitfenster der Auslösung: 260 ms vor dem Aufprallschlag (Regler).

---

## 3. Die drei Kopplungen

Alles Wesentliche folgt aus diesen drei Mustern:

1. **Abwehren** — Zwei Ausprägungen, je nach Steuerungsmodell:
   - *Freiflug:* Richtung (Spieler 2) UND Schub (Spieler 1) im selben
     Zeitfenster. Keiner kann es allein.
   - *Raster:* Position (Spieler 2, verschiebt das Schild) UND Auslösung
     (Spieler 1, im Moment der Berührung). Keiner kann es allein.

   Der Unterschied ist nicht kosmetisch. Im Freiflug teilen sich beide **eine
   Aktion** und müssen sie gleichzeitig auslösen — die Ansage lautet „jetzt".
   Im Raster hat jeder **eine eigene, andersartige Teilaufgabe**: der eine
   stellt räumlich ein, der andere trifft zeitlich. Die Ansage lautet eher
   „Spalte vier, ich löse auf der Drei aus". Das erzeugt mehr Gesprächsstoff
   und macht sichtbar, wer welchen Teil verpatzt hat.
2. **Markieren** — Spieler 1 hält den Zielstrahl kurz auf einer Kreatur, dann
   rastet die Markierung ein; Spieler 2 feuert die passende Farbe. Markierung
   erlischt, sobald die Kreatur in den Rammangriff übergeht.
3. **Ansagen** — Eine Information liegt bei dem, der sie nicht verwerten kann
   (Radar, Gewitterwolke, Zielmischung).

---

## 4. Die harte Randbedingung: Sprachverzögerung

Kommunikation läuft über Discord/WhatsApp: **0,5–2 s Verzögerung**.
Vollständige Ansagekette inkl. Erkennen und Reagieren: **2,1–3,6 s**.

**Regel:** Jede Kreatur, deren Bekämpfung eine Ansage erfordert, braucht
mindestens **4 Sekunden** vom Sichtbarwerden bis zum Einschlag, besser 5–6.
Kreaturen ohne Ansagebedarf dürfen beliebig schnell sein — der Kontrast ist ein
Gestaltungsmittel.

**Der Takt löst das Problem teilweise:** Ein hörbarer Puls ist eine gemeinsame
Uhr. Statt „jetzt!" (beim Ankommen falsch) sagt man „auf der Drei" (bleibt
gültig).

---

## 5. Systeme

### 5.1 Steuerungssichtbarkeit (Prinzip A) — gebaut

Jeder Kreaturentyp erklärt, welche Steuerungsgruppe er verlangt:
`{ manta: ['aim'], wespe: ['aim'], brocken: ['dodge'], ... }`

Eine Welle zeigt **nur die Vereinigung** der Gruppen ihrer Kreaturen. Kommen
keine Brocken vor, sind Schub und Ausweichpfeile unsichtbar **und
deaktiviert**. Ist nur eine Gruppe aktiv, bekommt sie die volle Bandbreite und
größere Bedienelemente.

Neue Kreaturentypen brauchen nur einen Eintrag in dieser Tabelle — Wellen
müssen nicht angefasst werden. Die Bedienelemente der Hilfsmechaniken
(Abschnitt 6) folgen derselben Regel.

### 5.2 Informationsverteilung

| Information | Pilot | Navigator |
|---|---|---|
| Position aller Kreaturen | ✔ | ✔ |
| Farben (normal) | ✔ | ✔ |
| Gewitterwolke: Farbe im Inneren | ✔ (nur im Blitzmoment) | ✘ |
| Radar: welche kommen (Warteschlange) | ✔ | ✘ |
| Radar: wo sie kommen (Spuren) | ✘ | ✔ |
| Zielmischung (Boss „Das Gefäß") | ✘ | ✔ |
| Markierung + Zielfarbe | ✔ | ✔ |

Radarlinien: Länge = verbleibende Zeit bis Ankunft; Vorwarnung, bevor die
Kreatur sichtbar wird. Gewitterwolke erscheint im Radar als Fragezeichen.

**Grundregel:** Die Position jeder Kreatur ist für beide vorhanden. Sie darf
unvollständig oder gestört sein (siehe *Der Blinde*, Abschnitt 10), aber nie
abwesend — sonst ist ein Treffer für den Betroffenen Willkür.

### 5.3 Takt

- ca. 100 Schläge/min, jeder vierte betont, läuft auch in Pausen durch
- Sync-Fenster = derselbe Schlag (statt unsichtbarer 250 ms)
- Teleportsprünge, Herzkoralle, Countdown-Kreaturen hängen am Takt
- **Kein Soundtrack** — nur ein sparsamer Klick-Track unterhalb des
  Sprachbereichs, damit er nicht mit der Stimme konkurriert
- Eigene Töne für: Farbe geladen, erfasst, Manöver geglückt, Fehlschuss,
  Schaden. Beide hören alles — ein Ton ist schneller als ein Satz
- Stiller Modus: pulsierender Bildschirmrand als sichtbarer Ersatz

### 5.4 Blasen als Munition

- Schüsse sind Blasen: langsam, schlingernd, wachsend
- Schlingern nimmt mit Entfernung zu → natürliche Reichweitenbegrenzung
- **Verschmelzen:** Zwei Blasen unterschiedlicher Farbe, die sich im Flug
  einholen, werden zu einer Mischblase (frische Blasen sind schneller als alte)
- Aufladen durch Halten: größer, aber träger — echter Tausch, keine reine
  Verbesserung. Konflikt: währenddessen ist der Daumen für Ausweichen blockiert

### 5.5 Waffen

Jederzeit umschaltbar, **1,5 s Umrüstzeit ohne Feuerkraft** (muss angesagt
werden — Spieler 1 muss die Lücke decken).

| Waffe | Wirkung |
|---|---|
| Standard | Einzelblase |
| Bohrer | durchschlägt bis zu 3 Segmente in einer Linie, langsamer |
| Haftmine | haftet, zündet beim nächsten Treffer *anderer* Farbe |

### 5.6 Zerstörung und Schaden

- Jede Kreatur ist ein Polygon; Treffer schneiden echte Stücke heraus
- 3–6 Splitter fliegen weg, Bruchkante glüht kurz
- **Brocken:** Krater bis ca. 15 % Materialverlust, dann liegt ein harter Kern
  frei — weitere Treffer erzeugen nur Funken. Vermittelt die Regel visuell
- Zerstörte Kreaturen hinterlassen treibende Trümmer
- Einschläge hinterlassen bleibende Narben an der Blase (offene Frage 15.2)
- Grenze: ca. 40 Splitter, 12 Trümmer gleichzeitig

### 5.7 Power-Ups

- **Zeitlupe** und **Autopilot** (ein Ausweichmanöver ohne Sync)
- Für beide sichtbar; Spieler 1 muss hinfliegen (hält vom Zielen ab)
- Zeitpunkt ist choreografiert, **Position und Fluchtrichtung zufällig**
- Bahn: von unten ins Bild, kreist unterhalb der Mitte, fliegt seitlich ab
- Blockiert das Wellenende nicht

### 5.8 Gesamtverhalten im Raster-Modell — gebaut

Gilt für `signal-bloom-raster.html`. Ergänzt Abschnitt 2.2 um das Verhalten.

**Raster.** 11 Spalten × 15 Reihen (Regler: 7–15 Spalten). Die unterste Reihe
ist die Hülle, eine Kreatur läuft also `Reihen − 1` = 14 Schläge. Bei 96 BPM
sind das 8,75 s — die 4-Sekunden-Regel aus Abschnitt 4 ist damit erfüllt.

Im Prototyp ergab sich die Reihenzahl aus der Kachelgröße. Im Port ist sie ein
festes Feld von `SimConfig`: zwei Geräte, die sich über die Höhe des Feldes
nicht einig sind, sind sich auch nicht einig, wann eine Kreatur die Hülle
erreicht. Stattdessen schrumpft die Kachel, bis das Feld passt.

**Bewegung der Kreaturen.** Sie **gleiten gleichmäßig**, nicht ruckweise:
genau eine Kachel pro Schlag, linear interpoliert, ohne Verharren zwischen den
Kacheln. Auf jedem Schlag stehen sie exakt auf einer Kachelmitte. Die Phase
kommt direkt aus dem Takt-Akkumulator, dadurch bewegen sich alle Kreaturen
exakt synchron und ohne Ruckeln an der Schlaggrenze.

Nachgemessen: 0,945 px pro Frame, Abweichung null; Tempo 1,600 Kacheln/s bei
einem Sollwert von 1,600.

**Spurtreue.** Die ersten beiden Kreaturentypen (Manta, Qualle) halten ihre
Spalte — kein Spurwechsel, kein Eindrehen auf die Hülle. Abwechslung entsteht
**rein optisch**: die Qualle pendelt in der Spur und pumpt mit der Glocke, die
Manta gleitet, kippt und schlägt mit den Flügeln, Steine driften leicht.
Nichts davon berührt die Kachel — die Bahn bleibt exakt ablesbar. Spurwechsel
bleibt späteren Typen vorbehalten.

**Schaden.**

| Ereignis | Wirkung |
|---|---|
| Kreatur erreicht die Hülle | 12 Schaden, Bruchstelle an dieser Spalte |
| Meteorit, Schild falsch oder nicht ausgelöst | 20 Schaden, Bruchstelle |
| Meteorit, Schild richtig **und** ausgelöst | 0 Schaden, Abwehr |
| Schuss trifft Meteorit | Einschussloch, Größe bleibt, unzerstörbar |

**Sichtbarkeit der Abwehr.** Eine geglückte Abwehr muss unübersehbar sein,
sonst lernt das Paar das Timing nicht. Gebaut: das Schild wechselt von einem
dünnen, durchlässigen Streifen zu einer geschlossenen hellen Kuppel, der
Meteorit prallt sichtbar nach oben aus dem Bild ab, eine Druckwelle läuft
auseinander, es blitzt nach, „ABGEWEHRT" erscheint, und im HUD läuft eine
Bilanz (`Abwehr 7/9`) mit. Der Nenner ist **jeder** Meteorit, der die Hülle
erreicht hat, nicht nur die mit Schild in der Spalte. Fehlversuche mit
richtiger Position, aber falschem Zeitpunkt werden separat gezählt — sie sind
die interessante Fehlerklasse.

**Schüsse.** Rasten auf Kachelmitten, 12 Kacheln pro Schlag, Feuerpause ein
halber Schlag. Beides hängt am Takt, nicht aneinander — sonst wird schnelleres
Fliegen versehentlich zu Dauerfeuer.

**Radar.** Nur am oberen Rand, in der Farbe des Objekts. Die Höhe zeigt die
Reihenfolge: je näher am Rand, desto eher kommt es. Im Feld selbst gibt es
**keine** Bahnanzeigen — auch nicht für Meteoriten. Die einzige verbliebene
Linie ist die eigene Kanonenspalte.

**Takt sichtbar.** Rasterlinien und Kreuzungspunkte leuchten auf jeden Schlag
auf und klingen ab, dazu vier Beat-Punkte im HUD und ein Ring am Schild.

**Wache halten** (Abschnitt 6.1) ist im Raster-Modell **nicht** umgesetzt:
Verlangsamen hieße hier, einen Schlag auszusetzen. Die Mechanik müsste dafür
neu gedacht werden, statt schlecht übersetzt zu werden.

---

## 6. Hilfsmechaniken

**Anlass:** Kompetenzunterschiede abfedern. Zwei Menschen sind selten gleich
schnell; ohne Ausgleich hört das Paar auf zu spielen — nicht aus Langeweile,
sondern weil einer sich dauernd als Bremse erlebt.

**Zwei Prinzipien für alle Formen:**

1. Hilfe kostet den Helfer etwas, und der Preis ist für beide sichtbar. Sonst
   spielt der Starke heimlich für beide, und der Schwächere schaut zu.
2. Jede Form funktioniert **in beide Richtungen**. Sonst ist eine Rolle
   dauerhaft die des Hilfsbedürftigen — auch wenn sie besser gespielt wird.

### 6.1 Die drei Formen

| Form | Aktion | Preis |
|---|---|---|
| **Sicht teilen** | Eigene Radarhälfte für den anderen freigeben | Eigenes Radarbild wird blasser |
| **Wache halten** | Finger auf einer Kreatur halten: markiert, bewegt sich langsamer | Eigene Hauptaktion blockiert, solange der Finger liegt |
| **Reserve → Zeitlupe** | Tippen füllt einen Speicher, den nur der andere auslösen kann | Tippzeit statt Spielzeit |

**Sicht teilen** ist von Natur aus symmetrisch: Der Pilot gibt die
Warteschlange ab (*welche* kommen), der Navigator die Spuren (*wo* sie kommen).
Jeder hat eine Radarhälfte zu verschenken. Das ist die leiseste Form der
Hilfe — reine Information, keine Handlung.

**Wache halten** ist beim Piloten das gehaltene Markieren aus Abschnitt 3 —
keine neue Geste, sondern dieselbe mit Dauerwirkung: Solange der Finger liegt,
bleibt die Markierung und die Kreatur wird langsamer; die eigene Kanone ruht.
Beim Navigator ruht stattdessen das Feuer, und der Pilot sieht die Kreatur
hervorgehoben und verlangsamt. Es ist die einzige Form, bei der die Hilfe
sichtbar im Spielfeld stattfindet statt in einer Anzeige.

**Reserve** ist an die Zeitlupe gekoppelt, nicht abstrakt — ein Speicher ohne
erkennbare Wirkung erklärt sich niemandem. Beide füllen, beide lösen aus, aber
nie den eigenen Speicher. Hilfe muss angenommen werden.

### 6.2 Freischaltung

Kein verstecktes Handicap, keine Anpassung an gemessene Leistung. Alle Paare
bekommen dieselben Werkzeuge zur selben Zeit; wer sie braucht, benutzt sie mehr.

**Ordnungsprinzip:** Jede Hilfsform ist die Abwandlung eines Verbs, das beide
schon können, und erscheint ein bis zwei Wellen nach dem System, von dem sie
borgt. So muss nie eine neue Geste erklärt werden, nur ein neuer Zweck.

| Ab Welle | Form | borgt von |
|---|---|---|
| ~4 | Sicht teilen | Radar |
| ~8 | Wache halten | Markieren |
| ~12 | Reserve → Zeitlupe | Power-Up Zeitlupe |

Sicht teilen zuerst, weil es nichts blockiert — es macht das Wort „Hilfe" im
Spiel überhaupt erst vorstellbar. Die Reserve zuletzt, weil sie als einzige
eine neue Anzeige einführt.

Freischaltungen bekommen dieselbe animierte Vorschau wie neue Kreaturen — und
dieselbe Regel: **nur beim allerersten Auftreten**, über Neustarts hinweg
gemerkt.

### 6.3 Verworfen

**Offenes Handicap vor Spielbeginn** (größeres Sync-Fenster oder langsamere
Kreaturen für ein Gerät). Ehrlicher als versteckte Erleichterung, aber die
gestaffelte Freischaltung leistet dasselbe, ohne jemanden zu etikettieren.

---

## 7. Spielstruktur

- Wellen kommen **geschlossen auf einmal**, dann kurze Pause, dann die nächste
- Wellenlänge 30–60 s; Pausen schrumpfen mit steigender Wellenzahl
- Hülle regeneriert langsam während des Spiels
- Fehlschuss in falscher Farbe: kurze Unverwundbarkeit
- Schuss auf nicht markierte Qualle: prallt wirkungslos ab (muss sichtbar
  anders aussehen als der Farbfehler)
- Neue Kreaturentypen: kurze **animierte Vorschau**, pausiert das Spiel, nur
  beim allerersten Auftreten, beide sehen dasselbe. Bei zwei Geräten braucht es
  ein „beide bereit"-Signal

### 7.1 Speichern

- **Speicherpunkt nach jedem zweiten Boss:** Welle 20, 40, 60, 80
- Gerechnet mit ca. 55 s je Welle inkl. Pause sind zwanzig Wellen rund
  18 Minuten. Für zwei Leute, die per Sprache koordinieren, liegt die Grenze
  bei etwa 20–25 Minuten am Stück — groß genug, dass es sich verdient anfühlt,
  klein genug für einen Abend
- Gespeichert wird **nur die erreichte Welle**, kein Punktestand — dazu die
  bereits gesehenen Vorschauen (Kreaturen und Hilfsformen)
- **Der Stand gehört dem Paar, nicht dem Gerät.** Gemeinsamer Code, sonst hat
  einer Welle 40 und der andere Welle 20

### 7.2 Punkte und Bilanz

- Gemeinsamer Wert, Bonus für überlebte Wellen, **keine Aufschlüsselung nach
  Spieler** (sonst Schuldzuweisungen)
- **SYNC-Wert** nach der Runde: ein gemeinsamer Prozentwert mit Unterwerten
  (Ausweich-Synchronisation, Farbsicherheit, Timing, Reaktionskonsistenz). Ein
  Unterwert, aus dem sich ableiten lässt, wer den Fehler gemacht hat, ist keiner
- **Gemeinsame Erinnerungen** statt nur Zahlen: längste fehlerfreie Sequenz,
  erster Boss ohne Schaden, schnellste gemeinsame Reaktion

**Zwei getrennte Bestenlisten**, damit niemand zwischen Weiterkommen und
Bestenliste wählen muss:

| Liste | Inhalt |
|---|---|
| **Durchlauf** | Punkte ab Welle 1, ohne Fortsetzen |
| **Fortschritt** | höchste je erreichte Welle |

### 7.3 Zufallsregel

**Zufällig bleibt nur, was einer weiß und der andere nicht.**

| zufällig | fest |
|---|---|
| Gewitterwolke: Farbe im Inneren | Positionen |
| Zielmischung (Boss „Das Gefäß") | Zeitpunkte |
| Zeichenrochen: Muster | Bahnen |
| Qualle: Markierungsfarbe | Reihenfolge |
| Power-Up: Position und Fluchtrichtung* | Farben normal sichtbarer Kreaturen |

**Begründung:** Der Kernsatz lautet „Reden ist die Steuerung". Wäre die Farbe
in der Gewitterwolke bei Welle 37 immer blau, sagte der Pilot sie beim vierten
Versuch nicht mehr an — beide wüssten sie auswendig. Dort verliert das Spiel
seinen Kern, nicht bloß Abwechslung.

\* Bewusste Ausnahme: Beide sehen das Power-Up, aber niemand weiß, wohin es
fliegt — das erzwingt eine gemeinsame Entscheidung unter unvollständigem Wissen.

**Gestrichen:** Die kleine Positionsstreuung. Sie kostet Wiedererkennbarkeit
und bringt nichts zurück.

---

## 8. Wellenaufbau

**Ziel:** sehr lange Spieldauer bei durchkomponierten Wellen und niedriger
Neuheitsdichte. Nicht ständig Neues, aber nie Füllmaterial.

### 8.1 Figuren

Eine **Figur** ist ein handgesetzter Baustein von 4–8 s: feste Anzahl, feste
Startpositionen, feste Bahnen, feste Zeitpunkte. Beispiel: „drei Mantas im
Fächer von links, dann ein Brocken durch die Lücke."

Eine **Welle** ist eine feste Folge aus 6–10 Figuren.

**Wichtig:** Das ist ein Autorenwerkzeug, kein Generator. Nichts wird zur
Laufzeit zusammengesetzt. Figuren werden im Editor von Hand gesetzt; jede Welle
ist genauso durchkomponiert wie eine einzeln geschriebene. Der Gewinn liegt
darin, dass für Welle 60 auf getestete Bausteine zurückgegriffen wird, statt
wieder einzelne Gegner zu platzieren. Musikalisch gedacht: Figuren sind Motive,
Wellen sind Sätze — ein Motiv kehrt wieder, gespiegelt, schneller, in anderer
Farbe, und wirkt neu, obwohl es dasselbe ist.

### 8.2 Variationsraum ohne neues Material

- **Mischung** — Brocken zwischen Mantas erzwingt Wechsel zwischen Ausweichen
  und Zielen
- **Steuerung** — reine Ausweichwelle, reine Farbwelle, oder Umschalten mitten
  in der Welle. Der stärkste Hebel: Eine Welle, die eine Steuerungsgruppe
  *wegnimmt*, fühlt sich neu an, ohne neues Material
- **Richtung und Dichte** — von unten, von zwei Seiten, geballt statt verteilt
- **Takt** — auf dem Puls statt frei. Verändert das Reden mehr als jede neue
  Kreatur
- **Modifikatoren** — Echo, Störung, Tarnung, Rückwärtswelle, Countdown,
  umgekehrte Anweisungen. Jeder verwandelt eine bekannte Welle vollständig,
  ohne dass eine Kreatur gezeichnet werden muss

### 8.3 Die zwei Filter

- **Wellentest:** Jede Welle muss sich in einem Satz benennen lassen — „die, in
  der man nicht ausweichen darf", „die, in der alles gleichzeitig kommt".
  Wellen ohne solchen Satz sind Streckung und werden gestrichen
- **Kommunikationswert-Test:** Jede neue Kreatur muss mindestens eines leisten:
  neue Information erzeugen, Information unvollständig machen, neues Timing
  verlangen, eine Kurzform ermöglichen, bestehende Information umdeuten,
  Aufmerksamkeit verschieben oder eine nur gemeinsam mögliche Entscheidung
  erzwingen. Mehr Lebenspunkte oder mehr Tempo genügen nicht

Der Wellentest ist strenger, als er klingt. Realistisch trägt er 60–80 Wellen,
nicht 200.

### 8.4 Die zehn Säulen als Aktstruktur

Zehn Kommunikationsdimensionen, zehn Akte zu je zehn Wellen, ein Boss je Akt —
das ergibt hundert Wellen mit einer inhaltlichen statt einer bloß zählenden
Ordnung.

| Akt | Säule | trägt | Boss |
|---|---|---|---|
| 1 | **Raum** | Manta, Wespe, Brocken | Quallenkönigin |
| 2 | **Farbe** | Qualle, Kristall | Wurmbau |
| 3 | **Zeit** | Herzkoralle, Countdown | Polyp — Thema „Der Dirigent" |
| 4 | **Reihenfolge** | Wurm, Schatten, Klammer | Der Chor |
| 5 | **Unsicherheit** | Gewitterwolke, Doppelgänger, Blinde | Tiefenwächter |
| 6 | **Rhythmus** | Flüsterin, Taktbrecher | Das Herz |
| 7 | **Priorität** | Larve, Larvenwolke, Riff | Die Mutter |
| 8 | **Negation** | Tarnung, Egel | Zeichenwal |
| 9 | **Vertrauen** | Echo, Symbiose | Die Echos |
| 10 | **Zukunft** | Leuchtfaden, Nadel | Die Perle |

Das Gefäß bleibt als Finale außerhalb der Zählung.

**Zwei Folgen:** Erstens ist damit entschieden, wo eine neue Kreatur hingehört —
in den Akt ihrer Säule, nicht dorthin, wo gerade Platz ist. Zweitens verschiebt
sich der Tiefenwächter von Akt 4 auf Akt 5.

### 8.5 Aufbau eines Akts

| Wellen im Akt | Funktion |
|---|---|
| 1 | einführen |
| 2–4 | variieren |
| 5–7 | kombinieren |
| 8–9 | umkehren (Modifikator) |
| 10 | Boss |

**Neue Kreaturen nur bis etwa Welle 50.** Danach ausschließlich Neukombination
und Modifikatoren. Genau diese Hälfte trägt lange, weil das Paar dort sein
Repertoire beherrscht und nur noch Ausführung zählt.

### 8.6 Vorgehen

Zuerst die Figurenverwaltung bauen, dann Akt 1–2 füllen. Danach ist alles
Weitere Inhalt statt Code. Nach zwanzig Wellen zeigt sich ehrlich, ob vierzig
Figuren zusammenkommen oder fünfzehn — im zweiten Fall ist das Gerüst nicht
verloren, nur der Umfang kleiner.

---

## 9. Grafik

**Organisch, grazil, neon.** Keine Pixelgrafik, kein Retro.

- Strichstärke 1,2–1,8 px bei 26 px Objektgröße, Innenzeichnung 0,6–0,9 px
- Kein gefüllter Rumpf — dunkle Füllung bei 10–20 % Deckkraft
- Leuchten durch weiche Aura um die Linie, nicht durch dicke Linien
- Objektgröße 20–26 px (bei 11 px bleibt von einer Figur nichts übrig)
- Zwei Akzentfarben plus gedeckte Neutraltöne
- **Vorgerenderte Leuchtsprites statt Live-Weichzeichnung.** Mehrfach-Durchgänge
  für Blur kosten auf mobilen GPUs Bilder pro Sekunde und heizen das Gerät auf
- Linienstärke in Gerätepixeln rechnen; Regler zum Testen
- Jede Kreatur hat eine **Eigenbewegung** unabhängig von der Flugbahn
  (Flügelwellen, Pulsieren, Nachschwingen)
- Zwei Bildschirme, zwei Stimmungen: Pilot wärmer mit Lichthof, Navigator
  kühler mit Rasterlinien

**Lebendigkeit bei 20–26 px** entsteht aus Bewegung mit Überschwingen, nicht
aus Detail: gedämpfte Feder mit Steifigkeit und Dämpfung, Volumen erhalten
(breiter = kürzer), kurzer Trefferstopp, Reaktion proportional zum Anlass.

**SVG ist das Autorenformat, nicht der Zeichenweg.** Aus den Vektorquellen
werden Sprites in mehreren Pixeldichten vorgerendert. Polygonumrisse gehören in
die Logik, nicht in die Grafik — sie sind die Datengrundlage der Zerstörung.

**Die Fiktion begründet die Regeln:** Farbe ist Biolumineszenz. Passende
Munition bringt das Leuchtorgan durch Resonanz zum Zerspringen. Der Brocken ist
unzerstörbar, weil er nicht lebt. Ihr seid eine Blase in einem Ozean voller
Tiere — nicht die Krieger, sondern das Zerbrechliche.

**Die Blase:** verformt sich sichtbar — längt sich beim Schub, kippt und staucht
beim Ausweichen, schwingt nach. Praktischer Nutzen: Spieler 2 erkennt am Kippen
sofort, ob sein Befehl angekommen ist.

---

## 10. Bestiarium

### 10.1 Bestand

| Kreatur | Form | Rolle |
|---|---|---|
| **Manta** | gleitender Rochen, zwei Augen | Farbe treffen |
| **Wespe** | Flügelpaar, gestreifter Leib | Farbe treffen |
| **Brocken** | matt, ohne Leuchten | nur ausweichen (Spiegelbild des Wurms) |
| **Gewitterwolke** | Blitz zeigt kurz den Kern | Farbe ansagen |
| **Qualle** | Schirm mit rotierendem Leuchtring | markieren + Farbe |
| **Wurm** | Segmentkette, Bohrkopf | durchschießen; Ausweichen gesperrt |
| **Kristall** | Facetten, zerbricht in zwei Hälften | schnelles Umschalten |
| **Klaue** | greift und hält fest | drei Ausweichmanöver in Folge |
| **Herzkoralle** | pulsiert im festen Takt | Timing statt Momentansage |
| **Larve** | klein, hilflos | nicht treffen (kostet Punkte) |
| **Egel** | dockt an, sperrt eine Taste | umgekehrte Anweisung |
| **Zeichenrochen** | Muster auf dem Rücken | Tabelle nachschlagen |
| **Leuchtsame** | Kapsel mit Blinkkern | Power-Up |

**Der Wurm im Detail:** Erscheint, dreht sich längs, feuert einen nicht
ausweichbaren Markierungsschuss auf die Blase, **löscht sein eigenes Triebwerk**
(sichtbar), woraufhin die Ausweichpfeile bei Spieler 2 **grau werden**. Danach
hilft nur noch Durchschießen der 5–7 Segmente in abwechselnden Farben.

### 10.2 Neu aufgenommen

| Kreatur | Säule | Beschreibung |
|---|---|---|
| **Leuchtfaden** | Zukunft | Spur der *künftigen* Bewegung; Navigator sieht sie stärker, Pilot die Ist-Position. Erstmals reden beide über eine Zukunft statt über einen Zustand |
| **Der Schatten** | Reihenfolge | Unverwundbar, solange er hinter einer anderen Kreatur liegt. Erzwingt eine geplante Reihenfolge statt einer Reaktion |
| **Die Flüsterin** | Rhythmus | Reagiert nur, wenn beide Eingaben denselben Beat treffen. Macht den Takt zum tragenden System statt zur Komfortfunktion |
| **Der Doppelgänger** | Unsicherheit | Zwei fast gleiche Kreaturen; Pilot erkennt die Form, Navigator das Radarverhalten |
| **Der Blinde** | Unsicherheit | Für einen sichtbar, für den anderen nur als Störung — siehe unten |
| **Die Klammer** | Reihenfolge | Verbindet zwei Kreaturen zu einer gefährlichen Linie; drei Lösungswege, gemeinsame Wahl |
| **Der Taktbrecher** | Rhythmus | Läuft auf einem eigenen Versatz, während der globale Takt stimmt |

**Der Blinde — Störung statt Unsichtbarkeit.** Er erscheint auf dem zweiten
Gerät als Störung an der richtigen Stelle (Rauschen, Verzerrung, Flackern im
Raster), nicht als Nichts. Die Information ist damit unvollständig statt
abwesend, und die Grundregel aus 5.2 bleibt gewahrt: Die Position ist da, nur
nicht lesbar. Der andere Spieler muss daraus eine sehr kurze Beschreibung
machen — genau das ist die Aufgabe. Frühestens Akt 5.

Zwei Anforderungen: Die Störung muss **an der Position** sitzen und mitwandern,
sonst ist sie Dekoration. Und sie muss sich von einem echten
Verbindungsproblem unterscheiden — sonst hält ein Paar beim ersten Auftreten
das Spiel für kaputt.

### 10.3 Geprüft und verworfen

- **Der Spiegel**, **Der Übersetzer** — beruhen darauf, dass dasselbe Objekt
  auf den zwei Geräten verschieden dargestellt wird, ohne dass die Welt das
  erklärt. Reine UI-Verwirrung; bei getrennten Geräten gibt es außerdem keinen
  gemeinsamen Bildschirm, an dem „links" strittig wäre
- **Der Nebler** — verdoppelt die Gewitterwolke
- **Der Resonanzkörper** — jeder Treffer verändert die Nachbarn; kollidiert mit
  der festen Choreografie, weil nach zwei Schüssen keine Ansage mehr gilt
- **Der Schwarmknoten** — gefährlich ab drei Nachbarn; bei 26 px ist „drei oder
  vier?" ein Sehtest, keine Kommunikationsaufgabe

**Verschmolzen:** Brutfaser und Wurzel gehen im **Riff** auf · Der Teiler ist
der **Kristall** · Der Umkehrer ist der **Egel** · Larvenwolke ist eine
Ausbaustufe der **Larve**

**Namenskonflikt:** Das *Echo* (eine Kreatur erscheint bei einem Spieler eine
Sekunde früher) ist etwas anderes als eine Kreatur, die eine Aktion verzögert
wiederholt. Letztere heißt **Nachhall**.

### 10.4 Obergrenze

13 bestehende plus 7 neue sind 20 Typen. Bei 20–26 px Objektgröße und dem
Stilrahmen aus Abschnitt 9 ist das vermutlich die Grenze für eindeutig
unterscheidbare Silhouetten — und mit „neue Kreaturen nur bis Welle 50" ohnehin
gedeckelt.

---

## 11. Bosse

Reihenfolge nach Abschnitt 8.4: Quallenkönigin (10) · Wurmbau (20) · Polyp (30)
· Der Chor (40) · Tiefenwächter (50) · Das Herz (60) · Die Mutter (70) ·
Zeichenwal (80) · Die Echos (90) · Die Perle (100) · Das Gefäß (Finale).

### 11.1 Die Mutter — Reaktion, aber angekündigt

Sie reagiert darauf, was das Paar im Akt vorher zerstört hat, und bringt es
zurück. Damit das keine versteckte Schwierigkeitsanpassung wird, drei
Bedingungen:

1. Die Reaktion bezieht sich auf **Zerstörtes, nicht auf Leistung**. Sie
   reagiert darauf, *was* das Paar getan hat, nie darauf, *wie gut*.
2. Die Zuordnung ist fest und lernbar: Brocken → Ausweichdruck, Manta →
   Farbdruck, verschonte Larven → stärkeres Wachstum. Ein Paar soll seine
   nächste Begegnung vorhersagen können.
3. Die Gesamtschwierigkeit bleibt gleich. Es verschiebt sich, **welche**
   Steuerungsgruppe belastet wird, nicht **wie stark**.

Die Choreografie bleibt damit fest — sie hat nur mehrere ausgeschriebene
Fassungen, zwischen denen das Verhalten des Paars sichtbar wählt.

### 11.2 Das Gefäß

Der Navigator sieht die Zielkombination, der Pilot nur die einzelnen
Ist-Zustände. Damit ist es kein Rechenpuzzle unter Zeitdruck mehr, sondern eine
Ansage unter Zeitdruck.

---

## 12. Technologie

**Empfehlung in einem Satz:** TypeScript, vorerst weiter Canvas 2D, strikt
getrennte deterministische Spiellogik, Netzwerk als verzögertes Lockstep über
Cloudflare Durable Objects — und PixiJS erst dann, wenn Canvas nachweislich
nicht mehr reicht.

| Bereich | Entscheidung | Status |
|---|---|---|
| Sprache | TypeScript | ab sofort |
| Spiellogik | eigener deterministischer Kern, kopflos testbar | ab sofort |
| Darstellung | Canvas 2D mit vorgerenderten Leuchtsprites | bleibt vorerst |
| Physik | eigene gedämpfte Federn, eigene Flugbahnen | ab sofort |
| Zerstörung | Sutherland-Hodgman-Clipping auf Polygonlisten | wenn fällig |
| Netzwerk | verzögertes Lockstep, Inputs mit lokalen Zeitstempeln | Phase 2 |
| Server | Cloudflare Workers + Durable Objects, ein Raum = ein Objekt | Phase 2 |
| Renderer später | PixiJS v8 | nur bei Bedarf |
| Rapier 2D | **nicht** | verworfen |
| Phaser 4 | **nicht** | verworfen |

### 12.1 Warum nicht Phaser 4

Phaser 4.0 erschien im April 2026, 4.2 im Juni 2026 mit Mesh2D,
Stencil-Rendering und Cone Lights; der neue Spine-Renderer folgte im Juli.
Phaser bewirbt sich ausdrücklich als KI-tauglich und liefert 28 offizielle
Skill-Dateien für Coding-Agenten sowie einen MCP-Server im Editor v5.

Das ist der einzige Punkt, an dem Phaser vorne liegt — und er wiegt weniger,
als er klingt. **Diese Spezifikation neutralisiert genau die Stärken, für die
man Phaser wählt:**

- Eigene deterministische Logik — Phasers Update-Schleife und Physik also gerade
  nicht
- Vorgerenderte Leuchtsprites — Filter, Lichter und Live-Glow werden nicht
  gebraucht
- Eigene Verformung und Splitterbewegung — selbst geschrieben

Übrig bliebe schnelles Zeichnen getönter Sprites. Dafür ist Phasers Voll-Build
(rund 345 KB minifiziert und gzip-komprimiert) teuer bezahlt. Der KI-Vorteil
greift außerdem an der falschen Stelle: Die Skills helfen beim Schreiben von
Phaser-Code. Die schweren Teile hier sind Determinismus, Taktbewertung und
Zeitsynchronisation — dabei hilft kein Framework-Wissen.

### 12.2 Warum kein Rapier

Rapier 2D bringt Vorteile bei stapelnden, kollidierenden Körpern. Hier sind es
40 Splitter und 12 Trümmer mit kurzer Lebensdauer. Dafür kostet die WASM-Datei
rund 1 MB und einen asynchronen Ladeschritt auf Mobilgeräten. Eigene
Splitterbewegung (Geschwindigkeit, Drehung, Dämpfung, grobe Kreiskollision)
reicht, bleibt deterministisch und lädt sofort.

### 12.3 Netzwerk und Takt

**Modell:** Kein server-autoritatives Vollmodell. Zwei kooperierende Spieler
ohne Wettbewerbsanreiz brauchen das nicht. Stattdessen **verzögertes Lockstep**:
Beide Geräte tauschen nur Eingaben aus und rechnen dieselbe deterministische
Simulation. Eigene Eingaben werden um wenige Bilder verzögert wirksam, damit
die Gegenseite rechtzeitig ankommt.

**Der Zeitstempel entsteht beim Berühren des Bildschirms**, nicht beim
Eintreffen auf dem Server. Sonst wird bestraft, wer die schlechtere Verbindung
hat, und belohnt, wer zu früh drückt — bei einem Spiel, dessen Kern ein
gemeinsamer Takt ist, wäre das tödlich.

**Uhrenabgleich:** Vier Zeitstempel je Messung (Client sendet, Server empfängt,
Server sendet, Client empfängt), Versatz und Umlaufzeit daraus berechnen,
mehrfach messen, Median nehmen. Die Systemuhr des Geräts wird nie angefasst —
nur die Spielzeit. Der Versatz wird regelmäßig nachgeführt und **sanft**
korrigiert, nie sprunghaft, sonst springt der Takt.

**Takt-Nullpunkt:** Ein gemeinsamer Startzeitpunkt in der abgeglichenen Zeit.
Beide Geräte rechnen den aktuellen Schlag selbst aus. Bei 100 Schlägen pro
Minute sind das 600 ms je Schlag — das Sync-Fenster „derselbe Schlag" ist damit
großzügig genug für Mobilfunk-Schwankungen.

**Fallstrick:** Der Vier-Zeitstempel-Abgleich nimmt an, dass Hin- und Rückweg
gleich lang sind. Im Mobilfunk stimmt das oft nicht. Also mehr Messungen
mitteln und das Bewertungsfenster eher großzügig wählen.

**Server:** Ein Durable Object je Raum, WebSocket, Hibernation-API. Es leitet
Eingaben weiter, verteilt den Takt-Nullpunkt und beantwortet Uhrenabgleiche —
mehr nicht. Im Hobbybetrieb liegt das im kostenlosen Kontingent (100.000
Anfragen pro Tag; eingehende WebSocket-Nachrichten zählen 20:1). Colyseus wäre
schneller aufgesetzt, kostet aber ab 15 $/Monat und ist auf server-autoritative
Zustandssynchronisation ausgelegt — also auf das Modell, das hier nicht
gebraucht wird.

### 12.4 Wann PixiJS fällig wird

Die Zeichenschicht wird erst migriert, wenn eines davon eintritt:

- Canvas 2D fällt auf den Zielgeräten unter stabile 60 Bilder/s, **obwohl**
  bereits vorgerenderte Sprites verwendet werden
- Deutlich mehr gleichzeitige Objekte als die vorgesehenen ~52
- Additives Mischen vieler Sprites wird in Canvas umständlich oder langsam
- Verformung zur Laufzeit statt vieler vorgerenderter Stufen wird gebraucht

Weil die Logik getrennt ist, betrifft der Wechsel dann nur `render/`.

---

## 13. Umsetzung mit Claude Code

### 13.1 Der Agent braucht etwas, woran er sich selbst prüfen kann

Claude Code hört auf, wenn die Arbeit fertig *aussieht*. Ohne eine Prüfung, die
es selbst ausführen kann, seid ihr die Prüfschleife — jeder Fehler wartet
darauf, dass ihr ihn bemerkt. Bei einem Spiel ist das besonders heikel: Ob sich
eine Blase richtig anfühlt, sieht man nur am Bildschirm.

**Deshalb ist die Trennung von Logik und Darstellung keine Architektur-Kosmetik,
sondern die Voraussetzung dafür, dass ein Agent sinnvoll arbeiten kann.** Eine
kopflos laufende, deterministische Simulation lässt sich testen:

- **Wiedergabetests:** Eine Datei mit Eingaben und Zeitstempeln, ein erwarteter
  Endzustand. Dieselbe Eingabefolge muss zweimal dasselbe ergeben
- **Determinismustest:** Simulation zweimal parallel rechnen, Zustände
  vergleichen. Bricht der Determinismus, bricht das Lockstep — dieser Test ist
  die wichtigste Absicherung des Projekts
- **Wellentests:** Eine Welle kopflos durchrechnen und prüfen, dass jede
  Kreatur mit Ansagebedarf die geforderten 4 s bis zum Einschlag hat

Alles, was nur am Bildschirm zu beurteilen ist — Game Feel, Leuchten, Timing im
Gefühl —, bleibt eure Aufgabe. Das ist die richtige Arbeitsteilung.

### 13.2 Aufbau des Projekts

```
src/
  sim/          deterministische Logik, kennt kein Canvas
  render/       zeichnet den Zustand, ändert ihn nie
  net/          Lockstep, Uhrenabgleich
  content/      Figuren, Wellen, Akte als Daten
test/
  replays/      Eingabefolgen mit erwartetem Endzustand
tools/
  director/     Director Mode
```

Die Regel, die in CLAUDE.md gehört: **`sim/` darf nichts aus `render/`
importieren, und nichts in `sim/` darf `Math.random`, `Date.now` oder
`performance.now` benutzen.** Zufall kommt aus einem gesetzten Startwert, Zeit
aus dem Simulationstakt. Das ist die Bedingung für Determinismus — und die Art
Regel, die ein Agent ohne ausdrückliche Ansage verletzt.

### 13.3 Konfiguration

- **CLAUDE.md** wird bei jeder Sitzung geladen und bleibt deshalb kurz: die
  Importregel oben, die Testbefehle, die Werte-Konventionen. Was zu lang wird,
  wird ignoriert
- **Skills** (`.claude/skills/`) für das, was nur manchmal gebraucht wird: eine
  Skill „neue Kreatur" mit dem vollständigen Ablauf (Eintrag in der
  Steuerungssichtbarkeits-Tabelle, Zustandsautomat, Parameter, Vorschau,
  Wiedergabetest), eine Skill „neue Welle" mit dem Ein-Satz-Test
- **Hooks** für das, was ausnahmslos passieren muss: der Determinismustest nach
  jeder Änderung in `sim/`. Eine Regel in CLAUDE.md ist ein Hinweis, ein Hook
  ist verbindlich
- **Plan-Modus** passt zur Arbeitsweise (Abschnitt 18): erst lesen und planen
  lassen, Plan prüfen, dann umsetzen
- **Unteragenten** für Recherche im eigenen Code, damit die Hauptsitzung nicht
  mit Dateiinhalten volläuft

### 13.4 Parameter statt Zurufe

Nicht „mach die Blase weicher", sondern benannte Werte — Steifigkeit, Dämpfung,
Längung, Schlingern, Rückstellung — und ein Vergleichsbildschirm, auf dem
mehrere Fassungen mit **identischer** Eingabe nebeneinander laufen. Der Agent
erzeugt Varianten; die Auswahl trefft ihr.

### 13.5 Director Mode

Welle wählen, einzelne Kreatur erzeugen, Tempo 0–300 %, Einzelschritt, Takt
anzeigen, Trefferflächen anzeigen, Verzögerung und Paketverlust simulieren,
Aufzeichnung. Er ist nicht nur euer Werkzeug, sondern die Oberfläche, über die
ein Agent Zustände reproduzierbar herstellt. **Die Aufzeichnung ist gleichzeitig
das Format der Wiedergabetests** — was ihr von Hand spielt, wird zum Testfall.

### 13.6 Reihenfolge

1. **Umbau auf TypeScript, Trennung `sim`/`render`.** Spielregeln unverändert
   lassen — es geht nur um die Struktur. Danach erste Wiedergabetests
2. **Eigene Physik** (Federn, Verformung, Flugbahnen) mit Reglern
3. **Netzwerk:** Durable Object, Uhrenabgleich, Lockstep, Bewertung nach
   lokalem Zeitstempel. Latenz und Schwankung zwischen zwei echten Geräten über
   Mobilfunk messen, daraus das Verzögerungsfenster ableiten
4. **Figurenverwaltung und Akt 1–2**
5. **Organische Darstellung und Zerstörung**
6. Renderer-Migration nur nach 12.4

Schritt 3 vor Schritt 4: Wenn das Timing-Modell nicht trägt, ist jeder Inhalt,
der darauf aufbaut, umsonst gebaut.

---

## 14. Stand der Prototypen

Es gibt **zwei lauffähige Prototypen**, je eine HTML-Datei, Canvas 2D, keine
Bibliotheken. Sie stehen nebeneinander zum Vergleich, nicht in Ablösung.

### 14.1 `signal-bloom-prototyp.html` — Freiflug

**Drin:** Hochformat, organischer Neon-Look (Manta und Qualle als
Silhouetten mit Flug-Eigenleben, Bernstein-Blase als Schiff), Zielen, Schub,
Sync-Ausweichen, Rammangriff mit Kurvenflug, bleibende Narben, Meteoriten mit
Einschusslöchern (Größe bleibt, unzerstörbar), Wellen 1–10 choreografiert plus
Fortsetzung, Steuerungssichtbarkeit (Prinzip A), reproduzierbare Wellen über
einen gesetzten Zufallsgenerator, Hilfsmechanik „Wache halten", Pause,
Wellensprung ±1/±5 im Spiel, Tastatursteuerung, rund 20 Regler.

**Nicht drin:** Blasen-Munition, Zwei-Geräte-Betrieb, Ton, Markieren, Waffen,
Power-Ups, Radar, weitere Kreaturen, Bosse, Peilungswellen.

**Aktuelle Werte:** Schussgeschwindigkeit 460 px/s, Gegnertempo 42 px/s,
Sync-Fenster 250 ms, Feuertakt 170 ms, Wache 45 % Tempo.

### 14.2 `signal-bloom-raster.html` — Raster und Takt

Zweck: die Taktmechanik prüfen. Verhalten vollständig in Abschnitt 5.8,
Steuerung in 2.2.

**Drin:** 11×15-Raster, 96 BPM, gleichmäßig gleitende Kreaturen (eine Kachel
pro Schlag), feststehende Hülle über die volle Breite mit spaltenweisem
Schadensbild, frei verschiebbare Kanone mit senkrechtem Schuss, Schild mit
getrennter Zuständigkeit (Spieler 2 verschiebt, Spieler 1 löst aus), sichtbare
Abwehr mit Abpraller und Druckwelle, Abwehrbilanz, Radar nur am Rand, Wellen
1–10 auf die neue Mechanik umgeschrieben plus reproduzierbare Fortsetzung,
Pause, Wellensprung, Tastatursteuerung, Regler für Tempo, Raster, Fenster.

**Nicht drin:** Zwei-Geräte-Betrieb, Ton, Hilfsmechaniken, weitere Kreaturen,
Bosse, Markieren, Waffen, Power-Ups.

**Aktuelle Werte:** 96 BPM (0,625 s/Schlag), Schild-Hüpfdauer 130 ms,
Abwehr-Fenster 260 ms, Schuss 12 Kacheln/Schlag, Feuerpause 0,5 Schläge,
Radar-Vorlauf 4 Schläge.

### 14.3 Konvention zum Vergleich

Gilt für das Freiflug-Modell. **Konvention aus Asteroids-Klonen:** Geschosse 300 px/s,
Reibung so, dass sich das Tempo in ca. 1,1 s halbiert. Eure Reibung ist etwa
zehnmal stärker — das Schiff stoppt fast sofort statt auszurollen. Testbereich
für Blasen: 180–260 px/s.

---

## 15. Offene Fragen

### 15.1 Gestaltung

1. **Ton der Fiktion:** Aus „Kampf gegen eine Flotte" ist „Begegnung mit einem
   Ökosystem" geworden. Passt dazu noch Highscore-Jagd?
2. **Narben auf einer Membran:** Eine Blase mit Kratzern ergibt wenig Sinn.
   Dellen und Trübungen? Oder wird aus der Blase eine gepanzerte Kanzel mit
   Energiehülle?
3. **Rollentausch:** Bei zwei Geräten gibt es keine Bildschirmseiten zu
   tauschen — es würden andere Bedienelemente auf dem eigenen Gerät erscheinen.
   Als Wiederspielanreiz nach einem Durchlauf unproblematisch; mitten im Level
   fraglich.
4. **Aufladen vs. Ausweichen:** Wer lädt, hat den Daumen belegt. In
   Brocken-Wellen wäre Aufladen damit unmöglich.
5. **Larve statt Rettungskapsel:** Ein hilfloses Jungtier nicht abzuschießen ist
   stärker, aber unangenehmer. Gewollt?
6. **Zündschloss-Mechanik** (dreistelligen Code ansagen) braucht mit
   Verzögerung ca. 6 s. Auf zwei Stellen kürzen?
7. **Nebelschiff/Gewitterwolke** ist stilistisch ein Fremdkörper — gewollt,
   weil sie sich versteckt?
8. **Brocken ohne Eigenleuchten** könnten im Neonbild untergehen.
9. **Schwarmverhalten vs. Choreografie:** Lose Schwärme widersprechen der
   festen Choreografie. Kompromiss: Startposition und Anzahl fest, Verhalten
   danach lose.

### 15.2 Aus den letzten Runden

10. Wie unterscheidet sich die Störung des Blinden sichtbar von einem echten
    Verbindungsabbruch? Betrifft auch die allgemeine Netzanzeige, die es noch
    nicht gibt.
11. Zählt eine Welle mit Modifikator als eigene Welle oder als Variante?
    Betrifft die Nummerierung und damit die Speicherpunkte.
12. Dürfen zwei Hilfsformen gleichzeitig laufen? Sicht teilen kostet keinen
    Daumen, Wache halten schon. Vorschlag: höchstens eine haltende Form.
13. Verlangsamt die Wache auch Kreaturen im Rammangriff? Die Markierung
    erlischt dort laut Abschnitt 3 — die Wache wäre dann wertlos, wenn sie am
    dringendsten gebraucht wird.
14. **Vertrauensmodus** (Informationen absichtlich nur indirekt geben) —
    zurückgestellt, überschneidet sich stark mit Akt 9.

### 15.3 Aus der Raster-Runde

15. **Welches Steuerungsmodell wird das Spiel?** Freiflug (2.1) oder Raster
    (2.2)? Das ist die größte offene Entscheidung und blockiert einiges: Akt-
    struktur, Bestiarium und Hilfsmechaniken sind für den Freiflug entworfen.
    Vorschlag: erst zu zweit beide spielen, dann entscheiden — vorher lohnt
    kein weiterer Ausbau in eine der beiden Richtungen.
16. **Ist die geteilte Abwehr fair verteilt?** Spieler 2 stellt räumlich ein,
    Spieler 1 trifft zeitlich. Timing unter Sprachverzögerung ist die härtere
    Aufgabe — Spieler 1 trägt damit die undankbarere Hälfte. Prüfen, ob das im
    Spiel als ungleich empfunden wird, und ob die Rollen zwischen Akten
    tauschen sollten.
17. **Bleibt die Hülle stumm?** Sie ist jetzt das einzige Element, das gar
    nicht bedient wird. Das ist ruhig und lesbar, aber sie könnte auch etwas
    beitragen (Reparatur? Segmente abschalten?). Bewusst offen gelassen, statt
    voreilig zu füllen.
18. **Fenstergröße der Auslösung.** Der Prototyp läuft mit **600 ms**
    (`CFG.guardWindow`); die früher hier genannten 260 ms waren geraten und
    standen nie im Code. Zu zweit mit Sprachverzögerung messen — die Zahl
    entscheidet, ob die Mechanik sich präzise oder gemein anfühlt.

### 15.4 Erledigt

- **Netzwerkmodell** → Abschnitt 12.3 (verzögertes Lockstep, lokale
  Zeitstempel, Durable Objects)
- **Leerlauf-Tippen** → Abschnitt 6 (Reserve, an die Zeitlupe gekoppelt)
- **Boss „Das Gefäß" als Rechenaufgabe** → Abschnitt 11.2 (Umdeutung zur
  Ansage)
- **Zufallsregel im Prototyp** → beide Prototypen ziehen Wellen aus einem mit
  dem Wellenindex gesetzten Generator: gleiche Welle, gleicher Ablauf. Zufällig
  bleibt nur, was der eine weiß und der andere nicht (Abschnitt 7.3)
- **Eine Hilfsmechanik gebaut** → „Wache halten" im Freiflug-Prototyp,
  inklusive sichtbarem Preis (Abschnitt 6.1)

---

## 16. Der Name

Kandidaten (englisch, organisch): **SIGNAL BLOOM** (Empfehlung — trägt beide
Themen, auffindbar), **BLOOM** (schöner, vermutlich vergeben), LUMEN, SOFT
SHELL, MEMBRANE, DRIFT BLOOM, THE QUIET DEEP, TWO LIGHTS.

Vor der Festlegung: App-Store-Suche und Markenrecherche.

---

## 17. Ideenspeicher

**Angenommen, noch nicht ausgearbeitet:**
Echo (eine Kreatur erscheint bei einem Spieler 1 s früher) · Nachhall
(wiederholt eine Aktion verzögert) · Störung (bei einem Spieler sind die Farben
vertauscht, er weiß es nicht) · Countdown-Kreatur (Treffer nur bei Null) ·
Rückwärtswelle (von unten) · Häutung · Symbiose (nur verwundbar, solange die
beiden weit auseinander sind) · Tarnung (erlischt beim Anvisieren — man muss
danebenzielen) · Das Riff (wuchert, brütet Wespen aus; enthält Brutfaser und
Wurzel) · Leuchtspuren · Peilungswellen (Koordinatennetz, Steuerungswechsel) ·
Codebuch-Tabelle · umgekehrte Anweisungen (Spaceteam-Prinzip) · Die Nadel
(geometrischer Korridor)

**Bewusst zurückgestellt:**
Risse im Cockpit (Abwärtsspirale) · Frachter (überschneidet sich mit der Larve)
· Kettenreaktion (überschneidet sich mit Peilungswellen) · Streuschuss (zu nah
am Standard) · Sprachkanal im Spiel (bleibt extern) · „Ohne Worte"-Modus (als
Selbstverpflichtung möglich, aber nie messbar — siehe 1.2)

---

## 18. Arbeitsweise

- **Nicht bauen ohne ausdrückliche Aufforderung.** Standard ist Spec-Modus:
  Ideen sammeln, Entscheidungen festhalten, kein Code.
- Änderungswünsche bündeln statt einzeln nachreichen.
- Beim Bauen: nur geänderte Stellen anfassen, nicht die ganze Datei neu
  erzeugen.
- Für den ersten spielbaren organischen Stand reichen: Manta, Wespe, Brocken,
  die Blase, Blasen-Munition, Wellen 1–9. Alles andere ist Ausbau.

---

## 19. Weitere Dateien

- `spec-wellen-und-bosse.md` — Wellen 11–20, erste Bosse, Delay-Rechnung
- `spec-teil-2-zerstoerung-lanze-waffen.md` — Zerstörung, Wurm, Waffen,
  Peilungswellen
- `spec-teil-3-mechaniken-bosse.md` — Anker, Blackout, Echo, weitere Bosse
- `spec-teil-4-rhythmus-stil-bosse.md` — Takt, Formensprache, Metronom, Kugel
- `spec-teil-5-organischer-umbau.md` — Kreaturen, Blasen, Das Gefäß, Namen
- `stilblatt-flotte.svg`, `neon-varianten-2.svg` — Grafikentwürfe
- `signal-bloom-prototyp.html` — spielbarer Prototyp, Freiflug (Abschnitt 14.1)
- `signal-bloom-raster.html` — spielbarer Prototyp, Raster und Takt (Abschnitt 14.2)

**Aufgegangen in diesem Dokument (können archiviert werden):**
`UEBERGABE-signal-bloom.md` · `spec-teil-6-hilfe-wellenaufbau-speichern.md` ·
`spec-teil-7-pruefung-deep-review.md` ·
`spec-teil-8-technik-und-claude-code.md` · `SIGNAL-BLOOM-DEEP-REVIEW-1.md`

---

## 20. Unsicheres in den Technikangaben

- Die genaue gzip-Größe eines zugeschnittenen PixiJS-Bündels ließ sich nicht
  belegen — nur, dass PixiJS v8 sich beim Bauen ausdünnen lässt
- Konkrete Verzögerungswerte fürs Lockstep sind Richtwerte aus anderen Genres.
  Ohne eigene Messung zwischen euren beiden Geräten nicht festlegbar
- Die AI-Integration in Phaser Editor v5 bezeichnet Phaser selbst als
  experimentell
- Preise (Cloudflare, Colyseus) Stand August 2026
