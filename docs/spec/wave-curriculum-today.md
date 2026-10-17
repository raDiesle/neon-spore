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
| regular | 618 | 0 | 14 | 27 | 73 | 4 h 56 min | 9 h 53 min |
| intro | 57 | 0 | 3 | 23 | 51 | 24 min | 48 min |
| boss | 60 | 0 | 9 | 30 | 343 | 49 min | 1 h 39 min |
| every wave | 735 | 0 | 3 | 27 | 343 | 6 h 10 min | 12 h 20 min |

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
| 45 | HUSK DRIFT | **regular** | THE HUSK | — | STANDARD 5 | 4 | 29 | 32 | 20 | 40 | 3 |
| 46 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 3.6 |
| 47 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 4 |
| 48 | SLEEPY HUSK | **regular** | THE HUSK | — | STANDARD 5 | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 49 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD 5 | 4 | 34 | 37 | 23 | 46 | 3.4 |
| 50 | HUSK SPELL | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 51 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 8 | 40 | 44 | 28 | 56 | 5.5 |
| 52 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 53 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.6 |
| 54 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 55 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 56 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 57 | HUSK PICNIC | **regular** | THE HUSK | — | STANDARD 5 | 4 | 40 | 43 | 27 | 54 | 2.6 |
| 58 | HUSK MEMORY | **regular** | THE HUSK | — | STANDARD 5 | 4 | 32 | 35 | 22 | 44 | 3.6 |
| 59 | HUSK TRICK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 60 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 61 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 34 | 21 | 42 | 3.6 |
| 62 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 45 | 28 | 56 | 3.6 |
| 63 | MORSEL RAIN | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 30 | 46 | 29 | 58 | 4.8 |
| 64 | MORSEL HORIZON | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 43 | 27 | 54 | 6 |
| 65 | MORSEL DUET | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 33 | 43 | 27 | 54 | 7 |
| 66 | MORSEL HUSH | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 37 | 53 | 33 | 66 | 5.5 |
| 67 | MORSEL HOMECOMING | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 38 | 52 | 33 | 66 | 6.6 |
| 68 | MORSEL PARADOX | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 43 | 59 | 37 | 74 | 7.6 |
| 69 | MORSEL FURY | **regular** | THE MORSEL | — | STANDARD 5 | 13 | 44 | 60 | 38 | 76 | 8.6 |
| 70 | MORSEL DREAM | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 40 | 49 | 31 | 62 | 6.2 |
| 71 | MORSEL LEGEND | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 36 | 42 | 26 | 52 | 7.2 |
| 72 | TWISTED MORSEL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 45 | 61 | 38 | 76 | 8.2 |
| 73 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 74 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD 5 | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 75 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD 5 | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 76 | SEEDER RAIN | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 32 | 40 | 25 | 50 | 5.1 |
| 77 | SEEDER HORIZON | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 28 | 37 | 23 | 46 | 6.3 |
| 78 | SEEDER DUET | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 37 | 53 | 33 | 66 | 7.5 |
| 79 | SEEDER HUSH | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 35 | 43 | 27 | 54 | 6.1 |
| 80 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 38 | 52 | 33 | 66 | 7.3 |
| 81 | SEEDER PARADOX | **regular** | THE SEEDER | — | STANDARD 5 | 12 | 48 | 64 | 40 | 80 | 8.5 |
| 82 | SEEDER FURY | **regular** | THE SEEDER | — | STANDARD 5 | 16 | 48 | 64 | 40 | 80 | 9.5 |
| 83 | SEEDER DREAM | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 37 | 45 | 28 | 56 | 6.3 |
| 84 | SEEDER LEGEND | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 39 | 47 | 29 | 58 | 7.3 |
| 85 | TWISTED SEEDER | **regular** | THE SEEDER | — | STANDARD 5 | 11 | 44 | 54 | 34 | 68 | 8.3 |
| 86 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 87 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 88 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 4.2 |
| 89 | LANCE SCATTER | **regular** | THE LANCE | — | STANDARD | 6 | 29 | 38 | 24 | 48 | 5.4 |
| 90 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 6 | 27 | 37 | 23 | 46 | 6.6 |
| 91 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 8 | 34 | 50 | 31 | 62 | 7.6 |
| 92 | LANCE LULLABY | **regular** | THE LANCE | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.1 |
| 93 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 7.1 |
| 94 | LANCE MIRAGE | **regular** | THE LANCE | — | STANDARD | 11 | 44 | 54 | 34 | 68 | 8.2 |
| 95 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 16 | 48 | 64 | 40 | 80 | 9.2 |
| 96 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 97 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 98 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 99 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 27 | 17 | 34 | 3.6 |
| 100 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 38 | 24 | 48 | 3.4 |
| 101 | SOFT LANCE | **regular** | THE LANCE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.6 |
| 102 | LANCE SAGA | **regular** | THE LANCE | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 7.6 |
| 103 | CROOKED LANCE | **regular** | THE LANCE | — | STANDARD | 11 | 46 | 56 | 35 | 70 | 8.7 |
| 104 | THE MAZE | boss (special) | THE LANCE | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 105 | THE GLUTTON | intro | THE GLUTTON | glutton | STANDARD | 3 | 18 | 25 | 16 | 32 | 4.2 |
| 106 | LITTLE GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 4.2 |
| 107 | GLUTTON BLOOM | **regular** | THE GLUTTON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 5.4 |
| 108 | GLUTTON PILGRIM | **regular** | THE GLUTTON | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 6.6 |
| 109 | GLUTTON TOGETHER | **regular** | THE GLUTTON | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 7.6 |
| 110 | GLUTTON SIESTA | **regular** | THE GLUTTON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 6.1 |
| 111 | GLUTTON RELIC | **regular** | THE GLUTTON | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 7.1 |
| 112 | GLUTTON ILLUSION | **regular** | THE GLUTTON | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 8.1 |
| 113 | GLUTTON STORM | **regular** | THE GLUTTON | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 9.1 |
| 114 | GLUTTON LULLABY | **regular** | THE GLUTTON | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.4 |
| 115 | ANCIENT GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 8 | 39 | 41 | 26 | 52 | 7.4 |
| 116 | GLUTTON MIRAGE | **regular** | THE GLUTTON | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 8.5 |
| 117 | THE GEODE | boss | THE GLUTTON | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 118 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 3.6 |
| 119 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 3.6 |
| 120 | CROSSING SEEDS | **regular** | THE CROSSING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 4.6 |
| 121 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 5.6 |
| 122 | CROSSING AND GLUTTON | **regular** | THE CROSSING | — | STANDARD | 7 | 37 | 44 | 28 | 56 | 6.7 |
| 123 | CROSSING DREAM | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 5.2 |
| 124 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 6.2 |
| 125 | TWISTED CROSSING | **regular** | THE CROSSING | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 7.5 |
| 126 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 8.5 |
| 127 | LAZY CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 38 | 45 | 28 | 56 | 5.2 |
| 128 | CROSSING REUNION | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 6.2 |
| 129 | CROSSING RIDDLE | **regular** | THE CROSSING | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 7.3 |
| 130 | THE GAUGE | boss (special) | THE CROSSING | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 131 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 132 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 133 | BEATBOX DRIFT | **regular** | THE BEATBOX | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 5.4 |
| 134 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 7 |
| 135 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 8 |
| 136 | SLEEPY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 6.5 |
| 137 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.5 |
| 138 | BEATBOX SPELL | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 8.5 |
| 139 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 9.5 |
| 140 | BEATBOX HUSH | **regular** | THE BEATBOX | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 6.5 |
| 141 | BEATBOX HOMECOMING | **regular** | THE BEATBOX | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.5 |
| 142 | BEATBOX PARADOX | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 49 | 31 | 62 | 8.5 |
| 143 | THE WARDEN | boss | THE BEATBOX | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 144 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 68 | 43 | 86 | 6.6 |
| 145 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.8 |
| 146 | LIMPET BLOOM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 8 |
| 147 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9 |
| 148 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 9.8 |
| 149 | LIMPET SIESTA | **regular** | THE LIMPET | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 8.2 |
| 150 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 10.2 |
| 151 | LIMPET ILLUSION | **regular** | THE LIMPET | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 11.8 |
| 152 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 12.8 |
| 153 | SLEEPY LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.9 |
| 154 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 7.9 |
| 155 | LIMPET SPELL | **regular** | THE LIMPET | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 8.9 |
| 156 | THE FLEET | boss (special) | THE LIMPET | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 157 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 42 | 44 | 28 | 56 | 3.9 |
| 158 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 159 | WEIGHT SEEDS | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 5.7 |
| 160 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 161 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8 |
| 162 | WEIGHT DREAM | **regular** | THE WEIGHT | — | STANDARD | 6 | 35 | 37 | 23 | 46 | 6.6 |
| 163 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 37 | 23 | 46 | 7.6 |
| 164 | TWISTED WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.6 |
| 165 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 9.6 |
| 166 | WEIGHT SIESTA | **regular** | THE WEIGHT | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 6.9 |
| 167 | WEIGHT RELIC | **regular** | THE WEIGHT | — | STANDARD | 8 | 36 | 38 | 24 | 48 | 7.9 |
| 168 | WEIGHT ILLUSION | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 53 | 33 | 66 | 8.9 |
| 169 | THE VANE | boss | THE WEIGHT | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 170 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 171 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 172 | HEAVY ROCK CONFETTI | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 5.7 |
| 173 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 6.7 |
| 174 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 175 | LAZY HEAVY ROCK | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 176 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 7.2 |
| 177 | HEAVY ROCK RIDDLE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 8.2 |
| 178 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 9.2 |
| 179 | HEAVY ROCK PICNIC | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 180 | HEAVY ROCK MEMORY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 39 | 46 | 29 | 58 | 7.2 |
| 181 | HEAVY ROCK TRICK | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8 |
| 182 | SNAKE | boss (special) | HEAVY ROCKS | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 183 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 7 |
| 184 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 7.5 |
| 185 | LEECH SPRINKLE | **regular** | THE LEECH | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 8.8 |
| 186 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 10.1 |
| 187 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 8 | 39 | 50 | 31 | 62 | 11.1 |
| 188 | LEECH PICNIC | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 9.6 |
| 189 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 10.8 |
| 190 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 191 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 50 | 31 | 62 | 12.9 |
| 192 | LEECH SIESTA | **regular** | THE LEECH | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.6 |
| 193 | LEECH RELIC | **regular** | THE LEECH | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.6 |
| 194 | LEECH ILLUSION | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 9.6 |
| 195 | PINBALL | boss (special) | THE LEECH | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 196 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 197 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.1 |
| 198 | THROB SCATTER | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6.9 |
| 199 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.1 |
| 200 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.1 |
| 201 | THROB LULLABY | **regular** | THE THROB | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7.6 |
| 202 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.6 |
| 203 | THROB MIRAGE | **regular** | THE THROB | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9.6 |
| 204 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 10.6 |
| 205 | THROB SIESTA | **regular** | THE THROB | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 6.8 |
| 206 | THROB RELIC | **regular** | THE THROB | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 7.8 |
| 207 | THROB ILLUSION | **regular** | THE THROB | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 8.8 |
| 208 | THE SCOUT | boss (special) | THE THROB | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 209 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 210 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 5.4 |
| 211 | COUNT SCATTER | **regular** | THE COUNT | — | STANDARD | 6 | 32 | 37 | 23 | 46 | 6.9 |
| 212 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 8.7 |
| 213 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 9.7 |
| 214 | COUNT LULLABY | **regular** | THE COUNT | — | STANDARD | 6 | 34 | 40 | 25 | 50 | 8.2 |
| 215 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 9.2 |
| 216 | COUNT MIRAGE | **regular** | THE COUNT | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 10.2 |
| 217 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 11.2 |
| 218 | COUNT PICNIC | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 7 |
| 219 | COUNT MEMORY | **regular** | THE COUNT | — | STANDARD | 8 | 37 | 53 | 33 | 66 | 8 |
| 220 | COUNT TRICK | **regular** | THE COUNT | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9 |
| 221 | THE HAUL | boss (special) | THE COUNT | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 222 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 223 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 5.7 |
| 224 | SHELL SPRINKLE | **regular** | THE SHELL | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 7.5 |
| 225 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 8.7 |
| 226 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 9.7 |
| 227 | SHELL PICNIC | **regular** | THE SHELL | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 8.2 |
| 228 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 8 | 38 | 54 | 34 | 68 | 9.2 |
| 229 | SHELL TRICK | **regular** | THE SHELL | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 10.2 |
| 230 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 11.2 |
| 231 | SHELL HUSH | **regular** | THE SHELL | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 7 |
| 232 | SHELL HOMECOMING | **regular** | THE SHELL | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8 |
| 233 | SHELL PARADOX | **regular** | THE SHELL | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9 |
| 234 | THE STARE | boss | THE SHELL | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 235 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 236 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6 |
| 237 | CHOKE SEEDS | **regular** | THE CHOKE | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.1 |
| 238 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 8.1 |
| 239 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.1 |
| 240 | CHOKE DREAM | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 7.6 |
| 241 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8.6 |
| 242 | TWISTED CHOKE | **regular** | THE CHOKE | — | STANDARD | 12 | 47 | 52 | 33 | 66 | 9.6 |
| 243 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 10.6 |
| 244 | SOFT CHOKE | **regular** | THE CHOKE | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 6.9 |
| 245 | CHOKE SAGA | **regular** | THE CHOKE | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 7.9 |
| 246 | CROOKED CHOKE | **regular** | THE CHOKE | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.9 |
| 247 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 248 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 249 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 250 | RIND SCATTER | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 7.2 |
| 251 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 252 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.9 |
| 253 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.4 |
| 254 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.4 |
| 255 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 9.4 |
| 256 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 10.4 |
| 257 | RIND DREAM | **regular** | THE RIND | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 6.9 |
| 258 | RIND HOMECOMING | **regular** | THE RIND | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 7.9 |
| 259 | RIND RIDDLE | **regular** | THE RIND | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.9 |
| 260 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 261 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 56 | 35 | 70 | 3.6 |
| 262 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.3 |
| 263 | VEER RAIN | **regular** | THE VEER | — | STANDARD | 6 | 30 | 39 | 24 | 48 | 7.3 |
| 264 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.4 |
| 265 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 9.4 |
| 266 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 6 | 34 | 48 | 30 | 60 | 7.9 |
| 267 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.9 |
| 268 | VEER PARADOX | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 269 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 270 | VEER LULLABY | **regular** | THE VEER | — | STANDARD | 7 | 39 | 45 | 28 | 56 | 6.8 |
| 271 | ANCIENT VEER | **regular** | THE VEER | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 7.8 |
| 272 | VEER MIRAGE | **regular** | THE VEER | — | STANDARD | 11 | 47 | 61 | 38 | 76 | 8.8 |
| 273 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 274 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 275 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 6.6 |
| 276 | STRAND SEEDS | **regular** | THE STRAND | — | STANDARD | 5 | 26 | 32 | 20 | 40 | 7.6 |
| 277 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 8.7 |
| 278 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 279 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 6 | 38 | 44 | 28 | 56 | 8.2 |
| 280 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 9.2 |
| 281 | TWISTED STRAND | **regular** | THE STRAND | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.2 |
| 282 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 11.2 |
| 283 | SLEEPY STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.9 |
| 284 | OLD STRAND SONG | **regular** | THE STRAND | — | STANDARD | 8 | 36 | 44 | 28 | 56 | 7.9 |
| 285 | STRAND SPELL | **regular** | THE STRAND | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 8.9 |
| 286 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 287 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 288 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 289 | CLAW SCATTER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 290 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 291 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 29 | 18 | 36 | 0 |
| 292 | CLAW LULLABY | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 37 | 23 | 46 | 0 |
| 293 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 31 | 19 | 38 | 0 |
| 294 | CLAW MIRAGE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 37 | 23 | 46 | 0 |
| 295 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 296 | SLEEPY CLAW | **regular** | THE CLAW | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 6.8 |
| 297 | OLD CLAW SONG | **regular** | THE CLAW | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 7.8 |
| 298 | CLAW SPELL | **regular** | THE CLAW | — | STANDARD | 11 | 46 | 51 | 32 | 64 | 8.8 |
| 299 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 300 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 301 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 302 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 303 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 31 | 40 | 25 | 50 | 6.9 |
| 304 | FENCE SPRINKLE | **regular** | THE FENCE | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.7 |
| 305 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.7 |
| 306 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 37 | 46 | 29 | 58 | 9.7 |
| 307 | FENCE PICNIC | **regular** | THE FENCE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.2 |
| 308 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 9.2 |
| 309 | FENCE TRICK | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 53 | 33 | 66 | 10.2 |
| 310 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 14 | 45 | 52 | 33 | 66 | 11.2 |
| 311 | FENCE LULLABY | **regular** | THE FENCE | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 7 |
| 312 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 8 | 36 | 38 | 24 | 48 | 8 |
| 313 | FENCE MIRAGE | **regular** | THE FENCE | — | STANDARD | 12 | 46 | 55 | 34 | 68 | 9 |
| 314 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 315 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 52 | 55 | 34 | 68 | 4.5 |
| 316 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7.2 |
| 317 | MAGNET CONFETTI | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8 |
| 318 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 9 |
| 319 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 10 |
| 320 | LAZY MAGNET | **regular** | THE MAGNET | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 8.5 |
| 321 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.5 |
| 322 | MAGNET RIDDLE | **regular** | THE MAGNET | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 10.5 |
| 323 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 17 | 46 | 53 | 33 | 66 | 12 |
| 324 | MAGNET DREAM | **regular** | THE MAGNET | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7.3 |
| 325 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.3 |
| 326 | TWISTED MAGNET | **regular** | THE MAGNET | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.3 |
| 327 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 328 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 329 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 7.5 |
| 330 | CHOIR SCATTER | **regular** | THE CHOIR | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 8.1 |
| 331 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 9 |
| 332 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 8 | 33 | 37 | 23 | 46 | 10 |
| 333 | CHOIR LULLABY | **regular** | THE CHOIR | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.6 |
| 334 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 9.6 |
| 335 | CHOIR MIRAGE | **regular** | THE CHOIR | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 10.8 |
| 336 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 15 | 45 | 48 | 30 | 60 | 11.8 |
| 337 | CHOIR SIESTA | **regular** | THE CHOIR | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.6 |
| 338 | CHOIR RELIC | **regular** | THE CHOIR | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 8.6 |
| 339 | CHOIR ILLUSION | **regular** | THE CHOIR | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9.6 |
| 340 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 341 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 342 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 343 | SPRING OF DARK | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 344 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 345 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 346 | SOFT DARK | **regular** | THE DARK | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10.3 |
| 347 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 348 | CROOKED DARK | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 349 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 350 | LAZY DARK | **regular** | THE DARK | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 8.8 |
| 351 | DARK REUNION | **regular** | THE DARK | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.8 |
| 352 | DARK RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.8 |
| 353 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 354 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 72 | 45 | 90 | 4.5 |
| 355 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 7.8 |
| 356 | BALLOON SCATTER | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 51 | 32 | 64 | 8.7 |
| 357 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9.6 |
| 358 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 359 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 6 | 37 | 63 | 39 | 78 | 8.5 |
| 360 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 38 | 54 | 34 | 68 | 9.5 |
| 361 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 362 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 363 | BALLOON DREAM | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.9 |
| 364 | BALLOON HOMECOMING | **regular** | THE BALLOON | — | STANDARD | 10 | 38 | 54 | 34 | 68 | 8.9 |
| 365 | BALLOON RIDDLE | **regular** | THE BALLOON | — | STANDARD | 12 | 44 | 65 | 41 | 82 | 9.9 |
| 366 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 367 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 368 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 8.1 |
| 369 | MOULT SCATTER | **regular** | THE MOULT | — | STANDARD | 6 | 30 | 56 | 35 | 70 | 9 |
| 370 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 27 | 87 | 54 | 108 | 9.3 |
| 371 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 372 | MOULT LULLABY | **regular** | THE MOULT | — | STANDARD | 6 | 34 | 67 | 42 | 84 | 8.5 |
| 373 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 374 | MOULT MIRAGE | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 375 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 16 | 46 | 72 | 45 | 90 | 11.7 |
| 376 | SLEEPY MOULT | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 107 | 67 | 134 | 8.2 |
| 377 | OLD MOULT SONG | **regular** | THE MOULT | — | STANDARD | 10 | 39 | 77 | 48 | 96 | 9.2 |
| 378 | MOULT SPELL | **regular** | THE MOULT | — | STANDARD | 12 | 45 | 77 | 48 | 96 | 10.2 |
| 379 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 380 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 6.5 |
| 381 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 8.4 |
| 382 | COIL SCATTER | **regular** | THE COIL | — | STANDARD | 6 | 30 | 77 | 48 | 96 | 9 |
| 383 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 9.3 |
| 384 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 39 | 87 | 54 | 108 | 9.8 |
| 385 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 39 | 97 | 61 | 122 | 6.9 |
| 386 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 7.2 |
| 387 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 388 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 389 | COIL DREAM | **regular** | THE COIL | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 7 |
| 390 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8 |
| 391 | COIL RIDDLE | **regular** | THE COIL | — | STANDARD | 12 | 45 | 107 | 67 | 134 | 9 |
| 392 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 393 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 394 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 395 | CODEX SCATTER | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 396 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 12.1 |
| 397 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 11 | 40 | 87 | 54 | 108 | 13.1 |
| 398 | CODEX LULLABY | **regular** | THE CODEX | — | STANDARD | 6 | 34 | 47 | 29 | 58 | 11.6 |
| 399 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 12.6 |
| 400 | CODEX MIRAGE | **regular** | THE CODEX | — | STANDARD | 12 | 46 | 107 | 67 | 134 | 13.7 |
| 401 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 20 | 48 | 97 | 61 | 122 | 14.7 |
| 402 | LAZY CODEX | **regular** | THE CODEX | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 403 | CODEX REUNION | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 404 | CODEX RIDDLE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 12 |
| 405 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 406 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 20 | 31 | 19 | 38 | 7 |
| 407 | LURE RISING | **regular** | THE LURE | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 7 |
| 408 | LURE CONFETTI | **regular** | THE LURE | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 8 |
| 409 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 26 | 32 | 20 | 40 | 9 |
| 410 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 411 | LAZY LURE | **regular** | THE LURE | — | STANDARD | 6 | 38 | 52 | 33 | 66 | 8.5 |
| 412 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 39 | 65 | 41 | 82 | 9.7 |
| 413 | LURE RIDDLE | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.7 |
| 414 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 17 | 47 | 53 | 33 | 66 | 11.7 |
| 415 | SLEEPY LURE | **regular** | THE LURE | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 7.1 |
| 416 | OLD LURE SONG | **regular** | THE LURE | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 8.1 |
| 417 | LURE SPELL | **regular** | THE LURE | — | STANDARD | 12 | 45 | 53 | 33 | 66 | 9.1 |
| 418 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 419 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 76 | 48 | 96 | 6.8 |
| 420 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 31 | 37 | 23 | 46 | 9.8 |
| 421 | JAM SEEDS | **regular** | THE JAM | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.9 |
| 422 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 26 | 33 | 21 | 42 | 11.9 |
| 423 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 12.9 |
| 424 | JAM DREAM | **regular** | THE JAM | — | STANDARD | 7 | 40 | 44 | 28 | 56 | 11.4 |
| 425 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 40 | 45 | 28 | 56 | 12.4 |
| 426 | TWISTED JAM | **regular** | THE JAM | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 13.5 |
| 427 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 17 | 45 | 59 | 37 | 74 | 14.6 |
| 428 | JAM HUSH | **regular** | THE JAM | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 9.7 |
| 429 | JAM HOMECOMING | **regular** | THE JAM | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.7 |
| 430 | JAM PARADOX | **regular** | THE JAM | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 11.7 |
| 431 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 432 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 433 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 7.1 |
| 434 | CLASP SPRINKLE | **regular** | THE CLASP | — | STANDARD | 4 | 26 | 40 | 25 | 50 | 8.1 |
| 435 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 436 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 33 | 36 | 23 | 46 | 10 |
| 437 | CLASP PICNIC | **regular** | THE CLASP | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 8.5 |
| 438 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 44 | 28 | 56 | 9.5 |
| 439 | CLASP TRICK | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 10.7 |
| 440 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 15 | 48 | 59 | 37 | 74 | 12.4 |
| 441 | CLASP SIESTA | **regular** | THE CLASP | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 7.3 |
| 442 | CLASP RELIC | **regular** | THE CLASP | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.3 |
| 443 | CLASP ILLUSION | **regular** | THE CLASP | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 9.3 |
| 444 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 445 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 446 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.2 |
| 447 | DART SPRINKLE | **regular** | THE DART | — | STANDARD | 6 | 30 | 32 | 20 | 40 | 8.1 |
| 448 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 449 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 7 | 33 | 36 | 23 | 46 | 10 |
| 450 | DART PICNIC | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 451 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 452 | DART TRICK | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 453 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 15 | 48 | 51 | 32 | 64 | 11.3 |
| 454 | DART SIESTA | **regular** | THE DART | — | STANDARD | 6 | 38 | 46 | 29 | 58 | 7.3 |
| 455 | DART RELIC | **regular** | THE DART | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 8.3 |
| 456 | DART ILLUSION | **regular** | THE DART | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 9.3 |
| 457 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 458 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 44 | 47 | 29 | 58 | 4 |
| 459 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 460 | ECHO SPRINKLE | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 461 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 462 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 9.6 |
| 463 | ECHO PICNIC | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 46 | 29 | 58 | 7.5 |
| 464 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.6 |
| 465 | ECHO TRICK | **regular** | THE ECHO | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.7 |
| 466 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 15 | 48 | 51 | 32 | 64 | 10.8 |
| 467 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 468 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 8.1 |
| 469 | GYRE DRIFT | **regular** | THE GYRE | — | STANDARD | 6 | 32 | 40 | 25 | 50 | 9.1 |
| 470 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.1 |
| 471 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11.1 |
| 472 | SLEEPY GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 34 | 36 | 23 | 46 | 9.6 |
| 473 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 10.6 |
| 474 | GYRE SPELL | **regular** | THE GYRE | — | STANDARD | 13 | 47 | 50 | 31 | 62 | 11.6 |
| 475 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 476 | GYRE PICNIC | **regular** | THE GYRE | — | STANDARD | 6 | 33 | 35 | 22 | 44 | 8.2 |
| 477 | GYRE MEMORY | **regular** | THE GYRE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.2 |
| 478 | GYRE TRICK | **regular** | THE GYRE | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 10.2 |
| 479 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 480 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 481 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 482 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.8 |
| 483 | HANDOVER BLOOM | **regular** | THE HANDOVER | — | STANDARD | 6 | 30 | 37 | 23 | 46 | 10.8 |
| 484 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.9 |
| 485 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 12.9 |
| 486 | HANDOVER SIESTA | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 42 | 26 | 52 | 11.4 |
| 487 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 488 | HANDOVER ILLUSION | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 489 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 45 | 59 | 37 | 74 | 14.5 |
| 490 | HANDOVER PICNIC | **regular** | THE HANDOVER | — | STANDARD | 7 | 40 | 47 | 29 | 58 | 10 |
| 491 | HANDOVER MEMORY | **regular** | THE HANDOVER | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 11 |
| 492 | HANDOVER TRICK | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 12 |
| 493 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 494 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 495 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8.4 |
| 496 | LID SPRINKLE | **regular** | THE LID | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9.5 |
| 497 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 28 | 44 | 28 | 56 | 10.5 |
| 498 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11.5 |
| 499 | LID PICNIC | **regular** | THE LID | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 500 | LID MEMORY | **regular** | THE LID | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 11 |
| 501 | LID TRICK | **regular** | THE LID | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.1 |
| 502 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 13.1 |
| 503 | LID SIESTA | **regular** | THE LID | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 8.5 |
| 504 | LID LEGEND | **regular** | THE LID | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 9.5 |
| 505 | LID SPELL | **regular** | THE LID | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.5 |
| 506 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 507 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 508 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 30 | 36 | 23 | 46 | 8.7 |
| 509 | RECOIL RAIN | **regular** | THE RECOIL | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 9.6 |
| 510 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.5 |
| 511 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 43 | 27 | 54 | 11.5 |
| 512 | RECOIL HUSH | **regular** | THE RECOIL | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 513 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 514 | RECOIL PARADOX | **regular** | THE RECOIL | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 12 |
| 515 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 18 | 48 | 52 | 33 | 66 | 13 |
| 516 | RECOIL SIESTA | **regular** | THE RECOIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 8.8 |
| 517 | RECOIL RELIC | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 45 | 28 | 56 | 9.8 |
| 518 | RECOIL ILLUSION | **regular** | THE RECOIL | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 10.8 |
| 519 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 520 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 521 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 9 |
| 522 | CRYSTAL CONFETTI | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 9.9 |
| 523 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 10.8 |
| 524 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 525 | LAZY CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 51 | 32 | 64 | 10 |
| 526 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 527 | CRYSTAL RIDDLE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 528 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 529 | SOFT CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 9.1 |
| 530 | CRYSTAL SAGA | **regular** | THE CRYSTAL | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 10.1 |
| 531 | CROOKED CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.1 |
| 532 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 533 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 534 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.1 |
| 535 | VOLLEY DRIFT | **regular** | THE VOLLEY | — | STANDARD | 6 | 29 | 46 | 29 | 58 | 9.9 |
| 536 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 46 | 29 | 58 | 10.8 |
| 537 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 11 | 38 | 68 | 43 | 86 | 11.7 |
| 538 | SLEEPY VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 539 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 58 | 36 | 72 | 11 |
| 540 | VOLLEY SPELL | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 541 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 18 | 48 | 74 | 46 | 92 | 13 |
| 542 | VOLLEY PICNIC | **regular** | THE VOLLEY | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 9.2 |
| 543 | VOLLEY MEMORY | **regular** | THE VOLLEY | — | STANDARD | 10 | 37 | 57 | 36 | 72 | 10.2 |
| 544 | VOLLEY TRICK | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 11.2 |
| 545 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 546 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 547 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.8 |
| 548 | FLIP BLOOM | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 549 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 47 | 29 | 58 | 12.2 |
| 550 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 62 | 39 | 78 | 13.2 |
| 551 | FLIP SIESTA | **regular** | THE FLIP | — | STANDARD | 6 | 34 | 48 | 30 | 60 | 11.7 |
| 552 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 59 | 37 | 74 | 12.7 |
| 553 | FLIP ILLUSION | **regular** | THE FLIP | — | STANDARD | 12 | 44 | 69 | 43 | 86 | 13.7 |
| 554 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 48 | 66 | 41 | 82 | 14.9 |
| 555 | FLIP DREAM | **regular** | THE FLIP | — | STANDARD | 7 | 40 | 49 | 31 | 62 | 10 |
| 556 | FLIP LEGEND | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 57 | 36 | 72 | 11 |
| 557 | TWISTED FLIP | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 70 | 44 | 88 | 12 |
| 558 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 559 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 560 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 30 | 60 | 38 | 76 | 9.3 |
| 561 | CRAWLER SEEDS | **regular** | THE CRAWLER | — | STANDARD | 6 | 29 | 54 | 34 | 68 | 10.2 |
| 562 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 563 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 38 | 58 | 36 | 72 | 12 |
| 564 | CRAWLER DREAM | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 565 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 566 | TWISTED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 567 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 18 | 48 | 74 | 46 | 92 | 13 |
| 568 | CRAWLER HUSH | **regular** | THE CRAWLER | — | STANDARD | 6 | 34 | 52 | 33 | 66 | 9.4 |
| 569 | CRAWLER HOMECOMING | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 10.4 |
| 570 | CRAWLER PARADOX | **regular** | THE CRAWLER | — | STANDARD | 14 | 48 | 72 | 45 | 90 | 11.4 |
| 571 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 572 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.2 |
| 573 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 27 | 44 | 28 | 56 | 9.4 |
| 574 | MINE BLOOM | **regular** | THE MINE | — | STANDARD | 6 | 30 | 32 | 20 | 40 | 9.9 |
| 575 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 10.5 |
| 576 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 11 | 40 | 42 | 26 | 52 | 11.5 |
| 577 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 10 |
| 578 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 11 |
| 579 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 580 | MINE STORM | **regular** | THE MINE | — | STANDARD | 17 | 47 | 64 | 40 | 80 | 13 |
| 581 | SOFT MINE | **regular** | THE MINE | — | STANDARD | 6 | 36 | 107 | 67 | 134 | 9.5 |
| 582 | MINE REUNION | **regular** | THE MINE | — | STANDARD | 10 | 38 | 40 | 25 | 50 | 10.5 |
| 583 | MINE SPELL | **regular** | THE MINE | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 11.5 |
| 584 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 585 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 586 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 587 | VEIL SEEDS | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 588 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 11.1 |
| 589 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 590 | VEIL DREAM | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 591 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 42 | 26 | 52 | 11 |
| 592 | TWISTED VEIL | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 593 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 18 | 48 | 107 | 67 | 134 | 13 |
| 594 | SLEEPY VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 36 | 38 | 24 | 48 | 10 |
| 595 | OLD VEIL SONG | **regular** | THE VEIL | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 11 |
| 596 | VEIL SPELL | **regular** | THE VEIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 597 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 598 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 599 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 600 | WISP SCATTER | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 601 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.8 |
| 602 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 603 | WISP LULLABY | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 604 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 9 | 39 | 42 | 26 | 52 | 11 |
| 605 | WISP MIRAGE | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 606 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 18 | 46 | 52 | 33 | 66 | 13 |
| 607 | WISP DREAM | **regular** | THE WISP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 608 | WISP LEGEND | **regular** | THE WISP | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 11 |
| 609 | TWISTED WISP | **regular** | THE WISP | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 610 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 611 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 612 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 10.2 |
| 613 | GHOST SCATTER | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 10.5 |
| 614 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 39 | 24 | 48 | 11.1 |
| 615 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 616 | GHOST LULLABY | **regular** | THE GHOST | — | STANDARD | 6 | 36 | 52 | 33 | 66 | 10 |
| 617 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 618 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 12 |
| 619 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 13.1 |
| 620 | LAZY GHOST | **regular** | THE GHOST | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 10 |
| 621 | GHOST REUNION | **regular** | THE GHOST | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 622 | GHOST RIDDLE | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 623 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 624 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 625 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 626 | CAROM CONFETTI | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 57 | 36 | 72 | 10.5 |
| 627 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 38 | 24 | 48 | 11.1 |
| 628 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 629 | LAZY CAROM | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 630 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 631 | CAROM RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 632 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 20 | 46 | 50 | 31 | 62 | 12.9 |
| 633 | CAROM PICNIC | **regular** | THE CAROM | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 634 | CAROM MEMORY | **regular** | THE CAROM | — | STANDARD | 10 | 37 | 58 | 36 | 72 | 11 |
| 635 | CAROM TRICK | **regular** | THE CAROM | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 636 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 637 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 32 | 40 | 25 | 50 | 6 |
| 638 | CAROM DRIFT | **regular** | HELLO CAROM | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 639 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 640 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 641 | SLEEPY CAROM | **regular** | HELLO CAROM | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 642 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 51 | 32 | 64 | 11 |
| 643 | CAROM SPELL | **regular** | HELLO CAROM | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 644 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 16 | 44 | 54 | 34 | 68 | 13 |
| 645 | THE SLING | boss | HELLO CAROM | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 646 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 32 | 35 | 22 | 44 | 5.4 |
| 647 | GHOST SEEDS | **regular** | GHOST DAWN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 648 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 12 |
| 649 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 11 | 39 | 43 | 27 | 54 | 12.3 |
| 650 | GHOST DREAM | **regular** | GHOST DAWN | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 10 |
| 651 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 36 | 47 | 29 | 58 | 11 |
| 652 | TWISTED GHOST | **regular** | GHOST DAWN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 653 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 16 | 45 | 49 | 31 | 62 | 13 |
| 654 | THE CAPSTAN | boss | GHOST DAWN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 655 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 32 | 35 | 22 | 44 | 5.1 |
| 656 | WISP RAIN | **regular** | WISP AWAKENS | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 10.5 |
| 657 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 658 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 659 | WISP HUSH | **regular** | WISP AWAKENS | — | STANDARD | 6 | 35 | 37 | 23 | 46 | 10 |
| 660 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 661 | WISP PARADOX | **regular** | WISP AWAKENS | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 662 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 19 | 46 | 50 | 31 | 62 | 13 |
| 663 | THE GALL | boss | WISP AWAKENS | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 664 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 32 | 34 | 21 | 42 | 5.1 |
| 665 | VEIL SPRINKLE | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.5 |
| 666 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 667 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 12 | 40 | 43 | 27 | 54 | 11.8 |
| 668 | VEIL PICNIC | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 669 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 670 | VEIL TRICK | **regular** | NEW VEIL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 671 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 13 |
| 672 | THE TRAPEZE | boss | NEW VEIL MOON | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 673 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 32 | 40 | 25 | 50 | 5.7 |
| 674 | MINE RAIN | **regular** | MINE AWAKENS | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 675 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 12 |
| 676 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 12 | 40 | 49 | 31 | 62 | 12.7 |
| 677 | MINE HUSH | **regular** | MINE AWAKENS | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 678 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 679 | MINE PARADOX | **regular** | MINE AWAKENS | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 680 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 16 | 44 | 59 | 37 | 74 | 12.9 |
| 681 | THE FLUE | boss | MINE AWAKENS | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 682 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 32 | 62 | 39 | 78 | 5.7 |
| 683 | CRAWLER SCATTER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 31 | 54 | 34 | 68 | 11.1 |
| 684 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 53 | 33 | 66 | 11.4 |
| 685 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 686 | CRAWLER LULLABY | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 687 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 688 | CRAWLER MIRAGE | **regular** | FIRST CRAWLER | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 689 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 18 | 47 | 73 | 46 | 92 | 13.3 |
| 690 | THE GOVERNOR | boss | FIRST CRAWLER | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 691 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 32 | 54 | 34 | 68 | 6 |
| 692 | SPRING OF VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 10.5 |
| 693 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 29 | 47 | 29 | 58 | 11.1 |
| 694 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 695 | SOFT VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 696 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 697 | CROOKED VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 698 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 19 | 46 | 64 | 40 | 80 | 12.9 |
| 699 | THE LAMPREY | boss | VOLLEY MORNING | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 700 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 32 | 38 | 24 | 48 | 5.4 |
| 701 | CRYSTAL SPRINKLE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 10.8 |
| 702 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 703 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 11.9 |
| 704 | CRYSTAL PICNIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 10 |
| 705 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 49 | 31 | 62 | 11 |
| 706 | CRYSTAL TRICK | **regular** | NEW CRYSTAL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 707 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 44 | 48 | 30 | 60 | 13 |
| 708 | THE MIMIC | boss | NEW CRYSTAL MOON | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 709 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 32 | 35 | 22 | 44 | 5.7 |
| 710 | RECOIL SCATTER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 711 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 45 | 28 | 56 | 11.1 |
| 712 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 713 | RECOIL LULLABY | **regular** | FIRST RECOIL | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 714 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 715 | RECOIL MIRAGE | **regular** | FIRST RECOIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 716 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 717 | THE LATCH | boss | FIRST RECOIL | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 718 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 32 | 40 | 25 | 50 | 5.4 |
| 719 | LID RAIN | **regular** | LID AWAKENS | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 720 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 721 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 722 | LID HUSH | **regular** | LID AWAKENS | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 723 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 724 | LID PARADOX | **regular** | LID AWAKENS | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 725 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 19 | 48 | 97 | 61 | 122 | 13 |
| 726 | THE CHRYSALIS | boss | LID AWAKENS | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 727 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 32 | 35 | 22 | 44 | 5.4 |
| 728 | GYRE SEEDS | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 729 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 12 |
| 730 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 35 | 42 | 26 | 52 | 12.3 |
| 731 | GYRE DREAM | **regular** | GYRE DAWN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 732 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 10 | 40 | 50 | 31 | 62 | 10.8 |
| 733 | TWISTED GYRE | **regular** | GYRE DAWN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 734 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 735 | THE HYDRA | boss | GYRE DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

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
| 60 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 73 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 86 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 104 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 117 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 130 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 143 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 156 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 169 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 182 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 195 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 208 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 221 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 234 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 247 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 260 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 273 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 286 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 299 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 314 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 327 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 340 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 353 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 366 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 379 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 392 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 405 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 418 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 431 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 444 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 457 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 479 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 493 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 506 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 519 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 532 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 545 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 558 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 571 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 584 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 597 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 610 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 623 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 636 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 645 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 654 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 663 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 672 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 681 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 690 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 699 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 708 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 717 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 726 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 735 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
