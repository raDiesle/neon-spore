# The waves today, measured

> **Status: a measurement of 2026-10-16**, the evidence for
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
| regular | 483 | 0 | 14 | 27 | 73 | 3 h 48 min | 7 h 36 min |
| intro | 57 | 0 | 3 | 21 | 48 | 21 min | 42 min |
| boss | 60 | 0 | 9 | 30 | 343 | 49 min | 1 h 38 min |
| every wave | 600 | 0 | 3 | 26 | 343 | 4 h 59 min | 9 h 57 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 48 | 51 | 32 | 64 | 4.6 |
| 2 | FIRST RED | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | RED WANDERER | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | RED TANGO | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 36 | 39 | 24 | 48 | 5.4 |
| 5 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 4 | 24 | 27 | 17 | 34 | 1.4 |
| 6 | CYAN AWAKENS | **regular** | CYAN | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 2.6 |
| 7 | CYAN PICNIC | **regular** | CYAN | — | STANDARD 2 | 7 | 36 | 39 | 24 | 48 | 3.4 |
| 8 | CYAN RAPTURE | **regular** | CYAN | — | STANDARD 2 | 8 | 42 | 45 | 28 | 56 | 4.6 |
| 9 | THE BROOD | boss | CYAN | brood | STANDARD 2 | 0 | 0 | 26 | 16 | 32 | — |
| 10 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 34 | 21 | 42 | 1.4 |
| 11 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 44 | 28 | 56 | 2.6 |
| 12 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 49 | 31 | 62 | 3.8 |
| 13 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 44 | 28 | 56 | 5 |
| 14 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 16 | 10 | 20 | 5.8 |
| 15 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 24 | 15 | 30 | 10.8 |
| 16 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 18 | 20 | 13 | 26 | 5.7 |
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
| 30 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 7 | 10 | 6 | 12 | 4.8 |
| 31 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 32 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 33 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 34 | BULB QUEEN | boss | SALVAGE | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 35 | CATCH AND AIM | intro | SALVAGE | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 36 | AIM RISING | **regular** | SALVAGE | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 37 | LONG AIM ROAD | **regular** | SALVAGE | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 38 | FINALE | boss | SALVAGE | matron | STANDARD 5 | 0 | 0 | 67 | 42 | 84 | — |
| 39 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 9 | 16 | 10 | 20 | 6 |
| 40 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.6 |
| 41 | HUSK DRIFT | **regular** | THE HUSK | — | STANDARD 5 | 4 | 29 | 32 | 20 | 40 | 3 |
| 42 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 3.6 |
| 43 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 4 |
| 44 | SLEEPY HUSK | **regular** | THE HUSK | — | STANDARD 5 | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 45 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD 5 | 4 | 34 | 37 | 23 | 46 | 3.4 |
| 46 | HUSK SPELL | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 47 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 8 | 40 | 44 | 28 | 56 | 5.5 |
| 48 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 49 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.6 |
| 50 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 51 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 52 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 53 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 54 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 16 | 32 | 20 | 40 | 5.5 |
| 55 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 45 | 28 | 56 | 3.6 |
| 56 | MORSEL RAIN | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 30 | 46 | 29 | 58 | 4.8 |
| 57 | MORSEL HORIZON | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 43 | 27 | 54 | 6 |
| 58 | MORSEL DUET | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 33 | 43 | 27 | 54 | 7 |
| 59 | MORSEL HUSH | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 37 | 53 | 33 | 66 | 5.5 |
| 60 | MORSEL HOMECOMING | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 38 | 52 | 33 | 66 | 6.6 |
| 61 | MORSEL PARADOX | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 43 | 59 | 37 | 74 | 7.6 |
| 62 | MORSEL FURY | **regular** | THE MORSEL | — | STANDARD 5 | 13 | 44 | 60 | 38 | 76 | 8.6 |
| 63 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 64 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD 5 | 4 | 14 | 23 | 14 | 28 | 7.9 |
| 65 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD 5 | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 66 | SEEDER RAIN | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 32 | 40 | 25 | 50 | 5.1 |
| 67 | SEEDER HORIZON | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 28 | 37 | 23 | 46 | 6.3 |
| 68 | SEEDER DUET | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 37 | 53 | 33 | 66 | 7.5 |
| 69 | SEEDER HUSH | **regular** | THE SEEDER | — | STANDARD 5 | 6 | 35 | 43 | 27 | 54 | 6.1 |
| 70 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD 5 | 8 | 38 | 52 | 33 | 66 | 7.3 |
| 71 | SEEDER PARADOX | **regular** | THE SEEDER | — | STANDARD 5 | 12 | 48 | 64 | 40 | 80 | 8.5 |
| 72 | SEEDER FURY | **regular** | THE SEEDER | — | STANDARD 5 | 16 | 48 | 64 | 40 | 80 | 9.5 |
| 73 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 74 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 75 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 4.2 |
| 76 | LANCE SCATTER | **regular** | THE LANCE | — | STANDARD | 6 | 29 | 38 | 24 | 48 | 5.4 |
| 77 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 6 | 27 | 37 | 23 | 46 | 6.6 |
| 78 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 8 | 34 | 50 | 31 | 62 | 7.6 |
| 79 | LANCE LULLABY | **regular** | THE LANCE | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.1 |
| 80 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 7.1 |
| 81 | LANCE MIRAGE | **regular** | THE LANCE | — | STANDARD | 11 | 44 | 54 | 34 | 68 | 8.2 |
| 82 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 16 | 48 | 64 | 40 | 80 | 9.2 |
| 83 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 84 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 85 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 86 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 27 | 17 | 34 | 3.6 |
| 87 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 38 | 24 | 48 | 3.4 |
| 88 | THE MAZE | boss (special) | THE LANCE | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 89 | THE GLUTTON | intro | THE GLUTTON | glutton | STANDARD | 3 | 12 | 19 | 12 | 24 | 5.7 |
| 90 | LITTLE GLUTTON | **regular** | THE GLUTTON | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 4.2 |
| 91 | GLUTTON BLOOM | **regular** | THE GLUTTON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 5.4 |
| 92 | GLUTTON PILGRIM | **regular** | THE GLUTTON | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 6.6 |
| 93 | GLUTTON TOGETHER | **regular** | THE GLUTTON | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 7.6 |
| 94 | GLUTTON SIESTA | **regular** | THE GLUTTON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 6.1 |
| 95 | GLUTTON RELIC | **regular** | THE GLUTTON | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 7.1 |
| 96 | GLUTTON ILLUSION | **regular** | THE GLUTTON | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 8.1 |
| 97 | GLUTTON STORM | **regular** | THE GLUTTON | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 9.1 |
| 98 | THE GEODE | boss | THE GLUTTON | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 99 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 100 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 3.6 |
| 101 | CROSSING SEEDS | **regular** | THE CROSSING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 4.6 |
| 102 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 5.6 |
| 103 | CROSSING AND GLUTTON | **regular** | THE CROSSING | — | STANDARD | 7 | 37 | 44 | 28 | 56 | 6.7 |
| 104 | CROSSING DREAM | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 5.2 |
| 105 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 6.2 |
| 106 | TWISTED CROSSING | **regular** | THE CROSSING | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 7.5 |
| 107 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 8.5 |
| 108 | THE GAUGE | boss (special) | THE CROSSING | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 109 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 110 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 111 | BEATBOX DRIFT | **regular** | THE BEATBOX | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 5.4 |
| 112 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 7 |
| 113 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 8 |
| 114 | SLEEPY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 6.5 |
| 115 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.5 |
| 116 | BEATBOX SPELL | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 8.5 |
| 117 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 9.5 |
| 118 | THE WARDEN | boss | THE BEATBOX | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 119 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 120 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.8 |
| 121 | LIMPET BLOOM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 8 |
| 122 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9 |
| 123 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 37 | 45 | 28 | 56 | 9.8 |
| 124 | LIMPET SIESTA | **regular** | THE LIMPET | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 8.2 |
| 125 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 10.2 |
| 126 | LIMPET ILLUSION | **regular** | THE LIMPET | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 11.8 |
| 127 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 12.8 |
| 128 | THE FLEET | boss (special) | THE LIMPET | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 129 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 130 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 131 | WEIGHT SEEDS | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 5.7 |
| 132 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 133 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8 |
| 134 | WEIGHT DREAM | **regular** | THE WEIGHT | — | STANDARD | 6 | 35 | 37 | 23 | 46 | 6.6 |
| 135 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 37 | 23 | 46 | 7.6 |
| 136 | TWISTED WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.6 |
| 137 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 9.6 |
| 138 | THE VANE | boss | THE WEIGHT | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 139 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 140 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 141 | HEAVY ROCK CONFETTI | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 5.7 |
| 142 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 6.7 |
| 143 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 144 | LAZY HEAVY ROCK | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 145 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 7.2 |
| 146 | HEAVY ROCK RIDDLE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 8.2 |
| 147 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 9.2 |
| 148 | SNAKE | boss (special) | HEAVY ROCKS | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 149 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 150 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 7.5 |
| 151 | LEECH SPRINKLE | **regular** | THE LEECH | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 8.8 |
| 152 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 10.1 |
| 153 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 8 | 39 | 50 | 31 | 62 | 11.1 |
| 154 | LEECH PICNIC | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 9.6 |
| 155 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 10.8 |
| 156 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 157 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 50 | 31 | 62 | 12.9 |
| 158 | PINBALL | boss (special) | THE LEECH | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 159 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 160 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.1 |
| 161 | THROB SCATTER | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6.9 |
| 162 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.1 |
| 163 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.1 |
| 164 | THROB LULLABY | **regular** | THE THROB | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7.6 |
| 165 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.6 |
| 166 | THROB MIRAGE | **regular** | THE THROB | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9.6 |
| 167 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 10.6 |
| 168 | THE SCOUT | boss (special) | THE THROB | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 169 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 170 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 5.4 |
| 171 | COUNT SCATTER | **regular** | THE COUNT | — | STANDARD | 6 | 32 | 37 | 23 | 46 | 6.9 |
| 172 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 8.7 |
| 173 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 9.7 |
| 174 | COUNT LULLABY | **regular** | THE COUNT | — | STANDARD | 6 | 34 | 40 | 25 | 50 | 8.2 |
| 175 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 9.2 |
| 176 | COUNT MIRAGE | **regular** | THE COUNT | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 10.2 |
| 177 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 11.2 |
| 178 | THE HAUL | boss (special) | THE COUNT | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 179 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 180 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 5.7 |
| 181 | SHELL SPRINKLE | **regular** | THE SHELL | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 7.5 |
| 182 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 8.7 |
| 183 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 9.7 |
| 184 | SHELL PICNIC | **regular** | THE SHELL | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 8.2 |
| 185 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 8 | 38 | 54 | 34 | 68 | 9.2 |
| 186 | SHELL TRICK | **regular** | THE SHELL | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 10.2 |
| 187 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 11.2 |
| 188 | THE STARE | boss | THE SHELL | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 189 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 190 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 6 |
| 191 | CHOKE SEEDS | **regular** | THE CHOKE | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.1 |
| 192 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 8.1 |
| 193 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 9.1 |
| 194 | CHOKE DREAM | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 7.6 |
| 195 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8.6 |
| 196 | TWISTED CHOKE | **regular** | THE CHOKE | — | STANDARD | 12 | 47 | 52 | 33 | 66 | 9.6 |
| 197 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 10.6 |
| 198 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 199 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 200 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 201 | RIND SCATTER | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 7.2 |
| 202 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 203 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.9 |
| 204 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.4 |
| 205 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.4 |
| 206 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 9.4 |
| 207 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 10.4 |
| 208 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 209 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 210 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.3 |
| 211 | VEER RAIN | **regular** | THE VEER | — | STANDARD | 6 | 30 | 39 | 24 | 48 | 7.3 |
| 212 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.4 |
| 213 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 9.4 |
| 214 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 6 | 34 | 48 | 30 | 60 | 7.9 |
| 215 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.9 |
| 216 | VEER PARADOX | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 217 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 218 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 219 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 220 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 6.6 |
| 221 | STRAND SEEDS | **regular** | THE STRAND | — | STANDARD | 5 | 26 | 32 | 20 | 40 | 7.6 |
| 222 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 8.7 |
| 223 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 224 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 6 | 38 | 44 | 28 | 56 | 8.2 |
| 225 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 9.2 |
| 226 | TWISTED STRAND | **regular** | THE STRAND | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 10.2 |
| 227 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 11.2 |
| 228 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 229 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 230 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 231 | CLAW SCATTER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 232 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 233 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 29 | 18 | 36 | 0 |
| 234 | CLAW LULLABY | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 37 | 23 | 46 | 0 |
| 235 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 31 | 19 | 38 | 0 |
| 236 | CLAW MIRAGE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 37 | 23 | 46 | 0 |
| 237 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 238 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 239 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 240 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 241 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 242 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 31 | 40 | 25 | 50 | 6.9 |
| 243 | FENCE SPRINKLE | **regular** | THE FENCE | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.7 |
| 244 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.7 |
| 245 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 37 | 46 | 29 | 58 | 9.7 |
| 246 | FENCE PICNIC | **regular** | THE FENCE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.2 |
| 247 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 9.2 |
| 248 | FENCE TRICK | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 53 | 33 | 66 | 10.2 |
| 249 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 14 | 45 | 52 | 33 | 66 | 11.2 |
| 250 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 251 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 252 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7.2 |
| 253 | MAGNET CONFETTI | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8 |
| 254 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 9 |
| 255 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 10 |
| 256 | LAZY MAGNET | **regular** | THE MAGNET | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 8.5 |
| 257 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.5 |
| 258 | MAGNET RIDDLE | **regular** | THE MAGNET | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 10.5 |
| 259 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 17 | 46 | 53 | 33 | 66 | 12 |
| 260 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 261 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 262 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 7.5 |
| 263 | CHOIR SCATTER | **regular** | THE CHOIR | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 8.1 |
| 264 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 9 |
| 265 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 8 | 33 | 37 | 23 | 46 | 10 |
| 266 | CHOIR LULLABY | **regular** | THE CHOIR | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.6 |
| 267 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 9.6 |
| 268 | CHOIR MIRAGE | **regular** | THE CHOIR | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 10.8 |
| 269 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 15 | 45 | 48 | 30 | 60 | 11.8 |
| 270 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 271 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 272 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 273 | SPRING OF DARK | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 274 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 275 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 276 | SOFT DARK | **regular** | THE DARK | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10.3 |
| 277 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 278 | CROOKED DARK | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 279 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 280 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 281 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 282 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 7.8 |
| 283 | BALLOON SCATTER | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 51 | 32 | 64 | 8.7 |
| 284 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9.6 |
| 285 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 286 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 6 | 37 | 63 | 39 | 78 | 8.5 |
| 287 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 38 | 54 | 34 | 68 | 9.5 |
| 288 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 289 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 290 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 291 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 292 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 8.1 |
| 293 | MOULT SCATTER | **regular** | THE MOULT | — | STANDARD | 6 | 30 | 56 | 35 | 70 | 9 |
| 294 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 27 | 87 | 54 | 108 | 9.3 |
| 295 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 296 | MOULT LULLABY | **regular** | THE MOULT | — | STANDARD | 6 | 34 | 67 | 42 | 84 | 8.5 |
| 297 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 298 | MOULT MIRAGE | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 299 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 16 | 46 | 72 | 45 | 90 | 11.7 |
| 300 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 301 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 302 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 8.4 |
| 303 | COIL SCATTER | **regular** | THE COIL | — | STANDARD | 6 | 30 | 77 | 48 | 96 | 9 |
| 304 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 9.3 |
| 305 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 39 | 87 | 54 | 108 | 9.8 |
| 306 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 39 | 97 | 61 | 122 | 6.9 |
| 307 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 7.2 |
| 308 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 309 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 310 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 311 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 312 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 313 | CODEX SCATTER | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 314 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 12.1 |
| 315 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 11 | 40 | 87 | 54 | 108 | 13.1 |
| 316 | CODEX LULLABY | **regular** | THE CODEX | — | STANDARD | 6 | 34 | 47 | 29 | 58 | 11.6 |
| 317 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 12.6 |
| 318 | CODEX MIRAGE | **regular** | THE CODEX | — | STANDARD | 12 | 46 | 107 | 67 | 134 | 13.7 |
| 319 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 20 | 48 | 97 | 61 | 122 | 14.7 |
| 320 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 321 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 322 | LURE RISING | **regular** | THE LURE | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 7 |
| 323 | LURE CONFETTI | **regular** | THE LURE | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 8 |
| 324 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 26 | 32 | 20 | 40 | 9 |
| 325 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 326 | LAZY LURE | **regular** | THE LURE | — | STANDARD | 6 | 38 | 52 | 33 | 66 | 8.5 |
| 327 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 39 | 65 | 41 | 82 | 9.7 |
| 328 | LURE RIDDLE | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.7 |
| 329 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 17 | 47 | 53 | 33 | 66 | 11.7 |
| 330 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 331 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 332 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 31 | 37 | 23 | 46 | 9.8 |
| 333 | JAM SEEDS | **regular** | THE JAM | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.9 |
| 334 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 26 | 33 | 21 | 42 | 11.9 |
| 335 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 12.9 |
| 336 | JAM DREAM | **regular** | THE JAM | — | STANDARD | 7 | 40 | 44 | 28 | 56 | 11.4 |
| 337 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 40 | 45 | 28 | 56 | 12.4 |
| 338 | TWISTED JAM | **regular** | THE JAM | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 13.5 |
| 339 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 17 | 45 | 59 | 37 | 74 | 14.6 |
| 340 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 341 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 342 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 7.1 |
| 343 | CLASP SPRINKLE | **regular** | THE CLASP | — | STANDARD | 4 | 26 | 40 | 25 | 50 | 8.1 |
| 344 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 345 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 33 | 36 | 23 | 46 | 10 |
| 346 | CLASP PICNIC | **regular** | THE CLASP | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 8.5 |
| 347 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 44 | 28 | 56 | 9.5 |
| 348 | CLASP TRICK | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 10.7 |
| 349 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 15 | 48 | 59 | 37 | 74 | 12.4 |
| 350 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 351 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 352 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.2 |
| 353 | DART SPRINKLE | **regular** | THE DART | — | STANDARD | 6 | 30 | 32 | 20 | 40 | 8.1 |
| 354 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 355 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 7 | 33 | 36 | 23 | 46 | 10 |
| 356 | DART PICNIC | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 357 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 358 | DART TRICK | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 359 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 15 | 48 | 51 | 32 | 64 | 11.3 |
| 360 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 361 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 362 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 363 | ECHO SPRINKLE | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 364 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 365 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 9.6 |
| 366 | ECHO PICNIC | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 46 | 29 | 58 | 7.5 |
| 367 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.6 |
| 368 | ECHO TRICK | **regular** | THE ECHO | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.7 |
| 369 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 15 | 48 | 51 | 32 | 64 | 10.8 |
| 370 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 371 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 372 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 27 | 35 | 22 | 44 | 8.1 |
| 373 | GYRE DRIFT | **regular** | THE GYRE | — | STANDARD | 6 | 32 | 40 | 25 | 50 | 9.1 |
| 374 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.1 |
| 375 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 11.1 |
| 376 | SLEEPY GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 34 | 36 | 23 | 46 | 9.6 |
| 377 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 10.6 |
| 378 | GYRE SPELL | **regular** | THE GYRE | — | STANDARD | 13 | 47 | 50 | 31 | 62 | 11.6 |
| 379 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 380 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 381 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 382 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 383 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 9.8 |
| 384 | HANDOVER BLOOM | **regular** | THE HANDOVER | — | STANDARD | 6 | 30 | 37 | 23 | 46 | 10.8 |
| 385 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.9 |
| 386 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 39 | 42 | 26 | 52 | 12.9 |
| 387 | HANDOVER SIESTA | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 42 | 26 | 52 | 11.4 |
| 388 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 389 | HANDOVER ILLUSION | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 390 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 45 | 59 | 37 | 74 | 14.5 |
| 391 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 392 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 393 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8.4 |
| 394 | LID SPRINKLE | **regular** | THE LID | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9.5 |
| 395 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 28 | 44 | 28 | 56 | 10.5 |
| 396 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11.5 |
| 397 | LID PICNIC | **regular** | THE LID | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 398 | LID MEMORY | **regular** | THE LID | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 11 |
| 399 | LID TRICK | **regular** | THE LID | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.1 |
| 400 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 13.1 |
| 401 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 402 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 403 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 30 | 36 | 23 | 46 | 8.7 |
| 404 | RECOIL RAIN | **regular** | THE RECOIL | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 9.6 |
| 405 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.5 |
| 406 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 43 | 27 | 54 | 11.5 |
| 407 | RECOIL HUSH | **regular** | THE RECOIL | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 408 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 409 | RECOIL PARADOX | **regular** | THE RECOIL | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 12 |
| 410 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 18 | 48 | 52 | 33 | 66 | 13 |
| 411 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 412 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 413 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 9 |
| 414 | CRYSTAL CONFETTI | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 9.9 |
| 415 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 10.8 |
| 416 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 417 | LAZY CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 37 | 51 | 32 | 64 | 10 |
| 418 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 419 | CRYSTAL RIDDLE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 420 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 421 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 422 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 423 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.1 |
| 424 | VOLLEY DRIFT | **regular** | THE VOLLEY | — | STANDARD | 6 | 29 | 46 | 29 | 58 | 9.9 |
| 425 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 46 | 29 | 58 | 10.8 |
| 426 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 11 | 38 | 68 | 43 | 86 | 11.7 |
| 427 | SLEEPY VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 428 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 58 | 36 | 72 | 11 |
| 429 | VOLLEY SPELL | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 430 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 18 | 48 | 74 | 46 | 92 | 13 |
| 431 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 432 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 433 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 9.8 |
| 434 | FLIP BLOOM | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 435 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 47 | 29 | 58 | 12.2 |
| 436 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 62 | 39 | 78 | 13.2 |
| 437 | FLIP SIESTA | **regular** | THE FLIP | — | STANDARD | 6 | 34 | 48 | 30 | 60 | 11.7 |
| 438 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 59 | 37 | 74 | 12.7 |
| 439 | FLIP ILLUSION | **regular** | THE FLIP | — | STANDARD | 12 | 44 | 69 | 43 | 86 | 13.7 |
| 440 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 48 | 66 | 41 | 82 | 14.9 |
| 441 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 442 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 443 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 30 | 60 | 38 | 76 | 9.3 |
| 444 | CRAWLER SEEDS | **regular** | THE CRAWLER | — | STANDARD | 6 | 29 | 54 | 34 | 68 | 10.2 |
| 445 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 446 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 38 | 58 | 36 | 72 | 12 |
| 447 | CRAWLER DREAM | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 448 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 449 | TWISTED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 450 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 18 | 48 | 74 | 46 | 92 | 13 |
| 451 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 452 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 453 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 27 | 44 | 28 | 56 | 9.4 |
| 454 | MINE BLOOM | **regular** | THE MINE | — | STANDARD | 6 | 30 | 32 | 20 | 40 | 9.9 |
| 455 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 10.5 |
| 456 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 11 | 40 | 42 | 26 | 52 | 11.5 |
| 457 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 10 |
| 458 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 11 |
| 459 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 460 | MINE STORM | **regular** | THE MINE | — | STANDARD | 17 | 47 | 64 | 40 | 80 | 13 |
| 461 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 462 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 463 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 464 | VEIL SEEDS | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 465 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 11.1 |
| 466 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 467 | VEIL DREAM | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 468 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 42 | 26 | 52 | 11 |
| 469 | TWISTED VEIL | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 470 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 18 | 48 | 107 | 67 | 134 | 13 |
| 471 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 472 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 473 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 474 | WISP SCATTER | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 475 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.8 |
| 476 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 477 | WISP LULLABY | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 478 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 9 | 39 | 42 | 26 | 52 | 11 |
| 479 | WISP MIRAGE | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 480 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 18 | 46 | 52 | 33 | 66 | 13 |
| 481 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 482 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 483 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 10.2 |
| 484 | GHOST SCATTER | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 10.5 |
| 485 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 39 | 24 | 48 | 11.1 |
| 486 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 487 | GHOST LULLABY | **regular** | THE GHOST | — | STANDARD | 6 | 36 | 52 | 33 | 66 | 10 |
| 488 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 489 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 12 |
| 490 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 13.1 |
| 491 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 492 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 493 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 494 | CAROM CONFETTI | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 57 | 36 | 72 | 10.5 |
| 495 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 38 | 24 | 48 | 11.1 |
| 496 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 497 | LAZY CAROM | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 498 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 499 | CAROM RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 500 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 20 | 46 | 50 | 31 | 62 | 12.9 |
| 501 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 502 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 10.2 |
| 503 | CAROM DRIFT | **regular** | HELLO CAROM | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 504 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 505 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 506 | SLEEPY CAROM | **regular** | HELLO CAROM | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 507 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 51 | 32 | 64 | 11 |
| 508 | CAROM SPELL | **regular** | HELLO CAROM | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 509 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 16 | 44 | 54 | 34 | 68 | 13 |
| 510 | THE SLING | boss | HELLO CAROM | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 511 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.5 |
| 512 | GHOST SEEDS | **regular** | GHOST DAWN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 513 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 12 |
| 514 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 11 | 39 | 43 | 27 | 54 | 12.3 |
| 515 | GHOST DREAM | **regular** | GHOST DAWN | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 10 |
| 516 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 36 | 47 | 29 | 58 | 11 |
| 517 | TWISTED GHOST | **regular** | GHOST DAWN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 518 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 16 | 45 | 49 | 31 | 62 | 13 |
| 519 | THE CAPSTAN | boss | GHOST DAWN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 520 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 521 | WISP RAIN | **regular** | WISP AWAKENS | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 10.5 |
| 522 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 523 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 524 | WISP HUSH | **regular** | WISP AWAKENS | — | STANDARD | 6 | 35 | 37 | 23 | 46 | 10 |
| 525 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 526 | WISP PARADOX | **regular** | WISP AWAKENS | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 527 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 19 | 46 | 50 | 31 | 62 | 13 |
| 528 | THE GALL | boss | WISP AWAKENS | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 529 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.2 |
| 530 | VEIL SPRINKLE | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.5 |
| 531 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 532 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 12 | 40 | 43 | 27 | 54 | 11.8 |
| 533 | VEIL PICNIC | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 534 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 535 | VEIL TRICK | **regular** | NEW VEIL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 536 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 13 |
| 537 | THE TRAPEZE | boss | NEW VEIL MOON | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 538 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 10.2 |
| 539 | MINE RAIN | **regular** | MINE AWAKENS | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 540 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 12 |
| 541 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 12 | 40 | 49 | 31 | 62 | 12.7 |
| 542 | MINE HUSH | **regular** | MINE AWAKENS | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 543 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 544 | MINE PARADOX | **regular** | MINE AWAKENS | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 545 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 16 | 44 | 59 | 37 | 74 | 12.9 |
| 546 | THE FLUE | boss | MINE AWAKENS | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 547 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 30 | 60 | 38 | 76 | 10.5 |
| 548 | CRAWLER SCATTER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 31 | 54 | 34 | 68 | 11.1 |
| 549 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 53 | 33 | 66 | 11.4 |
| 550 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 551 | CRAWLER LULLABY | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 552 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 553 | CRAWLER MIRAGE | **regular** | FIRST CRAWLER | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 554 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 18 | 47 | 73 | 46 | 92 | 13.3 |
| 555 | THE GOVERNOR | boss | FIRST CRAWLER | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 556 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 30 | 52 | 33 | 66 | 10.2 |
| 557 | SPRING OF VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 10.5 |
| 558 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 29 | 47 | 29 | 58 | 11.1 |
| 559 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 560 | SOFT VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 561 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 562 | CROOKED VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 563 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 19 | 46 | 64 | 40 | 80 | 12.9 |
| 564 | THE LAMPREY | boss | VOLLEY MORNING | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 565 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 10.5 |
| 566 | CRYSTAL SPRINKLE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 10.8 |
| 567 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 568 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 11.9 |
| 569 | CRYSTAL PICNIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 37 | 39 | 24 | 48 | 10 |
| 570 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 49 | 31 | 62 | 11 |
| 571 | CRYSTAL TRICK | **regular** | NEW CRYSTAL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 572 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 44 | 48 | 30 | 60 | 13 |
| 573 | THE MIMIC | boss | NEW CRYSTAL MOON | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 574 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 575 | RECOIL SCATTER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 576 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 45 | 28 | 56 | 11.1 |
| 577 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 578 | RECOIL LULLABY | **regular** | FIRST RECOIL | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 579 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 580 | RECOIL MIRAGE | **regular** | FIRST RECOIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 581 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 582 | THE LATCH | boss | FIRST RECOIL | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 583 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 584 | LID RAIN | **regular** | LID AWAKENS | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 585 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 586 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 587 | LID HUSH | **regular** | LID AWAKENS | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 588 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 589 | LID PARADOX | **regular** | LID AWAKENS | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 590 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 19 | 48 | 97 | 61 | 122 | 13 |
| 591 | THE CHRYSALIS | boss | LID AWAKENS | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 592 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 593 | GYRE SEEDS | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 594 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 12 |
| 595 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 35 | 42 | 26 | 52 | 12.3 |
| 596 | GYRE DREAM | **regular** | GYRE DAWN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 597 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 10 | 40 | 50 | 31 | 62 | 10.8 |
| 598 | TWISTED GYRE | **regular** | GYRE DAWN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 599 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 600 | THE HYDRA | boss | GYRE DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 26 beats | 16 | 32 s | short |
| 29 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 34 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 38 | FINALE | normal | 67 beats | 42 | 84 s | in band |
| 53 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 63 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 73 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 88 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 98 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 108 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 118 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 128 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 138 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 148 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 158 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 168 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 178 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 188 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 198 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 208 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 218 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 228 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 238 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 250 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 260 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 270 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 280 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 290 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 300 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 310 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 320 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 330 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 340 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 350 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 360 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 370 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
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
| 510 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 519 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 528 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 537 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 546 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 555 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 564 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 573 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 582 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 591 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 600 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
