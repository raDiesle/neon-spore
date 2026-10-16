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
| regular | 466 | 0 | 12 | 27 | 73 | 3 h 41 min | 7 h 22 min |
| intro | 54 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 57 | 0 | 9 | 28 | 343 | 47 min | 1 h 33 min |
| every wave | 577 | 0 | 3 | 26 | 343 | 4 h 48 min | 9 h 36 min |

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
| 34 | CATCH AND AIM | intro | SALVAGE | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 35 | AIM RISING | **regular** | SALVAGE | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 36 | LONG AIM ROAD | **regular** | SALVAGE | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 37 | SALVAGE RAPTURE | **regular** | SALVAGE | — | STANDARD 5 | 7 | 7 | 22 | 14 | 28 | 20.9 |
| 38 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 39 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 3 | 30 | 44 | 28 | 56 | 2.2 |
| 40 | LANCE SCATTER | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 2.6 |
| 41 | LANCE WANDERER | **regular** | THE LANCE | — | STANDARD | 4 | 27 | 41 | 26 | 52 | 3.2 |
| 42 | LANCE TANGO | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 4 |
| 43 | LANCE LULLABY | **regular** | THE LANCE | — | STANDARD | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 44 | ANCIENT LANCE | **regular** | THE LANCE | — | STANDARD | 4 | 33 | 36 | 23 | 46 | 3.4 |
| 45 | LANCE MIRAGE | **regular** | THE LANCE | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 46 | LANCE THUNDER | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 5.5 |
| 47 | THE INSTAR | boss | THE LANCE | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 48 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 49 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 2.4 |
| 50 | CROSSING SEEDS | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 3.4 |
| 51 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 4.4 |
| 52 | CROSSING AND SALVAGE | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 5.4 |
| 53 | CROSSING DREAM | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 4.6 |
| 54 | CROSSING LEGEND | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 5.6 |
| 55 | TWISTED CROSSING | **regular** | THE CROSSING | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 6.9 |
| 56 | CROSSING APOCALYPSE | **regular** | THE CROSSING | — | STANDARD | 13 | 44 | 47 | 29 | 58 | 7.9 |
| 57 | BULB QUEEN | boss | THE CROSSING | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 58 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 59 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 3.6 |
| 60 | BEATBOX DRIFT | **regular** | THE BEATBOX | — | STANDARD | 6 | 30 | 36 | 23 | 46 | 4.5 |
| 61 | BEATBOX AT WORLD END | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 5.4 |
| 62 | BEATBOX ALLIANCE | **regular** | THE BEATBOX | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 6.4 |
| 63 | SLEEPY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 4.8 |
| 64 | OLD BEATBOX SONG | **regular** | THE BEATBOX | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 6.5 |
| 65 | BEATBOX SPELL | **regular** | THE BEATBOX | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 7.6 |
| 66 | BEATBOX RAPTURE | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 8.6 |
| 67 | THE MIRROR | boss (special) | THE BEATBOX | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 68 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 69 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 30 | 32 | 20 | 40 | 3.9 |
| 70 | WEIGHT SEEDS | **regular** | THE WEIGHT | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 5.1 |
| 71 | OUTER WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 6.3 |
| 72 | WEIGHT MEETS BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 41 | 26 | 52 | 7.4 |
| 73 | WEIGHT DREAM | **regular** | THE WEIGHT | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 5.9 |
| 74 | WEIGHT LEGEND | **regular** | THE WEIGHT | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7 |
| 75 | TWISTED WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.2 |
| 76 | WEIGHT APOCALYPSE | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 9.2 |
| 77 | THE MAZE | boss (special) | THE WEIGHT | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 78 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 79 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 6.8 |
| 80 | LIMPET BLOOM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 8 |
| 81 | LIMPET PILGRIM | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9.8 |
| 82 | LIMPET TOGETHER | **regular** | THE LIMPET | — | STANDARD | 8 | 34 | 45 | 28 | 56 | 11.1 |
| 83 | LIMPET SIESTA | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 10 |
| 84 | LIMPET RELIC | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 11 |
| 85 | LIMPET ILLUSION | **regular** | THE LIMPET | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 12.1 |
| 86 | LIMPET STORM | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 54 | 34 | 68 | 13.1 |
| 87 | THE GAUGE | boss (special) | THE LIMPET | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 88 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 89 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.2 |
| 90 | HEAVY ROCK CONFETTI | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 5.2 |
| 91 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 6.2 |
| 92 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 34 | 42 | 26 | 52 | 7.2 |
| 93 | LAZY HEAVY ROCK | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 5.7 |
| 94 | HEAVY ROCK REUNION | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 6.7 |
| 95 | HEAVY ROCK RIDDLE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.2 |
| 96 | HEAVY ROCK OVERDRIVE | **regular** | HEAVY ROCKS | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.2 |
| 97 | THE WARDEN | boss | HEAVY ROCKS | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 98 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 99 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 5.6 |
| 100 | LEECH SPRINKLE | **regular** | THE LEECH | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 6.7 |
| 101 | FAR LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.5 |
| 102 | LEECH ALLIANCE | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 50 | 31 | 62 | 10.1 |
| 103 | LEECH PICNIC | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 8.6 |
| 104 | LEECH MEMORY | **regular** | THE LEECH | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 10.3 |
| 105 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 106 | LEECH ECLIPSE | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12.9 |
| 107 | THE FLEET | boss (special) | THE LEECH | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 108 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 109 | FIRST THROB | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 4.5 |
| 110 | THROB SCATTER | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6 |
| 111 | THROB WANDERER | **regular** | THE THROB | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.2 |
| 112 | THROB TANGO | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.2 |
| 113 | THROB LULLABY | **regular** | THE THROB | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.7 |
| 114 | ANCIENT THROB | **regular** | THE THROB | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.7 |
| 115 | THROB MIRAGE | **regular** | THE THROB | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 8.7 |
| 116 | THROB THUNDER | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.7 |
| 117 | THE VANE | boss | THE THROB | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 118 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 119 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 4.8 |
| 120 | COUNT SCATTER | **regular** | THE COUNT | — | STANDARD | 6 | 31 | 37 | 23 | 46 | 6 |
| 121 | COUNT WANDERER | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 122 | COUNT TANGO | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.1 |
| 123 | COUNT LULLABY | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 6.6 |
| 124 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.6 |
| 125 | COUNT MIRAGE | **regular** | THE COUNT | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 8.6 |
| 126 | COUNT THUNDER | **regular** | THE COUNT | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 9.6 |
| 127 | SNAKE | boss (special) | THE COUNT | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 128 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 129 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 5.1 |
| 130 | SHELL SPRINKLE | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 131 | FAR SHELL | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 132 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.2 |
| 133 | SHELL PICNIC | **regular** | THE SHELL | — | STANDARD | 6 | 39 | 43 | 27 | 54 | 6.4 |
| 134 | SHELL MEMORY | **regular** | THE SHELL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.4 |
| 135 | SHELL TRICK | **regular** | THE SHELL | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.4 |
| 136 | SHELL ECLIPSE | **regular** | THE SHELL | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 9.4 |
| 137 | PINBALL | boss (special) | THE SHELL | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 138 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 139 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD | 3 | 30 | 33 | 21 | 42 | 3.2 |
| 140 | HUSK DRIFT | **regular** | THE HUSK | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 3.8 |
| 141 | HUSK AT WORLD END | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 31 | 19 | 38 | 4.5 |
| 142 | HUSK ALLIANCE | **regular** | THE HUSK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 6.3 |
| 143 | SLEEPY HUSK | **regular** | THE HUSK | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 5.6 |
| 144 | OLD HUSK SONG | **regular** | THE HUSK | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 6.9 |
| 145 | HUSK SPELL | **regular** | THE HUSK | — | STANDARD | 9 | 48 | 52 | 33 | 66 | 8.2 |
| 146 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.2 |
| 147 | THE SCOUT | boss (special) | THE HUSK | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 148 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 149 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 3 | 28 | 42 | 26 | 52 | 3.4 |
| 150 | CHOKE SEEDS | **regular** | THE CHOKE | — | STANDARD | 3 | 29 | 32 | 20 | 40 | 4.6 |
| 151 | OUTER CHOKE | **regular** | THE CHOKE | — | STANDARD | 4 | 27 | 30 | 19 | 38 | 5.8 |
| 152 | CHOKE DUET | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 6.8 |
| 153 | CHOKE DREAM | **regular** | THE CHOKE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.7 |
| 154 | CHOKE LEGEND | **regular** | THE CHOKE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7 |
| 155 | TWISTED CHOKE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.1 |
| 156 | CHOKE APOCALYPSE | **regular** | THE CHOKE | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.1 |
| 157 | THE HAUL | boss (special) | THE CHOKE | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 158 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 159 | FIRST RIND | **regular** | THE RIND | — | STANDARD | 5 | 32 | 36 | 23 | 46 | 3 |
| 160 | RIND SCATTER | **regular** | THE RIND | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 3.9 |
| 161 | RIND WANDERER | **regular** | THE RIND | — | STANDARD | 3 | 24 | 28 | 18 | 36 | 4.5 |
| 162 | RIND TANGO | **regular** | THE RIND | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 5.9 |
| 163 | RIND LULLABY | **regular** | THE RIND | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.8 |
| 164 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 6.1 |
| 165 | RIND MIRAGE | **regular** | THE RIND | — | STANDARD | 9 | 46 | 50 | 31 | 62 | 7.4 |
| 166 | RIND THUNDER | **regular** | THE RIND | — | STANDARD | 13 | 44 | 48 | 30 | 60 | 8.3 |
| 167 | THE STARE | boss | THE RIND | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 168 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 169 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 5.4 |
| 170 | VEER RAIN | **regular** | THE VEER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 6.9 |
| 171 | VEER HORIZON | **regular** | THE VEER | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 172 | VEER DUET | **regular** | THE VEER | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.4 |
| 173 | VEER HUSH | **regular** | THE VEER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 7.9 |
| 174 | VEER HOMECOMING | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8.9 |
| 175 | VEER PARADOX | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 176 | VEER FURY | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 177 | THE PULSE | boss (special) | THE VEER | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 178 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 179 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 5.7 |
| 180 | STRAND SEEDS | **regular** | THE STRAND | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 7.5 |
| 181 | OUTER STRAND | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.7 |
| 182 | STRAND MEETS VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 183 | STRAND DREAM | **regular** | THE STRAND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.8 |
| 184 | STRAND LEGEND | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 8.8 |
| 185 | TWISTED STRAND | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 60 | 38 | 76 | 9.8 |
| 186 | STRAND APOCALYPSE | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.8 |
| 187 | THE BATON | boss | THE STRAND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 188 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 189 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 28 | 18 | 36 | 0 |
| 190 | CLAW SCATTER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 191 | CLAW WANDERER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 19 | 12 | 24 | 0 |
| 192 | CLAW ALLIANCE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 193 | CLAW LULLABY | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 23 | 14 | 28 | 0 |
| 194 | ANCIENT CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 32 | 20 | 40 | 0 |
| 195 | CLAW MIRAGE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 27 | 17 | 34 | 0 |
| 196 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 45 | 28 | 56 | 0 |
| 197 | THE UNDERTOW | boss | THE CLAW | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 198 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 199 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 200 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 201 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 6 |
| 202 | FENCE SPRINKLE | **regular** | THE FENCE | — | STANDARD | 6 | 28 | 33 | 21 | 42 | 7.1 |
| 203 | FAR FENCE | **regular** | THE FENCE | — | STANDARD | 4 | 24 | 29 | 18 | 36 | 8.1 |
| 204 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.1 |
| 205 | FENCE PICNIC | **regular** | THE FENCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 7.6 |
| 206 | FENCE MEMORY | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 47 | 29 | 58 | 8.6 |
| 207 | FENCE TRICK | **regular** | THE FENCE | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 9.6 |
| 208 | FENCE ECLIPSE | **regular** | THE FENCE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 10.6 |
| 209 | THE THROAT | boss | THE FENCE | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 210 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 211 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 6.3 |
| 212 | MAGNET CONFETTI | **regular** | THE MAGNET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.3 |
| 213 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.4 |
| 214 | MAGNET PARTY | **regular** | THE MAGNET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 9.4 |
| 215 | LAZY MAGNET | **regular** | THE MAGNET | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 7.9 |
| 216 | MAGNET REUNION | **regular** | THE MAGNET | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.9 |
| 217 | MAGNET RIDDLE | **regular** | THE MAGNET | — | STANDARD | 12 | 48 | 57 | 36 | 72 | 9.9 |
| 218 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD | 16 | 48 | 57 | 36 | 72 | 10.9 |
| 219 | THE GORGE | boss | THE MAGNET | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 220 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 221 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 222 | CHOIR SCATTER | **regular** | THE CHOIR | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.6 |
| 223 | CHOIR WANDERER | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.6 |
| 224 | CHOIR TANGO | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 225 | CHOIR LULLABY | **regular** | THE CHOIR | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 8.1 |
| 226 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.1 |
| 227 | CHOIR MIRAGE | **regular** | THE CHOIR | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 10.1 |
| 228 | CHOIR THUNDER | **regular** | THE CHOIR | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 11.1 |
| 229 | THE CURTAIN | boss | THE CHOIR | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 230 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 231 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 232 | SPRING OF DARK | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 233 | DARK VOYAGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 234 | DARK PARTY | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 235 | SOFT DARK | **regular** | THE DARK | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 10.5 |
| 236 | DARK SAGA | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 237 | CROOKED DARK | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 238 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 239 | THE TASTER | boss | THE DARK | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 240 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 241 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 6.9 |
| 242 | BALLOON SCATTER | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 8 |
| 243 | BALLOON WANDERER | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 244 | BALLOON TANGO | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 245 | BALLOON LULLABY | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 58 | 36 | 72 | 8.5 |
| 246 | ANCIENT BALLOON | **regular** | THE BALLOON | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 9.5 |
| 247 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 248 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 249 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 250 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 251 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 7.2 |
| 252 | MOULT SCATTER | **regular** | THE MOULT | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 8.1 |
| 253 | MOULT WANDERER | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 254 | MOULT TANGO | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 255 | MOULT LULLABY | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 57 | 36 | 72 | 8.5 |
| 256 | ANCIENT MOULT | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 257 | MOULT MIRAGE | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 258 | MOULT THUNDER | **regular** | THE MOULT | — | STANDARD | 15 | 45 | 77 | 48 | 96 | 11.7 |
| 259 | THE LEDGER | boss | THE MOULT | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 260 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 261 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 7.5 |
| 262 | COIL SCATTER | **regular** | THE COIL | — | STANDARD | 6 | 30 | 67 | 42 | 84 | 8.1 |
| 263 | COIL WANDERER | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 8.4 |
| 264 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 33 | 87 | 54 | 108 | 8.8 |
| 265 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 266 | ANCIENT COIL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.2 |
| 267 | COIL MIRAGE | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 268 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 269 | THE SURGE | boss | THE COIL | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 270 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 271 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 272 | CODEX SCATTER | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 273 | CODEX WANDERER | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 77 | 48 | 96 | 12 |
| 274 | CODEX TOGETHER | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 77 | 48 | 96 | 13 |
| 275 | CODEX LULLABY | **regular** | THE CODEX | — | STANDARD | 6 | 36 | 47 | 29 | 58 | 11.5 |
| 276 | ANCIENT CODEX | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 12.5 |
| 277 | CODEX MIRAGE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 13.5 |
| 278 | CODEX THUNDER | **regular** | THE CODEX | — | STANDARD | 15 | 43 | 97 | 61 | 122 | 14.6 |
| 279 | THE LEAD | boss | THE CODEX | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 280 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 281 | LURE RISING | **regular** | THE LURE | — | STANDARD | 5 | 25 | 39 | 24 | 48 | 6.6 |
| 282 | LURE CONFETTI | **regular** | THE LURE | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.8 |
| 283 | LONG LURE ROAD | **regular** | THE LURE | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 284 | LURE PARTY | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 285 | LAZY LURE | **regular** | THE LURE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 8.5 |
| 286 | LURE REUNION | **regular** | THE LURE | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.5 |
| 287 | LURE RIDDLE | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.5 |
| 288 | LURE OVERDRIVE | **regular** | THE LURE | — | STANDARD | 15 | 46 | 53 | 33 | 66 | 11.5 |
| 289 | THE SCUTTLE | boss | THE LURE | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 290 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 291 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 10.1 |
| 292 | JAM SEEDS | **regular** | THE JAM | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 293 | OUTER JAM | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 12.1 |
| 294 | JAM WALTZ | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 13.1 |
| 295 | JAM DREAM | **regular** | THE JAM | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 11.6 |
| 296 | JAM LEGEND | **regular** | THE JAM | — | STANDARD | 10 | 40 | 47 | 29 | 58 | 12.6 |
| 297 | TWISTED JAM | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 14 |
| 298 | JAM APOCALYPSE | **regular** | THE JAM | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 15.1 |
| 299 | THE ANTIPHON | boss | THE JAM | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 300 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 301 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.9 |
| 302 | CLASP SPRINKLE | **regular** | THE CLASP | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 7.2 |
| 303 | FAR CLASP | **regular** | THE CLASP | — | STANDARD | 4 | 24 | 38 | 24 | 48 | 8.1 |
| 304 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 8.7 |
| 305 | CLASP PICNIC | **regular** | THE CLASP | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.1 |
| 306 | CLASP MEMORY | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.1 |
| 307 | CLASP TRICK | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.1 |
| 308 | CLASP ECLIPSE | **regular** | THE CLASP | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.1 |
| 309 | THE HIVE | boss | THE CLASP | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 310 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 311 | NEW DART MOON | **regular** | THE DART | — | STANDARD | 5 | 26 | 34 | 21 | 42 | 7 |
| 312 | DART SPRINKLE | **regular** | THE DART | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 8.1 |
| 313 | FAR DART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 314 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 10 |
| 315 | DART PICNIC | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 316 | DART MEMORY | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 317 | DART TRICK | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 318 | DART ECLIPSE | **regular** | THE DART | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 11.5 |
| 319 | THE CAIRN | boss | THE DART | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 320 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 321 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 7.1 |
| 322 | ECHO SPRINKLE | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 323 | FAR ECHO | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 324 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 325 | ECHO PICNIC | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 326 | ECHO MEMORY | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 48 | 30 | 60 | 9.3 |
| 327 | ECHO TRICK | **regular** | THE ECHO | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 10.4 |
| 328 | ECHO ECLIPSE | **regular** | THE ECHO | — | STANDARD | 15 | 47 | 50 | 31 | 62 | 11.5 |
| 329 | THE WELL | boss (special) | THE ECHO | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 330 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 331 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 7.2 |
| 332 | GYRE DRIFT | **regular** | THE GYRE | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 8.1 |
| 333 | GYRE AT WORLD END | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9 |
| 334 | GYRE ALLIANCE | **regular** | THE GYRE | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 10 |
| 335 | SLEEPY GYRE | **regular** | THE GYRE | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 8.7 |
| 336 | OLD GYRE SONG | **regular** | THE GYRE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.5 |
| 337 | GYRE SPELL | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 10.5 |
| 338 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD | 16 | 45 | 51 | 32 | 64 | 11.3 |
| 339 | THE REPRISE | boss | THE GYRE | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 340 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 341 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 342 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.1 |
| 343 | HANDOVER BLOOM | **regular** | THE HANDOVER | — | STANDARD | 6 | 31 | 47 | 29 | 58 | 11 |
| 344 | HANDOVER PILGRIM | **regular** | THE HANDOVER | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 11.9 |
| 345 | HANDOVER TANGO | **regular** | THE HANDOVER | — | STANDARD | 11 | 38 | 46 | 29 | 58 | 12.9 |
| 346 | HANDOVER SIESTA | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 11.4 |
| 347 | HANDOVER RELIC | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 348 | HANDOVER ILLUSION | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 349 | HANDOVER STORM | **regular** | THE HANDOVER | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 14.4 |
| 350 | THE SPLICE | boss (special) | THE HANDOVER | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 351 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 352 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 353 | LID SPRINKLE | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 8.1 |
| 354 | FAR LID | **regular** | THE LID | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 9 |
| 355 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 10 |
| 356 | LID PICNIC | **regular** | THE LID | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 8.5 |
| 357 | LID MEMORY | **regular** | THE LID | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.5 |
| 358 | LID TRICK | **regular** | THE LID | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 10.5 |
| 359 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 16 | 46 | 54 | 34 | 68 | 11.5 |
| 360 | THE FILAMENT | boss | THE LID | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 361 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 362 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 8.1 |
| 363 | RECOIL RAIN | **regular** | THE RECOIL | — | STANDARD | 6 | 28 | 34 | 21 | 42 | 9 |
| 364 | RECOIL HORIZON | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.9 |
| 365 | RECOIL DUET | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 10.9 |
| 366 | RECOIL HUSH | **regular** | THE RECOIL | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 9.4 |
| 367 | RECOIL HOMECOMING | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.4 |
| 368 | RECOIL PARADOX | **regular** | THE RECOIL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.4 |
| 369 | RECOIL FURY | **regular** | THE RECOIL | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 12.1 |
| 370 | THE GIMBAL | boss | THE RECOIL | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 371 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 372 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.4 |
| 373 | CRYSTAL CONFETTI | **regular** | THE CRYSTAL | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 9.6 |
| 374 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.6 |
| 375 | CRYSTAL PARTY | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 376 | LAZY CRYSTAL | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 63 | 39 | 78 | 10 |
| 377 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 378 | CRYSTAL RIDDLE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 379 | CRYSTAL OVERDRIVE | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 380 | THE SPOOL | boss | THE CRYSTAL | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 381 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 382 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 5 | 31 | 61 | 38 | 76 | 8.7 |
| 383 | VOLLEY DRIFT | **regular** | THE VOLLEY | — | STANDARD | 4 | 24 | 49 | 31 | 62 | 9.6 |
| 384 | VOLLEY AT WORLD END | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 47 | 29 | 58 | 10.5 |
| 385 | VOLLEY ALLIANCE | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 63 | 39 | 78 | 11.5 |
| 386 | SLEEPY VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 387 | OLD VOLLEY SONG | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 11 |
| 388 | VOLLEY SPELL | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 389 | VOLLEY RAPTURE | **regular** | THE VOLLEY | — | STANDARD | 15 | 45 | 68 | 43 | 86 | 13.1 |
| 390 | THE HASP | boss | THE VOLLEY | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 391 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 392 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 10.1 |
| 393 | FLIP BLOOM | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 394 | FLIP PILGRIM | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 54 | 34 | 68 | 11.9 |
| 395 | FLIP ALLIANCE | **regular** | THE FLIP | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.9 |
| 396 | FLIP SIESTA | **regular** | THE FLIP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.4 |
| 397 | FLIP RELIC | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 58 | 36 | 72 | 12.4 |
| 398 | FLIP ILLUSION | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 69 | 43 | 86 | 13.4 |
| 399 | FLIP STORM | **regular** | THE FLIP | — | STANDARD | 18 | 46 | 66 | 41 | 82 | 14.3 |
| 400 | THE RATCHET | boss | THE FLIP | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 401 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 402 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 9 |
| 403 | CRAWLER SEEDS | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 9.9 |
| 404 | OUTER CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 405 | CRAWLER MEETS VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 34 | 64 | 40 | 80 | 11.5 |
| 406 | CRAWLER DREAM | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 407 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 408 | TWISTED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 409 | CRAWLER APOCALYPSE | **regular** | THE CRAWLER | — | STANDARD | 17 | 46 | 70 | 44 | 88 | 13 |
| 410 | THE NETTLE | boss | THE CRAWLER | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 411 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 412 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 9.3 |
| 413 | MINE BLOOM | **regular** | THE MINE | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 9.9 |
| 414 | MINE PILGRIM | **regular** | THE MINE | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 10.5 |
| 415 | MINE TOGETHER | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.5 |
| 416 | MINE SIESTA | **regular** | THE MINE | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 417 | MINE RELIC | **regular** | THE MINE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 11 |
| 418 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 419 | MINE STORM | **regular** | THE MINE | — | STANDARD | 18 | 47 | 107 | 67 | 134 | 13.1 |
| 420 | THE MANTLE | boss | THE MINE | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 421 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 422 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 423 | VEIL SEEDS | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 424 | OUTER VEIL | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 11.1 |
| 425 | VEIL MEETS MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 426 | VEIL DREAM | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 427 | VEIL LEGEND | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 428 | TWISTED VEIL | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 429 | VEIL APOCALYPSE | **regular** | THE VEIL | — | STANDARD | 15 | 44 | 46 | 29 | 58 | 13 |
| 430 | THE KEEL | boss | THE VEIL | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 431 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 432 | FIRST WISP | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 433 | WISP SCATTER | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 434 | WISP WANDERER | **regular** | THE WISP | — | STANDARD | 6 | 26 | 54 | 34 | 68 | 10.8 |
| 435 | WISP TANGO | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 436 | WISP LULLABY | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 437 | ANCIENT WISP | **regular** | THE WISP | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11 |
| 438 | WISP MIRAGE | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 439 | WISP THUNDER | **regular** | THE WISP | — | STANDARD | 18 | 47 | 53 | 33 | 66 | 13 |
| 440 | THE VALVE | boss | THE WISP | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 441 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 442 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.2 |
| 443 | GHOST SCATTER | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 10.5 |
| 444 | GHOST WANDERER | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 28 | 18 | 36 | 11.1 |
| 445 | GHOST TANGO | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 446 | GHOST LULLABY | **regular** | THE GHOST | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 10 |
| 447 | ANCIENT GHOST | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 448 | GHOST MIRAGE | **regular** | THE GHOST | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.9 |
| 449 | GHOST THUNDER | **regular** | THE GHOST | — | STANDARD | 15 | 42 | 45 | 28 | 56 | 12.9 |
| 450 | THE SEAM | boss | THE GHOST | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 451 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 452 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 453 | CAROM CONFETTI | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 10.5 |
| 454 | LONG CAROM ROAD | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 35 | 22 | 44 | 11.1 |
| 455 | CAROM PARTY | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 456 | LAZY CAROM | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 457 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 458 | CAROM RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 459 | CAROM OVERDRIVE | **regular** | THE CAROM | — | STANDARD | 18 | 46 | 51 | 32 | 64 | 13.1 |
| 460 | THE OCULUS | boss | THE CAROM | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 461 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 10.2 |
| 462 | CAROM DRIFT | **regular** | HELLO CAROM | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 463 | CAROM AT WORLD END | **regular** | HELLO CAROM | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 464 | CAROM ALLIANCE | **regular** | HELLO CAROM | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 465 | SLEEPY CAROM | **regular** | HELLO CAROM | — | STANDARD | 7 | 36 | 44 | 28 | 56 | 10 |
| 466 | OLD CAROM SONG | **regular** | HELLO CAROM | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 11 |
| 467 | CAROM SPELL | **regular** | HELLO CAROM | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 468 | CAROM RAPTURE | **regular** | HELLO CAROM | — | STANDARD | 17 | 48 | 62 | 39 | 78 | 13 |
| 469 | THE VISE | boss | HELLO CAROM | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 470 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.5 |
| 471 | GHOST SEEDS | **regular** | GHOST DAWN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 472 | OUTER GHOST | **regular** | GHOST DAWN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 11.4 |
| 473 | GHOST MEETS WISP | **regular** | GHOST DAWN | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.8 |
| 474 | GHOST DREAM | **regular** | GHOST DAWN | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 10 |
| 475 | GHOST LEGEND | **regular** | GHOST DAWN | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 11 |
| 476 | TWISTED GHOST | **regular** | GHOST DAWN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 477 | GHOST APOCALYPSE | **regular** | GHOST DAWN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 478 | THE PLUMB | boss | GHOST DAWN | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 479 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 480 | WISP RAIN | **regular** | WISP AWAKENS | — | STANDARD | 6 | 32 | 34 | 21 | 42 | 10.5 |
| 481 | WISP HORIZON | **regular** | WISP AWAKENS | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 482 | WISP DUET | **regular** | WISP AWAKENS | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 483 | WISP HUSH | **regular** | WISP AWAKENS | — | STANDARD | 7 | 40 | 63 | 39 | 78 | 10 |
| 484 | WISP HOMECOMING | **regular** | WISP AWAKENS | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 11 |
| 485 | WISP PARADOX | **regular** | WISP AWAKENS | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 486 | WISP FURY | **regular** | WISP AWAKENS | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13 |
| 487 | THE SLING | boss | WISP AWAKENS | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 488 | NEW VEIL MOON | **regular** | NEW VEIL MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.2 |
| 489 | VEIL SPRINKLE | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 10.5 |
| 490 | FAR VEIL | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 491 | VEIL AND MINE | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11.8 |
| 492 | VEIL PICNIC | **regular** | NEW VEIL MOON | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 493 | VEIL MEMORY | **regular** | NEW VEIL MOON | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 11 |
| 494 | VEIL TRICK | **regular** | NEW VEIL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 495 | VEIL ECLIPSE | **regular** | NEW VEIL MOON | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 496 | THE CAPSTAN | boss | NEW VEIL MOON | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 497 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 10.2 |
| 498 | MINE RAIN | **regular** | MINE AWAKENS | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 499 | MINE HORIZON | **regular** | MINE AWAKENS | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 11.4 |
| 500 | MINE DUET | **regular** | MINE AWAKENS | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 11.8 |
| 501 | MINE HUSH | **regular** | MINE AWAKENS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 10 |
| 502 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 503 | MINE PARADOX | **regular** | MINE AWAKENS | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 504 | MINE FURY | **regular** | MINE AWAKENS | — | STANDARD | 19 | 48 | 50 | 31 | 62 | 13 |
| 505 | THE GALL | boss | MINE AWAKENS | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 506 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.1 |
| 507 | CRAWLER SCATTER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 32 | 57 | 36 | 72 | 10.5 |
| 508 | CRAWLER WANDERER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 509 | CRAWLER TANGO | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 510 | CRAWLER LULLABY | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 511 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 512 | CRAWLER MIRAGE | **regular** | FIRST CRAWLER | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 513 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 19 | 48 | 70 | 44 | 88 | 13.2 |
| 514 | THE TRAPEZE | boss | FIRST CRAWLER | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 515 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 10.5 |
| 516 | SPRING OF VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 11.1 |
| 517 | VOLLEY VOYAGE | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 518 | VOLLEY WALTZ | **regular** | VOLLEY MORNING | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 519 | SOFT VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 520 | VOLLEY SAGA | **regular** | VOLLEY MORNING | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 521 | CROOKED VOLLEY | **regular** | VOLLEY MORNING | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 522 | VOLLEY INFERNO | **regular** | VOLLEY MORNING | — | STANDARD | 19 | 46 | 66 | 41 | 82 | 13 |
| 523 | THE FLUE | boss | VOLLEY MORNING | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 524 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 10.5 |
| 525 | CRYSTAL SPRINKLE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.8 |
| 526 | FAR CRYSTAL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 527 | CRYSTAL AND RECOIL | **regular** | NEW CRYSTAL MOON | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.8 |
| 528 | CRYSTAL PICNIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 10 |
| 529 | CRYSTAL MEMORY | **regular** | NEW CRYSTAL MOON | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 530 | CRYSTAL TRICK | **regular** | NEW CRYSTAL MOON | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 531 | CRYSTAL ECLIPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 532 | THE GOVERNOR | boss | NEW CRYSTAL MOON | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 533 | FIRST RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 534 | RECOIL SCATTER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 535 | RECOIL WANDERER | **regular** | FIRST RECOIL | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 11.1 |
| 536 | RECOIL TANGO | **regular** | FIRST RECOIL | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 537 | RECOIL LULLABY | **regular** | FIRST RECOIL | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 538 | ANCIENT RECOIL | **regular** | FIRST RECOIL | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 539 | RECOIL MIRAGE | **regular** | FIRST RECOIL | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 540 | RECOIL THUNDER | **regular** | FIRST RECOIL | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 541 | THE LAMPREY | boss | FIRST RECOIL | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 542 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 543 | LID RAIN | **regular** | LID AWAKENS | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 544 | LID HORIZON | **regular** | LID AWAKENS | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 545 | LID DUET | **regular** | LID AWAKENS | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 546 | LID HUSH | **regular** | LID AWAKENS | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 547 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 548 | LID PARADOX | **regular** | LID AWAKENS | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 549 | LID FURY | **regular** | LID AWAKENS | — | STANDARD | 19 | 46 | 52 | 33 | 66 | 13.1 |
| 550 | THE MIMIC | boss | LID AWAKENS | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 551 | GYRE DAWN | **regular** | GYRE DAWN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 552 | GYRE SEEDS | **regular** | GYRE DAWN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 553 | OUTER GYRE | **regular** | GYRE DAWN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 12 |
| 554 | GYRE MEETS ECHO | **regular** | GYRE DAWN | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.4 |
| 555 | GYRE DREAM | **regular** | GYRE DAWN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 556 | GYRE LEGEND | **regular** | GYRE DAWN | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 10.8 |
| 557 | TWISTED GYRE | **regular** | GYRE DAWN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 558 | GYRE APOCALYPSE | **regular** | GYRE DAWN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 559 | THE LATCH | boss | GYRE DAWN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 560 | ECHO MORNING | **regular** | ECHO MORNING | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 9.9 |
| 561 | SPRING OF ECHO | **regular** | ECHO MORNING | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 10.5 |
| 562 | ECHO VOYAGE | **regular** | ECHO MORNING | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 11.1 |
| 563 | ECHO WALTZ | **regular** | ECHO MORNING | — | STANDARD | 11 | 39 | 43 | 27 | 54 | 11.6 |
| 564 | SOFT ECHO | **regular** | ECHO MORNING | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 10 |
| 565 | ECHO SAGA | **regular** | ECHO MORNING | — | STANDARD | 10 | 37 | 87 | 54 | 108 | 11 |
| 566 | CROOKED ECHO | **regular** | ECHO MORNING | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 567 | ECHO INFERNO | **regular** | ECHO MORNING | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 568 | THE CHRYSALIS | boss | ECHO MORNING | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 569 | DART DAWN | **regular** | DART DAWN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.5 |
| 570 | DART SEEDS | **regular** | DART DAWN | — | STANDARD | 6 | 28 | 37 | 23 | 46 | 10.8 |
| 571 | OUTER DART | **regular** | DART DAWN | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 11.4 |
| 572 | DART MEETS CLASP | **regular** | DART DAWN | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 12.4 |
| 573 | DART DREAM | **regular** | DART DAWN | — | STANDARD | 6 | 37 | 51 | 32 | 64 | 9.8 |
| 574 | DART LEGEND | **regular** | DART DAWN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 10.8 |
| 575 | TWISTED DART | **regular** | DART DAWN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 576 | DART APOCALYPSE | **regular** | DART DAWN | — | STANDARD | 19 | 47 | 51 | 32 | 64 | 12.8 |
| 577 | THE HYDRA | boss | DART DAWN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 26 beats | 16 | 32 s | short |
| 29 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 47 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 57 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 67 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 77 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 87 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 97 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 107 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 117 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 127 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 137 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 147 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 157 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 167 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 177 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 187 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 197 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 209 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 219 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 229 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 239 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 249 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 259 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 269 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 279 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 289 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 299 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 309 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 319 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 329 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 339 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 350 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 360 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 370 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 380 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 390 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 400 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 410 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 420 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 430 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 440 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 450 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 460 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 469 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 478 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 487 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 496 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 505 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 514 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 523 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 532 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 541 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 550 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 559 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 568 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 577 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
