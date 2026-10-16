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
| regular | 457 | 0 | 12 | 27 | 73 | 3 h 37 min | 7 h 14 min |
| intro | 54 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 58 | 0 | 9 | 28 | 343 | 47 min | 1 h 34 min |
| every wave | 569 | 0 | 3 | 27 | 343 | 4 h 45 min | 9 h 29 min |

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
| 29 | THE BASTION | boss | THE BLISTER | bastion, panel | STANDARD 5 | 0 | 0 | 82 | 51 | 102 | — |
| 30 | SALVAGE | intro | SALVAGE | pod | STANDARD 5 | 2 | 7 | 10 | 6 | 12 | 4.8 |
| 31 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 32 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 33 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 34 | BULB QUEEN | boss | SALVAGE | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 35 | CATCH AND AIM | intro | SALVAGE | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 36 | AIM RISING | **regular** | SALVAGE | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 37 | LONG AIM ROAD | **regular** | SALVAGE | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 38 | FINALE | boss | SALVAGE | matron | STANDARD 5 | 0 | 0 | 67 | 42 | 84 | — |
| 39 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 40 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 3 | 30 | 44 | 28 | 56 | 2.2 |
| 41 | LANCE SCATTER | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 2.6 |
| 42 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 4 | 27 | 41 | 26 | 52 | 3.2 |
| 43 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 4 |
| 44 | LANCE LULLABY | **regular** | THE LANCE | — | STANDARD | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 45 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 4 | 33 | 36 | 23 | 46 | 3.4 |
| 46 | LANCE MIRAGE | **regular** | THE LANCE | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 47 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 5.5 |
| 48 | THE INSTAR | boss | THE LANCE | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 49 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 50 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 2.4 |
| 51 | CROSSING SEEDS | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 3.4 |
| 52 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 4.4 |
| 53 | CROSSING AND SALVAGE | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 5.4 |
| 54 | CROSSING DREAM | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 4.6 |
| 55 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 5.6 |
| 56 | TWISTED CROSSING | **regular** | THE CROSSING | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 6.9 |
| 57 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 13 | 44 | 47 | 29 | 58 | 7.9 |
| 58 | THE MIRROR | boss (special) | THE CROSSING | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 59 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 60 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 3.6 |
| 61 | BEATBOX DRIFT | **regular** | THE BEATBOX | — | STANDARD | 6 | 30 | 36 | 23 | 46 | 4.5 |
| 62 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 5.4 |
| 63 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 6.4 |
| 64 | SLEEPY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 4.8 |
| 65 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 6.5 |
| 66 | BEATBOX SPELL | **regular** | THE BEATBOX | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 7.6 |
| 67 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 8.6 |
| 68 | THE MAZE | boss (special) | THE BEATBOX | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 69 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 70 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 30 | 32 | 20 | 40 | 3.9 |
| 71 | WEIGHT SEEDS | **regular** | THE WEIGHT | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 5.1 |
| 72 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 6.3 |
| 73 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 41 | 26 | 52 | 7.4 |
| 74 | WEIGHT DREAM | **regular** | THE WEIGHT | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 5.9 |
| 75 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7 |
| 76 | TWISTED WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.2 |
| 77 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 9.2 |
| 78 | THE GAUGE | boss (special) | THE WEIGHT | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 79 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 80 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 6.8 |
| 81 | LIMPET BLOOM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 8 |
| 82 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9.8 |
| 83 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 34 | 45 | 28 | 56 | 11.1 |
| 84 | LIMPET SIESTA | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 10 |
| 85 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 11 |
| 86 | LIMPET ILLUSION | **regular** | THE LIMPET | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 12.1 |
| 87 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 54 | 34 | 68 | 13.1 |
| 88 | THE WARDEN | boss | THE LIMPET | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 89 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 90 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.2 |
| 91 | HEAVY ROCK CONFETTI | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 5.2 |
| 92 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 6.2 |
| 93 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 34 | 42 | 26 | 52 | 7.2 |
| 94 | LAZY HEAVY ROCK | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 5.7 |
| 95 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 6.7 |
| 96 | HEAVY ROCK RIDDLE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.2 |
| 97 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.2 |
| 98 | THE FLEET | boss (special) | HEAVY ROCKS | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 99 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 100 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 5.6 |
| 101 | LEECH SPRINKLE | **regular** | THE LEECH | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 6.7 |
| 102 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.5 |
| 103 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 50 | 31 | 62 | 10.1 |
| 104 | LEECH PICNIC | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 8.6 |
| 105 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 10.3 |
| 106 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 107 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12.9 |
| 108 | THE VANE | boss | THE LEECH | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 109 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 110 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 4.5 |
| 111 | THROB SCATTER | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6 |
| 112 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.2 |
| 113 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.2 |
| 114 | THROB LULLABY | **regular** | THE THROB | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.7 |
| 115 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.7 |
| 116 | THROB MIRAGE | **regular** | THE THROB | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 8.7 |
| 117 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.7 |
| 118 | SNAKE | boss (special) | THE THROB | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 119 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 120 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 4.8 |
| 121 | COUNT SCATTER | **regular** | THE COUNT | — | STANDARD | 6 | 31 | 37 | 23 | 46 | 6 |
| 122 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 123 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.1 |
| 124 | COUNT LULLABY | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 6.6 |
| 125 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.6 |
| 126 | COUNT MIRAGE | **regular** | THE COUNT | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 8.6 |
| 127 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 9.6 |
| 128 | PINBALL | boss (special) | THE COUNT | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 129 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 130 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 5.1 |
| 131 | SHELL SPRINKLE | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 132 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 133 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.2 |
| 134 | SHELL PICNIC | **regular** | THE SHELL | — | STANDARD | 6 | 39 | 43 | 27 | 54 | 6.4 |
| 135 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.4 |
| 136 | SHELL TRICK | **regular** | THE SHELL | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.4 |
| 137 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 9.4 |
| 138 | THE SCOUT | boss (special) | THE SHELL | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 139 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 140 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD | 3 | 30 | 33 | 21 | 42 | 3.2 |
| 141 | HUSK DRIFT | **regular** | THE HUSK | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 3.8 |
| 142 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 31 | 19 | 38 | 4.5 |
| 143 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 6.3 |
| 144 | SLEEPY HUSK | **regular** | THE HUSK | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 5.6 |
| 145 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 6.9 |
| 146 | HUSK SPELL | **regular** | THE HUSK | — | STANDARD | 9 | 48 | 52 | 33 | 66 | 8.2 |
| 147 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.2 |
| 148 | THE HAUL | boss (special) | THE HUSK | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 149 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 150 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 3 | 28 | 42 | 26 | 52 | 3.4 |
| 151 | CHOKE SEEDS | **regular** | THE CHOKE | — | STANDARD | 3 | 29 | 32 | 20 | 40 | 4.6 |
| 152 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 27 | 30 | 19 | 38 | 5.8 |
| 153 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 6.8 |
| 154 | CHOKE DREAM | **regular** | THE CHOKE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.7 |
| 155 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7 |
| 156 | TWISTED CHOKE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.1 |
| 157 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.1 |
| 158 | THE STARE | boss | THE CHOKE | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 159 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 160 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 32 | 36 | 23 | 46 | 3 |
| 161 | RIND SCATTER | **regular** | THE RIND | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 3.9 |
| 162 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 3 | 24 | 28 | 18 | 36 | 4.5 |
| 163 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 5.9 |
| 164 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.8 |
| 165 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 6.1 |
| 166 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 9 | 46 | 50 | 31 | 62 | 7.4 |
| 167 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 13 | 44 | 48 | 30 | 60 | 8.3 |
| 168 | THE PULSE | boss (special) | THE RIND | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 169 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 170 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 5.4 |
| 171 | VEER RAIN | **regular** | THE VEER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 6.9 |
| 172 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 173 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.4 |
| 174 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 7.9 |
| 175 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8.9 |
| 176 | VEER PARADOX | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 177 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 178 | THE BATON | boss | THE VEER | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 179 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 180 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 5.7 |
| 181 | STRAND SEEDS | **regular** | THE STRAND | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 7.5 |
| 182 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.7 |
| 183 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 184 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.8 |
| 185 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 8.8 |
| 186 | TWISTED STRAND | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 60 | 38 | 76 | 9.8 |
| 187 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.8 |
| 188 | THE UNDERTOW | boss | THE STRAND | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 189 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 190 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 28 | 18 | 36 | 0 |
| 191 | CLAW SCATTER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 192 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 19 | 12 | 24 | 0 |
| 193 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 194 | CLAW LULLABY | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 23 | 14 | 28 | 0 |
| 195 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 32 | 20 | 40 | 0 |
| 196 | CLAW MIRAGE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 27 | 17 | 34 | 0 |
| 197 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 45 | 28 | 56 | 0 |
| 198 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 199 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 200 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 201 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 202 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 6 |
| 203 | FENCE SPRINKLE | **regular** | THE FENCE | — | STANDARD | 6 | 28 | 33 | 21 | 42 | 7.1 |
| 204 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 4 | 24 | 29 | 18 | 36 | 8.1 |
| 205 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.1 |
| 206 | FENCE PICNIC | **regular** | THE FENCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 7.6 |
| 207 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 47 | 29 | 58 | 8.6 |
| 208 | FENCE TRICK | **regular** | THE FENCE | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 9.6 |
| 209 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 10.6 |
| 210 | THE GORGE | boss | THE FENCE | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 211 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 212 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 6.3 |
| 213 | MAGNET CONFETTI | **regular** | THE MAGNET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.3 |
| 214 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.4 |
| 215 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 9.4 |
| 216 | LAZY MAGNET | **regular** | THE MAGNET | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 7.9 |
| 217 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.9 |
| 218 | MAGNET RIDDLE | **regular** | THE MAGNET | — | STANDARD | 12 | 48 | 57 | 36 | 72 | 9.9 |
| 219 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 16 | 48 | 57 | 36 | 72 | 10.9 |
| 220 | THE CURTAIN | boss | THE MAGNET | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 221 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 222 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 223 | CHOIR SCATTER | **regular** | THE CHOIR | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.6 |
| 224 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.6 |
| 225 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 226 | CHOIR LULLABY | **regular** | THE CHOIR | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 8.1 |
| 227 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.1 |
| 228 | CHOIR MIRAGE | **regular** | THE CHOIR | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 10.1 |
| 229 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 11.1 |
| 230 | THE TASTER | boss | THE CHOIR | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 231 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 232 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 233 | SPRING OF DARK | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 234 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 235 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 236 | SOFT DARK | **regular** | THE DARK | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 10.5 |
| 237 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 238 | CROOKED DARK | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 239 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 240 | THE SINEW | boss | THE DARK | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 241 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 242 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 6.9 |
| 243 | BALLOON SCATTER | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 8 |
| 244 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 245 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 246 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 58 | 36 | 72 | 8.5 |
| 247 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 9.5 |
| 248 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 249 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 250 | THE LEDGER | boss | THE BALLOON | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 251 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 252 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 7.2 |
| 253 | MOULT SCATTER | **regular** | THE MOULT | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 8.1 |
| 254 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 255 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 256 | MOULT LULLABY | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 57 | 36 | 72 | 8.5 |
| 257 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 258 | MOULT MIRAGE | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 259 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 15 | 45 | 77 | 48 | 96 | 11.7 |
| 260 | THE SURGE | boss | THE MOULT | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 261 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 262 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 7.5 |
| 263 | COIL SCATTER | **regular** | THE COIL | — | STANDARD | 6 | 30 | 67 | 42 | 84 | 8.1 |
| 264 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 8.4 |
| 265 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 33 | 87 | 54 | 108 | 8.8 |
| 266 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 267 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.2 |
| 268 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 269 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 270 | THE LEAD | boss | THE COIL | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 271 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 272 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 273 | CODEX SCATTER | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 274 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 77 | 48 | 96 | 12 |
| 275 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 77 | 48 | 96 | 13 |
| 276 | CODEX LULLABY | **regular** | THE CODEX | — | STANDARD | 6 | 36 | 47 | 29 | 58 | 11.5 |
| 277 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 12.5 |
| 278 | CODEX MIRAGE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 13.5 |
| 279 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 15 | 43 | 97 | 61 | 122 | 14.6 |
| 280 | THE SCUTTLE | boss | THE CODEX | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 281 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 282 | LURE RISING | **regular** | THE LURE | — | STANDARD | 5 | 25 | 39 | 24 | 48 | 6.6 |
| 283 | LURE CONFETTI | **regular** | THE LURE | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.8 |
| 284 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 285 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 286 | LAZY LURE | **regular** | THE LURE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 8.5 |
| 287 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.5 |
| 288 | LURE RIDDLE | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.5 |
| 289 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 15 | 46 | 53 | 33 | 66 | 11.5 |
| 290 | THE ANTIPHON | boss | THE LURE | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 291 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 292 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 10.1 |
| 293 | JAM SEEDS | **regular** | THE JAM | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 294 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 12.1 |
| 295 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 13.1 |
| 296 | JAM DREAM | **regular** | THE JAM | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 11.6 |
| 297 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 40 | 47 | 29 | 58 | 12.6 |
| 298 | TWISTED JAM | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 14 |
| 299 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 15.1 |
| 300 | THE HIVE | boss | THE JAM | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 301 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 302 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.9 |
| 303 | CLASP SPRINKLE | **regular** | THE CLASP | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 7.2 |
| 304 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 4 | 24 | 38 | 24 | 48 | 8.1 |
| 305 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 8.7 |
| 306 | CLASP PICNIC | **regular** | THE CLASP | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.1 |
| 307 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.1 |
| 308 | CLASP TRICK | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.1 |
| 309 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.1 |
| 310 | THE CAIRN | boss | THE CLASP | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 311 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 312 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 26 | 34 | 21 | 42 | 7 |
| 313 | DART SPRINKLE | **regular** | THE DART | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 8.1 |
| 314 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 315 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 10 |
| 316 | DART PICNIC | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 317 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 318 | DART TRICK | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 319 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 11.5 |
| 320 | THE WELL | boss (special) | THE DART | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 321 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 322 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 7.1 |
| 323 | ECHO SPRINKLE | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 324 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 325 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 326 | ECHO PICNIC | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 327 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 48 | 30 | 60 | 9.3 |
| 328 | ECHO TRICK | **regular** | THE ECHO | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 10.4 |
| 329 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 15 | 47 | 50 | 31 | 62 | 11.5 |
| 330 | THE REPRISE | boss | THE ECHO | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 331 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 332 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 7.2 |
| 333 | GYRE DRIFT | **regular** | THE GYRE | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 8.1 |
| 334 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9 |
| 335 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 10 |
| 336 | SLEEPY GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 8.7 |
| 337 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.5 |
| 338 | GYRE SPELL | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 10.5 |
| 339 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 16 | 45 | 51 | 32 | 64 | 11.3 |
| 340 | THE SPLICE | boss (special) | THE GYRE | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 341 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 342 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 343 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.1 |
| 344 | HANDOVER BLOOM | **regular** | THE HANDOVER | — | STANDARD | 6 | 31 | 47 | 29 | 58 | 11 |
| 345 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 11.9 |
| 346 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 38 | 46 | 29 | 58 | 12.9 |
| 347 | HANDOVER SIESTA | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 11.4 |
| 348 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 349 | HANDOVER ILLUSION | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 350 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 14.4 |
| 351 | THE FILAMENT | boss | THE HANDOVER | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 352 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 353 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 354 | LID SPRINKLE | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 8.1 |
| 355 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 9 |
| 356 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 10 |
| 357 | LID PICNIC | **regular** | THE LID | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 8.5 |
| 358 | LID MEMORY | **regular** | THE LID | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.5 |
| 359 | LID TRICK | **regular** | THE LID | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 10.5 |
| 360 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 16 | 46 | 54 | 34 | 68 | 11.5 |
| 361 | THE GIMBAL | boss | THE LID | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 362 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 363 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 8.1 |
| 364 | RECOIL RAIN | **regular** | THE RECOIL | — | STANDARD | 6 | 28 | 34 | 21 | 42 | 9 |
| 365 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.9 |
| 366 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 10.9 |
| 367 | RECOIL HUSH | **regular** | THE RECOIL | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 9.4 |
| 368 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.4 |
| 369 | RECOIL PARADOX | **regular** | THE RECOIL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.4 |
| 370 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 12.1 |
| 371 | THE SPOOL | boss | THE RECOIL | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 372 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 373 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.4 |
| 374 | CRYSTAL CONFETTI | **regular** | THE CRYSTAL | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 9.6 |
| 375 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.6 |
| 376 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 377 | LAZY CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 63 | 39 | 78 | 10 |
| 378 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 379 | CRYSTAL RIDDLE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 380 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 381 | THE HASP | boss | THE CRYSTAL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 382 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 383 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 31 | 61 | 38 | 76 | 8.7 |
| 384 | VOLLEY DRIFT | **regular** | THE VOLLEY | — | STANDARD | 4 | 24 | 49 | 31 | 62 | 9.6 |
| 385 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 47 | 29 | 58 | 10.5 |
| 386 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 63 | 39 | 78 | 11.5 |
| 387 | SLEEPY VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 388 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 11 |
| 389 | VOLLEY SPELL | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 390 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 15 | 45 | 68 | 43 | 86 | 13.1 |
| 391 | THE RATCHET | boss | THE VOLLEY | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 392 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 393 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 10.1 |
| 394 | FLIP BLOOM | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 395 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 54 | 34 | 68 | 11.9 |
| 396 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.9 |
| 397 | FLIP SIESTA | **regular** | THE FLIP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.4 |
| 398 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 58 | 36 | 72 | 12.4 |
| 399 | FLIP ILLUSION | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 69 | 43 | 86 | 13.4 |
| 400 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 46 | 66 | 41 | 82 | 14.3 |
| 401 | THE NETTLE | boss | THE FLIP | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 402 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 403 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 9 |
| 404 | CRAWLER SEEDS | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 9.9 |
| 405 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 406 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 34 | 64 | 40 | 80 | 11.5 |
| 407 | CRAWLER DREAM | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 408 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 409 | TWISTED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 410 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 17 | 46 | 70 | 44 | 88 | 13 |
| 411 | THE MANTLE | boss | THE CRAWLER | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 412 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 413 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 9.3 |
| 414 | MINE BLOOM | **regular** | THE MINE | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 9.9 |
| 415 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 10.5 |
| 416 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.5 |
| 417 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 418 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 11 |
| 419 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 420 | MINE STORM | **regular** | THE MINE | — | STANDARD | 18 | 47 | 107 | 67 | 134 | 13.1 |
| 421 | THE KEEL | boss | THE MINE | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 422 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 423 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 424 | VEIL SEEDS | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 425 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 11.1 |
| 426 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 427 | VEIL DREAM | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 428 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 429 | TWISTED VEIL | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 430 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 15 | 44 | 46 | 29 | 58 | 13 |
| 431 | THE VALVE | boss | THE VEIL | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 432 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 433 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 434 | WISP SCATTER | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 435 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 26 | 54 | 34 | 68 | 10.8 |
| 436 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 437 | WISP LULLABY | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 438 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11 |
| 439 | WISP MIRAGE | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 440 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 18 | 47 | 53 | 33 | 66 | 13 |
| 441 | THE SEAM | boss | THE WISP | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 442 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 443 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.2 |
| 444 | GHOST SCATTER | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 10.5 |
| 445 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 28 | 18 | 36 | 11.1 |
| 446 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 447 | GHOST LULLABY | **regular** | THE GHOST | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 10 |
| 448 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 449 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.9 |
| 450 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 15 | 42 | 45 | 28 | 56 | 12.9 |
| 451 | THE OCULUS | boss | THE GHOST | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 452 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 453 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 454 | CAROM CONFETTI | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 10.5 |
| 455 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 35 | 22 | 44 | 11.1 |
| 456 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 457 | LAZY CAROM | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 458 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 459 | CAROM RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 460 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 18 | 46 | 51 | 32 | 64 | 13.1 |
| 461 | THE VISE | boss | THE CAROM | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 462 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 10.2 |
| 463 | CAROM DRIFT | **regular** | HELLO CAROM | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 464 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 465 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 466 | SLEEPY CAROM | **regular** | HELLO CAROM | — | STANDARD | 7 | 36 | 44 | 28 | 56 | 10 |
| 467 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 11 |
| 468 | CAROM SPELL | **regular** | HELLO CAROM | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 469 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 17 | 48 | 62 | 39 | 78 | 13 |
| 470 | THE PLUMB | boss | HELLO CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 471 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.5 |
| 472 | GHOST SEEDS | **regular** | GHOST DAWN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 473 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 11.4 |
| 474 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.8 |
| 475 | GHOST DREAM | **regular** | GHOST DAWN | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 10 |
| 476 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 11 |
| 477 | TWISTED GHOST | **regular** | GHOST DAWN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 478 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 479 | THE SLING | boss | GHOST DAWN | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 480 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 481 | WISP RAIN | **regular** | WISP AWAKENS | — | STANDARD | 6 | 32 | 34 | 21 | 42 | 10.5 |
| 482 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 483 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 484 | WISP HUSH | **regular** | WISP AWAKENS | — | STANDARD | 7 | 40 | 63 | 39 | 78 | 10 |
| 485 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 11 |
| 486 | WISP PARADOX | **regular** | WISP AWAKENS | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 487 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13 |
| 488 | THE CAPSTAN | boss | WISP AWAKENS | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 489 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.2 |
| 490 | VEIL SPRINKLE | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 10.5 |
| 491 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 492 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11.8 |
| 493 | VEIL PICNIC | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 494 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 11 |
| 495 | VEIL TRICK | **regular** | NEW VEIL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 496 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 497 | THE GALL | boss | NEW VEIL MOON | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 498 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 10.2 |
| 499 | MINE RAIN | **regular** | MINE AWAKENS | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 500 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 11.4 |
| 501 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 11.8 |
| 502 | MINE HUSH | **regular** | MINE AWAKENS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 10 |
| 503 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 504 | MINE PARADOX | **regular** | MINE AWAKENS | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 505 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 19 | 48 | 50 | 31 | 62 | 13 |
| 506 | THE TRAPEZE | boss | MINE AWAKENS | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 507 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.1 |
| 508 | CRAWLER SCATTER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 32 | 57 | 36 | 72 | 10.5 |
| 509 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 510 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 511 | CRAWLER LULLABY | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 512 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 513 | CRAWLER MIRAGE | **regular** | FIRST CRAWLER | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 514 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 19 | 48 | 70 | 44 | 88 | 13.2 |
| 515 | THE FLUE | boss | FIRST CRAWLER | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 516 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 10.5 |
| 517 | SPRING OF VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 11.1 |
| 518 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 519 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 520 | SOFT VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 521 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 522 | CROOKED VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 523 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 19 | 46 | 66 | 41 | 82 | 13 |
| 524 | THE GOVERNOR | boss | VOLLEY MORNING | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 525 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 10.5 |
| 526 | CRYSTAL SPRINKLE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.8 |
| 527 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 528 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.8 |
| 529 | CRYSTAL PICNIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 10 |
| 530 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 531 | CRYSTAL TRICK | **regular** | NEW CRYSTAL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 532 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 533 | THE LAMPREY | boss | NEW CRYSTAL MOON | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 534 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 535 | RECOIL SCATTER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 536 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 11.1 |
| 537 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 538 | RECOIL LULLABY | **regular** | FIRST RECOIL | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 539 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 540 | RECOIL MIRAGE | **regular** | FIRST RECOIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 541 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 542 | THE MIMIC | boss | FIRST RECOIL | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 543 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 544 | LID RAIN | **regular** | LID AWAKENS | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 545 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 546 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 547 | LID HUSH | **regular** | LID AWAKENS | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 548 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 549 | LID PARADOX | **regular** | LID AWAKENS | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 550 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 19 | 46 | 52 | 33 | 66 | 13.1 |
| 551 | THE LATCH | boss | LID AWAKENS | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 552 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 553 | GYRE SEEDS | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 554 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 12 |
| 555 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.4 |
| 556 | GYRE DREAM | **regular** | GYRE DAWN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 557 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 10.8 |
| 558 | TWISTED GYRE | **regular** | GYRE DAWN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 559 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 560 | THE CHRYSALIS | boss | GYRE DAWN | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 561 | ECHO MORNING | **regular** | ECHO MORNING | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 9.9 |
| 562 | SPRING OF ECHO | **regular** | ECHO MORNING | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 10.5 |
| 563 | ECHO VOYAGE | **regular** | ECHO MORNING | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 11.1 |
| 564 | ECHO WALTZ | **regular** | ECHO MORNING | — | STANDARD | 11 | 39 | 43 | 27 | 54 | 11.6 |
| 565 | SOFT ECHO | **regular** | ECHO MORNING | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 566 | ECHO SAGA | **regular** | ECHO MORNING | — | STANDARD | 10 | 37 | 87 | 54 | 108 | 11 |
| 567 | CROOKED ECHO | **regular** | ECHO MORNING | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 568 | ECHO INFERNO | **regular** | ECHO MORNING | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 569 | THE HYDRA | boss | ECHO MORNING | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

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
| 48 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 58 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 68 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 78 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 88 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 98 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 108 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 118 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 128 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 138 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 148 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 158 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 168 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 178 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 188 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 198 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 210 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 220 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 230 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 240 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 250 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 260 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 270 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 280 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 290 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 300 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 310 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 320 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 330 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 340 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 351 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 361 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 371 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 381 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 391 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 401 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 411 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 421 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 431 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 441 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 451 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 461 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 470 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 479 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 488 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 497 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 506 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 515 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 524 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 533 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 542 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 551 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 560 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 569 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
