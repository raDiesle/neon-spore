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
| regular | 453 | 0 | 14 | 27 | 67 | 3 h 36 min | 7 h 12 min |
| intro | 57 | 0 | 3 | 23 | 51 | 24 min | 48 min |
| boss | 60 | 0 | 9 | 30 | 343 | 49 min | 1 h 39 min |
| every wave | 570 | 0 | 3 | 27 | 343 | 4 h 50 min | 9 h 39 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 64 | 67 | 42 | 84 | 2.4 |
| 2 | FIRST RED | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | RED WANDERER | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | RED TANGO | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 36 | 39 | 24 | 48 | 5.4 |
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
| 19 | TORCH ALLIANCE | **regular** | TORCH | — | STANDARD 4 | 8 | 34 | 48 | 30 | 60 | 6.7 |
| 20 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 21 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 22 | TAP SCATTER | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 41 | 44 | 28 | 56 | 7.5 |
| 23 | HOLD WANDERER | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 42 | 45 | 28 | 56 | 7.8 |
| 24 | SWIPE TOGETHER | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 39 | 42 | 26 | 52 | 7.8 |
| 25 | TURN SIESTA | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 42 | 45 | 28 | 56 | 7.4 |
| 26 | RUB MEMORY | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 27 | TWISTED COMBO | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 41 | 44 | 28 | 56 | 7.6 |
| 28 | LEVER FURY | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 29 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 82 | 51 | 102 | — |
| 30 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 31 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 32 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 33 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 34 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 35 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 34 | 37 | 23 | 46 | 7 |
| 36 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 37 | 41 | 26 | 52 | 8.2 |
| 37 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 38 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 39 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 40 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 41 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 67 | 42 | 84 | — |
| 42 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 16 | 10 | 20 | 2.4 |
| 43 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.6 |
| 44 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 3.6 |
| 45 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 4 |
| 46 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 54 | 34 | 68 | 6 |
| 47 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 10 | 40 | 44 | 28 | 56 | 8 |
| 48 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 49 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.6 |
| 50 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 51 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 52 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 53 | HUSK PICNIC | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 2.8 |
| 54 | HUSK MEMORY | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 3.8 |
| 55 | HUSK TRICK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 44 | 28 | 56 | 4.7 |
| 56 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 57 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 34 | 21 | 42 | 3.6 |
| 58 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 45 | 28 | 56 | 3.6 |
| 59 | MORSEL HORIZON | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 43 | 27 | 54 | 5.7 |
| 60 | MORSEL DUET | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 44 | 28 | 56 | 6.7 |
| 61 | MORSEL HOMECOMING | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 40 | 56 | 35 | 70 | 8.7 |
| 62 | MORSEL FURY | **regular** | THE MORSEL | — | STANDARD 5 | 13 | 44 | 60 | 38 | 76 | 10.7 |
| 63 | MORSEL DREAM | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 40 | 49 | 31 | 62 | 6.2 |
| 64 | MORSEL LEGEND | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 36 | 42 | 26 | 52 | 7.2 |
| 65 | TWISTED MORSEL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 45 | 61 | 38 | 76 | 8.2 |
| 66 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 67 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD 5 | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 68 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD 5 | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 69 | SEEDER HORIZON | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 26 | 36 | 23 | 46 | 6 |
| 70 | SEEDER DUET | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 36 | 52 | 33 | 66 | 7 |
| 71 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 38 | 42 | 26 | 52 | 9 |
| 72 | SEEDER FURY | **regular** | THE SEEDER | — | STANDARD 5 | 16 | 48 | 64 | 40 | 80 | 11 |
| 73 | SEEDER DREAM | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 37 | 45 | 28 | 56 | 6.3 |
| 74 | SEEDER LEGEND | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 39 | 47 | 29 | 58 | 7.3 |
| 75 | TWISTED SEEDER | **regular** | THE SEEDER | — | STANDARD 5 | 11 | 44 | 54 | 34 | 68 | 8.3 |
| 76 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 77 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 78 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 4.2 |
| 79 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 6 | 28 | 37 | 23 | 46 | 6.3 |
| 80 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 7.3 |
| 81 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 9.3 |
| 82 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 16 | 48 | 64 | 40 | 80 | 11.3 |
| 83 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 84 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 85 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 86 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 27 | 17 | 34 | 3.6 |
| 87 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 38 | 24 | 48 | 3.4 |
| 88 | SOFT LANCE | **regular** | THE LANCE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.6 |
| 89 | LANCE SAGA | **regular** | THE LANCE | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 7.6 |
| 90 | CROOKED LANCE | **regular** | THE LANCE | — | STANDARD | 11 | 46 | 56 | 35 | 70 | 8.7 |
| 91 | THE MAZE | boss (special) | THE LANCE | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 92 | THE GLUTTON | intro | THE GLUTTON | glutton | STANDARD | 3 | 18 | 25 | 16 | 32 | 4.2 |
| 93 | LITTLE GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 4.2 |
| 94 | GLUTTON PILGRIM | **regular** | THE GLUTTON | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 6.3 |
| 95 | GLUTTON TOGETHER | **regular** | THE GLUTTON | — | STANDARD | 8 | 35 | 43 | 27 | 54 | 7.3 |
| 96 | GLUTTON RELIC | **regular** | THE GLUTTON | — | STANDARD | 8 | 40 | 42 | 26 | 52 | 9.3 |
| 97 | GLUTTON STORM | **regular** | THE GLUTTON | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 11.3 |
| 98 | GLUTTON LULLABY | **regular** | THE GLUTTON | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.4 |
| 99 | ANCIENT GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 8 | 39 | 41 | 26 | 52 | 7.4 |
| 100 | GLUTTON MIRAGE | **regular** | THE GLUTTON | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 8.5 |
| 101 | THE GEODE | boss | THE GLUTTON | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 102 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 3.6 |
| 103 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 3.6 |
| 104 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 5.6 |
| 105 | CROSSING AND GLUTTON | **regular** | THE CROSSING | — | STANDARD | 8 | 37 | 44 | 28 | 56 | 6.6 |
| 106 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8.6 |
| 107 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 10.6 |
| 108 | LAZY CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 38 | 45 | 28 | 56 | 5.2 |
| 109 | CROSSING REUNION | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 6.2 |
| 110 | CROSSING RIDDLE | **regular** | THE CROSSING | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 7.3 |
| 111 | THE GAUGE | boss (special) | THE CROSSING | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 112 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 113 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 114 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 7 |
| 115 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 8 |
| 116 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 10 |
| 117 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 12 |
| 118 | BEATBOX HUSH | **regular** | THE BEATBOX | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 6.5 |
| 119 | BEATBOX HOMECOMING | **regular** | THE BEATBOX | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.5 |
| 120 | BEATBOX PARADOX | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 49 | 31 | 62 | 8.5 |
| 121 | THE WARDEN | boss | THE BEATBOX | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 122 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 68 | 43 | 86 | 6.6 |
| 123 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.8 |
| 124 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9 |
| 125 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 33 | 47 | 29 | 58 | 10.1 |
| 126 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 12.1 |
| 127 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 55 | 34 | 68 | 14.1 |
| 128 | SLEEPY LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.9 |
| 129 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 7.9 |
| 130 | LIMPET SPELL | **regular** | THE LIMPET | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 8.9 |
| 131 | THE FLEET | boss (special) | THE LIMPET | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 132 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 42 | 44 | 28 | 56 | 3.9 |
| 133 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 134 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 135 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8 |
| 136 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 137 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 12 |
| 138 | WEIGHT SIESTA | **regular** | THE WEIGHT | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 6.9 |
| 139 | WEIGHT RELIC | **regular** | THE WEIGHT | — | STANDARD | 8 | 36 | 38 | 24 | 48 | 7.9 |
| 140 | WEIGHT ILLUSION | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 53 | 33 | 66 | 8.9 |
| 141 | THE VANE | boss | THE WEIGHT | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 142 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 143 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 144 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 6.7 |
| 145 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 146 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.7 |
| 147 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 16 | 48 | 60 | 38 | 76 | 11.7 |
| 148 | HEAVY ROCK PICNIC | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 149 | HEAVY ROCK MEMORY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 39 | 46 | 29 | 58 | 7.2 |
| 150 | HEAVY ROCK TRICK | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8 |
| 151 | SNAKE | boss (special) | HEAVY ROCKS | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 152 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 153 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 6.4 |
| 154 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 10.1 |
| 155 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 10.4 |
| 156 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 8 | 40 | 48 | 30 | 60 | 12 |
| 157 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 14 | 48 | 62 | 39 | 78 | 14 |
| 158 | LEECH SIESTA | **regular** | THE LEECH | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.5 |
| 159 | LEECH RELIC | **regular** | THE LEECH | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.5 |
| 160 | LEECH ILLUSION | **regular** | THE LEECH | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 8.5 |
| 161 | PINBALL | boss (special) | THE LEECH | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 162 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 163 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.1 |
| 164 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.1 |
| 165 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 7 | 39 | 43 | 27 | 54 | 8.5 |
| 166 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 8 | 36 | 38 | 24 | 48 | 10 |
| 167 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 12 |
| 168 | THROB SIESTA | **regular** | THE THROB | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 6.8 |
| 169 | THROB RELIC | **regular** | THE THROB | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 7.8 |
| 170 | THROB ILLUSION | **regular** | THE THROB | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 8.8 |
| 171 | THE SCOUT | boss (special) | THE THROB | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 172 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 173 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 6 | 32 | 37 | 23 | 46 | 6.3 |
| 174 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 8.7 |
| 175 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 33 | 40 | 25 | 50 | 9.3 |
| 176 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 10 |
| 177 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 12 |
| 178 | COUNT PICNIC | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 7 |
| 179 | COUNT MEMORY | **regular** | THE COUNT | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 8 |
| 180 | COUNT TRICK | **regular** | THE COUNT | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9 |
| 181 | THE HAUL | boss (special) | THE COUNT | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 182 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 183 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6.6 |
| 184 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 8.7 |
| 185 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9 |
| 186 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 10 |
| 187 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12 |
| 188 | SHELL HUSH | **regular** | THE SHELL | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 7 |
| 189 | SHELL HOMECOMING | **regular** | THE SHELL | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8 |
| 190 | SHELL PARADOX | **regular** | THE SHELL | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9 |
| 191 | THE STARE | boss | THE SHELL | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 192 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 193 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6.9 |
| 194 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 8.1 |
| 195 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.5 |
| 196 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 45 | 28 | 56 | 10 |
| 197 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12 |
| 198 | SOFT CHOKE | **regular** | THE CHOKE | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7 |
| 199 | CHOKE SAGA | **regular** | THE CHOKE | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 8 |
| 200 | CROOKED CHOKE | **regular** | THE CHOKE | — | STANDARD | 12 | 47 | 52 | 33 | 66 | 9 |
| 201 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 202 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 203 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6.6 |
| 204 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 205 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.9 |
| 206 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 207 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 12 |
| 208 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 6.9 |
| 209 | RIND HOMECOMING | **regular** | THE RIND | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 7.9 |
| 210 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.9 |
| 211 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 212 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 56 | 35 | 70 | 3.6 |
| 213 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 6.9 |
| 214 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.4 |
| 215 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 8.8 |
| 216 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 10 |
| 217 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 12 |
| 218 | VEER LULLABY | **regular** | THE VEER | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 7 |
| 219 | ANCIENT VEER | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8 |
| 220 | VEER MIRAGE | **regular** | THE VEER | — | STANDARD | 11 | 47 | 61 | 38 | 76 | 9 |
| 221 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 222 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 223 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 7.2 |
| 224 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 8.7 |
| 225 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 33 | 39 | 24 | 48 | 9.2 |
| 226 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 227 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 14 | 48 | 62 | 39 | 78 | 12 |
| 228 | SLEEPY STRAND | **regular** | THE STRAND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 7.3 |
| 229 | OLD STRAND SONG | **regular** | THE STRAND | — | STANDARD | 8 | 39 | 41 | 26 | 52 | 8.3 |
| 230 | STRAND SPELL | **regular** | THE STRAND | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 9.3 |
| 231 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 232 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 233 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 234 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 235 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 236 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 237 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 238 | SLEEPY CLAW | **regular** | THE CLAW | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 7.3 |
| 239 | OLD CLAW SONG | **regular** | THE CLAW | — | STANDARD | 8 | 39 | 46 | 29 | 58 | 8.3 |
| 240 | CLAW SPELL | **regular** | THE CLAW | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 9.3 |
| 241 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 242 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 243 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 244 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 245 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 27 | 36 | 23 | 46 | 7.5 |
| 246 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 8.4 |
| 247 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 35 | 44 | 28 | 56 | 9.2 |
| 248 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 10 |
| 249 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 15 | 45 | 52 | 33 | 66 | 12.1 |
| 250 | FENCE LULLABY | **regular** | THE FENCE | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 7.6 |
| 251 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 8.6 |
| 252 | FENCE MIRAGE | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 53 | 33 | 66 | 9.6 |
| 253 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 254 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 52 | 55 | 34 | 68 | 4.5 |
| 255 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7.8 |
| 256 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 32 | 20 | 40 | 8.4 |
| 257 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 34 | 43 | 27 | 54 | 8.9 |
| 258 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 56 | 35 | 70 | 10 |
| 259 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 17 | 46 | 53 | 33 | 66 | 12 |
| 260 | MAGNET DREAM | **regular** | THE MAGNET | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 7.9 |
| 261 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.9 |
| 262 | TWISTED MAGNET | **regular** | THE MAGNET | — | STANDARD | 12 | 47 | 56 | 35 | 70 | 9.9 |
| 263 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 264 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 265 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 8.1 |
| 266 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 8.7 |
| 267 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 8 | 32 | 36 | 23 | 46 | 9 |
| 268 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 10 |
| 269 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 15 | 48 | 51 | 32 | 64 | 12 |
| 270 | CHOIR SIESTA | **regular** | THE CHOIR | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 8.2 |
| 271 | CHOIR RELIC | **regular** | THE CHOIR | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.2 |
| 272 | CHOIR ILLUSION | **regular** | THE CHOIR | — | STANDARD | 11 | 47 | 51 | 32 | 64 | 10.2 |
| 273 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 274 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 275 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 276 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 10.4 |
| 277 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 11.1 |
| 278 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.8 |
| 279 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 280 | LAZY DARK | **regular** | THE DARK | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 8.8 |
| 281 | DARK REUNION | **regular** | THE DARK | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.8 |
| 282 | DARK RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.8 |
| 283 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 284 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 72 | 45 | 90 | 4.5 |
| 285 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 32 | 60 | 38 | 76 | 8.4 |
| 286 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 287 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 9.5 |
| 288 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 10 |
| 289 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 15 | 47 | 66 | 41 | 82 | 12 |
| 290 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8.5 |
| 291 | BALLOON HOMECOMING | **regular** | THE BALLOON | — | STANDARD | 10 | 38 | 54 | 34 | 68 | 9.5 |
| 292 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 13 | 48 | 63 | 39 | 78 | 10.5 |
| 293 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 294 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 295 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 8.7 |
| 296 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 297 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 87 | 54 | 108 | 9.3 |
| 298 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 38 | 87 | 54 | 108 | 9.7 |
| 299 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 16 | 46 | 72 | 45 | 90 | 11.7 |
| 300 | SLEEPY MOULT | **regular** | THE MOULT | — | STANDARD | 7 | 39 | 77 | 48 | 96 | 8.8 |
| 301 | OLD MOULT SONG | **regular** | THE MOULT | — | STANDARD | 10 | 39 | 77 | 48 | 96 | 9.8 |
| 302 | MOULT SPELL | **regular** | THE MOULT | — | STANDARD | 12 | 43 | 87 | 54 | 108 | 10.8 |
| 303 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 304 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 6.5 |
| 305 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 306 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 9 |
| 307 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 34 | 87 | 54 | 108 | 9.5 |
| 308 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 10 |
| 309 | COIL THUNDER | **regular** | THE COIL | — | STANDARD | 16 | 47 | 107 | 67 | 134 | 12.3 |
| 310 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 34 | 41 | 26 | 52 | 8.1 |
| 311 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 9 | 38 | 40 | 25 | 50 | 9.1 |
| 312 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 13 | 48 | 97 | 61 | 122 | 10.1 |
| 313 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 314 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 315 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 316 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 12.1 |
| 317 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 11 | 40 | 87 | 54 | 108 | 13.1 |
| 318 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 15 |
| 319 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 18 | 45 | 97 | 61 | 122 | 17 |
| 320 | LAZY CODEX | **regular** | THE CODEX | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 321 | CODEX REUNION | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 322 | CODEX RIDDLE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 12 |
| 323 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 324 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 20 | 31 | 19 | 38 | 6.5 |
| 325 | LURE RISING | **regular** | THE LURE | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.7 |
| 326 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.4 |
| 327 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 34 | 48 | 30 | 60 | 9.1 |
| 328 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 40 | 54 | 34 | 68 | 9.8 |
| 329 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 17 | 46 | 53 | 33 | 66 | 11.8 |
| 330 | SLEEPY LURE | **regular** | THE LURE | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.9 |
| 331 | OLD LURE SONG | **regular** | THE LURE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 7.9 |
| 332 | LURE SPELL | **regular** | THE LURE | — | STANDARD | 12 | 43 | 52 | 33 | 66 | 8.9 |
| 333 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 334 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 76 | 48 | 96 | 6.8 |
| 335 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 31 | 37 | 23 | 46 | 9.8 |
| 336 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 11.8 |
| 337 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 12.8 |
| 338 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 14.7 |
| 339 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 18 | 47 | 51 | 32 | 64 | 16.6 |
| 340 | JAM HUSH | **regular** | THE JAM | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 9.7 |
| 341 | JAM HOMECOMING | **regular** | THE JAM | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.7 |
| 342 | JAM PARADOX | **regular** | THE JAM | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 11.7 |
| 343 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 344 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 345 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 36 | 23 | 46 | 6.8 |
| 346 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 8.4 |
| 347 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 41 | 26 | 52 | 8.8 |
| 348 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 10 |
| 349 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 15 | 48 | 59 | 37 | 74 | 12.4 |
| 350 | CLASP SIESTA | **regular** | THE CLASP | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 6.9 |
| 351 | CLASP RELIC | **regular** | THE CLASP | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 7.8 |
| 352 | CLASP ILLUSION | **regular** | THE CLASP | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 8.8 |
| 353 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 354 | THE DART | intro | THE DART | dart | STANDARD | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 355 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6.9 |
| 356 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.7 |
| 357 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 9.1 |
| 358 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 359 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 17 | 48 | 51 | 32 | 64 | 12.3 |
| 360 | DART SIESTA | **regular** | THE DART | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7 |
| 361 | DART RELIC | **regular** | THE DART | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.9 |
| 362 | DART ILLUSION | **regular** | THE DART | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 8.9 |
| 363 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 364 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 44 | 47 | 29 | 58 | 4 |
| 365 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7 |
| 366 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 367 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 9.6 |
| 368 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 369 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 17 | 46 | 49 | 31 | 62 | 12 |
| 370 | ECHO SIESTA | **regular** | THE ECHO | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 7.1 |
| 371 | ECHO RELIC | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.1 |
| 372 | ECHO ILLUSION | **regular** | THE ECHO | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 9 |
| 373 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 374 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 375 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 8.1 |
| 376 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.1 |
| 377 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11.1 |
| 378 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 13.2 |
| 379 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 20 | 46 | 50 | 31 | 62 | 15.2 |
| 380 | GYRE PICNIC | **regular** | THE GYRE | — | STANDARD | 6 | 33 | 35 | 22 | 44 | 8.2 |
| 381 | GYRE MEMORY | **regular** | THE GYRE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.2 |
| 382 | GYRE TRICK | **regular** | THE GYRE | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 10.2 |
| 383 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 384 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 385 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 386 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.8 |
| 387 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.6 |
| 388 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 40 | 43 | 27 | 54 | 12.2 |
| 389 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 14.1 |
| 390 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 47 | 50 | 31 | 62 | 16.1 |
| 391 | HANDOVER PICNIC | **regular** | THE HANDOVER | — | STANDARD | 7 | 40 | 47 | 29 | 58 | 10 |
| 392 | HANDOVER MEMORY | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 11 |
| 393 | HANDOVER TRICK | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 12 |
| 394 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 395 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 396 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8.4 |
| 397 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9.9 |
| 398 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 10.9 |
| 399 | LID MEMORY | **regular** | THE LID | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 12.9 |
| 400 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 20 | 46 | 55 | 34 | 68 | 14.9 |
| 401 | LID HUSH | **regular** | THE LID | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 8.5 |
| 402 | LID HOMECOMING | **regular** | THE LID | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 9.5 |
| 403 | LID PARADOX | **regular** | THE LID | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.5 |
| 404 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 405 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 406 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 30 | 36 | 23 | 46 | 8.7 |
| 407 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.5 |
| 408 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 38 | 41 | 26 | 52 | 11.4 |
| 409 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 12.9 |
| 410 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 14.9 |
| 411 | RECOIL SIESTA | **regular** | THE RECOIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 8.8 |
| 412 | RECOIL RELIC | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 45 | 28 | 56 | 9.8 |
| 413 | RECOIL ILLUSION | **regular** | THE RECOIL | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 10.8 |
| 414 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 415 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 416 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 9 |
| 417 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 10.8 |
| 418 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 419 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 9 | 39 | 43 | 27 | 54 | 13.5 |
| 420 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 15.5 |
| 421 | SOFT CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 9.1 |
| 422 | CRYSTAL SAGA | **regular** | THE CRYSTAL | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 10.1 |
| 423 | CROOKED CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.1 |
| 424 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 425 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 426 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.6 |
| 427 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 28 | 47 | 29 | 58 | 9.9 |
| 428 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 10 | 36 | 60 | 38 | 76 | 10.6 |
| 429 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 59 | 37 | 74 | 12.6 |
| 430 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 18 | 48 | 67 | 42 | 84 | 14.6 |
| 431 | VOLLEY PICNIC | **regular** | THE VOLLEY | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.7 |
| 432 | VOLLEY MEMORY | **regular** | THE VOLLEY | — | STANDARD | 8 | 35 | 59 | 37 | 74 | 10.7 |
| 433 | VOLLEY TRICK | **regular** | THE VOLLEY | — | STANDARD | 12 | 43 | 69 | 43 | 86 | 11.7 |
| 434 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 435 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 436 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.8 |
| 437 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 29 | 47 | 29 | 58 | 11.8 |
| 438 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 35 | 97 | 61 | 122 | 12.8 |
| 439 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 38 | 58 | 36 | 72 | 14.6 |
| 440 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 48 | 68 | 43 | 86 | 16.6 |
| 441 | FLIP DREAM | **regular** | THE FLIP | — | STANDARD | 7 | 40 | 49 | 31 | 62 | 10 |
| 442 | FLIP LEGEND | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 57 | 36 | 72 | 11 |
| 443 | TWISTED FLIP | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 70 | 44 | 88 | 12 |
| 444 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 445 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 446 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 9.7 |
| 447 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 448 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 40 | 60 | 38 | 76 | 11.4 |
| 449 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 49 | 31 | 62 | 12.9 |
| 450 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 20 | 48 | 71 | 44 | 88 | 14.9 |
| 451 | CRAWLER HUSH | **regular** | THE CRAWLER | — | STANDARD | 7 | 39 | 48 | 30 | 60 | 9.8 |
| 452 | CRAWLER HOMECOMING | **regular** | THE CRAWLER | — | STANDARD | 10 | 39 | 59 | 37 | 74 | 10.8 |
| 453 | CRAWLER PARADOX | **regular** | THE CRAWLER | — | STANDARD | 14 | 47 | 72 | 45 | 90 | 11.8 |
| 454 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 455 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.2 |
| 456 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 28 | 44 | 28 | 56 | 9.8 |
| 457 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 10.5 |
| 458 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11.5 |
| 459 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 13.1 |
| 460 | MINE STORM | **regular** | THE MINE | — | STANDARD | 18 | 48 | 54 | 34 | 68 | 15.1 |
| 461 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 9.7 |
| 462 | MINE REUNION | **regular** | THE MINE | — | STANDARD | 10 | 39 | 87 | 54 | 108 | 10.7 |
| 463 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.7 |
| 464 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 465 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 466 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 467 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 11.1 |
| 468 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11.9 |
| 469 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 45 | 28 | 56 | 13.5 |
| 470 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 17 | 46 | 48 | 30 | 60 | 15.3 |
| 471 | SLEEPY VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 10 |
| 472 | OLD VEIL SONG | **regular** | THE VEIL | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 11 |
| 473 | VEIL SPELL | **regular** | THE VEIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 474 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 475 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 476 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 477 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 28 | 58 | 36 | 72 | 10.5 |
| 478 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11 |
| 479 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.9 |
| 480 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 17 | 46 | 63 | 39 | 78 | 14.9 |
| 481 | WISP DREAM | **regular** | THE WISP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 482 | WISP LEGEND | **regular** | THE WISP | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 11 |
| 483 | TWISTED WISP | **regular** | THE WISP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 484 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 485 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 486 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.8 |
| 487 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 12 |
| 488 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 13 |
| 489 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 37 | 62 | 39 | 78 | 13.5 |
| 490 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 18 | 46 | 58 | 36 | 72 | 15.5 |
| 491 | LAZY GHOST | **regular** | THE GHOST | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 10 |
| 492 | GHOST REUNION | **regular** | THE GHOST | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 493 | GHOST RIDDLE | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 494 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 495 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 496 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 11.1 |
| 497 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 26 | 32 | 20 | 40 | 11.4 |
| 498 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 499 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 12.6 |
| 500 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 20 | 48 | 52 | 33 | 66 | 14.6 |
| 501 | CAROM PICNIC | **regular** | THE CAROM | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 502 | CAROM MEMORY | **regular** | THE CAROM | — | STANDARD | 10 | 37 | 58 | 36 | 72 | 11 |
| 503 | CAROM TRICK | **regular** | THE CAROM | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 504 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 505 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 28 | 37 | 23 | 46 | 11.4 |
| 506 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 28 | 44 | 28 | 56 | 12 |
| 507 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 12 | 39 | 46 | 29 | 58 | 12.3 |
| 508 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 39 | 55 | 34 | 68 | 13 |
| 509 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 19 | 48 | 54 | 34 | 68 | 15.7 |
| 510 | THE SLING | boss | HELLO CAROM | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 511 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 28 | 87 | 54 | 108 | 11.7 |
| 512 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 12 |
| 513 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 11 | 39 | 43 | 27 | 54 | 12.3 |
| 514 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 13 |
| 515 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 20 | 47 | 50 | 31 | 62 | 15 |
| 516 | THE CAPSTAN | boss | GHOST DAWN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 517 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 9.9 |
| 518 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.6 |
| 519 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 11.3 |
| 520 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 12.5 |
| 521 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 14.4 |
| 522 | THE GALL | boss | WISP AWAKENS | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 523 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 27 | 29 | 18 | 36 | 10.2 |
| 524 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 525 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 12 | 36 | 40 | 25 | 50 | 12 |
| 526 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 13.1 |
| 527 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 20 | 48 | 61 | 38 | 76 | 15.1 |
| 528 | THE TRAPEZE | boss | NEW VEIL MOON | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 529 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 30 | 46 | 29 | 58 | 10.5 |
| 530 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 29 | 40 | 25 | 50 | 10.8 |
| 531 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 46 | 29 | 58 | 11.2 |
| 532 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 39 | 48 | 30 | 60 | 12.8 |
| 533 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 19 | 46 | 56 | 35 | 70 | 14.8 |
| 534 | THE FLUE | boss | MINE AWAKENS | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 535 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.8 |
| 536 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 53 | 33 | 66 | 11.4 |
| 537 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 538 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 12.9 |
| 539 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 20 | 48 | 68 | 43 | 86 | 14.9 |
| 540 | THE GOVERNOR | boss | FIRST CRAWLER | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 541 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 11.1 |
| 542 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 543 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 544 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 38 | 68 | 43 | 86 | 13.2 |
| 545 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 20 | 48 | 79 | 49 | 98 | 15.2 |
| 546 | THE LAMPREY | boss | VOLLEY MORNING | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 547 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 32 | 37 | 23 | 46 | 11.4 |
| 548 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 12 |
| 549 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 12.4 |
| 550 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 13 |
| 551 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 19 | 47 | 51 | 32 | 64 | 15 |
| 552 | THE MIMIC | boss | NEW CRYSTAL MOON | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 553 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 6 | 32 | 48 | 30 | 60 | 10.2 |
| 554 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 38 | 24 | 48 | 11.4 |
| 555 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 556 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 13 |
| 557 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 19 | 45 | 49 | 31 | 62 | 15 |
| 558 | THE LATCH | boss | FIRST RECOIL | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 559 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 10.5 |
| 560 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 561 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 562 | LID LEGEND | **regular** | LID AWAKENS | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 13.5 |
| 563 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 18 | 45 | 51 | 32 | 64 | 15.1 |
| 564 | THE CHRYSALIS | boss | LID AWAKENS | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 565 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 10.8 |
| 566 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 12 |
| 567 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 35 | 42 | 26 | 52 | 12.3 |
| 568 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 10 | 36 | 44 | 28 | 56 | 12.9 |
| 569 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 19 | 46 | 49 | 31 | 62 | 14.9 |
| 570 | THE HYDRA | boss | GYRE DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 29 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 37 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 41 | FINALE | normal | 67 beats | 42 | 84 s | in band |
| 56 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 66 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 76 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 91 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 101 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 111 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 121 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 131 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 141 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 151 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 161 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 171 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 181 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 191 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 201 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 211 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 221 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 231 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 241 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 253 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 263 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 273 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 283 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 293 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 303 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 313 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 323 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 333 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 343 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 353 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 363 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 373 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 383 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 394 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 404 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 414 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 424 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 434 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 444 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 454 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 464 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 474 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 484 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 494 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 504 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 510 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 516 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 522 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 528 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 534 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 540 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 546 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 552 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 558 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 564 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 570 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
