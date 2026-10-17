# The waves today, measured

> **Status: a measurement of 2026-10-17**, the evidence for
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
| regular | 467 | 0 | 14 | 27 | 67 | 3 h 41 min | 7 h 21 min |
| intro | 64 | 0 | 3 | 24 | 51 | 29 min | 58 min |
| boss | 60 | 0 | 9 | 30 | 343 | 49 min | 1 h 39 min |
| every wave | 591 | 0 | 3 | 27 | 343 | 4 h 59 min | 9 h 58 min |

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
| 10 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 34 | 21 | 42 | 1.4 |
| 11 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 44 | 28 | 56 | 2.6 |
| 12 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 49 | 31 | 62 | 3.8 |
| 13 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 44 | 28 | 56 | 5 |
| 14 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 16 | 10 | 20 | 5.8 |
| 15 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 24 | 15 | 30 | 10.8 |
| 16 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 22 | 24 | 15 | 30 | 3.3 |
| 17 | HELLO TORCH | **regular** | TORCH | — | STANDARD 4 | 5 | 25 | 27 | 17 | 34 | 3.6 |
| 18 | TORCH AT WORLD END | **regular** | TORCH | — | STANDARD 4 | 6 | 28 | 30 | 19 | 38 | 5.7 |
| 19 | TORCH ALLIANCE | **regular** | TORCH | — | STANDARD 4 | 8 | 37 | 51 | 32 | 64 | 6.7 |
| 20 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 21 | TAP | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 22 | TAP DAWN | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 23 | TAP PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 26 | 30 | 19 | 38 | 6 |
| 24 | TAP TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 35 | 37 | 23 | 46 | 7 |
| 25 | HOLD | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 26 | HOLD AWAKENS | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 30 | 34 | 21 | 42 | 3.9 |
| 27 | HOLD PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 27 | 31 | 19 | 38 | 6 |
| 28 | HOLD DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 38 | 40 | 25 | 50 | 7 |
| 29 | SWIPE | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 30 | LITTLE SWIPE | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 26 | 30 | 19 | 38 | 3.9 |
| 31 | FAR SWIPE | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 27 | 31 | 19 | 38 | 6 |
| 32 | SWIPE DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 39 | 41 | 26 | 52 | 7 |
| 33 | TURN | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 34 | TURN DAWN | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 35 | TURN VOYAGE | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 32 | 20 | 40 | 6 |
| 36 | TURN TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 35 | 37 | 23 | 46 | 7 |
| 37 | RUB | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 38 | RUB MORNING | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 39 | LONG RUB ROAD | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 32 | 20 | 40 | 6 |
| 40 | RUB DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 36 | 38 | 24 | 48 | 7 |
| 41 | COMBO | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 42 | LITTLE COMBO | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 30 | 34 | 21 | 42 | 3.9 |
| 43 | COMBO PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 26 | 30 | 19 | 38 | 6 |
| 44 | COMBO TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 36 | 38 | 24 | 48 | 7 |
| 45 | LEVER | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 46 | HELLO LEVER | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 32 | 20 | 40 | 3.9 |
| 47 | LEVER HORIZON | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 33 | 21 | 42 | 6 |
| 48 | LEVER PARTY | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 37 | 39 | 24 | 48 | 7 |
| 49 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 50 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 82 | 51 | 102 | — |
| 51 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 52 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 53 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 54 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 55 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 56 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 35 | 38 | 24 | 48 | 7 |
| 57 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 38 | 42 | 26 | 52 | 8.2 |
| 58 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 59 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 60 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 61 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 62 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 67 | 42 | 84 | — |
| 63 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 16 | 10 | 20 | 2.4 |
| 64 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.6 |
| 65 | FAR HUSK | **regular** | THE HUSK | — | STANDARD 5 | 4 | 28 | 42 | 26 | 52 | 3.2 |
| 66 | HUSK TANGO | **regular** | THE HUSK | — | STANDARD 5 | 4 | 37 | 40 | 25 | 50 | 4 |
| 67 | ANCIENT HUSK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 36 | 38 | 24 | 48 | 6 |
| 68 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 10 | 40 | 44 | 28 | 56 | 8 |
| 69 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 70 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.6 |
| 71 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 72 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 73 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 74 | HUSK DREAM | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 2.8 |
| 75 | HUSK HOMECOMING | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 3.8 |
| 76 | HUSK TRICK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 42 | 46 | 29 | 58 | 4.7 |
| 77 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 78 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 34 | 21 | 42 | 3.6 |
| 79 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 45 | 28 | 56 | 3.6 |
| 80 | MORSEL PILGRIM | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 43 | 27 | 54 | 5.7 |
| 81 | MORSEL TANGO | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 42 | 26 | 52 | 6.7 |
| 82 | MORSEL SAGA | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 37 | 53 | 33 | 66 | 8.7 |
| 83 | MORSEL THUNDER | **regular** | THE MORSEL | — | STANDARD 5 | 10 | 47 | 50 | 31 | 62 | 10.7 |
| 84 | SOFT MORSEL | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 34 | 50 | 31 | 62 | 6.2 |
| 85 | MORSEL RELIC | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 35 | 51 | 32 | 64 | 7.2 |
| 86 | MORSEL SPELL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 46 | 62 | 39 | 78 | 8.2 |
| 87 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 88 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD 5 | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 89 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD 5 | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 90 | SEEDER VOYAGE | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 26 | 36 | 23 | 46 | 6 |
| 91 | SEEDER AND MORSEL | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 36 | 52 | 33 | 66 | 7 |
| 92 | SEEDER REUNION | **regular** | THE SEEDER | — | STANDARD 5 | 7 | 35 | 39 | 24 | 48 | 9 |
| 93 | SEEDER THUNDER | **regular** | THE SEEDER | — | STANDARD 5 | 14 | 47 | 56 | 35 | 70 | 11 |
| 94 | SEEDER DREAM | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 95 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD 5 | 7 | 37 | 40 | 25 | 50 | 7.2 |
| 96 | SEEDER ILLUSION | **regular** | THE SEEDER | — | STANDARD 5 | 11 | 47 | 57 | 36 | 72 | 8.2 |
| 97 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 98 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 99 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 4.2 |
| 100 | LONG LANCE ROAD | **regular** | THE LANCE | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 6.3 |
| 101 | LANCE PARTY | **regular** | THE LANCE | — | STANDARD | 8 | 38 | 54 | 34 | 68 | 7.3 |
| 102 | LANCE REUNION | **regular** | THE LANCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 9.3 |
| 103 | LANCE INFERNO | **regular** | THE LANCE | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 11.3 |
| 104 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 105 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 106 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 107 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 27 | 17 | 34 | 3.6 |
| 108 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 38 | 24 | 48 | 3.4 |
| 109 | SLEEPY LANCE | **regular** | THE LANCE | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 6.4 |
| 110 | LANCE RELIC | **regular** | THE LANCE | — | STANDARD | 7 | 36 | 40 | 25 | 50 | 7.4 |
| 111 | LANCE ILLUSION | **regular** | THE LANCE | — | STANDARD | 11 | 46 | 56 | 35 | 70 | 8.4 |
| 112 | THE GEODE | boss | THE LANCE | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 113 | THE GLUTTON | intro | THE GLUTTON | glutton | STANDARD | 3 | 18 | 25 | 16 | 32 | 4.2 |
| 114 | LITTLE GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 4.2 |
| 115 | GLUTTON PILGRIM | **regular** | THE GLUTTON | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 6.3 |
| 116 | GLUTTON DUET | **regular** | THE GLUTTON | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 7.3 |
| 117 | OLD GLUTTON SONG | **regular** | THE GLUTTON | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.3 |
| 118 | GLUTTON THUNDER | **regular** | THE GLUTTON | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 11.3 |
| 119 | SOFT GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.5 |
| 120 | GLUTTON SAGA | **regular** | THE GLUTTON | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.5 |
| 121 | GLUTTON RIDDLE | **regular** | THE GLUTTON | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 8.4 |
| 122 | THE MAZE | boss (special) | THE GLUTTON | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 123 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 3.6 |
| 124 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 5 | 29 | 36 | 23 | 46 | 3.6 |
| 125 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 5.6 |
| 126 | CROSSING AND GLUTTON | **regular** | THE CROSSING | — | STANDARD | 7 | 38 | 45 | 28 | 56 | 6.6 |
| 127 | OLD CROSSING SONG | **regular** | THE CROSSING | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 8.6 |
| 128 | CROSSING ECLIPSE | **regular** | THE CROSSING | — | STANDARD | 14 | 45 | 52 | 33 | 66 | 10.6 |
| 129 | CROSSING HUSH | **regular** | THE CROSSING | — | STANDARD | 6 | 36 | 43 | 27 | 54 | 5.2 |
| 130 | CROSSING SAGA | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 6.2 |
| 131 | CROOKED CROSSING | **regular** | THE CROSSING | — | STANDARD | 10 | 44 | 48 | 30 | 60 | 7.3 |
| 132 | THE GAUGE | boss (special) | THE CROSSING | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 133 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 134 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 135 | BEATBOX VOYAGE | **regular** | THE BEATBOX | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 7.2 |
| 136 | BEATBOX PARTY | **regular** | THE BEATBOX | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.1 |
| 137 | BEATBOX LEGEND | **regular** | THE BEATBOX | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 138 | BEATBOX ECLIPSE | **regular** | THE BEATBOX | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 139 | LAZY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.6 |
| 140 | BEATBOX SAGA | **regular** | THE BEATBOX | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.6 |
| 141 | BEATBOX TRICK | **regular** | THE BEATBOX | — | STANDARD | 11 | 47 | 51 | 32 | 64 | 8.6 |
| 142 | THE FLEET | boss (special) | THE BEATBOX | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 143 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 68 | 43 | 86 | 6.6 |
| 144 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6.8 |
| 145 | FAR LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 146 | LIMPET DUET | **regular** | THE LIMPET | — | STANDARD | 7 | 38 | 47 | 29 | 58 | 10 |
| 147 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 40 | 56 | 35 | 70 | 12 |
| 148 | LIMPET APOCALYPSE | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 14 |
| 149 | LAZY LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 39 | 44 | 28 | 56 | 6.9 |
| 150 | ANCIENT LIMPET | **regular** | THE LIMPET | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.9 |
| 151 | CROOKED LIMPET | **regular** | THE LIMPET | — | STANDARD | 11 | 48 | 53 | 33 | 66 | 8.9 |
| 152 | SNAKE | boss (special) | THE LIMPET | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 153 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 42 | 44 | 28 | 56 | 3.9 |
| 154 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 155 | WEIGHT AT WORLD END | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 156 | WEIGHT DUET | **regular** | THE WEIGHT | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 8 |
| 157 | OLD WEIGHT SONG | **regular** | THE WEIGHT | — | STANDARD | 7 | 33 | 36 | 23 | 46 | 10 |
| 158 | WEIGHT STORM | **regular** | THE WEIGHT | — | STANDARD | 12 | 47 | 53 | 33 | 66 | 12 |
| 159 | LAZY WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 6.8 |
| 160 | WEIGHT REUNION | **regular** | THE WEIGHT | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 7.8 |
| 161 | WEIGHT MIRAGE | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.8 |
| 162 | THE PLUMB | boss | THE WEIGHT | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 163 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 164 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.7 |
| 165 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.7 |
| 166 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 167 | HEAVY ROCK SAGA | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 39 | 55 | 34 | 68 | 9.6 |
| 168 | HEAVY ROCK ECLIPSE | **regular** | HEAVY ROCKS | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 11.6 |
| 169 | HEAVY ROCK LULLABY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.3 |
| 170 | HEAVY ROCK LEGEND | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.3 |
| 171 | HEAVY ROCK MIRAGE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.3 |
| 172 | THE HIVE | boss | HEAVY ROCKS | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 173 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 174 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 7.5 |
| 175 | OUTER LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 10 |
| 176 | LEECH DUET | **regular** | THE LEECH | — | STANDARD | 7 | 34 | 37 | 23 | 46 | 10.4 |
| 177 | LEECH SAGA | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 11.4 |
| 178 | LEECH THUNDER | **regular** | THE LEECH | — | STANDARD | 12 | 42 | 46 | 29 | 58 | 13.3 |
| 179 | LEECH DREAM | **regular** | THE LEECH | — | STANDARD | 6 | 38 | 46 | 29 | 58 | 7.6 |
| 180 | OLD LEECH SONG | **regular** | THE LEECH | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.6 |
| 181 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 9.6 |
| 182 | THE LAMPREY | boss | THE LEECH | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 183 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 184 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.1 |
| 185 | THROB AT WORLD END | **regular** | THE THROB | — | STANDARD | 6 | 26 | 34 | 21 | 42 | 8.1 |
| 186 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.4 |
| 187 | THROB RELIC | **regular** | THE THROB | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 188 | THROB STORM | **regular** | THE THROB | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 189 | THROB LULLABY | **regular** | THE THROB | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 6.8 |
| 190 | THROB REUNION | **regular** | THE THROB | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.8 |
| 191 | THROB ILLUSION | **regular** | THE THROB | — | STANDARD | 11 | 47 | 51 | 32 | 64 | 8.8 |
| 192 | PINBALL | boss (special) | THE THROB | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 193 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 194 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.3 |
| 195 | COUNT VOYAGE | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 8.7 |
| 196 | COUNT DUET | **regular** | THE COUNT | — | STANDARD | 8 | 37 | 44 | 28 | 56 | 9.2 |
| 197 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 198 | COUNT APOCALYPSE | **regular** | THE COUNT | — | STANDARD | 14 | 46 | 50 | 31 | 62 | 12 |
| 199 | SLEEPY COUNT | **regular** | THE COUNT | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 6.9 |
| 200 | COUNT SAGA | **regular** | THE COUNT | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 7.9 |
| 201 | COUNT RIDDLE | **regular** | THE COUNT | — | STANDARD | 11 | 47 | 52 | 33 | 66 | 8.9 |
| 202 | THE STARE | boss | THE COUNT | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 203 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 204 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6.6 |
| 205 | LONG SHELL ROAD | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 8.4 |
| 206 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 7 | 33 | 36 | 23 | 46 | 8.8 |
| 207 | SHELL SAGA | **regular** | THE SHELL | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 208 | SHELL THUNDER | **regular** | THE SHELL | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 12 |
| 209 | SHELL DREAM | **regular** | THE SHELL | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.8 |
| 210 | ANCIENT SHELL | **regular** | THE SHELL | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.8 |
| 211 | CROOKED SHELL | **regular** | THE SHELL | — | STANDARD | 12 | 46 | 52 | 33 | 66 | 8.8 |
| 212 | THE VISE | boss | THE SHELL | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 213 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 214 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6.9 |
| 215 | CHOKE HORIZON | **regular** | THE CHOKE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 7.2 |
| 216 | CHOKE ALLIANCE | **regular** | THE CHOKE | — | STANDARD | 7 | 40 | 44 | 28 | 56 | 8.1 |
| 217 | CHOKE REUNION | **regular** | THE CHOKE | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 218 | CHOKE THUNDER | **regular** | THE CHOKE | — | STANDARD | 15 | 45 | 49 | 31 | 62 | 12 |
| 219 | CHOKE HUSH | **regular** | THE CHOKE | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 7 |
| 220 | CHOKE RELIC | **regular** | THE CHOKE | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8 |
| 221 | CHOKE ILLUSION | **regular** | THE CHOKE | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 9 |
| 222 | THE WARDEN | boss | THE CHOKE | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 223 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 224 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 225 | RIND HORIZON | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 226 | RIND MEETS SHELL | **regular** | THE RIND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 9.4 |
| 227 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 228 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 12 | 48 | 51 | 32 | 64 | 12 |
| 229 | RIND HUSH | **regular** | THE RIND | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 6.8 |
| 230 | RIND REUNION | **regular** | THE RIND | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.8 |
| 231 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 8.8 |
| 232 | THE SCOUT | boss (special) | THE RIND | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 233 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 56 | 35 | 70 | 3.6 |
| 234 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 6.9 |
| 235 | LONG VEER ROAD | **regular** | THE VEER | — | STANDARD | 4 | 24 | 32 | 20 | 40 | 8.1 |
| 236 | VEER MEETS RIND | **regular** | THE VEER | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 8.8 |
| 237 | VEER REUNION | **regular** | THE VEER | — | STANDARD | 7 | 36 | 44 | 28 | 56 | 10 |
| 238 | VEER APOCALYPSE | **regular** | THE VEER | — | STANDARD | 12 | 46 | 49 | 31 | 62 | 12 |
| 239 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 7 |
| 240 | VEER RELIC | **regular** | THE VEER | — | STANDARD | 8 | 37 | 42 | 26 | 52 | 8 |
| 241 | VEER TRICK | **regular** | THE VEER | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 9 |
| 242 | THE HAUL | boss (special) | THE VEER | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 243 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 244 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 7.2 |
| 245 | STRAND VOYAGE | **regular** | THE STRAND | — | STANDARD | 4 | 25 | 39 | 24 | 48 | 7.5 |
| 246 | STRAND WALTZ | **regular** | THE STRAND | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8 |
| 247 | ANCIENT STRAND | **regular** | THE STRAND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 248 | STRAND INFERNO | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 53 | 33 | 66 | 12 |
| 249 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 7.3 |
| 250 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8.3 |
| 251 | CROOKED STRAND | **regular** | THE STRAND | — | STANDARD | 11 | 44 | 49 | 31 | 62 | 9.3 |
| 252 | THE BATON | boss | THE STRAND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 253 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 254 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 255 | CLAW HORIZON | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 256 | CLAW DUET | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 257 | CLAW HOMECOMING | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 258 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 259 | CLAW PICNIC | **regular** | THE CLAW | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 7.3 |
| 260 | CLAW LEGEND | **regular** | THE CLAW | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.3 |
| 261 | CLAW PARADOX | **regular** | THE CLAW | — | STANDARD | 11 | 45 | 51 | 32 | 64 | 9.3 |
| 262 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 263 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 264 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 265 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 266 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 7.5 |
| 267 | OUTER FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 9 |
| 268 | FENCE ALLIANCE | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 49 | 31 | 62 | 9.5 |
| 269 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.8 |
| 270 | FENCE INFERNO | **regular** | THE FENCE | — | STANDARD | 12 | 48 | 51 | 32 | 64 | 11.8 |
| 271 | FENCE DREAM | **regular** | THE FENCE | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.6 |
| 272 | FENCE HOMECOMING | **regular** | THE FENCE | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.6 |
| 273 | FENCE ILLUSION | **regular** | THE FENCE | — | STANDARD | 11 | 43 | 52 | 33 | 66 | 9.6 |
| 274 | THE PULSE | boss (special) | THE FENCE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 275 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 52 | 55 | 34 | 68 | 4.5 |
| 276 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 7.8 |
| 277 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 4 | 24 | 33 | 21 | 42 | 8.4 |
| 278 | MAGNET DUET | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.3 |
| 279 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 280 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 14 | 47 | 58 | 36 | 72 | 11.9 |
| 281 | MAGNET DREAM | **regular** | THE MAGNET | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 7.9 |
| 282 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.9 |
| 283 | MAGNET MIRAGE | **regular** | THE MAGNET | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.9 |
| 284 | THE GORGE | boss | THE MAGNET | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 285 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 286 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 8.1 |
| 287 | CHOIR VOYAGE | **regular** | THE CHOIR | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 8.4 |
| 288 | CHOIR AND MAGNET | **regular** | THE CHOIR | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.8 |
| 289 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 290 | CHOIR RAPTURE | **regular** | THE CHOIR | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 291 | SOFT CHOIR | **regular** | THE CHOIR | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 8.2 |
| 292 | CHOIR REUNION | **regular** | THE CHOIR | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 9.2 |
| 293 | CHOIR RIDDLE | **regular** | THE CHOIR | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.2 |
| 294 | THE TASTER | boss | THE CHOIR | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 295 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 296 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 8.7 |
| 297 | LONG DARK ROAD | **regular** | THE DARK | — | STANDARD | 4 | 25 | 28 | 18 | 36 | 9.5 |
| 298 | DARK ALLIANCE | **regular** | THE DARK | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 10.1 |
| 299 | DARK LEGEND | **regular** | THE DARK | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 12 |
| 300 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 14.1 |
| 301 | SLEEPY DARK | **regular** | THE DARK | — | STANDARD | 6 | 34 | 36 | 23 | 46 | 8.8 |
| 302 | DARK REUNION | **regular** | THE DARK | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.8 |
| 303 | DARK RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.8 |
| 304 | THE CURTAIN | boss | THE DARK | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 305 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 72 | 45 | 90 | 4.5 |
| 306 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 5 | 27 | 55 | 34 | 68 | 8.4 |
| 307 | BALLOON VOYAGE | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 8.8 |
| 308 | BALLOON ALLIANCE | **regular** | THE BALLOON | — | STANDARD | 8 | 38 | 64 | 40 | 80 | 9.2 |
| 309 | BALLOON LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 58 | 36 | 72 | 10 |
| 310 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 58 | 36 | 72 | 12 |
| 311 | SOFT BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 36 | 62 | 39 | 78 | 8.5 |
| 312 | BALLOON RELIC | **regular** | THE BALLOON | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 9.5 |
| 313 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 12 | 46 | 66 | 41 | 82 | 10.5 |
| 314 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 315 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 316 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 30 | 87 | 54 | 108 | 8.7 |
| 317 | FAR MOULT | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 67 | 42 | 84 | 9.3 |
| 318 | MOULT WALTZ | **regular** | THE MOULT | — | STANDARD | 7 | 38 | 77 | 48 | 96 | 9.7 |
| 319 | MOULT RELIC | **regular** | THE MOULT | — | STANDARD | 7 | 36 | 77 | 48 | 96 | 10 |
| 320 | MOULT ECLIPSE | **regular** | THE MOULT | — | STANDARD | 12 | 47 | 70 | 44 | 88 | 12 |
| 321 | MOULT PICNIC | **regular** | THE MOULT | — | STANDARD | 6 | 33 | 77 | 48 | 96 | 8.8 |
| 322 | MOULT SAGA | **regular** | THE MOULT | — | STANDARD | 10 | 36 | 97 | 61 | 122 | 9.8 |
| 323 | MOULT RIDDLE | **regular** | THE MOULT | — | STANDARD | 10 | 43 | 77 | 48 | 96 | 10.8 |
| 324 | THE CHRYSALIS | boss | THE MOULT | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 325 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 5.6 |
| 326 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 6 |
| 327 | OUTER COIL | **regular** | THE COIL | — | STANDARD | 4 | 26 | 97 | 61 | 122 | 7.2 |
| 328 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 39 | 67 | 42 | 84 | 7.7 |
| 329 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 8 |
| 330 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 331 | COIL HUSH | **regular** | THE COIL | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 6.9 |
| 332 | COIL RELIC | **regular** | THE COIL | — | STANDARD | 9 | 36 | 38 | 24 | 48 | 7.9 |
| 333 | COIL SPELL | **regular** | THE COIL | — | STANDARD | 12 | 44 | 107 | 67 | 134 | 8.9 |
| 334 | THE LEDGER | boss | THE COIL | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 335 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 336 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 25 | 77 | 48 | 96 | 9.8 |
| 337 | CODEX AT WORLD END | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 77 | 48 | 96 | 11.8 |
| 338 | CODEX TANGO | **regular** | THE CODEX | — | STANDARD | 10 | 40 | 77 | 48 | 96 | 12.8 |
| 339 | CODEX LEGEND | **regular** | THE CODEX | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 14.8 |
| 340 | CODEX OVERDRIVE | **regular** | THE CODEX | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 16.7 |
| 341 | CODEX HUSH | **regular** | THE CODEX | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 342 | OLD CODEX SONG | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 343 | CODEX PARADOX | **regular** | THE CODEX | — | STANDARD | 12 | 46 | 107 | 67 | 134 | 12 |
| 344 | THE SURGE | boss | THE CODEX | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 345 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 20 | 31 | 19 | 38 | 6.5 |
| 346 | LURE RISING | **regular** | THE LURE | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.7 |
| 347 | OUTER LURE | **regular** | THE LURE | — | STANDARD | 4 | 25 | 34 | 21 | 42 | 8.7 |
| 348 | LURE AND COIL | **regular** | THE LURE | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9 |
| 349 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 7 | 39 | 47 | 29 | 58 | 10 |
| 350 | LURE INFERNO | **regular** | THE LURE | — | STANDARD | 12 | 45 | 53 | 33 | 66 | 12 |
| 351 | LAZY LURE | **regular** | THE LURE | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.8 |
| 352 | OLD LURE SONG | **regular** | THE LURE | — | STANDARD | 8 | 36 | 44 | 28 | 56 | 7.8 |
| 353 | LURE ILLUSION | **regular** | THE LURE | — | STANDARD | 12 | 45 | 53 | 33 | 66 | 8.8 |
| 354 | THE LEAD | boss | THE LURE | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 355 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 76 | 48 | 96 | 6.8 |
| 356 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 30 | 36 | 23 | 46 | 9.8 |
| 357 | FAR JAM | **regular** | THE JAM | — | STANDARD | 5 | 26 | 34 | 21 | 42 | 11.6 |
| 358 | JAM DUET | **regular** | THE JAM | — | STANDARD | 10 | 39 | 53 | 33 | 66 | 12.4 |
| 359 | OLD JAM SONG | **regular** | THE JAM | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 14.4 |
| 360 | JAM OVERDRIVE | **regular** | THE JAM | — | STANDARD | 14 | 46 | 60 | 38 | 76 | 16.4 |
| 361 | JAM PICNIC | **regular** | THE JAM | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 10 |
| 362 | JAM REUNION | **regular** | THE JAM | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 11 |
| 363 | CROOKED JAM | **regular** | THE JAM | — | STANDARD | 12 | 43 | 52 | 33 | 66 | 12 |
| 364 | THE SCUTTLE | boss | THE JAM | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 365 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 366 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 36 | 23 | 46 | 6.8 |
| 367 | CLASP AT WORLD END | **regular** | THE CLASP | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.7 |
| 368 | CLASP WALTZ | **regular** | THE CLASP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.3 |
| 369 | CLASP HOMECOMING | **regular** | THE CLASP | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 370 | CLASP RAPTURE | **regular** | THE CLASP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 371 | CLASP DREAM | **regular** | THE CLASP | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 7 |
| 372 | CLASP LEGEND | **regular** | THE CLASP | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 8.1 |
| 373 | CLASP PARADOX | **regular** | THE CLASP | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 9.1 |
| 374 | THE ANTIPHON | boss | THE CLASP | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 375 | THE DART | intro | THE DART | dart | STANDARD | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 376 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 6.9 |
| 377 | DART AT WORLD END | **regular** | THE DART | — | STANDARD | 4 | 24 | 27 | 17 | 34 | 7.2 |
| 378 | DART PARTY | **regular** | THE DART | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.1 |
| 379 | DART HOMECOMING | **regular** | THE DART | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 380 | DART THUNDER | **regular** | THE DART | — | STANDARD | 12 | 48 | 62 | 39 | 78 | 12 |
| 381 | DART PICNIC | **regular** | THE DART | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7 |
| 382 | OLD DART SONG | **regular** | THE DART | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 8 |
| 383 | DART ILLUSION | **regular** | THE DART | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 9 |
| 384 | THE CAIRN | boss | THE DART | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 385 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 44 | 47 | 29 | 58 | 4 |
| 386 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 7 |
| 387 | ECHO HORIZON | **regular** | THE ECHO | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 8.7 |
| 388 | ECHO ALLIANCE | **regular** | THE ECHO | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.1 |
| 389 | ECHO SAGA | **regular** | THE ECHO | — | STANDARD | 7 | 34 | 37 | 23 | 46 | 10 |
| 390 | ECHO RAPTURE | **regular** | THE ECHO | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 391 | SLEEPY ECHO | **regular** | THE ECHO | — | STANDARD | 7 | 39 | 49 | 31 | 62 | 7.1 |
| 392 | ECHO REUNION | **regular** | THE ECHO | — | STANDARD | 8 | 36 | 45 | 28 | 56 | 8.1 |
| 393 | ECHO MIRAGE | **regular** | THE ECHO | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 9.1 |
| 394 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 395 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 396 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 8.1 |
| 397 | OUTER GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9.9 |
| 398 | GYRE DUET | **regular** | THE GYRE | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 10.8 |
| 399 | GYRE LEGEND | **regular** | THE GYRE | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 12.8 |
| 400 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 14 | 45 | 53 | 33 | 66 | 14.7 |
| 401 | SOFT GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 8.2 |
| 402 | GYRE RELIC | **regular** | THE GYRE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 9.2 |
| 403 | GYRE TRICK | **regular** | THE GYRE | — | STANDARD | 12 | 44 | 49 | 31 | 62 | 10.2 |
| 404 | THE WELL | boss (special) | THE GYRE | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 405 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 406 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 407 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.8 |
| 408 | LONG HANDOVER ROAD | **regular** | THE HANDOVER | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 11.9 |
| 409 | HANDOVER ALLIANCE | **regular** | THE HANDOVER | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 12.8 |
| 410 | HANDOVER LEGEND | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 14.7 |
| 411 | HANDOVER OVERDRIVE | **regular** | THE HANDOVER | — | STANDARD | 14 | 47 | 63 | 39 | 78 | 16.7 |
| 412 | SOFT HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 62 | 39 | 78 | 10 |
| 413 | HANDOVER REUNION | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 11 |
| 414 | HANDOVER RIDDLE | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 12 |
| 415 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 416 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 417 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 8.4 |
| 418 | LID HORIZON | **regular** | THE LID | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 10.2 |
| 419 | LID TANGO | **regular** | THE LID | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11.1 |
| 420 | ANCIENT LID | **regular** | THE LID | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 12.9 |
| 421 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 14 | 45 | 48 | 30 | 60 | 15 |
| 422 | LID LULLABY | **regular** | THE LID | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8.5 |
| 423 | LID SAGA | **regular** | THE LID | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 9.5 |
| 424 | LID MIRAGE | **regular** | THE LID | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 10.5 |
| 425 | THE OCULUS | boss | THE LID | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 426 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 427 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 8.7 |
| 428 | FAR RECOIL | **regular** | THE RECOIL | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 10.6 |
| 429 | RECOIL MEETS LID | **regular** | THE RECOIL | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11.6 |
| 430 | OLD RECOIL SONG | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 13.3 |
| 431 | RECOIL STORM | **regular** | THE RECOIL | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 15.3 |
| 432 | SOFT RECOIL | **regular** | THE RECOIL | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.8 |
| 433 | RECOIL RELIC | **regular** | THE RECOIL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 9.8 |
| 434 | RECOIL MIRAGE | **regular** | THE RECOIL | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 10.8 |
| 435 | THE REPRISE | boss | THE RECOIL | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 436 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 437 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 9 |
| 438 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 10.5 |
| 439 | CRYSTAL WALTZ | **regular** | THE CRYSTAL | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 11.4 |
| 440 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 12.6 |
| 441 | CRYSTAL ECLIPSE | **regular** | THE CRYSTAL | — | STANDARD | 14 | 46 | 50 | 31 | 62 | 14.6 |
| 442 | CRYSTAL LULLABY | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 9.1 |
| 443 | ANCIENT CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 10 | 37 | 42 | 26 | 52 | 10.1 |
| 444 | CRYSTAL RIDDLE | **regular** | THE CRYSTAL | — | STANDARD | 13 | 47 | 53 | 33 | 66 | 11.1 |
| 445 | THE FILAMENT | boss | THE CRYSTAL | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 446 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 447 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 9.6 |
| 448 | VOLLEY HORIZON | **regular** | THE VOLLEY | — | STANDARD | 6 | 32 | 50 | 31 | 62 | 11.4 |
| 449 | VOLLEY PARTY | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.3 |
| 450 | VOLLEY LEGEND | **regular** | THE VOLLEY | — | STANDARD | 8 | 36 | 61 | 38 | 76 | 12.9 |
| 451 | VOLLEY APOCALYPSE | **regular** | THE VOLLEY | — | STANDARD | 14 | 46 | 76 | 48 | 96 | 15 |
| 452 | VOLLEY PICNIC | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 9.7 |
| 453 | VOLLEY RELIC | **regular** | THE VOLLEY | — | STANDARD | 10 | 36 | 56 | 35 | 70 | 10.7 |
| 454 | VOLLEY RIDDLE | **regular** | THE VOLLEY | — | STANDARD | 13 | 48 | 68 | 43 | 86 | 11.7 |
| 455 | THE SPOOL | boss | THE VOLLEY | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 456 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 457 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 9.8 |
| 458 | FAR FLIP | **regular** | THE FLIP | — | STANDARD | 6 | 31 | 49 | 31 | 62 | 11.9 |
| 459 | FLIP WALTZ | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 62 | 39 | 78 | 12.9 |
| 460 | OLD FLIP SONG | **regular** | THE FLIP | — | STANDARD | 8 | 36 | 61 | 38 | 76 | 15 |
| 461 | FLIP INFERNO | **regular** | THE FLIP | — | STANDARD | 14 | 47 | 77 | 48 | 96 | 17 |
| 462 | FLIP DREAM | **regular** | THE FLIP | — | STANDARD | 7 | 40 | 50 | 31 | 62 | 10 |
| 463 | FLIP REUNION | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 58 | 36 | 72 | 11 |
| 464 | FLIP PARADOX | **regular** | THE FLIP | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 465 | THE VANE | boss | THE FLIP | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 466 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 467 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 30 | 60 | 38 | 76 | 10.2 |
| 468 | FAR CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 54 | 34 | 68 | 10.5 |
| 469 | CRAWLER TANGO | **regular** | THE CRAWLER | — | STANDARD | 10 | 34 | 60 | 38 | 76 | 11.1 |
| 470 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 8 | 35 | 46 | 29 | 58 | 12.4 |
| 471 | CRAWLER INFERNO | **regular** | THE CRAWLER | — | STANDARD | 13 | 45 | 62 | 39 | 78 | 14.4 |
| 472 | SOFT CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 37 | 53 | 33 | 66 | 9.7 |
| 473 | CRAWLER RELIC | **regular** | THE CRAWLER | — | STANDARD | 10 | 40 | 56 | 35 | 70 | 10.7 |
| 474 | CROOKED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 11.7 |
| 475 | THE UNDERTOW | boss | THE CRAWLER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 476 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.2 |
| 477 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 31 | 48 | 30 | 60 | 11.1 |
| 478 | FAR MINE | **regular** | THE MINE | — | STANDARD | 6 | 31 | 42 | 26 | 52 | 11.7 |
| 479 | MINE ALLIANCE | **regular** | THE MINE | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 12 |
| 480 | MINE SAGA | **regular** | THE MINE | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 13 |
| 481 | MINE STORM | **regular** | THE MINE | — | STANDARD | 17 | 48 | 60 | 38 | 76 | 14.8 |
| 482 | MINE HUSH | **regular** | THE MINE | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 10 |
| 483 | ANCIENT MINE | **regular** | THE MINE | — | STANDARD | 10 | 39 | 41 | 26 | 52 | 11.2 |
| 484 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 14 | 48 | 61 | 38 | 76 | 12.2 |
| 485 | THE MIMIC | boss | THE MINE | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 486 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 487 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 27 | 29 | 18 | 36 | 11.4 |
| 488 | LONG VEIL ROAD | **regular** | THE VEIL | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 12 |
| 489 | VEIL WALTZ | **regular** | THE VEIL | — | STANDARD | 10 | 39 | 57 | 36 | 72 | 12.6 |
| 490 | VEIL HOMECOMING | **regular** | THE VEIL | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 13 |
| 491 | VEIL RAPTURE | **regular** | THE VEIL | — | STANDARD | 16 | 46 | 50 | 31 | 62 | 14.9 |
| 492 | VEIL HUSH | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 63 | 39 | 78 | 10 |
| 493 | VEIL REUNION | **regular** | THE VEIL | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 494 | VEIL MIRAGE | **regular** | THE VEIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 495 | THE HASP | boss | THE VEIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 496 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 497 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 11.7 |
| 498 | WISP VOYAGE | **regular** | THE WISP | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 12 |
| 499 | WISP AND VEIL | **regular** | THE WISP | — | STANDARD | 10 | 40 | 57 | 36 | 72 | 12.7 |
| 500 | WISP LEGEND | **regular** | THE WISP | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 13.2 |
| 501 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 15.5 |
| 502 | WISP DREAM | **regular** | THE WISP | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 10 |
| 503 | WISP RELIC | **regular** | THE WISP | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 10.9 |
| 504 | WISP PARADOX | **regular** | THE WISP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 505 | THE RATCHET | boss | THE WISP | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 506 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 507 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 9 |
| 508 | GHOST HORIZON | **regular** | THE GHOST | — | STANDARD | 6 | 31 | 40 | 25 | 50 | 10.2 |
| 509 | GHOST MEETS WISP | **regular** | THE GHOST | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 11.2 |
| 510 | GHOST LEGEND | **regular** | THE GHOST | — | STANDARD | 10 | 37 | 61 | 38 | 76 | 12.4 |
| 511 | GHOST RAPTURE | **regular** | THE GHOST | — | STANDARD | 13 | 44 | 60 | 38 | 76 | 14.4 |
| 512 | LAZY GHOST | **regular** | THE GHOST | — | STANDARD | 7 | 40 | 64 | 40 | 80 | 9.1 |
| 513 | GHOST HOMECOMING | **regular** | THE GHOST | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 10.1 |
| 514 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.1 |
| 515 | THE FLUE | boss | THE GHOST | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 516 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 517 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 9.6 |
| 518 | CAROM VOYAGE | **regular** | THE CAROM | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 9.9 |
| 519 | CAROM ALLIANCE | **regular** | THE CAROM | — | STANDARD | 10 | 37 | 46 | 29 | 58 | 10.5 |
| 520 | OLD CAROM SONG | **regular** | THE CAROM | — | STANDARD | 10 | 38 | 45 | 28 | 56 | 11.7 |
| 521 | CAROM INFERNO | **regular** | THE CAROM | — | STANDARD | 16 | 48 | 70 | 44 | 88 | 13.6 |
| 522 | CAROM DREAM | **regular** | THE CAROM | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 9.7 |
| 523 | CAROM SAGA | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 55 | 34 | 68 | 10.6 |
| 524 | CAROM PARADOX | **regular** | THE CAROM | — | STANDARD | 14 | 48 | 54 | 34 | 68 | 11.6 |
| 525 | THE NETTLE | boss | THE CAROM | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 526 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 9.9 |
| 527 | FAR CAROM | **regular** | HELLO CAROM | — | STANDARD | 6 | 31 | 36 | 23 | 46 | 11.4 |
| 528 | CAROM TANGO | **regular** | HELLO CAROM | — | STANDARD | 12 | 39 | 49 | 31 | 62 | 12.1 |
| 529 | ANCIENT CAROM | **regular** | HELLO CAROM | — | STANDARD | 10 | 39 | 54 | 34 | 68 | 12.4 |
| 530 | CAROM OVERDRIVE | **regular** | HELLO CAROM | — | STANDARD | 16 | 47 | 57 | 36 | 72 | 14.4 |
| 531 | THE MANTLE | boss | HELLO CAROM | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 532 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 533 | GHOST AT WORLD END | **regular** | GHOST DAWN | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 10.8 |
| 534 | GHOST AND WISP | **regular** | GHOST DAWN | — | STANDARD | 9 | 36 | 39 | 24 | 48 | 11.3 |
| 535 | ANCIENT GHOST | **regular** | GHOST DAWN | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 12.6 |
| 536 | GHOST OVERDRIVE | **regular** | GHOST DAWN | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 14.6 |
| 537 | THE KEEL | boss | GHOST DAWN | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 538 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.5 |
| 539 | WISP PILGRIM | **regular** | WISP AWAKENS | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 11.1 |
| 540 | WISP MEETS VEIL | **regular** | WISP AWAKENS | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.5 |
| 541 | ANCIENT WISP | **regular** | WISP AWAKENS | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 12.3 |
| 542 | WISP RAPTURE | **regular** | WISP AWAKENS | — | STANDARD | 18 | 46 | 58 | 36 | 72 | 14.7 |
| 543 | THE VALVE | boss | WISP AWAKENS | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 544 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.8 |
| 545 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 11.4 |
| 546 | VEIL DUET | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 38 | 40 | 25 | 50 | 11.8 |
| 547 | VEIL SAGA | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 12.4 |
| 548 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 16 | 48 | 50 | 31 | 62 | 14.5 |
| 549 | THE SEAM | boss | NEW VEIL MOON | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 550 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 27 | 40 | 25 | 50 | 11.1 |
| 551 | MINE VOYAGE | **regular** | MINE AWAKENS | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 11.7 |
| 552 | MINE AND CRAWLER | **regular** | MINE AWAKENS | — | STANDARD | 13 | 39 | 56 | 35 | 70 | 12 |
| 553 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 12.3 |
| 554 | MINE ECLIPSE | **regular** | MINE AWAKENS | — | STANDARD | 16 | 48 | 64 | 40 | 80 | 14.3 |
| 555 | THE SLING | boss | MINE AWAKENS | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 556 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 30 | 60 | 38 | 76 | 11.4 |
| 557 | OUTER CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 12 |
| 558 | CRAWLER WALTZ | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 36 | 66 | 41 | 82 | 12.4 |
| 559 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 40 | 56 | 35 | 70 | 12.8 |
| 560 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 19 | 48 | 64 | 40 | 80 | 14.9 |
| 561 | THE CAPSTAN | boss | FIRST CRAWLER | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 562 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 11.7 |
| 563 | VOLLEY PILGRIM | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 48 | 30 | 60 | 12 |
| 564 | VOLLEY AND CRYSTAL | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 38 | 62 | 39 | 78 | 12.3 |
| 565 | VOLLEY REUNION | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 38 | 68 | 43 | 86 | 12.7 |
| 566 | VOLLEY ECLIPSE | **regular** | VOLLEY MORNING | — | STANDARD | 18 | 47 | 61 | 38 | 76 | 14.7 |
| 567 | THE GALL | boss | VOLLEY MORNING | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 568 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 31 | 37 | 23 | 46 | 10.5 |
| 569 | CRYSTAL PILGRIM | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 11.1 |
| 570 | CRYSTAL DUET | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 37 | 43 | 27 | 54 | 11.7 |
| 571 | CRYSTAL RELIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 12.3 |
| 572 | CRYSTAL APOCALYPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 47 | 53 | 33 | 66 | 14.4 |
| 573 | THE TRAPEZE | boss | NEW CRYSTAL MOON | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 574 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 11.4 |
| 575 | OUTER RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 12 |
| 576 | RECOIL DUET | **regular** | FIRST RECOIL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 12.3 |
| 577 | RECOIL HOMECOMING | **regular** | FIRST RECOIL | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 12.7 |
| 578 | RECOIL INFERNO | **regular** | FIRST RECOIL | — | STANDARD | 16 | 45 | 60 | 38 | 76 | 14.7 |
| 579 | THE GOVERNOR | boss | FIRST RECOIL | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 580 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 11.7 |
| 581 | LONG LID ROAD | **regular** | LID AWAKENS | — | STANDARD | 6 | 31 | 40 | 25 | 50 | 12 |
| 582 | LID ALLIANCE | **regular** | LID AWAKENS | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 12.5 |
| 583 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 12.9 |
| 584 | LID STORM | **regular** | LID AWAKENS | — | STANDARD | 16 | 47 | 55 | 34 | 68 | 15.1 |
| 585 | THE LATCH | boss | LID AWAKENS | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 586 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.9 |
| 587 | GYRE AT WORLD END | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 11.1 |
| 588 | GYRE TANGO | **regular** | GYRE DAWN | — | STANDARD | 12 | 38 | 77 | 48 | 96 | 11.8 |
| 589 | GYRE SAGA | **regular** | GYRE DAWN | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 13 |
| 590 | GYRE ECLIPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 48 | 52 | 33 | 66 | 14.8 |
| 591 | THE HYDRA | boss | GYRE DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 50 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 58 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 62 | FINALE | normal | 67 beats | 42 | 84 s | in band |
| 77 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 87 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 97 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 112 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 122 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 132 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 142 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 152 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 162 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 172 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 182 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 192 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 202 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 212 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 222 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 232 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 242 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 252 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 262 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 274 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 284 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 294 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 304 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 314 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 324 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 334 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 344 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 354 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 364 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 374 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 384 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 394 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 404 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 415 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 425 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 435 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 445 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 455 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 465 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 475 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 485 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 495 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 505 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 515 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 525 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 531 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 537 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 543 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 549 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 555 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 561 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 567 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 573 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 579 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 585 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 591 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
