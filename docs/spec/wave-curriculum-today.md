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
| regular | 450 | 0 | 12 | 27 | 73 | 3 h 33 min | 7 h 7 min |
| intro | 54 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 57 | 0 | 9 | 28 | 343 | 47 min | 1 h 33 min |
| every wave | 561 | 0 | 3 | 26 | 343 | 4 h 40 min | 9 h 21 min |

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
| 10 | THE INSTAR | boss | CYAN | instar, panel | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 11 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 34 | 21 | 42 | 1.4 |
| 12 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 44 | 28 | 56 | 2.6 |
| 13 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 49 | 31 | 62 | 3.8 |
| 14 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 44 | 28 | 56 | 5 |
| 15 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 16 | 10 | 20 | 5.8 |
| 16 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 24 | 15 | 30 | 10.8 |
| 17 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 18 | 20 | 13 | 26 | 5.7 |
| 18 | HELLO TORCH | **regular** | TORCH | — | STANDARD 4 | 5 | 25 | 27 | 17 | 34 | 3.6 |
| 19 | TORCH AT WORLD END | **regular** | TORCH | — | STANDARD 4 | 6 | 28 | 30 | 19 | 38 | 5.7 |
| 20 | TORCH ALLIANCE | **regular** | TORCH | — | STANDARD 4 | 8 | 34 | 48 | 30 | 60 | 6.7 |
| 21 | THE BASTION | boss | TORCH | bastion | STANDARD 5 | 0 | 0 | 82 | 51 | 102 | — |
| 22 | SALVAGE | intro | SALVAGE | pod | STANDARD 5 | 2 | 7 | 10 | 6 | 12 | 4.8 |
| 23 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 24 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 25 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 26 | CATCH AND AIM | intro | SALVAGE | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 27 | AIM RISING | **regular** | SALVAGE | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 28 | LONG AIM ROAD | **regular** | SALVAGE | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 29 | SALVAGE RAPTURE | **regular** | SALVAGE | — | STANDARD 5 | 7 | 7 | 22 | 14 | 28 | 20.9 |
| 30 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 31 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 3 | 30 | 44 | 28 | 56 | 2.2 |
| 32 | LANCE SCATTER | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 2.6 |
| 33 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 4 | 27 | 41 | 26 | 52 | 3.2 |
| 34 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 4 |
| 35 | LANCE LULLABY | **regular** | THE LANCE | — | STANDARD | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 36 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 4 | 33 | 36 | 23 | 46 | 3.4 |
| 37 | LANCE MIRAGE | **regular** | THE LANCE | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 38 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 5.5 |
| 39 | BULB QUEEN | boss | THE LANCE | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 40 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 41 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 2.4 |
| 42 | CROSSING SEEDS | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 3.4 |
| 43 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 4.4 |
| 44 | CROSSING AND SALVAGE | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 5.4 |
| 45 | CROSSING DREAM | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 4.6 |
| 46 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 5.6 |
| 47 | TWISTED CROSSING | **regular** | THE CROSSING | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 6.9 |
| 48 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 13 | 44 | 47 | 29 | 58 | 7.9 |
| 49 | THE MIRROR | boss (special) | THE CROSSING | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 50 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 51 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 3.6 |
| 52 | BEATBOX DRIFT | **regular** | THE BEATBOX | — | STANDARD | 6 | 30 | 36 | 23 | 46 | 4.5 |
| 53 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 5.4 |
| 54 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 6.4 |
| 55 | SLEEPY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 4.8 |
| 56 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 6.5 |
| 57 | BEATBOX SPELL | **regular** | THE BEATBOX | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 7.6 |
| 58 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 8.6 |
| 59 | THE MAZE | boss (special) | THE BEATBOX | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 60 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 61 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 30 | 32 | 20 | 40 | 3.9 |
| 62 | WEIGHT SEEDS | **regular** | THE WEIGHT | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 5.1 |
| 63 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 6.3 |
| 64 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 41 | 26 | 52 | 7.4 |
| 65 | WEIGHT DREAM | **regular** | THE WEIGHT | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 5.9 |
| 66 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7 |
| 67 | TWISTED WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.2 |
| 68 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 9.2 |
| 69 | THE GAUGE | boss (special) | THE WEIGHT | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 70 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 71 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 6.8 |
| 72 | LIMPET BLOOM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 8 |
| 73 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9.8 |
| 74 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 34 | 45 | 28 | 56 | 11.1 |
| 75 | LIMPET SIESTA | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 10 |
| 76 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 11 |
| 77 | LIMPET ILLUSION | **regular** | THE LIMPET | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 12.1 |
| 78 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 54 | 34 | 68 | 13.1 |
| 79 | THE WARDEN | boss | THE LIMPET | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 80 | THE BLISTER | intro | THE BLISTER | blister | STANDARD | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 81 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 82 | TAP SCATTER | **regular** | THE BLISTER | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.5 |
| 83 | HOLD WANDERER | **regular** | THE BLISTER | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.8 |
| 84 | SWIPE TOGETHER | **regular** | THE BLISTER | — | STANDARD | 9 | 39 | 42 | 26 | 52 | 7.8 |
| 85 | TURN SIESTA | **regular** | THE BLISTER | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.4 |
| 86 | RUB MEMORY | **regular** | THE BLISTER | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 87 | TWISTED COMBO | **regular** | THE BLISTER | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.6 |
| 88 | LEVER FURY | **regular** | THE BLISTER | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 89 | THE FLEET | boss (special) | THE BLISTER | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 90 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 91 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.2 |
| 92 | HEAVY ROCK CONFETTI | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 5.2 |
| 93 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 6.2 |
| 94 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 34 | 42 | 26 | 52 | 7.2 |
| 95 | LAZY HEAVY ROCK | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 5.7 |
| 96 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 6.7 |
| 97 | HEAVY ROCK RIDDLE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.2 |
| 98 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.2 |
| 99 | THE VANE | boss | HEAVY ROCKS | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 100 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 101 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 5.6 |
| 102 | LEECH SPRINKLE | **regular** | THE LEECH | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 6.7 |
| 103 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.5 |
| 104 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 50 | 31 | 62 | 10.1 |
| 105 | LEECH PICNIC | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 8.6 |
| 106 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 10.3 |
| 107 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 108 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12.9 |
| 109 | SNAKE | boss (special) | THE LEECH | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 110 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 111 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 4.5 |
| 112 | THROB SCATTER | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6 |
| 113 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.2 |
| 114 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.2 |
| 115 | THROB LULLABY | **regular** | THE THROB | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.7 |
| 116 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.7 |
| 117 | THROB MIRAGE | **regular** | THE THROB | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 8.7 |
| 118 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.7 |
| 119 | PINBALL | boss (special) | THE THROB | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 120 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 121 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 4.8 |
| 122 | COUNT SCATTER | **regular** | THE COUNT | — | STANDARD | 6 | 31 | 37 | 23 | 46 | 6 |
| 123 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 124 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.1 |
| 125 | COUNT LULLABY | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 6.6 |
| 126 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.6 |
| 127 | COUNT MIRAGE | **regular** | THE COUNT | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 8.6 |
| 128 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 9.6 |
| 129 | THE SCOUT | boss (special) | THE COUNT | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 130 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 131 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 5.1 |
| 132 | SHELL SPRINKLE | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 133 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 134 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.2 |
| 135 | SHELL PICNIC | **regular** | THE SHELL | — | STANDARD | 6 | 39 | 43 | 27 | 54 | 6.4 |
| 136 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.4 |
| 137 | SHELL TRICK | **regular** | THE SHELL | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.4 |
| 138 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 9.4 |
| 139 | THE HAUL | boss (special) | THE SHELL | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 140 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 141 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD | 3 | 30 | 33 | 21 | 42 | 3.2 |
| 142 | HUSK DRIFT | **regular** | THE HUSK | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 3.8 |
| 143 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 31 | 19 | 38 | 4.5 |
| 144 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 6.3 |
| 145 | SLEEPY HUSK | **regular** | THE HUSK | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 5.6 |
| 146 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 6.9 |
| 147 | HUSK SPELL | **regular** | THE HUSK | — | STANDARD | 9 | 48 | 52 | 33 | 66 | 8.2 |
| 148 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.2 |
| 149 | THE STARE | boss | THE HUSK | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 150 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 151 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 3 | 28 | 42 | 26 | 52 | 3.4 |
| 152 | CHOKE SEEDS | **regular** | THE CHOKE | — | STANDARD | 3 | 29 | 32 | 20 | 40 | 4.6 |
| 153 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 27 | 30 | 19 | 38 | 5.8 |
| 154 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 6.8 |
| 155 | CHOKE DREAM | **regular** | THE CHOKE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.7 |
| 156 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7 |
| 157 | TWISTED CHOKE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.1 |
| 158 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.1 |
| 159 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 160 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 161 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 32 | 36 | 23 | 46 | 3 |
| 162 | RIND SCATTER | **regular** | THE RIND | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 3.9 |
| 163 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 3 | 24 | 28 | 18 | 36 | 4.5 |
| 164 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 5.9 |
| 165 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.8 |
| 166 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 6.1 |
| 167 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 9 | 46 | 50 | 31 | 62 | 7.4 |
| 168 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 13 | 44 | 48 | 30 | 60 | 8.3 |
| 169 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 170 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 171 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 5.4 |
| 172 | VEER RAIN | **regular** | THE VEER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 6.9 |
| 173 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 174 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.4 |
| 175 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 7.9 |
| 176 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8.9 |
| 177 | VEER PARADOX | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 178 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 179 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 180 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 181 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 5.7 |
| 182 | STRAND SEEDS | **regular** | THE STRAND | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 7.5 |
| 183 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.7 |
| 184 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 185 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.8 |
| 186 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 8.8 |
| 187 | TWISTED STRAND | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 60 | 38 | 76 | 9.8 |
| 188 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.8 |
| 189 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 190 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 191 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 28 | 18 | 36 | 0 |
| 192 | CLAW SCATTER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 193 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 19 | 12 | 24 | 0 |
| 194 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 195 | CLAW LULLABY | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 23 | 14 | 28 | 0 |
| 196 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 32 | 20 | 40 | 0 |
| 197 | CLAW MIRAGE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 27 | 17 | 34 | 0 |
| 198 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 45 | 28 | 56 | 0 |
| 199 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 200 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 201 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 202 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 203 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 6 |
| 204 | FENCE SPRINKLE | **regular** | THE FENCE | — | STANDARD | 6 | 28 | 33 | 21 | 42 | 7.1 |
| 205 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 4 | 24 | 29 | 18 | 36 | 8.1 |
| 206 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.1 |
| 207 | FENCE PICNIC | **regular** | THE FENCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 7.6 |
| 208 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 47 | 29 | 58 | 8.6 |
| 209 | FENCE TRICK | **regular** | THE FENCE | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 9.6 |
| 210 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 10.6 |
| 211 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 212 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 213 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 6.3 |
| 214 | MAGNET CONFETTI | **regular** | THE MAGNET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.3 |
| 215 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.4 |
| 216 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 9.4 |
| 217 | LAZY MAGNET | **regular** | THE MAGNET | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 7.9 |
| 218 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.9 |
| 219 | MAGNET RIDDLE | **regular** | THE MAGNET | — | STANDARD | 12 | 48 | 57 | 36 | 72 | 9.9 |
| 220 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 16 | 48 | 57 | 36 | 72 | 10.9 |
| 221 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 222 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 223 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 224 | CHOIR SCATTER | **regular** | THE CHOIR | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.6 |
| 225 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.6 |
| 226 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 227 | CHOIR LULLABY | **regular** | THE CHOIR | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 8.1 |
| 228 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.1 |
| 229 | CHOIR MIRAGE | **regular** | THE CHOIR | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 10.1 |
| 230 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 11.1 |
| 231 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 232 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 233 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 234 | SPRING OF DARK | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 235 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 236 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 237 | SOFT DARK | **regular** | THE DARK | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 10.5 |
| 238 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 239 | CROOKED DARK | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 240 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 241 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 242 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 243 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 6.9 |
| 244 | BALLOON SCATTER | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 8 |
| 245 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 246 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 247 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 58 | 36 | 72 | 8.5 |
| 248 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 9.5 |
| 249 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 250 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 251 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 252 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 253 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 7.2 |
| 254 | MOULT SCATTER | **regular** | THE MOULT | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 8.1 |
| 255 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 256 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 257 | MOULT LULLABY | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 57 | 36 | 72 | 8.5 |
| 258 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 259 | MOULT MIRAGE | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 260 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 15 | 45 | 77 | 48 | 96 | 11.7 |
| 261 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 262 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 263 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 7.5 |
| 264 | COIL SCATTER | **regular** | THE COIL | — | STANDARD | 6 | 30 | 67 | 42 | 84 | 8.1 |
| 265 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 8.4 |
| 266 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 33 | 87 | 54 | 108 | 8.8 |
| 267 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 268 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.2 |
| 269 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 270 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 271 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 272 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 273 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 274 | CODEX SCATTER | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 275 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 77 | 48 | 96 | 12 |
| 276 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 77 | 48 | 96 | 13 |
| 277 | CODEX LULLABY | **regular** | THE CODEX | — | STANDARD | 6 | 36 | 47 | 29 | 58 | 11.5 |
| 278 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 12.5 |
| 279 | CODEX MIRAGE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 13.5 |
| 280 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 15 | 43 | 97 | 61 | 122 | 14.6 |
| 281 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 282 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 283 | LURE RISING | **regular** | THE LURE | — | STANDARD | 5 | 25 | 39 | 24 | 48 | 6.6 |
| 284 | LURE CONFETTI | **regular** | THE LURE | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.8 |
| 285 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 286 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 287 | LAZY LURE | **regular** | THE LURE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 8.5 |
| 288 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.5 |
| 289 | LURE RIDDLE | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.5 |
| 290 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 15 | 46 | 53 | 33 | 66 | 11.5 |
| 291 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 292 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 293 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 10.1 |
| 294 | JAM SEEDS | **regular** | THE JAM | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 295 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 12.1 |
| 296 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 13.1 |
| 297 | JAM DREAM | **regular** | THE JAM | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 11.6 |
| 298 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 40 | 47 | 29 | 58 | 12.6 |
| 299 | TWISTED JAM | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 14 |
| 300 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 15.1 |
| 301 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 302 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 303 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.9 |
| 304 | CLASP SPRINKLE | **regular** | THE CLASP | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 7.2 |
| 305 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 4 | 24 | 38 | 24 | 48 | 8.1 |
| 306 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 8.7 |
| 307 | CLASP PICNIC | **regular** | THE CLASP | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.1 |
| 308 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.1 |
| 309 | CLASP TRICK | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.1 |
| 310 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.1 |
| 311 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 312 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 313 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 26 | 34 | 21 | 42 | 7 |
| 314 | DART SPRINKLE | **regular** | THE DART | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 8.1 |
| 315 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 316 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 10 |
| 317 | DART PICNIC | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 318 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 319 | DART TRICK | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 320 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 11.5 |
| 321 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 322 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 323 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 7.1 |
| 324 | ECHO SPRINKLE | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 325 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 326 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 327 | ECHO PICNIC | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 328 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 48 | 30 | 60 | 9.3 |
| 329 | ECHO TRICK | **regular** | THE ECHO | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 10.4 |
| 330 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 15 | 47 | 50 | 31 | 62 | 11.5 |
| 331 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 332 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 333 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 7.2 |
| 334 | GYRE DRIFT | **regular** | THE GYRE | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 8.1 |
| 335 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9 |
| 336 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 10 |
| 337 | SLEEPY GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 8.7 |
| 338 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.5 |
| 339 | GYRE SPELL | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 10.5 |
| 340 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 16 | 45 | 51 | 32 | 64 | 11.3 |
| 341 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 342 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 343 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 344 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.1 |
| 345 | HANDOVER BLOOM | **regular** | THE HANDOVER | — | STANDARD | 6 | 31 | 47 | 29 | 58 | 11 |
| 346 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 11.9 |
| 347 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 38 | 46 | 29 | 58 | 12.9 |
| 348 | HANDOVER SIESTA | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 11.4 |
| 349 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 350 | HANDOVER ILLUSION | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 351 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 14.4 |
| 352 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 353 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 354 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 355 | LID SPRINKLE | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 8.1 |
| 356 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 9 |
| 357 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 10 |
| 358 | LID PICNIC | **regular** | THE LID | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 8.5 |
| 359 | LID MEMORY | **regular** | THE LID | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.5 |
| 360 | LID TRICK | **regular** | THE LID | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 10.5 |
| 361 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 16 | 46 | 54 | 34 | 68 | 11.5 |
| 362 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 363 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 364 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 8.1 |
| 365 | RECOIL RAIN | **regular** | THE RECOIL | — | STANDARD | 6 | 28 | 34 | 21 | 42 | 9 |
| 366 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.9 |
| 367 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 10.9 |
| 368 | RECOIL HUSH | **regular** | THE RECOIL | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 9.4 |
| 369 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.4 |
| 370 | RECOIL PARADOX | **regular** | THE RECOIL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.4 |
| 371 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 12.1 |
| 372 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 373 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 374 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.4 |
| 375 | CRYSTAL CONFETTI | **regular** | THE CRYSTAL | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 9.6 |
| 376 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.6 |
| 377 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 378 | LAZY CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 63 | 39 | 78 | 10 |
| 379 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 380 | CRYSTAL RIDDLE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 381 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 382 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 383 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 384 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 31 | 61 | 38 | 76 | 8.7 |
| 385 | VOLLEY DRIFT | **regular** | THE VOLLEY | — | STANDARD | 4 | 24 | 49 | 31 | 62 | 9.6 |
| 386 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 47 | 29 | 58 | 10.5 |
| 387 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 63 | 39 | 78 | 11.5 |
| 388 | SLEEPY VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 389 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 11 |
| 390 | VOLLEY SPELL | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 391 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 15 | 45 | 68 | 43 | 86 | 13.1 |
| 392 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 393 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 394 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 10.1 |
| 395 | FLIP BLOOM | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 396 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 54 | 34 | 68 | 11.9 |
| 397 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.9 |
| 398 | FLIP SIESTA | **regular** | THE FLIP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.4 |
| 399 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 58 | 36 | 72 | 12.4 |
| 400 | FLIP ILLUSION | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 69 | 43 | 86 | 13.4 |
| 401 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 46 | 66 | 41 | 82 | 14.3 |
| 402 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 403 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 404 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 9 |
| 405 | CRAWLER SEEDS | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 9.9 |
| 406 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 407 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 34 | 64 | 40 | 80 | 11.5 |
| 408 | CRAWLER DREAM | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 409 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 410 | TWISTED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 411 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 17 | 46 | 70 | 44 | 88 | 13 |
| 412 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 413 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 414 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 9.3 |
| 415 | MINE BLOOM | **regular** | THE MINE | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 9.9 |
| 416 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 10.5 |
| 417 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.5 |
| 418 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 419 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 11 |
| 420 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 421 | MINE STORM | **regular** | THE MINE | — | STANDARD | 18 | 47 | 107 | 67 | 134 | 13.1 |
| 422 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 423 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 424 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 425 | VEIL SEEDS | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 426 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 11.1 |
| 427 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 428 | VEIL DREAM | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 429 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 430 | TWISTED VEIL | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 431 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 15 | 44 | 46 | 29 | 58 | 13 |
| 432 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 433 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 434 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 435 | WISP SCATTER | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 436 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 26 | 54 | 34 | 68 | 10.8 |
| 437 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 438 | WISP LULLABY | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 439 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11 |
| 440 | WISP MIRAGE | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 441 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 18 | 47 | 53 | 33 | 66 | 13 |
| 442 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 443 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 444 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.2 |
| 445 | GHOST SCATTER | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 10.5 |
| 446 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 28 | 18 | 36 | 11.1 |
| 447 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 448 | GHOST LULLABY | **regular** | THE GHOST | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 10 |
| 449 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 450 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.9 |
| 451 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 15 | 42 | 45 | 28 | 56 | 12.9 |
| 452 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 453 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 454 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 455 | CAROM CONFETTI | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 10.5 |
| 456 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 35 | 22 | 44 | 11.1 |
| 457 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 458 | LAZY CAROM | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 459 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 460 | CAROM RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 461 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 18 | 46 | 51 | 32 | 64 | 13.1 |
| 462 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 463 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 10.2 |
| 464 | CAROM DRIFT | **regular** | HELLO CAROM | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 465 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 466 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 467 | SLEEPY CAROM | **regular** | HELLO CAROM | — | STANDARD | 7 | 36 | 44 | 28 | 56 | 10 |
| 468 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 11 |
| 469 | CAROM SPELL | **regular** | HELLO CAROM | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 470 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 17 | 48 | 62 | 39 | 78 | 13 |
| 471 | THE SLING | boss | HELLO CAROM | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 472 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.5 |
| 473 | GHOST SEEDS | **regular** | GHOST DAWN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 474 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 11.4 |
| 475 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.8 |
| 476 | GHOST DREAM | **regular** | GHOST DAWN | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 10 |
| 477 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 11 |
| 478 | TWISTED GHOST | **regular** | GHOST DAWN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 479 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 480 | THE CAPSTAN | boss | GHOST DAWN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 481 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 482 | WISP RAIN | **regular** | WISP AWAKENS | — | STANDARD | 6 | 32 | 34 | 21 | 42 | 10.5 |
| 483 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 484 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 485 | WISP HUSH | **regular** | WISP AWAKENS | — | STANDARD | 7 | 40 | 63 | 39 | 78 | 10 |
| 486 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 11 |
| 487 | WISP PARADOX | **regular** | WISP AWAKENS | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 488 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13 |
| 489 | THE GALL | boss | WISP AWAKENS | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 490 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.2 |
| 491 | VEIL SPRINKLE | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 10.5 |
| 492 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 493 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11.8 |
| 494 | VEIL PICNIC | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 495 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 11 |
| 496 | VEIL TRICK | **regular** | NEW VEIL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 497 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 498 | THE TRAPEZE | boss | NEW VEIL MOON | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 499 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 10.2 |
| 500 | MINE RAIN | **regular** | MINE AWAKENS | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 501 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 11.4 |
| 502 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 11.8 |
| 503 | MINE HUSH | **regular** | MINE AWAKENS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 10 |
| 504 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 505 | MINE PARADOX | **regular** | MINE AWAKENS | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 506 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 19 | 48 | 50 | 31 | 62 | 13 |
| 507 | THE FLUE | boss | MINE AWAKENS | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 508 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.1 |
| 509 | CRAWLER SCATTER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 32 | 57 | 36 | 72 | 10.5 |
| 510 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 511 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 512 | CRAWLER LULLABY | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 513 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 514 | CRAWLER MIRAGE | **regular** | FIRST CRAWLER | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 515 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 19 | 48 | 70 | 44 | 88 | 13.2 |
| 516 | THE GOVERNOR | boss | FIRST CRAWLER | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 517 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 10.5 |
| 518 | SPRING OF VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 11.1 |
| 519 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 520 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 521 | SOFT VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 522 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 523 | CROOKED VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 524 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 19 | 46 | 66 | 41 | 82 | 13 |
| 525 | THE LAMPREY | boss | VOLLEY MORNING | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 526 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 10.5 |
| 527 | CRYSTAL SPRINKLE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.8 |
| 528 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 529 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.8 |
| 530 | CRYSTAL PICNIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 10 |
| 531 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 532 | CRYSTAL TRICK | **regular** | NEW CRYSTAL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 533 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 534 | THE MIMIC | boss | NEW CRYSTAL MOON | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 535 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 536 | RECOIL SCATTER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 537 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 11.1 |
| 538 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 539 | RECOIL LULLABY | **regular** | FIRST RECOIL | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 540 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 541 | RECOIL MIRAGE | **regular** | FIRST RECOIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 542 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 543 | THE LATCH | boss | FIRST RECOIL | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 544 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 545 | LID RAIN | **regular** | LID AWAKENS | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 546 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 547 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 548 | LID HUSH | **regular** | LID AWAKENS | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 549 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 550 | LID PARADOX | **regular** | LID AWAKENS | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 551 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 19 | 46 | 52 | 33 | 66 | 13.1 |
| 552 | THE CHRYSALIS | boss | LID AWAKENS | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 553 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 554 | GYRE SEEDS | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 555 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 12 |
| 556 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.4 |
| 557 | GYRE DREAM | **regular** | GYRE DAWN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 558 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 10.8 |
| 559 | TWISTED GYRE | **regular** | GYRE DAWN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 560 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 561 | THE HYDRA | boss | GYRE DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 26 beats | 16 | 32 s | short |
| 10 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 21 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 39 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 49 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 59 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 69 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 79 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 89 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 99 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 109 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 119 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 129 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 139 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 149 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 159 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 169 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 179 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 189 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 199 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 211 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 221 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 231 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 241 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 251 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 261 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 271 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 281 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 291 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 301 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 311 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 321 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 331 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 341 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 352 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 362 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 372 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 382 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 392 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 402 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 412 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 422 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 432 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 442 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 452 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 462 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 471 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 480 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 489 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 498 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 507 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 516 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 525 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 534 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 543 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 552 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 561 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
