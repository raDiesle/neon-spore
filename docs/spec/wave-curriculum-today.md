# The waves today, measured

> **Status: a measurement of 2026-10-18**, the evidence for
> `wave-curriculum.md`. Written by `bun run waves:measure`
> (`tools/probe/measure-waves.ts`) — run it again rather than editing a
> number here.

**How it was read.** *Kind* and *New* are content's own answers —
`isRegularWave` and `waveIntroduces` (`packages/content/src/wave-regular.ts`).
*Block* is the wave that brought the block's new body or pod.
*Span* is the beat of the last authored arrival. *AUTO beats* is the beat
the field was clear, with AUTO playing both seats — perfect hands, no
talking, so a lower bound on what a pair needs; *AUTO fails* means it lost
the wave. *A pair, about* is AUTO's seconds × 2, the owner's accepted
guess. *Pressure* is `wavePressure`
(`packages/content/src/wave-pressure.ts`); a boss wave has none.

## The whole game

| Kind | Waves | AUTO fails | Shortest (s) | Median (s) | Longest (s) | AUTO, all of them | A pair, about |
|---|---|---|---|---|---|---|---|
| regular | 464 | 0 | 14 | 27 | 67 | 3 h 40 min | 7 h 20 min |
| intro | 63 | 0 | 3 | 27 | 51 | 29 min | 59 min |
| boss | 60 | 0 | 9 | 31 | 343 | 50 min | 1 h 41 min |
| every wave | 587 | 0 | 3 | 28 | 343 | 4 h 60 min | 9 h 60 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 64 | 67 | 42 | 84 | 2.4 |
| 2 | FIRST RED | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | RED WANDERER | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | RED TANGO | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 41 | 44 | 28 | 56 | 5.4 |
| 5 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 4 | 24 | 27 | 17 | 34 | 1.4 |
| 6 | CYAN AWAKENS | **regular** | CYAN | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 2.6 |
| 7 | CYAN PICNIC | **regular** | CYAN | — | STANDARD 2 | 7 | 36 | 39 | 24 | 48 | 3.4 |
| 8 | CYAN RAPTURE | **regular** | CYAN | — | STANDARD 2 | 8 | 42 | 45 | 28 | 56 | 4.6 |
| 9 | THE BROOD | boss | CYAN | brood | STANDARD 2 | 0 | 0 | 40 | 25 | 50 | — |
| 10 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 35 | 22 | 44 | 1.4 |
| 11 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 45 | 28 | 56 | 2.6 |
| 12 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 50 | 31 | 62 | 3.8 |
| 13 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 45 | 28 | 56 | 5 |
| 14 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 17 | 11 | 22 | 5.8 |
| 15 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 25 | 16 | 32 | 10.8 |
| 16 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 22 | 25 | 16 | 32 | 3.3 |
| 17 | HELLO TORCH | **regular** | TORCH | — | STANDARD 4 | 5 | 25 | 28 | 18 | 36 | 3.6 |
| 18 | TORCH AT WORLD END | **regular** | TORCH | — | STANDARD 4 | 6 | 28 | 31 | 19 | 38 | 5.7 |
| 19 | TORCH ALLIANCE | **regular** | TORCH | — | STANDARD 4 | 8 | 37 | 52 | 33 | 66 | 6.7 |
| 20 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 21 | TAP | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 22 | TAP DAWN | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 23 | TAP PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 26 | 30 | 19 | 38 | 6 |
| 24 | TAP TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 35 | 38 | 24 | 48 | 7 |
| 25 | HOLD | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 26 | HOLD AWAKENS | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 30 | 34 | 21 | 42 | 3.9 |
| 27 | HOLD PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 27 | 31 | 19 | 38 | 6 |
| 28 | HOLD DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 38 | 41 | 26 | 52 | 7 |
| 29 | SWIPE | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 30 | LITTLE SWIPE | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 26 | 30 | 19 | 38 | 3.9 |
| 31 | FAR SWIPE | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 27 | 31 | 19 | 38 | 6 |
| 32 | SWIPE DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 39 | 42 | 26 | 52 | 7 |
| 33 | TURN | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 34 | TURN DAWN | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 35 | TURN VOYAGE | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 32 | 20 | 40 | 6 |
| 36 | TURN TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 35 | 38 | 24 | 48 | 7 |
| 37 | RUB | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 38 | RUB MORNING | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 39 | LONG RUB ROAD | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 32 | 20 | 40 | 6 |
| 40 | RUB DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 36 | 39 | 24 | 48 | 7 |
| 41 | COMBO | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 42 | LITTLE COMBO | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 30 | 34 | 21 | 42 | 3.9 |
| 43 | COMBO PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 26 | 30 | 19 | 38 | 6 |
| 44 | COMBO TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 36 | 39 | 24 | 48 | 7 |
| 45 | LEVER | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 46 | HELLO LEVER | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 32 | 20 | 40 | 3.9 |
| 47 | LEVER HORIZON | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 33 | 21 | 42 | 6 |
| 48 | LEVER PARTY | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 37 | 40 | 25 | 50 | 7 |
| 49 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 50 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 87 | 54 | 108 | — |
| 51 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 52 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 53 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 54 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 37 | 23 | 46 | 5.7 |
| 55 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 56 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 35 | 38 | 24 | 48 | 7 |
| 57 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 38 | 42 | 26 | 52 | 8.2 |
| 58 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 59 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 60 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 61 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 62 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 63 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 17 | 11 | 22 | 2.4 |
| 64 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.6 |
| 65 | FAR HUSK | **regular** | THE HUSK | — | STANDARD 5 | 4 | 28 | 43 | 27 | 54 | 3.2 |
| 66 | HUSK TANGO | **regular** | THE HUSK | — | STANDARD 5 | 4 | 37 | 40 | 25 | 50 | 4 |
| 67 | ANCIENT HUSK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 36 | 39 | 24 | 48 | 6 |
| 68 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 10 | 40 | 44 | 28 | 56 | 8 |
| 69 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 70 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 24 | 15 | 30 | 3.6 |
| 71 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 72 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 73 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 74 | HUSK DREAM | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 2.8 |
| 75 | HUSK HOMECOMING | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 3.8 |
| 76 | HUSK TRICK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 42 | 46 | 29 | 58 | 4.7 |
| 77 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 78 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 35 | 22 | 44 | 3.6 |
| 79 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 46 | 29 | 58 | 3.6 |
| 80 | MORSEL PILGRIM | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 44 | 28 | 56 | 5.7 |
| 81 | MORSEL TANGO | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 43 | 27 | 54 | 6.7 |
| 82 | MORSEL SAGA | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 37 | 54 | 34 | 68 | 8.7 |
| 83 | MORSEL THUNDER | **regular** | THE MORSEL | — | STANDARD 5 | 10 | 47 | 51 | 32 | 64 | 10.7 |
| 84 | SOFT MORSEL | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 34 | 51 | 32 | 64 | 6.2 |
| 85 | MORSEL RELIC | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 35 | 52 | 33 | 66 | 7.2 |
| 86 | MORSEL SPELL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 46 | 63 | 39 | 78 | 8.2 |
| 87 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 88 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD 5 | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 89 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD 5 | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 90 | SEEDER VOYAGE | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 26 | 37 | 23 | 46 | 6 |
| 91 | SEEDER AND MORSEL | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 36 | 53 | 33 | 66 | 7 |
| 92 | SEEDER REUNION | **regular** | THE SEEDER | — | STANDARD 5 | 7 | 35 | 39 | 24 | 48 | 9 |
| 93 | SEEDER THUNDER | **regular** | THE SEEDER | — | STANDARD 5 | 14 | 47 | 57 | 36 | 72 | 11 |
| 94 | SEEDER DREAM | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 95 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD 5 | 7 | 37 | 40 | 25 | 50 | 7.2 |
| 96 | SEEDER ILLUSION | **regular** | THE SEEDER | — | STANDARD 5 | 11 | 47 | 58 | 36 | 72 | 8.2 |
| 97 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 98 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 99 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 28 | 37 | 23 | 46 | 4.2 |
| 100 | LONG LANCE ROAD | **regular** | THE LANCE | — | STANDARD | 6 | 28 | 37 | 23 | 46 | 6.3 |
| 101 | LANCE PARTY | **regular** | THE LANCE | — | STANDARD | 8 | 37 | 54 | 34 | 68 | 7.3 |
| 102 | LANCE REUNION | **regular** | THE LANCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 9.3 |
| 103 | LANCE INFERNO | **regular** | THE LANCE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 11.3 |
| 104 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 105 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 106 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 107 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 28 | 18 | 36 | 3.6 |
| 108 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 39 | 24 | 48 | 3.4 |
| 109 | SLEEPY LANCE | **regular** | THE LANCE | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 6.4 |
| 110 | LANCE RELIC | **regular** | THE LANCE | — | STANDARD | 7 | 36 | 40 | 25 | 50 | 7.4 |
| 111 | LANCE ILLUSION | **regular** | THE LANCE | — | STANDARD | 11 | 46 | 58 | 36 | 72 | 8.4 |
| 112 | THE GEODE | boss | THE LANCE | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 113 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 2.8 |
| 114 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 5 | 27 | 34 | 21 | 42 | 2.8 |
| 115 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 4.8 |
| 116 | CROSSING AND SEEDER | **regular** | THE CROSSING | — | STANDARD | 8 | 35 | 43 | 27 | 54 | 5.9 |
| 117 | OLD CROSSING SONG | **regular** | THE CROSSING | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.9 |
| 118 | CROSSING ECLIPSE | **regular** | THE CROSSING | — | STANDARD | 14 | 47 | 54 | 34 | 68 | 9.9 |
| 119 | SOFT CROSSING | **regular** | THE CROSSING | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 5.2 |
| 120 | CROSSING SAGA | **regular** | THE CROSSING | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 6.2 |
| 121 | CROSSING RIDDLE | **regular** | THE CROSSING | — | STANDARD | 10 | 42 | 46 | 29 | 58 | 7.3 |
| 122 | THE MAZE | boss (special) | THE CROSSING | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 123 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 124 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 125 | BEATBOX VOYAGE | **regular** | THE BEATBOX | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 7.2 |
| 126 | BEATBOX PARTY | **regular** | THE BEATBOX | — | STANDARD | 8 | 40 | 45 | 28 | 56 | 8.1 |
| 127 | BEATBOX LEGEND | **regular** | THE BEATBOX | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 128 | BEATBOX ECLIPSE | **regular** | THE BEATBOX | — | STANDARD | 14 | 48 | 60 | 38 | 76 | 12 |
| 129 | BEATBOX HUSH | **regular** | THE BEATBOX | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 6.5 |
| 130 | BEATBOX SAGA | **regular** | THE BEATBOX | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.5 |
| 131 | CROOKED BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 10 | 43 | 47 | 29 | 58 | 8.5 |
| 132 | THE GAUGE | boss (special) | THE BEATBOX | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 133 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 42 | 44 | 28 | 56 | 3.9 |
| 134 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 135 | WEIGHT AT WORLD END | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 136 | WEIGHT DUET | **regular** | THE WEIGHT | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 8 |
| 137 | OLD WEIGHT SONG | **regular** | THE WEIGHT | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 138 | WEIGHT STORM | **regular** | THE WEIGHT | — | STANDARD | 12 | 47 | 53 | 33 | 66 | 12 |
| 139 | LAZY WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.4 |
| 140 | WEIGHT REUNION | **regular** | THE WEIGHT | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 7.4 |
| 141 | WEIGHT MIRAGE | **regular** | THE WEIGHT | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 8.4 |
| 142 | THE PLUMB | boss | THE WEIGHT | plumb | STANDARD | 0 | 0 | 45 | 28 | 56 | — |
| 143 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 69 | 43 | 86 | 6.6 |
| 144 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 27 | 29 | 18 | 36 | 6.8 |
| 145 | FAR LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 146 | LIMPET DUET | **regular** | THE LIMPET | — | STANDARD | 7 | 36 | 47 | 29 | 58 | 10 |
| 147 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 40 | 57 | 36 | 72 | 12 |
| 148 | LIMPET APOCALYPSE | **regular** | THE LIMPET | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 14 |
| 149 | LAZY LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 6.9 |
| 150 | LIMPET SAGA | **regular** | THE LIMPET | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 7.9 |
| 151 | LIMPET TRICK | **regular** | THE LIMPET | — | STANDARD | 11 | 43 | 45 | 28 | 56 | 8.9 |
| 152 | THE FLEET | boss (special) | THE LIMPET | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 153 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 154 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.7 |
| 155 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 32 | 47 | 29 | 58 | 6.7 |
| 156 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 157 | HEAVY ROCK SAGA | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 39 | 56 | 35 | 70 | 9.6 |
| 158 | HEAVY ROCK ECLIPSE | **regular** | HEAVY ROCKS | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 11.6 |
| 159 | HEAVY ROCK LULLABY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.3 |
| 160 | HEAVY ROCK LEGEND | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.3 |
| 161 | HEAVY ROCK MIRAGE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.3 |
| 162 | THE HIVE | boss | HEAVY ROCKS | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 163 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 164 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 7.5 |
| 165 | OUTER LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 10 |
| 166 | LEECH DUET | **regular** | THE LEECH | — | STANDARD | 7 | 34 | 38 | 24 | 48 | 10.4 |
| 167 | LEECH SAGA | **regular** | THE LEECH | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 11.2 |
| 168 | LEECH THUNDER | **regular** | THE LEECH | — | STANDARD | 14 | 43 | 47 | 29 | 58 | 12.9 |
| 169 | LEECH DREAM | **regular** | THE LEECH | — | STANDARD | 6 | 38 | 46 | 29 | 58 | 7.6 |
| 170 | OLD LEECH SONG | **regular** | THE LEECH | — | STANDARD | 8 | 38 | 55 | 34 | 68 | 8.6 |
| 171 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 9.6 |
| 172 | THE LAMPREY | boss | THE LEECH | lamprey | STANDARD | 0 | 0 | 132 | 83 | 166 | — |
| 173 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 174 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 4.8 |
| 175 | THROB AT WORLD END | **regular** | THE THROB | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 7.2 |
| 176 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 8 |
| 177 | THROB RELIC | **regular** | THE THROB | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 178 | THROB STORM | **regular** | THE THROB | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 179 | LAZY THROB | **regular** | THE THROB | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 6.7 |
| 180 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 7.7 |
| 181 | CROOKED THROB | **regular** | THE THROB | — | STANDARD | 11 | 44 | 49 | 31 | 62 | 8.7 |
| 182 | SNAKE | boss (special) | THE THROB | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 183 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 184 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 26 | 30 | 19 | 38 | 6.3 |
| 185 | COUNT VOYAGE | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 8.7 |
| 186 | COUNT DUET | **regular** | THE COUNT | — | STANDARD | 8 | 37 | 44 | 28 | 56 | 9.2 |
| 187 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 188 | COUNT APOCALYPSE | **regular** | THE COUNT | — | STANDARD | 14 | 46 | 50 | 31 | 62 | 12 |
| 189 | SLEEPY COUNT | **regular** | THE COUNT | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 6.9 |
| 190 | COUNT SAGA | **regular** | THE COUNT | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 7.9 |
| 191 | COUNT RIDDLE | **regular** | THE COUNT | — | STANDARD | 11 | 47 | 52 | 33 | 66 | 8.9 |
| 192 | THE STARE | boss | THE COUNT | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 193 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 15 | 9 | 18 | 3 |
| 194 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 29 | 34 | 21 | 42 | 6.6 |
| 195 | LONG SHELL ROAD | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 8.4 |
| 196 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 7 | 33 | 36 | 23 | 46 | 8.8 |
| 197 | SHELL SAGA | **regular** | THE SHELL | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 198 | SHELL THUNDER | **regular** | THE SHELL | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 12 |
| 199 | SHELL DREAM | **regular** | THE SHELL | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.8 |
| 200 | ANCIENT SHELL | **regular** | THE SHELL | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.8 |
| 201 | CROOKED SHELL | **regular** | THE SHELL | — | STANDARD | 12 | 46 | 52 | 33 | 66 | 8.8 |
| 202 | THE VISE | boss | THE SHELL | vise | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 203 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 204 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 29 | 34 | 21 | 42 | 6.9 |
| 205 | CHOKE HORIZON | **regular** | THE CHOKE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 7.2 |
| 206 | CHOKE ALLIANCE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 45 | 28 | 56 | 8.1 |
| 207 | CHOKE REUNION | **regular** | THE CHOKE | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 208 | CHOKE THUNDER | **regular** | THE CHOKE | — | STANDARD | 12 | 45 | 62 | 39 | 78 | 12 |
| 209 | CHOKE HUSH | **regular** | THE CHOKE | — | STANDARD | 6 | 36 | 41 | 26 | 52 | 7 |
| 210 | CHOKE RELIC | **regular** | THE CHOKE | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8 |
| 211 | CHOKE ILLUSION | **regular** | THE CHOKE | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 9 |
| 212 | THE WARDEN | boss | THE CHOKE | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 213 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 26 | 16 | 32 | 4.8 |
| 214 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 28 | 33 | 21 | 42 | 6.6 |
| 215 | RIND HORIZON | **regular** | THE RIND | — | STANDARD | 6 | 27 | 32 | 20 | 40 | 8.4 |
| 216 | RIND MEETS SHELL | **regular** | THE RIND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 9.4 |
| 217 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 218 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 12 |
| 219 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 34 | 39 | 24 | 48 | 7 |
| 220 | RIND REUNION | **regular** | THE RIND | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 8 |
| 221 | RIND ILLUSION | **regular** | THE RIND | — | STANDARD | 11 | 44 | 49 | 31 | 62 | 9 |
| 222 | PINBALL | boss (special) | THE RIND | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 223 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 57 | 36 | 72 | 3.6 |
| 224 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 30 | 45 | 28 | 56 | 6.6 |
| 225 | LONG VEER ROAD | **regular** | THE VEER | — | STANDARD | 6 | 27 | 37 | 23 | 46 | 8.7 |
| 226 | VEER MEETS RIND | **regular** | THE VEER | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 9.4 |
| 227 | VEER REUNION | **regular** | THE VEER | — | STANDARD | 7 | 36 | 45 | 28 | 56 | 10 |
| 228 | VEER APOCALYPSE | **regular** | THE VEER | — | STANDARD | 12 | 46 | 49 | 31 | 62 | 12 |
| 229 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 7 | 40 | 48 | 30 | 60 | 6.9 |
| 230 | OLD VEER SONG | **regular** | THE VEER | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 7.9 |
| 231 | VEER MIRAGE | **regular** | THE VEER | — | STANDARD | 11 | 44 | 59 | 37 | 74 | 8.9 |
| 232 | THE SCOUT | boss (special) | THE VEER | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 233 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 234 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 30 | 36 | 23 | 46 | 6.9 |
| 235 | STRAND VOYAGE | **regular** | THE STRAND | — | STANDARD | 4 | 25 | 40 | 25 | 50 | 7.2 |
| 236 | STRAND WALTZ | **regular** | THE STRAND | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8 |
| 237 | ANCIENT STRAND | **regular** | THE STRAND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 238 | STRAND INFERNO | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 12 |
| 239 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 7 |
| 240 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 39 | 56 | 35 | 70 | 8 |
| 241 | CROOKED STRAND | **regular** | THE STRAND | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 9 |
| 242 | THE BATON | boss | THE STRAND | baton | STANDARD | 0 | 0 | 286 | 179 | 358 | — |
| 243 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 244 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 245 | CLAW HORIZON | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 246 | CLAW DUET | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 247 | CLAW HOMECOMING | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 248 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 249 | CLAW PICNIC | **regular** | THE CLAW | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 7 |
| 250 | CLAW LEGEND | **regular** | THE CLAW | — | STANDARD | 8 | 38 | 43 | 27 | 54 | 8 |
| 251 | CLAW PARADOX | **regular** | THE CLAW | — | STANDARD | 11 | 46 | 53 | 33 | 66 | 9 |
| 252 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 253 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 34 | 21 | 42 | 1.5 |
| 254 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 66 | 41 | 82 | 4.5 |
| 255 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 58 | 36 | 72 | 1.5 |
| 256 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 27 | 37 | 23 | 46 | 7.2 |
| 257 | OUTER FENCE | **regular** | THE FENCE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 7.5 |
| 258 | FENCE ALLIANCE | **regular** | THE FENCE | — | STANDARD | 8 | 39 | 49 | 31 | 62 | 7.9 |
| 259 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 7 | 34 | 40 | 25 | 50 | 9.7 |
| 260 | FENCE INFERNO | **regular** | THE FENCE | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 11.7 |
| 261 | FENCE HUSH | **regular** | THE FENCE | — | STANDARD | 6 | 37 | 47 | 29 | 58 | 7.3 |
| 262 | FENCE RELIC | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 57 | 36 | 72 | 8.3 |
| 263 | FENCE TRICK | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 54 | 34 | 68 | 9.3 |
| 264 | THE HAUL | boss (special) | THE FENCE | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 265 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 52 | 55 | 34 | 68 | 4.5 |
| 266 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.5 |
| 267 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 4 | 24 | 34 | 21 | 42 | 8.4 |
| 268 | MAGNET DUET | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 45 | 28 | 56 | 9.3 |
| 269 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 270 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 14 | 47 | 59 | 37 | 74 | 11.9 |
| 271 | MAGNET DREAM | **regular** | THE MAGNET | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.6 |
| 272 | MAGNET HOMECOMING | **regular** | THE MAGNET | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 8.6 |
| 273 | MAGNET ILLUSION | **regular** | THE MAGNET | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 9.6 |
| 274 | THE PULSE | boss (special) | THE MAGNET | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 275 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 276 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 7.8 |
| 277 | CHOIR VOYAGE | **regular** | THE CHOIR | — | STANDARD | 4 | 24 | 27 | 17 | 34 | 8.1 |
| 278 | CHOIR AND MAGNET | **regular** | THE CHOIR | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.7 |
| 279 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 280 | CHOIR RAPTURE | **regular** | THE CHOIR | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 281 | CHOIR DREAM | **regular** | THE CHOIR | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 7.9 |
| 282 | CHOIR REUNION | **regular** | THE CHOIR | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 8.9 |
| 283 | CHOIR MIRAGE | **regular** | THE CHOIR | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 9.9 |
| 284 | THE GORGE | boss | THE CHOIR | gorge | STANDARD | 10 | 82 | 259 | 162 | 324 | — |
| 285 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 286 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 27 | 36 | 23 | 46 | 8.7 |
| 287 | LONG DARK ROAD | **regular** | THE DARK | — | STANDARD | 4 | 24 | 27 | 17 | 34 | 9.5 |
| 288 | DARK ALLIANCE | **regular** | THE DARK | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 10.1 |
| 289 | DARK LEGEND | **regular** | THE DARK | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 12 |
| 290 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 14.1 |
| 291 | SLEEPY DARK | **regular** | THE DARK | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.8 |
| 292 | DARK REUNION | **regular** | THE DARK | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.8 |
| 293 | DARK RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.8 |
| 294 | THE CURTAIN | boss | THE DARK | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 295 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 75 | 47 | 94 | 4.5 |
| 296 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 5 | 29 | 60 | 38 | 76 | 8.1 |
| 297 | BALLOON VOYAGE | **regular** | THE BALLOON | — | STANDARD | 4 | 25 | 50 | 31 | 62 | 8.7 |
| 298 | BALLOON ALLIANCE | **regular** | THE BALLOON | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.1 |
| 299 | BALLOON LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 61 | 38 | 76 | 10 |
| 300 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 61 | 38 | 76 | 12 |
| 301 | SOFT BALLOON | **regular** | THE BALLOON | — | STANDARD | 7 | 40 | 49 | 31 | 62 | 8.2 |
| 302 | BALLOON RELIC | **regular** | THE BALLOON | — | STANDARD | 7 | 36 | 59 | 37 | 74 | 9.2 |
| 303 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 45 | 74 | 46 | 92 | 10.2 |
| 304 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 305 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 306 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 8.4 |
| 307 | FAR MOULT | **regular** | THE MOULT | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 9.3 |
| 308 | MOULT WALTZ | **regular** | THE MOULT | — | STANDARD | 7 | 38 | 67 | 42 | 84 | 9.7 |
| 309 | MOULT RELIC | **regular** | THE MOULT | — | STANDARD | 7 | 36 | 77 | 48 | 96 | 10 |
| 310 | MOULT ECLIPSE | **regular** | THE MOULT | — | STANDARD | 12 | 47 | 73 | 46 | 92 | 12 |
| 311 | MOULT PICNIC | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 52 | 33 | 66 | 8.5 |
| 312 | MOULT SAGA | **regular** | THE MOULT | — | STANDARD | 10 | 40 | 77 | 48 | 96 | 9.5 |
| 313 | MOULT RIDDLE | **regular** | THE MOULT | — | STANDARD | 12 | 46 | 97 | 61 | 122 | 10.5 |
| 314 | THE CHRYSALIS | boss | THE MOULT | chrysalis | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 315 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 5.6 |
| 316 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 6 |
| 317 | OUTER COIL | **regular** | THE COIL | — | STANDARD | 4 | 26 | 87 | 54 | 108 | 7.2 |
| 318 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 39 | 57 | 36 | 72 | 7.7 |
| 319 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 8 |
| 320 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 321 | SOFT COIL | **regular** | THE COIL | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 6.9 |
| 322 | COIL REUNION | **regular** | THE COIL | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.9 |
| 323 | COIL RIDDLE | **regular** | THE COIL | — | STANDARD | 12 | 45 | 107 | 67 | 134 | 8.9 |
| 324 | THE TASTER | boss | THE COIL | taster | STANDARD | 10 | 80 | 44 | 28 | 56 | — |
| 325 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.4 |
| 326 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 25 | 67 | 42 | 84 | 9.8 |
| 327 | CODEX AT WORLD END | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 11.9 |
| 328 | CODEX TANGO | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 87 | 54 | 108 | 12.9 |
| 329 | CODEX LEGEND | **regular** | THE CODEX | — | STANDARD | 8 | 37 | 42 | 26 | 52 | 14.9 |
| 330 | CODEX OVERDRIVE | **regular** | THE CODEX | — | STANDARD | 14 | 48 | 97 | 61 | 122 | 16.9 |
| 331 | CODEX HUSH | **regular** | THE CODEX | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 10 |
| 332 | CODEX RELIC | **regular** | THE CODEX | — | STANDARD | 8 | 37 | 52 | 33 | 66 | 11 |
| 333 | CODEX SPELL | **regular** | THE CODEX | — | STANDARD | 12 | 47 | 97 | 61 | 122 | 12 |
| 334 | THE LEDGER | boss | THE CODEX | ledger | STANDARD | 8 | 82 | 33 | 21 | 42 | — |
| 335 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 40 | 47 | 29 | 58 | 3.9 |
| 336 | LURE RISING | **regular** | THE LURE | — | STANDARD | 5 | 27 | 42 | 26 | 52 | 6.3 |
| 337 | OUTER LURE | **regular** | THE LURE | — | STANDARD | 6 | 30 | 45 | 28 | 56 | 8.1 |
| 338 | LURE AND COIL | **regular** | THE LURE | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9 |
| 339 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 7 | 36 | 46 | 29 | 58 | 10 |
| 340 | LURE INFERNO | **regular** | THE LURE | — | STANDARD | 12 | 45 | 53 | 33 | 66 | 12 |
| 341 | LURE HUSH | **regular** | THE LURE | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.9 |
| 342 | OLD LURE SONG | **regular** | THE LURE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.8 |
| 343 | LURE PARADOX | **regular** | THE LURE | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 8.8 |
| 344 | THE SURGE | boss | THE LURE | surge | STANDARD | 8 | 76 | 45 | 28 | 56 | — |
| 345 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 77 | 48 | 96 | 6.8 |
| 346 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 30 | 45 | 28 | 56 | 9.8 |
| 347 | FAR JAM | **regular** | THE JAM | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 11.9 |
| 348 | JAM DUET | **regular** | THE JAM | — | STANDARD | 10 | 40 | 49 | 31 | 62 | 12.9 |
| 349 | OLD JAM SONG | **regular** | THE JAM | — | STANDARD | 8 | 35 | 45 | 28 | 56 | 15 |
| 350 | JAM OVERDRIVE | **regular** | THE JAM | — | STANDARD | 14 | 48 | 63 | 39 | 78 | 17 |
| 351 | LAZY JAM | **regular** | THE JAM | — | STANDARD | 6 | 36 | 46 | 29 | 58 | 10 |
| 352 | JAM SAGA | **regular** | THE JAM | — | STANDARD | 10 | 40 | 52 | 33 | 66 | 11 |
| 353 | JAM ILLUSION | **regular** | THE JAM | — | STANDARD | 12 | 48 | 57 | 36 | 72 | 12 |
| 354 | THE LEAD | boss | THE JAM | lead | STANDARD | 8 | 84 | 41 | 26 | 52 | — |
| 355 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 356 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 6.5 |
| 357 | CLASP AT WORLD END | **regular** | THE CLASP | — | STANDARD | 4 | 25 | 40 | 25 | 50 | 8.4 |
| 358 | CLASP WALTZ | **regular** | THE CLASP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.3 |
| 359 | CLASP HOMECOMING | **regular** | THE CLASP | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 360 | CLASP RAPTURE | **regular** | THE CLASP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 361 | CLASP PICNIC | **regular** | THE CLASP | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 6.9 |
| 362 | CLASP REUNION | **regular** | THE CLASP | — | STANDARD | 8 | 35 | 45 | 28 | 56 | 7.8 |
| 363 | CROOKED CLASP | **regular** | THE CLASP | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 8.9 |
| 364 | THE SCUTTLE | boss | THE CLASP | scuttle | STANDARD | 0 | 0 | 49 | 31 | 62 | — |
| 365 | THE DART | intro | THE DART | dart | STANDARD | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 366 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 6.7 |
| 367 | DART AT WORLD END | **regular** | THE DART | — | STANDARD | 4 | 24 | 27 | 17 | 34 | 7.2 |
| 368 | DART PARTY | **regular** | THE DART | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.1 |
| 369 | DART HOMECOMING | **regular** | THE DART | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 9.8 |
| 370 | DART THUNDER | **regular** | THE DART | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 11.8 |
| 371 | DART DREAM | **regular** | THE DART | — | STANDARD | 6 | 38 | 77 | 48 | 96 | 6.9 |
| 372 | DART LEGEND | **regular** | THE DART | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.8 |
| 373 | DART PARADOX | **regular** | THE DART | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 8.8 |
| 374 | THE ANTIPHON | boss | THE DART | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 375 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 44 | 47 | 29 | 58 | 4 |
| 376 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.8 |
| 377 | ECHO HORIZON | **regular** | THE ECHO | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8.7 |
| 378 | ECHO ALLIANCE | **regular** | THE ECHO | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.1 |
| 379 | ECHO SAGA | **regular** | THE ECHO | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.8 |
| 380 | ECHO RAPTURE | **regular** | THE ECHO | — | STANDARD | 12 | 46 | 75 | 47 | 94 | 11.8 |
| 381 | SLEEPY ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 33 | 39 | 24 | 48 | 7 |
| 382 | ECHO REUNION | **regular** | THE ECHO | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8 |
| 383 | ECHO MIRAGE | **regular** | THE ECHO | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 9 |
| 384 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 385 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 10 | 6 | 12 | 1.5 |
| 386 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 27 | 37 | 23 | 46 | 6.9 |
| 387 | OUTER GYRE | **regular** | THE GYRE | — | STANDARD | 4 | 24 | 27 | 17 | 34 | 8.1 |
| 388 | GYRE DUET | **regular** | THE GYRE | — | STANDARD | 8 | 38 | 48 | 30 | 60 | 8.7 |
| 389 | GYRE LEGEND | **regular** | THE GYRE | — | STANDARD | 7 | 37 | 43 | 27 | 54 | 10 |
| 390 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 12 | 47 | 49 | 31 | 62 | 12.1 |
| 391 | GYRE PICNIC | **regular** | THE GYRE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7 |
| 392 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 8 |
| 393 | GYRE ILLUSION | **regular** | THE GYRE | — | STANDARD | 12 | 44 | 51 | 32 | 64 | 9 |
| 394 | THE CAIRN | boss | THE GYRE | cairn | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 395 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 396 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 397 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.8 |
| 398 | LONG HANDOVER ROAD | **regular** | THE HANDOVER | — | STANDARD | 6 | 29 | 44 | 28 | 56 | 11.9 |
| 399 | HANDOVER ALLIANCE | **regular** | THE HANDOVER | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 12.8 |
| 400 | HANDOVER LEGEND | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 41 | 26 | 52 | 14.7 |
| 401 | HANDOVER OVERDRIVE | **regular** | THE HANDOVER | — | STANDARD | 17 | 47 | 57 | 36 | 72 | 16.7 |
| 402 | SOFT HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 65 | 41 | 82 | 10 |
| 403 | HANDOVER REUNION | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 11 |
| 404 | HANDOVER RIDDLE | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 12 |
| 405 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 406 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 407 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 27 | 32 | 20 | 40 | 7.8 |
| 408 | LID HORIZON | **regular** | THE LID | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 9.8 |
| 409 | LID TANGO | **regular** | THE LID | — | STANDARD | 11 | 38 | 48 | 30 | 60 | 10.8 |
| 410 | ANCIENT LID | **regular** | THE LID | — | STANDARD | 8 | 36 | 51 | 32 | 64 | 12.9 |
| 411 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 14 | 48 | 51 | 32 | 64 | 14.9 |
| 412 | LID LULLABY | **regular** | THE LID | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 7.9 |
| 413 | LID SAGA | **regular** | THE LID | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 8.9 |
| 414 | LID MIRAGE | **regular** | THE LID | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 9.9 |
| 415 | THE OCULUS | boss | THE LID | oculus | STANDARD | 17 | 86 | 25 | 16 | 32 | — |
| 416 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 417 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 8.1 |
| 418 | FAR RECOIL | **regular** | THE RECOIL | — | STANDARD | 6 | 28 | 45 | 28 | 56 | 9.6 |
| 419 | RECOIL MEETS LID | **regular** | THE RECOIL | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 10.5 |
| 420 | OLD RECOIL SONG | **regular** | THE RECOIL | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 12 |
| 421 | RECOIL STORM | **regular** | THE RECOIL | — | STANDARD | 13 | 46 | 50 | 31 | 62 | 14 |
| 422 | SOFT RECOIL | **regular** | THE RECOIL | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 8.2 |
| 423 | RECOIL RELIC | **regular** | THE RECOIL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 9.2 |
| 424 | RECOIL TRICK | **regular** | THE RECOIL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.2 |
| 425 | THE WELL | boss (special) | THE RECOIL | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 426 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 51 | 32 | 64 | 7.2 |
| 427 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 8.4 |
| 428 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 30 | 32 | 20 | 40 | 10.2 |
| 429 | CRYSTAL WALTZ | **regular** | THE CRYSTAL | — | STANDARD | 11 | 38 | 44 | 28 | 56 | 11.1 |
| 430 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 12.6 |
| 431 | CRYSTAL ECLIPSE | **regular** | THE CRYSTAL | — | STANDARD | 17 | 47 | 52 | 33 | 66 | 14.6 |
| 432 | SOFT CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 68 | 43 | 86 | 8.5 |
| 433 | CRYSTAL RELIC | **regular** | THE CRYSTAL | — | STANDARD | 8 | 37 | 44 | 28 | 56 | 9.5 |
| 434 | CRYSTAL MIRAGE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 10.5 |
| 435 | THE REPRISE | boss | THE CRYSTAL | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 436 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 57 | 36 | 72 | 3.3 |
| 437 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 32 | 57 | 36 | 72 | 8.7 |
| 438 | VOLLEY HORIZON | **regular** | THE VOLLEY | — | STANDARD | 6 | 30 | 50 | 31 | 62 | 10.2 |
| 439 | VOLLEY PARTY | **regular** | THE VOLLEY | — | STANDARD | 10 | 37 | 62 | 39 | 78 | 11 |
| 440 | VOLLEY LEGEND | **regular** | THE VOLLEY | — | STANDARD | 8 | 36 | 62 | 39 | 78 | 12.9 |
| 441 | VOLLEY APOCALYPSE | **regular** | THE VOLLEY | — | STANDARD | 14 | 45 | 61 | 38 | 76 | 15 |
| 442 | VOLLEY LULLABY | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 43 | 27 | 54 | 8.8 |
| 443 | ANCIENT VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 8 | 36 | 61 | 38 | 76 | 9.8 |
| 444 | VOLLEY RIDDLE | **regular** | THE VOLLEY | — | STANDARD | 12 | 47 | 73 | 46 | 92 | 10.8 |
| 445 | THE FILAMENT | boss | THE VOLLEY | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 446 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 447 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 31 | 54 | 34 | 68 | 9.8 |
| 448 | FAR FLIP | **regular** | THE FLIP | — | STANDARD | 6 | 29 | 57 | 36 | 72 | 11.9 |
| 449 | FLIP WALTZ | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 63 | 39 | 78 | 12.9 |
| 450 | OLD FLIP SONG | **regular** | THE FLIP | — | STANDARD | 8 | 36 | 62 | 39 | 78 | 15 |
| 451 | FLIP INFERNO | **regular** | THE FLIP | — | STANDARD | 16 | 46 | 59 | 37 | 74 | 17 |
| 452 | FLIP DREAM | **regular** | THE FLIP | — | STANDARD | 7 | 40 | 51 | 32 | 64 | 10 |
| 453 | FLIP REUNION | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 59 | 37 | 74 | 11 |
| 454 | FLIP PARADOX | **regular** | THE FLIP | — | STANDARD | 12 | 47 | 72 | 45 | 90 | 12 |
| 455 | THE VANE | boss | THE FLIP | vane | STANDARD 5 | 2 | 3 | 82 | 51 | 102 | — |
| 456 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 457 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 27 | 58 | 36 | 72 | 8.9 |
| 458 | FAR CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 10.5 |
| 459 | CRAWLER TANGO | **regular** | THE CRAWLER | — | STANDARD | 10 | 34 | 61 | 38 | 76 | 11.1 |
| 460 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 8 | 35 | 47 | 29 | 58 | 12.4 |
| 461 | CRAWLER INFERNO | **regular** | THE CRAWLER | — | STANDARD | 16 | 48 | 61 | 38 | 76 | 14.4 |
| 462 | SOFT CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 9 |
| 463 | CRAWLER RELIC | **regular** | THE CRAWLER | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10 |
| 464 | CROOKED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 64 | 40 | 80 | 11 |
| 465 | THE UNDERTOW | boss | THE CRAWLER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 466 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 36 | 39 | 24 | 48 | 6.3 |
| 467 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 27 | 40 | 25 | 50 | 9 |
| 468 | FAR MINE | **regular** | THE MINE | — | STANDARD | 6 | 28 | 45 | 28 | 56 | 10.2 |
| 469 | MINE ALLIANCE | **regular** | THE MINE | — | STANDARD | 11 | 39 | 56 | 35 | 70 | 11.1 |
| 470 | MINE SAGA | **regular** | THE MINE | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 13 |
| 471 | MINE STORM | **regular** | THE MINE | — | STANDARD | 16 | 46 | 55 | 34 | 68 | 15 |
| 472 | MINE HUSH | **regular** | THE MINE | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.1 |
| 473 | ANCIENT MINE | **regular** | THE MINE | — | STANDARD | 10 | 40 | 42 | 26 | 52 | 10.1 |
| 474 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 11.1 |
| 475 | THE MIMIC | boss | THE MINE | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 476 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 477 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.3 |
| 478 | LONG VEIL ROAD | **regular** | THE VEIL | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.2 |
| 479 | VEIL WALTZ | **regular** | THE VEIL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 10.7 |
| 480 | VEIL HOMECOMING | **regular** | THE VEIL | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 12.5 |
| 481 | VEIL RAPTURE | **regular** | THE VEIL | — | STANDARD | 14 | 47 | 50 | 31 | 62 | 14.7 |
| 482 | VEIL PICNIC | **regular** | THE VEIL | — | STANDARD | 6 | 34 | 65 | 41 | 82 | 9.4 |
| 483 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 10.4 |
| 484 | VEIL RIDDLE | **regular** | THE VEIL | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 11.4 |
| 485 | THE SPOOL | boss | THE VEIL | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 486 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 487 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 488 | WISP VOYAGE | **regular** | THE WISP | — | STANDARD | 6 | 31 | 46 | 29 | 58 | 10.5 |
| 489 | WISP AND VEIL | **regular** | THE WISP | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11 |
| 490 | WISP LEGEND | **regular** | THE WISP | — | STANDARD | 8 | 38 | 53 | 33 | 66 | 12.6 |
| 491 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 16 | 46 | 50 | 31 | 62 | 14.6 |
| 492 | WISP HUSH | **regular** | THE WISP | — | STANDARD | 6 | 35 | 107 | 67 | 134 | 10 |
| 493 | WISP REUNION | **regular** | THE WISP | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 11 |
| 494 | WISP MIRAGE | **regular** | THE WISP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 495 | THE HASP | boss | THE WISP | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 496 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 497 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.5 |
| 498 | GHOST HORIZON | **regular** | THE GHOST | — | STANDARD | 6 | 31 | 36 | 23 | 46 | 11.1 |
| 499 | GHOST MEETS WISP | **regular** | THE GHOST | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11.5 |
| 500 | GHOST LEGEND | **regular** | THE GHOST | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 12.3 |
| 501 | GHOST RAPTURE | **regular** | THE GHOST | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 14.3 |
| 502 | LAZY GHOST | **regular** | THE GHOST | — | STANDARD | 6 | 35 | 52 | 33 | 66 | 9.8 |
| 503 | GHOST HOMECOMING | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 10.8 |
| 504 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 505 | THE FLUE | boss | THE GHOST | flue, panel | SHOTS | 0 | 0 | 71 | 44 | 88 | — |
| 506 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 44 | 28 | 56 | 7.2 |
| 507 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 30 | 39 | 24 | 48 | 10.8 |
| 508 | CAROM VOYAGE | **regular** | THE CAROM | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 11.4 |
| 509 | CAROM ALLIANCE | **regular** | THE CAROM | — | STANDARD | 10 | 39 | 50 | 31 | 62 | 11.8 |
| 510 | OLD CAROM SONG | **regular** | THE CAROM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 12.5 |
| 511 | CAROM INFERNO | **regular** | THE CAROM | — | STANDARD | 14 | 46 | 62 | 39 | 78 | 14.5 |
| 512 | CAROM DREAM | **regular** | THE CAROM | — | STANDARD | 6 | 36 | 43 | 27 | 54 | 10 |
| 513 | CAROM RELIC | **regular** | THE CAROM | — | STANDARD | 10 | 38 | 64 | 40 | 80 | 10.9 |
| 514 | CAROM PARADOX | **regular** | THE CAROM | — | STANDARD | 14 | 48 | 55 | 34 | 68 | 12 |
| 515 | THE RATCHET | boss | THE CAROM | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 516 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 30 | 39 | 24 | 48 | 11.1 |
| 517 | FAR CAROM | **regular** | HELLO CAROM | — | STANDARD | 6 | 31 | 37 | 23 | 46 | 11.4 |
| 518 | CAROM TANGO | **regular** | HELLO CAROM | — | STANDARD | 10 | 39 | 51 | 32 | 64 | 12.1 |
| 519 | ANCIENT CAROM | **regular** | HELLO CAROM | — | STANDARD | 10 | 39 | 55 | 34 | 68 | 12.4 |
| 520 | CAROM OVERDRIVE | **regular** | HELLO CAROM | — | STANDARD | 16 | 46 | 59 | 37 | 74 | 14.4 |
| 521 | THE NETTLE | boss | HELLO CAROM | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 522 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 11.4 |
| 523 | GHOST AT WORLD END | **regular** | GHOST DAWN | — | STANDARD | 6 | 32 | 42 | 26 | 52 | 12 |
| 524 | GHOST AND WISP | **regular** | GHOST DAWN | — | STANDARD | 13 | 39 | 42 | 26 | 52 | 12.3 |
| 525 | ANCIENT GHOST | **regular** | GHOST DAWN | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 13.3 |
| 526 | GHOST OVERDRIVE | **regular** | GHOST DAWN | — | STANDARD | 16 | 44 | 53 | 33 | 66 | 15.3 |
| 527 | THE MANTLE | boss | GHOST DAWN | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 528 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 4 | 29 | 32 | 20 | 40 | 11.7 |
| 529 | WISP PILGRIM | **regular** | WISP AWAKENS | — | STANDARD | 6 | 31 | 35 | 22 | 44 | 12 |
| 530 | WISP MEETS VEIL | **regular** | WISP AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12.3 |
| 531 | ANCIENT WISP | **regular** | WISP AWAKENS | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 13.1 |
| 532 | WISP RAPTURE | **regular** | WISP AWAKENS | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 15.1 |
| 533 | THE KEEL | boss | WISP AWAKENS | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 534 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 9 |
| 535 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 10.2 |
| 536 | VEIL DUET | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 38 | 40 | 25 | 50 | 11.2 |
| 537 | VEIL SAGA | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 12.4 |
| 538 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 16 | 47 | 49 | 31 | 62 | 14.2 |
| 539 | THE VALVE | boss | NEW VEIL MOON | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 540 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 9.2 |
| 541 | MINE VOYAGE | **regular** | MINE AWAKENS | — | STANDARD | 6 | 32 | 61 | 38 | 76 | 10.8 |
| 542 | MINE AND CRAWLER | **regular** | MINE AWAKENS | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.6 |
| 543 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 39 | 41 | 26 | 52 | 12.4 |
| 544 | MINE ECLIPSE | **regular** | MINE AWAKENS | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 14.5 |
| 545 | THE SEAM | boss | MINE AWAKENS | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 546 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 30 | 61 | 38 | 76 | 9.3 |
| 547 | OUTER CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 29 | 54 | 34 | 68 | 10.2 |
| 548 | CRAWLER WALTZ | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 40 | 71 | 44 | 88 | 10.9 |
| 549 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 40 | 56 | 35 | 70 | 12.8 |
| 550 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 19 | 48 | 64 | 40 | 80 | 14.9 |
| 551 | THE SLING | boss | FIRST CRAWLER | sling | STANDARD | 0 | 0 | 43 | 27 | 54 | — |
| 552 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 27 | 52 | 33 | 66 | 9.4 |
| 553 | VOLLEY PILGRIM | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 49 | 31 | 62 | 10.2 |
| 554 | VOLLEY AND CRYSTAL | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 38 | 65 | 41 | 82 | 10.5 |
| 555 | VOLLEY RELIC | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 40 | 71 | 44 | 88 | 12.3 |
| 556 | VOLLEY ECLIPSE | **regular** | VOLLEY MORNING | — | STANDARD | 18 | 45 | 58 | 36 | 72 | 14.4 |
| 557 | THE CAPSTAN | boss | VOLLEY MORNING | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 558 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 9.5 |
| 559 | CRYSTAL PILGRIM | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 30 | 40 | 25 | 50 | 10.8 |
| 560 | CRYSTAL DUET | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 37 | 43 | 27 | 54 | 11.7 |
| 561 | OLD CRYSTAL SONG | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 40 | 45 | 28 | 56 | 13 |
| 562 | CRYSTAL APOCALYPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 47 | 53 | 33 | 66 | 15 |
| 563 | THE GALL | boss | NEW CRYSTAL MOON | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 564 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 27 | 32 | 20 | 40 | 9.6 |
| 565 | OUTER RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 6 | 30 | 35 | 22 | 44 | 10.5 |
| 566 | RECOIL DUET | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11.1 |
| 567 | RECOIL HOMECOMING | **regular** | FIRST RECOIL | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 12.7 |
| 568 | RECOIL INFERNO | **regular** | FIRST RECOIL | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 14.9 |
| 569 | THE TRAPEZE | boss | FIRST RECOIL | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 570 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 30 | 40 | 25 | 50 | 9.8 |
| 571 | LONG LID ROAD | **regular** | LID AWAKENS | — | STANDARD | 6 | 27 | 33 | 21 | 42 | 10.5 |
| 572 | LID ALLIANCE | **regular** | LID AWAKENS | — | STANDARD | 10 | 37 | 47 | 29 | 58 | 10.8 |
| 573 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 37 | 47 | 29 | 58 | 12.4 |
| 574 | LID STORM | **regular** | LID AWAKENS | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 14.2 |
| 575 | THE GOVERNOR | boss | LID AWAKENS | governor | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 576 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 26 | 33 | 21 | 42 | 9.9 |
| 577 | GYRE AT WORLD END | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 45 | 28 | 56 | 10.8 |
| 578 | GYRE TANGO | **regular** | GYRE DAWN | — | STANDARD | 11 | 38 | 42 | 26 | 52 | 11.7 |
| 579 | GYRE SAGA | **regular** | GYRE DAWN | — | STANDARD | 10 | 38 | 48 | 30 | 60 | 12.8 |
| 580 | GYRE ECLIPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 48 | 52 | 33 | 66 | 14.8 |
| 581 | THE LATCH | boss | GYRE DAWN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 582 | ECHO MORNING | **regular** | ECHO MORNING | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.8 |
| 583 | FAR ECHO | **regular** | ECHO MORNING | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 11.4 |
| 584 | ECHO AND DART | **regular** | ECHO MORNING | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.2 |
| 585 | OLD ECHO SONG | **regular** | ECHO MORNING | — | STANDARD | 10 | 38 | 48 | 30 | 60 | 12.5 |
| 586 | ECHO OVERDRIVE | **regular** | ECHO MORNING | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 14.7 |
| 587 | THE HYDRA | boss | ECHO MORNING | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 50 | THE BASTION | normal | 87 beats | 54 | 108 s | in band |
| 58 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 62 | FINALE | normal | 79 beats | 49 | 98 s | in band |
| 77 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 87 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 97 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 112 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 122 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 132 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 142 | THE PLUMB | normal | 45 beats | 28 | 56 s | short |
| 152 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 162 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 172 | THE LAMPREY | normal | 132 beats | 83 | 166 s | long |
| 182 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 192 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 202 | THE VISE | normal | 42 beats | 26 | 52 s | short |
| 212 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 222 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 232 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 242 | THE BATON | normal | 286 beats | 179 | 358 s | long |
| 252 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 264 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 274 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 284 | THE GORGE | normal | 259 beats | 162 | 324 s | long |
| 294 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 304 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 314 | THE CHRYSALIS | normal | 75 beats | 47 | 94 s | in band |
| 324 | THE TASTER | normal | 44 beats | 28 | 56 s | short |
| 334 | THE LEDGER | normal | 33 beats | 21 | 42 s | short |
| 344 | THE SURGE | normal | 45 beats | 28 | 56 s | short |
| 354 | THE LEAD | normal | 41 beats | 26 | 52 s | short |
| 364 | THE SCUTTLE | normal | 49 beats | 31 | 62 s | in band |
| 374 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 384 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 394 | THE CAIRN | normal | 25 beats | 16 | 32 s | short |
| 405 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 415 | THE OCULUS | normal | 25 beats | 16 | 32 s | short |
| 425 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 435 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 445 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 455 | THE VANE | normal | 82 beats | 51 | 102 s | in band |
| 465 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 475 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 485 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 495 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 505 | THE FLUE | normal | 71 beats | 44 | 88 s | in band |
| 515 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 521 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 527 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 533 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 539 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 545 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 551 | THE SLING | normal | 43 beats | 27 | 54 s | short |
| 557 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 563 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 569 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 575 | THE GOVERNOR | normal | 25 beats | 16 | 32 s | short |
| 581 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 587 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
