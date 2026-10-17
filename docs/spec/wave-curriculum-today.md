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
| regular | 450 | 0 | 14 | 27 | 67 | 3 h 35 min | 7 h 10 min |
| intro | 57 | 0 | 3 | 23 | 51 | 24 min | 48 min |
| boss | 60 | 0 | 9 | 30 | 343 | 49 min | 1 h 39 min |
| every wave | 567 | 0 | 3 | 27 | 343 | 4 h 48 min | 9 h 37 min |

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
| 34 | THE SPLICE | boss (special) | SALVAGE | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 35 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 36 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 34 | 37 | 23 | 46 | 7 |
| 37 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 37 | 41 | 26 | 52 | 8.2 |
| 38 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 39 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 40 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 41 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 42 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 67 | 42 | 84 | — |
| 43 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 16 | 10 | 20 | 2.4 |
| 44 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.6 |
| 45 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 3.6 |
| 46 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 4 |
| 47 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 54 | 34 | 68 | 6 |
| 48 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 10 | 40 | 44 | 28 | 56 | 8 |
| 49 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 50 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.6 |
| 51 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 52 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 53 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 54 | HUSK PICNIC | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 2.8 |
| 55 | HUSK MEMORY | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 3.8 |
| 56 | HUSK TRICK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 44 | 28 | 56 | 4.7 |
| 57 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 58 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 34 | 21 | 42 | 3.6 |
| 59 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 45 | 28 | 56 | 3.6 |
| 60 | MORSEL HORIZON | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 43 | 27 | 54 | 5.7 |
| 61 | MORSEL DUET | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 44 | 28 | 56 | 6.7 |
| 62 | MORSEL HOMECOMING | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 40 | 56 | 35 | 70 | 8.7 |
| 63 | MORSEL FURY | **regular** | THE MORSEL | — | STANDARD 5 | 13 | 44 | 60 | 38 | 76 | 10.7 |
| 64 | MORSEL DREAM | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 40 | 49 | 31 | 62 | 6.2 |
| 65 | MORSEL LEGEND | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 36 | 42 | 26 | 52 | 7.2 |
| 66 | TWISTED MORSEL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 45 | 61 | 38 | 76 | 8.2 |
| 67 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 68 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD 5 | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 69 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD 5 | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 70 | SEEDER HORIZON | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 26 | 36 | 23 | 46 | 6 |
| 71 | SEEDER DUET | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 36 | 52 | 33 | 66 | 7 |
| 72 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 38 | 42 | 26 | 52 | 9 |
| 73 | SEEDER FURY | **regular** | THE SEEDER | — | STANDARD 5 | 16 | 48 | 64 | 40 | 80 | 11 |
| 74 | SEEDER DREAM | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 37 | 45 | 28 | 56 | 6.3 |
| 75 | SEEDER LEGEND | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 39 | 47 | 29 | 58 | 7.3 |
| 76 | TWISTED SEEDER | **regular** | THE SEEDER | — | STANDARD 5 | 11 | 44 | 54 | 34 | 68 | 8.3 |
| 77 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 78 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 79 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 4.2 |
| 80 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 6 | 28 | 37 | 23 | 46 | 6.3 |
| 81 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 7.3 |
| 82 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 9.3 |
| 83 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 16 | 48 | 64 | 40 | 80 | 11.3 |
| 84 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 85 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 86 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 87 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 27 | 17 | 34 | 3.6 |
| 88 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 38 | 24 | 48 | 3.4 |
| 89 | SOFT LANCE | **regular** | THE LANCE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.6 |
| 90 | LANCE SAGA | **regular** | THE LANCE | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 7.6 |
| 91 | CROOKED LANCE | **regular** | THE LANCE | — | STANDARD | 11 | 46 | 56 | 35 | 70 | 8.7 |
| 92 | THE MAZE | boss (special) | THE LANCE | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 93 | THE GLUTTON | intro | THE GLUTTON | glutton | STANDARD | 3 | 18 | 25 | 16 | 32 | 4.2 |
| 94 | LITTLE GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 4.2 |
| 95 | GLUTTON PILGRIM | **regular** | THE GLUTTON | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 6.3 |
| 96 | GLUTTON TOGETHER | **regular** | THE GLUTTON | — | STANDARD | 8 | 35 | 43 | 27 | 54 | 7.3 |
| 97 | GLUTTON RELIC | **regular** | THE GLUTTON | — | STANDARD | 8 | 40 | 42 | 26 | 52 | 9.3 |
| 98 | GLUTTON STORM | **regular** | THE GLUTTON | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 11.3 |
| 99 | GLUTTON LULLABY | **regular** | THE GLUTTON | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.4 |
| 100 | ANCIENT GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 8 | 39 | 41 | 26 | 52 | 7.4 |
| 101 | GLUTTON MIRAGE | **regular** | THE GLUTTON | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 8.5 |
| 102 | THE GEODE | boss | THE GLUTTON | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 103 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 3.6 |
| 104 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 3.6 |
| 105 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 5.6 |
| 106 | CROSSING AND GLUTTON | **regular** | THE CROSSING | — | STANDARD | 8 | 37 | 44 | 28 | 56 | 6.6 |
| 107 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8.6 |
| 108 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 10.6 |
| 109 | LAZY CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 38 | 45 | 28 | 56 | 5.2 |
| 110 | CROSSING REUNION | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 6.2 |
| 111 | CROSSING RIDDLE | **regular** | THE CROSSING | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 7.3 |
| 112 | THE GAUGE | boss (special) | THE CROSSING | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 113 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 114 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 115 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 7 |
| 116 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 8 |
| 117 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 10 |
| 118 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 12 |
| 119 | BEATBOX HUSH | **regular** | THE BEATBOX | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 6.5 |
| 120 | BEATBOX HOMECOMING | **regular** | THE BEATBOX | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.5 |
| 121 | BEATBOX PARADOX | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 49 | 31 | 62 | 8.5 |
| 122 | THE WARDEN | boss | THE BEATBOX | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 123 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 68 | 43 | 86 | 6.6 |
| 124 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.8 |
| 125 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9 |
| 126 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 33 | 47 | 29 | 58 | 10.1 |
| 127 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 12.1 |
| 128 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 55 | 34 | 68 | 14.1 |
| 129 | SLEEPY LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.9 |
| 130 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 7.9 |
| 131 | LIMPET SPELL | **regular** | THE LIMPET | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 8.9 |
| 132 | THE FLEET | boss (special) | THE LIMPET | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 133 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 42 | 44 | 28 | 56 | 3.9 |
| 134 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 135 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 136 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8 |
| 137 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 138 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 12 |
| 139 | WEIGHT SIESTA | **regular** | THE WEIGHT | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 6.9 |
| 140 | WEIGHT RELIC | **regular** | THE WEIGHT | — | STANDARD | 8 | 36 | 38 | 24 | 48 | 7.9 |
| 141 | WEIGHT ILLUSION | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 53 | 33 | 66 | 8.9 |
| 142 | THE VANE | boss | THE WEIGHT | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 143 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 144 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 145 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 6.7 |
| 146 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 147 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.7 |
| 148 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 16 | 48 | 60 | 38 | 76 | 11.7 |
| 149 | HEAVY ROCK PICNIC | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 150 | HEAVY ROCK MEMORY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 39 | 46 | 29 | 58 | 7.2 |
| 151 | HEAVY ROCK TRICK | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8 |
| 152 | SNAKE | boss (special) | HEAVY ROCKS | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 153 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 154 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 6.4 |
| 155 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 10.1 |
| 156 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 10.4 |
| 157 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 8 | 40 | 48 | 30 | 60 | 12 |
| 158 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 14 | 48 | 62 | 39 | 78 | 14 |
| 159 | LEECH SIESTA | **regular** | THE LEECH | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.5 |
| 160 | LEECH RELIC | **regular** | THE LEECH | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.5 |
| 161 | LEECH ILLUSION | **regular** | THE LEECH | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 8.5 |
| 162 | PINBALL | boss (special) | THE LEECH | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 163 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 164 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.1 |
| 165 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.1 |
| 166 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 7 | 39 | 43 | 27 | 54 | 8.5 |
| 167 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 8 | 36 | 38 | 24 | 48 | 10 |
| 168 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 12 |
| 169 | THROB SIESTA | **regular** | THE THROB | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 6.8 |
| 170 | THROB RELIC | **regular** | THE THROB | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 7.8 |
| 171 | THROB ILLUSION | **regular** | THE THROB | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 8.8 |
| 172 | THE SCOUT | boss (special) | THE THROB | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 173 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 174 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 6 | 32 | 37 | 23 | 46 | 6.3 |
| 175 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 8.7 |
| 176 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 33 | 40 | 25 | 50 | 9.3 |
| 177 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 10 |
| 178 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 12 |
| 179 | COUNT PICNIC | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 7 |
| 180 | COUNT MEMORY | **regular** | THE COUNT | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 8 |
| 181 | COUNT TRICK | **regular** | THE COUNT | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9 |
| 182 | THE HAUL | boss (special) | THE COUNT | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 183 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 184 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6.6 |
| 185 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 8.7 |
| 186 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9 |
| 187 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 10 |
| 188 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12 |
| 189 | SHELL HUSH | **regular** | THE SHELL | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 7 |
| 190 | SHELL HOMECOMING | **regular** | THE SHELL | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8 |
| 191 | SHELL PARADOX | **regular** | THE SHELL | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9 |
| 192 | THE STARE | boss | THE SHELL | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 193 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 194 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6.9 |
| 195 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 8.1 |
| 196 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.5 |
| 197 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 45 | 28 | 56 | 10 |
| 198 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12 |
| 199 | SOFT CHOKE | **regular** | THE CHOKE | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7 |
| 200 | CHOKE SAGA | **regular** | THE CHOKE | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 8 |
| 201 | CROOKED CHOKE | **regular** | THE CHOKE | — | STANDARD | 12 | 47 | 52 | 33 | 66 | 9 |
| 202 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 203 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 204 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6.6 |
| 205 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 206 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.9 |
| 207 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 208 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 12 |
| 209 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 6.9 |
| 210 | RIND HOMECOMING | **regular** | THE RIND | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 7.9 |
| 211 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.9 |
| 212 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 213 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 56 | 35 | 70 | 3.6 |
| 214 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 6.9 |
| 215 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.4 |
| 216 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 8.8 |
| 217 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 10 |
| 218 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 12 |
| 219 | VEER LULLABY | **regular** | THE VEER | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 7 |
| 220 | ANCIENT VEER | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8 |
| 221 | VEER MIRAGE | **regular** | THE VEER | — | STANDARD | 11 | 47 | 61 | 38 | 76 | 9 |
| 222 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 223 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 224 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 7.2 |
| 225 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 8.7 |
| 226 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 33 | 39 | 24 | 48 | 9.2 |
| 227 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 228 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 14 | 48 | 62 | 39 | 78 | 12 |
| 229 | SLEEPY STRAND | **regular** | THE STRAND | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 7.3 |
| 230 | OLD STRAND SONG | **regular** | THE STRAND | — | STANDARD | 8 | 39 | 41 | 26 | 52 | 8.3 |
| 231 | STRAND SPELL | **regular** | THE STRAND | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 9.3 |
| 232 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 233 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 234 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 235 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 236 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 237 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 238 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 239 | SLEEPY CLAW | **regular** | THE CLAW | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 7.3 |
| 240 | OLD CLAW SONG | **regular** | THE CLAW | — | STANDARD | 8 | 39 | 46 | 29 | 58 | 8.3 |
| 241 | CLAW SPELL | **regular** | THE CLAW | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 9.3 |
| 242 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 243 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 244 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 245 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 246 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 27 | 36 | 23 | 46 | 7.5 |
| 247 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 8.4 |
| 248 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 35 | 44 | 28 | 56 | 9.2 |
| 249 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 10 |
| 250 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 15 | 45 | 52 | 33 | 66 | 12.1 |
| 251 | FENCE LULLABY | **regular** | THE FENCE | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 7.6 |
| 252 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 8.6 |
| 253 | FENCE MIRAGE | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 53 | 33 | 66 | 9.6 |
| 254 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 255 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 52 | 55 | 34 | 68 | 4.5 |
| 256 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7.8 |
| 257 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 32 | 20 | 40 | 8.4 |
| 258 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 34 | 43 | 27 | 54 | 8.9 |
| 259 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 56 | 35 | 70 | 10 |
| 260 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 17 | 46 | 53 | 33 | 66 | 12 |
| 261 | MAGNET DREAM | **regular** | THE MAGNET | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 7.9 |
| 262 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.9 |
| 263 | TWISTED MAGNET | **regular** | THE MAGNET | — | STANDARD | 12 | 47 | 56 | 35 | 70 | 9.9 |
| 264 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 265 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 266 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 8.1 |
| 267 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 8.7 |
| 268 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 8 | 32 | 36 | 23 | 46 | 9 |
| 269 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 10 |
| 270 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 15 | 48 | 51 | 32 | 64 | 12 |
| 271 | CHOIR SIESTA | **regular** | THE CHOIR | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 8.2 |
| 272 | CHOIR RELIC | **regular** | THE CHOIR | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.2 |
| 273 | CHOIR ILLUSION | **regular** | THE CHOIR | — | STANDARD | 11 | 47 | 51 | 32 | 64 | 10.2 |
| 274 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 275 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 276 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 277 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 10.4 |
| 278 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 11.1 |
| 279 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.8 |
| 280 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 281 | LAZY DARK | **regular** | THE DARK | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 8.8 |
| 282 | DARK REUNION | **regular** | THE DARK | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.8 |
| 283 | DARK RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.8 |
| 284 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 285 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 72 | 45 | 90 | 4.5 |
| 286 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 32 | 60 | 38 | 76 | 8.4 |
| 287 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 288 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 9.5 |
| 289 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 10 |
| 290 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 15 | 47 | 66 | 41 | 82 | 12 |
| 291 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8.5 |
| 292 | BALLOON HOMECOMING | **regular** | THE BALLOON | — | STANDARD | 10 | 38 | 54 | 34 | 68 | 9.5 |
| 293 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 13 | 48 | 63 | 39 | 78 | 10.5 |
| 294 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 295 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 296 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 8.7 |
| 297 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 298 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 87 | 54 | 108 | 9.3 |
| 299 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 38 | 87 | 54 | 108 | 9.7 |
| 300 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 16 | 46 | 72 | 45 | 90 | 11.7 |
| 301 | SLEEPY MOULT | **regular** | THE MOULT | — | STANDARD | 7 | 39 | 77 | 48 | 96 | 8.8 |
| 302 | OLD MOULT SONG | **regular** | THE MOULT | — | STANDARD | 10 | 39 | 77 | 48 | 96 | 9.8 |
| 303 | MOULT SPELL | **regular** | THE MOULT | — | STANDARD | 12 | 43 | 87 | 54 | 108 | 10.8 |
| 304 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 305 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 6.5 |
| 306 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 307 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 9 |
| 308 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 34 | 87 | 54 | 108 | 9.5 |
| 309 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 10 |
| 310 | COIL THUNDER | **regular** | THE COIL | — | STANDARD | 16 | 47 | 107 | 67 | 134 | 12.3 |
| 311 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 34 | 41 | 26 | 52 | 8.1 |
| 312 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 9 | 38 | 40 | 25 | 50 | 9.1 |
| 313 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 13 | 48 | 97 | 61 | 122 | 10.1 |
| 314 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 315 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 316 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 317 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 12.1 |
| 318 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 11 | 40 | 87 | 54 | 108 | 13.1 |
| 319 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 15 |
| 320 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 18 | 45 | 97 | 61 | 122 | 17 |
| 321 | LAZY CODEX | **regular** | THE CODEX | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 322 | CODEX REUNION | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 323 | CODEX RIDDLE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 12 |
| 324 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 325 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 20 | 31 | 19 | 38 | 6.5 |
| 326 | LURE RISING | **regular** | THE LURE | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.7 |
| 327 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.4 |
| 328 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 34 | 48 | 30 | 60 | 9.1 |
| 329 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 40 | 54 | 34 | 68 | 9.8 |
| 330 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 17 | 46 | 53 | 33 | 66 | 11.8 |
| 331 | SLEEPY LURE | **regular** | THE LURE | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.9 |
| 332 | OLD LURE SONG | **regular** | THE LURE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 7.9 |
| 333 | LURE SPELL | **regular** | THE LURE | — | STANDARD | 12 | 43 | 52 | 33 | 66 | 8.9 |
| 334 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 335 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 76 | 48 | 96 | 6.8 |
| 336 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 31 | 37 | 23 | 46 | 9.8 |
| 337 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 11.8 |
| 338 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 12.8 |
| 339 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 14.7 |
| 340 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 18 | 47 | 51 | 32 | 64 | 16.6 |
| 341 | JAM HUSH | **regular** | THE JAM | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 9.7 |
| 342 | JAM HOMECOMING | **regular** | THE JAM | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.7 |
| 343 | JAM PARADOX | **regular** | THE JAM | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 11.7 |
| 344 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 345 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 346 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 36 | 23 | 46 | 6.8 |
| 347 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 8.4 |
| 348 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 41 | 26 | 52 | 8.8 |
| 349 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 10 |
| 350 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 15 | 48 | 59 | 37 | 74 | 12.4 |
| 351 | CLASP SIESTA | **regular** | THE CLASP | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 6.9 |
| 352 | CLASP RELIC | **regular** | THE CLASP | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 7.8 |
| 353 | CLASP ILLUSION | **regular** | THE CLASP | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 8.8 |
| 354 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 355 | THE DART | intro | THE DART | dart | STANDARD | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 356 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6.9 |
| 357 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.7 |
| 358 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 9.1 |
| 359 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 360 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 17 | 48 | 51 | 32 | 64 | 12.3 |
| 361 | DART SIESTA | **regular** | THE DART | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7 |
| 362 | DART RELIC | **regular** | THE DART | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.9 |
| 363 | DART ILLUSION | **regular** | THE DART | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 8.9 |
| 364 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 365 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 44 | 47 | 29 | 58 | 4 |
| 366 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7 |
| 367 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 368 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 9.6 |
| 369 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 370 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 17 | 46 | 49 | 31 | 62 | 12 |
| 371 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 372 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 8.1 |
| 373 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.1 |
| 374 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11.1 |
| 375 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 13.2 |
| 376 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 20 | 46 | 50 | 31 | 62 | 15.2 |
| 377 | GYRE PICNIC | **regular** | THE GYRE | — | STANDARD | 6 | 33 | 35 | 22 | 44 | 8.2 |
| 378 | GYRE MEMORY | **regular** | THE GYRE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.2 |
| 379 | GYRE TRICK | **regular** | THE GYRE | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 10.2 |
| 380 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 381 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 382 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 383 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.8 |
| 384 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.6 |
| 385 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 40 | 43 | 27 | 54 | 12.2 |
| 386 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 14.1 |
| 387 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 47 | 50 | 31 | 62 | 16.1 |
| 388 | HANDOVER PICNIC | **regular** | THE HANDOVER | — | STANDARD | 7 | 40 | 47 | 29 | 58 | 10 |
| 389 | HANDOVER MEMORY | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 11 |
| 390 | HANDOVER TRICK | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 12 |
| 391 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 392 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 393 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8.4 |
| 394 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9.9 |
| 395 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 10.9 |
| 396 | LID MEMORY | **regular** | THE LID | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 12.9 |
| 397 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 20 | 46 | 55 | 34 | 68 | 14.9 |
| 398 | LID HUSH | **regular** | THE LID | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 8.5 |
| 399 | LID HOMECOMING | **regular** | THE LID | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 9.5 |
| 400 | LID PARADOX | **regular** | THE LID | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.5 |
| 401 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 402 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 403 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 30 | 36 | 23 | 46 | 8.7 |
| 404 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.5 |
| 405 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 38 | 41 | 26 | 52 | 11.4 |
| 406 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 12.9 |
| 407 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 14.9 |
| 408 | RECOIL SIESTA | **regular** | THE RECOIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 8.8 |
| 409 | RECOIL RELIC | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 45 | 28 | 56 | 9.8 |
| 410 | RECOIL ILLUSION | **regular** | THE RECOIL | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 10.8 |
| 411 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 412 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 413 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 9 |
| 414 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 10.8 |
| 415 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 416 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 9 | 39 | 43 | 27 | 54 | 13.5 |
| 417 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 15.5 |
| 418 | SOFT CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 9.1 |
| 419 | CRYSTAL SAGA | **regular** | THE CRYSTAL | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 10.1 |
| 420 | CROOKED CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.1 |
| 421 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 422 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 423 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.6 |
| 424 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 28 | 47 | 29 | 58 | 9.9 |
| 425 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 10 | 36 | 60 | 38 | 76 | 10.6 |
| 426 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 59 | 37 | 74 | 12.6 |
| 427 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 18 | 48 | 67 | 42 | 84 | 14.6 |
| 428 | VOLLEY PICNIC | **regular** | THE VOLLEY | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.7 |
| 429 | VOLLEY MEMORY | **regular** | THE VOLLEY | — | STANDARD | 8 | 35 | 59 | 37 | 74 | 10.7 |
| 430 | VOLLEY TRICK | **regular** | THE VOLLEY | — | STANDARD | 12 | 43 | 69 | 43 | 86 | 11.7 |
| 431 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 432 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 433 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.8 |
| 434 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 29 | 47 | 29 | 58 | 11.8 |
| 435 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 35 | 97 | 61 | 122 | 12.8 |
| 436 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 38 | 58 | 36 | 72 | 14.6 |
| 437 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 48 | 68 | 43 | 86 | 16.6 |
| 438 | FLIP DREAM | **regular** | THE FLIP | — | STANDARD | 7 | 40 | 49 | 31 | 62 | 10 |
| 439 | FLIP LEGEND | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 57 | 36 | 72 | 11 |
| 440 | TWISTED FLIP | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 70 | 44 | 88 | 12 |
| 441 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 442 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 443 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 9.7 |
| 444 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 445 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 40 | 60 | 38 | 76 | 11.4 |
| 446 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 49 | 31 | 62 | 12.9 |
| 447 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 20 | 48 | 71 | 44 | 88 | 14.9 |
| 448 | CRAWLER HUSH | **regular** | THE CRAWLER | — | STANDARD | 7 | 39 | 48 | 30 | 60 | 9.8 |
| 449 | CRAWLER HOMECOMING | **regular** | THE CRAWLER | — | STANDARD | 10 | 39 | 59 | 37 | 74 | 10.8 |
| 450 | CRAWLER PARADOX | **regular** | THE CRAWLER | — | STANDARD | 14 | 47 | 72 | 45 | 90 | 11.8 |
| 451 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 452 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.2 |
| 453 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 28 | 44 | 28 | 56 | 9.8 |
| 454 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 10.5 |
| 455 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11.5 |
| 456 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 13.1 |
| 457 | MINE STORM | **regular** | THE MINE | — | STANDARD | 18 | 48 | 54 | 34 | 68 | 15.1 |
| 458 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 9.7 |
| 459 | MINE REUNION | **regular** | THE MINE | — | STANDARD | 10 | 39 | 87 | 54 | 108 | 10.7 |
| 460 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.7 |
| 461 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 462 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 463 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 464 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 11.1 |
| 465 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11.9 |
| 466 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 45 | 28 | 56 | 13.5 |
| 467 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 17 | 46 | 48 | 30 | 60 | 15.3 |
| 468 | SLEEPY VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 10 |
| 469 | OLD VEIL SONG | **regular** | THE VEIL | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 11 |
| 470 | VEIL SPELL | **regular** | THE VEIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 471 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 472 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 473 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 474 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 28 | 58 | 36 | 72 | 10.5 |
| 475 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11 |
| 476 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.9 |
| 477 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 17 | 46 | 63 | 39 | 78 | 14.9 |
| 478 | WISP DREAM | **regular** | THE WISP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 479 | WISP LEGEND | **regular** | THE WISP | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 11 |
| 480 | TWISTED WISP | **regular** | THE WISP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 481 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 482 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 483 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.8 |
| 484 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 12 |
| 485 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 13 |
| 486 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 37 | 62 | 39 | 78 | 13.5 |
| 487 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 18 | 46 | 58 | 36 | 72 | 15.5 |
| 488 | LAZY GHOST | **regular** | THE GHOST | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 10 |
| 489 | GHOST REUNION | **regular** | THE GHOST | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 490 | GHOST RIDDLE | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 491 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 492 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 493 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 11.1 |
| 494 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 26 | 32 | 20 | 40 | 11.4 |
| 495 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 496 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 12.6 |
| 497 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 20 | 48 | 52 | 33 | 66 | 14.6 |
| 498 | CAROM PICNIC | **regular** | THE CAROM | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 499 | CAROM MEMORY | **regular** | THE CAROM | — | STANDARD | 10 | 37 | 58 | 36 | 72 | 11 |
| 500 | CAROM TRICK | **regular** | THE CAROM | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 501 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 502 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 28 | 37 | 23 | 46 | 11.4 |
| 503 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 28 | 44 | 28 | 56 | 12 |
| 504 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 12 | 39 | 46 | 29 | 58 | 12.3 |
| 505 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 39 | 55 | 34 | 68 | 13 |
| 506 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 19 | 48 | 54 | 34 | 68 | 15.7 |
| 507 | THE SLING | boss | HELLO CAROM | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 508 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 28 | 87 | 54 | 108 | 11.7 |
| 509 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 12 |
| 510 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 11 | 39 | 43 | 27 | 54 | 12.3 |
| 511 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 13 |
| 512 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 20 | 47 | 50 | 31 | 62 | 15 |
| 513 | THE CAPSTAN | boss | GHOST DAWN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 514 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 9.9 |
| 515 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.6 |
| 516 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 11.3 |
| 517 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 12.5 |
| 518 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 14.4 |
| 519 | THE GALL | boss | WISP AWAKENS | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 520 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 27 | 29 | 18 | 36 | 10.2 |
| 521 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 522 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 12 | 36 | 40 | 25 | 50 | 12 |
| 523 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 13.1 |
| 524 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 20 | 48 | 61 | 38 | 76 | 15.1 |
| 525 | THE TRAPEZE | boss | NEW VEIL MOON | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 526 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 30 | 46 | 29 | 58 | 10.5 |
| 527 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 29 | 40 | 25 | 50 | 10.8 |
| 528 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 46 | 29 | 58 | 11.2 |
| 529 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 39 | 48 | 30 | 60 | 12.8 |
| 530 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 19 | 46 | 56 | 35 | 70 | 14.8 |
| 531 | THE FLUE | boss | MINE AWAKENS | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 532 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.8 |
| 533 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 53 | 33 | 66 | 11.4 |
| 534 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 535 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 12.9 |
| 536 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 20 | 48 | 68 | 43 | 86 | 14.9 |
| 537 | THE GOVERNOR | boss | FIRST CRAWLER | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 538 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 11.1 |
| 539 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 540 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 541 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 38 | 68 | 43 | 86 | 13.2 |
| 542 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 20 | 48 | 79 | 49 | 98 | 15.2 |
| 543 | THE LAMPREY | boss | VOLLEY MORNING | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 544 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 32 | 37 | 23 | 46 | 11.4 |
| 545 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 12 |
| 546 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 12.4 |
| 547 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 13 |
| 548 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 19 | 47 | 51 | 32 | 64 | 15 |
| 549 | THE MIMIC | boss | NEW CRYSTAL MOON | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 550 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 6 | 32 | 48 | 30 | 60 | 10.2 |
| 551 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 38 | 24 | 48 | 11.4 |
| 552 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 553 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 13 |
| 554 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 19 | 45 | 49 | 31 | 62 | 15 |
| 555 | THE LATCH | boss | FIRST RECOIL | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 556 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 10.5 |
| 557 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 558 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 559 | LID LEGEND | **regular** | LID AWAKENS | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 13.5 |
| 560 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 18 | 45 | 51 | 32 | 64 | 15.1 |
| 561 | THE CHRYSALIS | boss | LID AWAKENS | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 562 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 10.8 |
| 563 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 12 |
| 564 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 35 | 42 | 26 | 52 | 12.3 |
| 565 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 10 | 36 | 44 | 28 | 56 | 12.9 |
| 566 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 19 | 46 | 49 | 31 | 62 | 14.9 |
| 567 | THE HYDRA | boss | GYRE DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 29 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 34 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 38 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 42 | FINALE | normal | 67 beats | 42 | 84 s | in band |
| 57 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 67 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 77 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 92 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 102 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 112 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 122 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 132 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 142 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 152 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 162 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 172 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 182 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 192 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 202 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 212 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 222 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 232 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 242 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 254 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 264 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 274 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 284 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 294 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 304 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 314 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 324 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 334 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 344 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 354 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 364 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 380 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 391 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 401 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 411 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 421 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 431 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 441 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 451 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 461 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 471 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 481 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 491 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 501 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 507 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 513 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 519 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 525 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 531 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 537 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 543 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 549 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 555 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 561 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 567 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
