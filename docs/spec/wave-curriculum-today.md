# The waves today, measured

> **Status: a measurement of 2026-10-15**, the evidence for
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
| regular | 459 | 0 | 4 | 27 | 67 | 3 h 35 min | 7 h 9 min |
| intro | 56 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 56 | 0 | 9 | 28 | 343 | 46 min | 1 h 33 min |
| every wave | 571 | 0 | 3 | 26 | 343 | 4 h 41 min | 9 h 22 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 48 | 51 | 32 | 64 | 4.6 |
| 2 | STEADY | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | SIDE TO SIDE | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | QUICKER | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 36 | 39 | 24 | 48 | 5.4 |
| 5 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 2 | 3 | 6 | 4 | 8 | 3.2 |
| 6 | ONLY CYAN | **regular** | CYAN | — | STANDARD 2 | 5 | 30 | 33 | 21 | 42 | 2.4 |
| 7 | TWO COLOURS | **regular** | CYAN | — | STANDARD 2 | 2 | 3 | 6 | 4 | 8 | 4.2 |
| 8 | ALTERNATING | **regular** | CYAN | — | STANDARD 2 | 3 | 4 | 7 | 4 | 8 | 6.8 |
| 9 | THE INSTAR | boss | CYAN | instar, panel | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 10 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 3 | 1 | 0 | 14 | 9 | 18 | 1 |
| 11 | TWO ROCKS | intro | TWO ROCKS | panel | STANDARD 4 | 2 | 4 | 18 | 11 | 22 | 2.4 |
| 12 | THE HAND | intro | TWO ROCKS | — | STANDARD 4 | 3 | 0 | 16 | 10 | 20 | 5.8 |
| 13 | FIVE ROCKS | **regular** | TWO ROCKS | — | STANDARD 4 | 5 | 28 | 42 | 26 | 52 | 2.4 |
| 14 | WIDE ROCKS | **regular** | TWO ROCKS | — | STANDARD 4 | 6 | 26 | 40 | 25 | 50 | 4.4 |
| 15 | ROCKS BETWEEN | **regular** | TWO ROCKS | — | STANDARD 4 | 8 | 34 | 48 | 30 | 60 | 5.4 |
| 16 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 18 | 20 | 13 | 26 | 5.7 |
| 17 | ONE LAST CHANCE | intro | TORCH | — | STANDARD 4 | 6 | 13 | 24 | 15 | 30 | 10.8 |
| 18 | SHIELD, THEN CANNON | **regular** | TORCH | — | STANDARD 4 | 2 | 5 | 15 | 9 | 18 | 3 |
| 19 | THE WALL | **regular** | TORCH | — | STANDARD 4 | 4 | 3 | 6 | 4 | 8 | 10 |
| 20 | SHOOT AND SHIELD | **regular** | TORCH | — | STANDARD 4 | 4 | 9 | 23 | 14 | 28 | 8 |
| 21 | IN ITS SHADOW | **regular** | TORCH | — | STANDARD 4 | 4 | 9 | 23 | 14 | 28 | 4.6 |
| 22 | CROWDED | **regular** | TORCH | — | STANDARD 4 | 5 | 6 | 17 | 11 | 22 | 14.4 |
| 23 | THE BASTION | boss | TORCH | bastion | STANDARD 5 | 0 | 0 | 82 | 51 | 102 | — |
| 24 | SALVAGE | intro | SALVAGE | purge | STANDARD 5 | 2 | 7 | 10 | 6 | 12 | 4.8 |
| 25 | SAVE IT | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 26 | PURGE WIDE | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 27 | PURGE THE TORCH | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 28 | CATCH AND AIM | intro | CATCH AND AIM | ward | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 29 | SHIELD HELD | **regular** | CATCH AND AIM | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 30 | HELD WIDE | **regular** | CATCH AND AIM | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 31 | FINALE | **regular** | CATCH AND AIM | — | STANDARD 5 | 7 | 7 | 22 | 14 | 28 | 20.9 |
| 32 | THE LURE | intro | THE LURE | lure | STANDARD 5 | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 33 | LURES AGAIN | **regular** | THE LURE | — | STANDARD 5 | 5 | 25 | 39 | 24 | 48 | 3.6 |
| 34 | LURES SPREAD | **regular** | THE LURE | — | STANDARD 5 | 6 | 30 | 44 | 28 | 56 | 4.8 |
| 35 | LURES FAR APART | **regular** | THE LURE | — | STANDARD 5 | 6 | 28 | 42 | 26 | 52 | 6 |
| 36 | LURE AND SHIELD | **regular** | THE LURE | — | STANDARD 5 | 6 | 34 | 42 | 26 | 52 | 7 |
| 37 | EASY LURES | **regular** | THE LURE | — | STANDARD 5 | 6 | 37 | 51 | 32 | 64 | 5.5 |
| 38 | LURE RECALL | **regular** | THE LURE | — | STANDARD 5 | 8 | 39 | 53 | 33 | 66 | 6.6 |
| 39 | LURES AND TWINS | **regular** | THE LURE | — | STANDARD 5 | 9 | 45 | 59 | 37 | 74 | 7.6 |
| 40 | LURE PEAK | **regular** | THE LURE | — | STANDARD 5 | 13 | 44 | 58 | 36 | 72 | 8.6 |
| 41 | BULB QUEEN | boss | THE LURE | queen | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 42 | THE THROB | intro | THE THROB | throb | STANDARD 5 | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 43 | THROBS AGAIN | **regular** | THE THROB | — | STANDARD 5 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 44 | THROBS SPREAD | **regular** | THE THROB | — | STANDARD 5 | 5 | 27 | 31 | 19 | 38 | 5.1 |
| 45 | THROBS FAR APART | **regular** | THE THROB | — | STANDARD 5 | 6 | 26 | 30 | 19 | 38 | 6.3 |
| 46 | THROB AND LURE | **regular** | THE THROB | — | STANDARD 5 | 8 | 38 | 52 | 33 | 66 | 7.4 |
| 47 | EASY THROBS | **regular** | THE THROB | — | STANDARD 5 | 6 | 35 | 39 | 24 | 48 | 6 |
| 48 | THROB RECALL | **regular** | THE THROB | — | STANDARD 5 | 8 | 37 | 51 | 32 | 64 | 7.3 |
| 49 | THROBS AND TWINS | **regular** | THE THROB | — | STANDARD 5 | 12 | 48 | 62 | 39 | 78 | 8.3 |
| 50 | THROB PEAK | **regular** | THE THROB | — | STANDARD 5 | 16 | 48 | 62 | 39 | 78 | 9.3 |
| 51 | THE MIRROR | boss (special) | THE THROB | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 52 | THE COUNT | intro | THE COUNT | countdown | STANDARD 5 | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 53 | COUNTS AGAIN | **regular** | THE COUNT | — | STANDARD 5 | 5 | 29 | 35 | 22 | 44 | 4.2 |
| 54 | COUNTS SPREAD | **regular** | THE COUNT | — | STANDARD 5 | 6 | 31 | 37 | 23 | 46 | 5.4 |
| 55 | COUNTS FAR APART | **regular** | THE COUNT | — | STANDARD 5 | 6 | 26 | 31 | 19 | 38 | 6.6 |
| 56 | COUNT AND THROB | **regular** | THE COUNT | — | STANDARD 5 | 8 | 34 | 37 | 23 | 46 | 7.6 |
| 57 | EASY COUNTS | **regular** | THE COUNT | — | STANDARD 5 | 6 | 36 | 39 | 24 | 48 | 6.1 |
| 58 | COUNT RECALL | **regular** | THE COUNT | — | STANDARD 5 | 8 | 39 | 43 | 27 | 54 | 7.3 |
| 59 | COUNTS AND TWINS | **regular** | THE COUNT | — | STANDARD 5 | 11 | 44 | 47 | 29 | 58 | 8.5 |
| 60 | COUNT PEAK | **regular** | THE COUNT | — | STANDARD 5 | 14 | 48 | 52 | 33 | 66 | 9.5 |
| 61 | THE MAZE | boss (special) | THE COUNT | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 62 | THE SHELL | intro | THE SHELL | shell | STANDARD 5 | 2 | 10 | 14 | 9 | 18 | 3 |
| 63 | SHELLS AGAIN | **regular** | THE SHELL | — | STANDARD 5 | 5 | 29 | 33 | 21 | 42 | 4.2 |
| 64 | SHELLS SPREAD | **regular** | THE SHELL | — | STANDARD 5 | 5 | 27 | 31 | 19 | 38 | 5.4 |
| 65 | SHELLS FAR APART | **regular** | THE SHELL | — | STANDARD 5 | 6 | 26 | 30 | 19 | 38 | 6.6 |
| 66 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD 5 | 8 | 35 | 38 | 24 | 48 | 7.7 |
| 67 | EASY SHELLS | **regular** | THE SHELL | — | STANDARD 5 | 6 | 35 | 39 | 24 | 48 | 6.2 |
| 68 | SHELL RECALL | **regular** | THE SHELL | — | STANDARD 5 | 8 | 40 | 54 | 34 | 68 | 7.3 |
| 69 | SHELLS AND TWINS | **regular** | THE SHELL | — | STANDARD 5 | 11 | 44 | 48 | 30 | 60 | 8.4 |
| 70 | SHELL PEAK | **regular** | THE SHELL | — | STANDARD 5 | 14 | 48 | 53 | 33 | 66 | 9.4 |
| 71 | THE GAUGE | boss (special) | THE SHELL | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 72 | THE CLASP | intro | THE CLASP | clasp | STANDARD 5 | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 73 | CLASPS AGAIN | **regular** | THE CLASP | — | STANDARD 5 | 5 | 29 | 32 | 20 | 40 | 4.5 |
| 74 | CLASPS SPREAD | **regular** | THE CLASP | — | STANDARD 5 | 6 | 31 | 34 | 21 | 42 | 5.7 |
| 75 | CLASPS FAR APART | **regular** | THE CLASP | — | STANDARD 5 | 6 | 29 | 32 | 20 | 40 | 7 |
| 76 | CLASP AND SHELL | **regular** | THE CLASP | — | STANDARD 5 | 8 | 33 | 37 | 23 | 46 | 8 |
| 77 | EASY CLASPS | **regular** | THE CLASP | — | STANDARD 5 | 7 | 40 | 43 | 27 | 54 | 6.5 |
| 78 | CLASP RECALL | **regular** | THE CLASP | — | STANDARD 5 | 7 | 35 | 38 | 24 | 48 | 7.5 |
| 79 | CLASPS AND TWINS | **regular** | THE CLASP | — | STANDARD 5 | 11 | 44 | 47 | 29 | 58 | 8.5 |
| 80 | CLASP PEAK | **regular** | THE CLASP | — | STANDARD 5 | 16 | 48 | 52 | 33 | 66 | 9.5 |
| 81 | THE WARDEN | boss | THE CLASP | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 82 | THE DART | intro | THE DART | dart | STANDARD 5 | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 83 | DARTS AGAIN | **regular** | THE DART | — | STANDARD 5 | 5 | 27 | 30 | 19 | 38 | 4.8 |
| 84 | DARTS SPREAD | **regular** | THE DART | — | STANDARD 5 | 6 | 28 | 31 | 19 | 38 | 6 |
| 85 | DARTS FAR APART | **regular** | THE DART | — | STANDARD 5 | 6 | 27 | 41 | 26 | 52 | 7.2 |
| 86 | DART AND CLASP | **regular** | THE DART | — | STANDARD 5 | 8 | 36 | 39 | 24 | 48 | 8.2 |
| 87 | EASY DARTS | **regular** | THE DART | — | STANDARD 5 | 6 | 38 | 41 | 26 | 52 | 6.7 |
| 88 | DART RECALL | **regular** | THE DART | — | STANDARD 5 | 8 | 39 | 53 | 33 | 66 | 7.7 |
| 89 | DARTS AND TWINS | **regular** | THE DART | — | STANDARD 5 | 11 | 45 | 48 | 30 | 60 | 8.7 |
| 90 | DART PEAK | **regular** | THE DART | — | STANDARD 5 | 14 | 48 | 51 | 32 | 64 | 9.7 |
| 91 | THE FLEET | boss (special) | THE DART | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 92 | THE VEIL | intro | THE VEIL | veil | STANDARD 5 | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 93 | VEILS AGAIN | **regular** | THE VEIL | — | STANDARD 5 | 5 | 28 | 34 | 21 | 42 | 5.1 |
| 94 | VEILS SPREAD | **regular** | THE VEIL | — | STANDARD 5 | 6 | 30 | 33 | 21 | 42 | 6.3 |
| 95 | VEILS FAR APART | **regular** | THE VEIL | — | STANDARD 5 | 6 | 27 | 41 | 26 | 52 | 7.4 |
| 96 | VEIL AND DART | **regular** | THE VEIL | — | STANDARD 5 | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 97 | EASY VEILS | **regular** | THE VEIL | — | STANDARD 5 | 6 | 36 | 39 | 24 | 48 | 6.9 |
| 98 | VEIL RECALL | **regular** | THE VEIL | — | STANDARD 5 | 8 | 39 | 43 | 27 | 54 | 7.9 |
| 99 | VEILS AND TWINS | **regular** | THE VEIL | — | STANDARD 5 | 11 | 44 | 47 | 29 | 58 | 8.9 |
| 100 | VEIL PEAK | **regular** | THE VEIL | — | STANDARD 5 | 16 | 48 | 51 | 32 | 64 | 9.9 |
| 101 | THE VANE | boss | THE VEIL | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 102 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 103 | THE PURGE | intro | THE LANCE | — | STANDARD | 3 | 3 | 8 | 5 | 10 | 8.6 |
| 104 | LANCE AGAIN | **regular** | THE LANCE | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 5.1 |
| 105 | LANCE WIDE | **regular** | THE LANCE | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 6.3 |
| 106 | LANCE AT THE EDGE | **regular** | THE LANCE | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 7.3 |
| 107 | LANCE IN PAIRS | **regular** | THE LANCE | — | STANDARD | 8 | 32 | 35 | 22 | 44 | 8.3 |
| 108 | LANCE AT EASE | **regular** | THE LANCE | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.8 |
| 109 | LANCE RECALLED | **regular** | THE LANCE | — | STANDARD | 8 | 38 | 43 | 27 | 54 | 7.8 |
| 110 | LANCE TWICE | **regular** | THE LANCE | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 8.8 |
| 111 | LANCE PEAK | **regular** | THE LANCE | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 9.8 |
| 112 | SNAKE | boss (special) | THE LANCE | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 113 | THE WARD | intro | THE WARD | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 114 | HEAVY ROCKS AGAIN | **regular** | THE WARD | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 115 | HEAVY ROCKS SPREAD | **regular** | THE WARD | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 5.7 |
| 116 | HEAVY ROCKS APART | **regular** | THE WARD | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 6.7 |
| 117 | HEAVY ROCK AND VEIL | **regular** | THE WARD | — | STANDARD | 8 | 33 | 41 | 26 | 52 | 7.7 |
| 118 | EASY HEAVY ROCKS | **regular** | THE WARD | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 119 | HEAVY ROCK RECALL | **regular** | THE WARD | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 7.2 |
| 120 | HEAVY ROCKS, TWINS | **regular** | THE WARD | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 8.2 |
| 121 | HEAVY ROCK PEAK | **regular** | THE WARD | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.1 |
| 122 | PINBALL | boss (special) | THE WARD | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 123 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 124 | WISPS AGAIN | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 4.8 |
| 125 | WISPS SPREAD | **regular** | THE WISP | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 6 |
| 126 | WISPS FAR APART | **regular** | THE WISP | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 7.8 |
| 127 | WISP AND ROCK | **regular** | THE WISP | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 8.8 |
| 128 | EASY WISPS | **regular** | THE WISP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.3 |
| 129 | WISP RECALL | **regular** | THE WISP | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 8.3 |
| 130 | WISPS AND TWINS | **regular** | THE WISP | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.3 |
| 131 | WISP PEAK | **regular** | THE WISP | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 10.3 |
| 132 | THE SCOUT | boss (special) | THE WISP | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 133 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 134 | GHOSTS AGAIN | **regular** | THE GHOST | — | STANDARD | 5 | 25 | 28 | 18 | 36 | 5.7 |
| 135 | GHOSTS SPREAD | **regular** | THE GHOST | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 6.9 |
| 136 | GHOSTS FAR APART | **regular** | THE GHOST | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.7 |
| 137 | GHOST AND WISP | **regular** | THE GHOST | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 9.7 |
| 138 | EASY GHOSTS | **regular** | THE GHOST | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 8.2 |
| 139 | GHOST RECALL | **regular** | THE GHOST | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.2 |
| 140 | GHOSTS AND TWINS | **regular** | THE GHOST | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 10.2 |
| 141 | GHOST PEAK | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 51 | 32 | 64 | 11.2 |
| 142 | THE HAUL | boss (special) | THE GHOST | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 143 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 144 | ECHOES AGAIN | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6 |
| 145 | ECHOES SPREAD | **regular** | THE ECHO | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7.2 |
| 146 | ECHOES FAR APART | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 8.4 |
| 147 | ECHO AND GHOST | **regular** | THE ECHO | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 9.4 |
| 148 | EASY ECHOES | **regular** | THE ECHO | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 7.9 |
| 149 | ECHO RECALL | **regular** | THE ECHO | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 8.9 |
| 150 | ECHOES AND TWINS | **regular** | THE ECHO | — | STANDARD | 11 | 47 | 50 | 31 | 62 | 9.9 |
| 151 | ECHO PEAK | **regular** | THE ECHO | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 10.9 |
| 152 | THE STARE | boss | THE ECHO | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 153 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 154 | RINDS AGAIN | **regular** | THE RIND | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 6.3 |
| 155 | RINDS SPREAD | **regular** | THE RIND | — | STANDARD | 6 | 31 | 35 | 22 | 44 | 7.5 |
| 156 | RINDS FAR APART | **regular** | THE RIND | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8.4 |
| 157 | RIND AND ECHO | **regular** | THE RIND | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 9.4 |
| 158 | EASY RINDS | **regular** | THE RIND | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.9 |
| 159 | RIND RECALL | **regular** | THE RIND | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 8.9 |
| 160 | RINDS AND TWINS | **regular** | THE RIND | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 9.9 |
| 161 | RIND PEAK | **regular** | THE RIND | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 10.9 |
| 162 | THE PULSE | boss (special) | THE RIND | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 163 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 164 | GYRES AGAIN | **regular** | THE GYRE | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 6.3 |
| 165 | GYRES SPREAD | **regular** | THE GYRE | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7.3 |
| 166 | GYRES FAR APART | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.4 |
| 167 | GYRE AND RIND | **regular** | THE GYRE | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 9.4 |
| 168 | EASY GYRES | **regular** | THE GYRE | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 7.9 |
| 169 | GYRE RECALL | **regular** | THE GYRE | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8.9 |
| 170 | GYRES AND TWINS | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 9.9 |
| 171 | GYRE PEAK | **regular** | THE GYRE | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 10.9 |
| 172 | THE BATON | boss | THE GYRE | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 173 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 174 | LIDS AGAIN | **regular** | THE LID | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6.3 |
| 175 | LIDS SPREAD | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.3 |
| 176 | LIDS FAR APART | **regular** | THE LID | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 177 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 9.4 |
| 178 | EASY LIDS | **regular** | THE LID | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.9 |
| 179 | LID RECALL | **regular** | THE LID | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 8.9 |
| 180 | LIDS AND TWINS | **regular** | THE LID | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.9 |
| 181 | LID PEAK | **regular** | THE LID | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 10.9 |
| 182 | THE UNDERTOW | boss | THE LID | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 183 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 184 | RECOILS AGAIN | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 6.3 |
| 185 | RECOILS SPREAD | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 7.3 |
| 186 | RECOILS FAR APART | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8.4 |
| 187 | RECOIL AND LID | **regular** | THE RECOIL | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 9.5 |
| 188 | EASY RECOILS | **regular** | THE RECOIL | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8 |
| 189 | RECOIL RECALL | **regular** | THE RECOIL | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9 |
| 190 | RECOILS AND TWINS | **regular** | THE RECOIL | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 10 |
| 191 | RECOIL PEAK | **regular** | THE RECOIL | — | STANDARD | 15 | 44 | 47 | 29 | 58 | 11.1 |
| 192 | THE THROAT | boss | THE RECOIL | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 193 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 194 | CAROMS AGAIN | **regular** | THE CAROM | — | STANDARD | 5 | 27 | 41 | 26 | 52 | 6.6 |
| 195 | CAROMS SPREAD | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 37 | 23 | 46 | 7.8 |
| 196 | CAROMS FAR APART | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 33 | 21 | 42 | 9 |
| 197 | CAROM AND RECOIL | **regular** | THE CAROM | — | STANDARD | 8 | 33 | 48 | 30 | 60 | 10 |
| 198 | EASY CAROMS | **regular** | THE CAROM | — | STANDARD | 6 | 37 | 52 | 33 | 66 | 8.5 |
| 199 | CAROM RECALL | **regular** | THE CAROM | — | STANDARD | 8 | 37 | 43 | 27 | 54 | 9.5 |
| 200 | CAROMS AND TWINS | **regular** | THE CAROM | — | STANDARD | 11 | 43 | 57 | 36 | 72 | 10.5 |
| 201 | CAROM PEAK | **regular** | THE CAROM | — | STANDARD | 15 | 47 | 58 | 36 | 72 | 11.8 |
| 202 | THE GORGE | boss | THE CAROM | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 203 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 204 | CRYSTALS AGAIN | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 205 | CRYSTALS SPREAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 32 | 47 | 29 | 58 | 7.8 |
| 206 | CRYSTALS FAR APART | **regular** | THE CRYSTAL | — | STANDARD | 6 | 27 | 38 | 24 | 48 | 8.8 |
| 207 | CRYSTAL AND CAROM | **regular** | THE CRYSTAL | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.8 |
| 208 | EASY CRYSTALS | **regular** | THE CRYSTAL | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 8.3 |
| 209 | CRYSTAL RECALL | **regular** | THE CRYSTAL | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 9.3 |
| 210 | CRYSTALS AND TWINS | **regular** | THE CRYSTAL | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 10.3 |
| 211 | CRYSTAL PEAK | **regular** | THE CRYSTAL | — | STANDARD | 15 | 48 | 59 | 37 | 74 | 11.7 |
| 212 | THE CURTAIN | boss | THE CRYSTAL | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 213 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 214 | VOLLEYS AGAIN | **regular** | THE VOLLEY | — | STANDARD | 5 | 28 | 59 | 37 | 74 | 6.6 |
| 215 | VOLLEYS SPREAD | **regular** | THE VOLLEY | — | STANDARD | 6 | 32 | 55 | 34 | 68 | 7.8 |
| 216 | VOLLEYS FAR APART | **regular** | THE VOLLEY | — | STANDARD | 6 | 28 | 46 | 29 | 58 | 9 |
| 217 | VOLLEY AND CRYSTAL | **regular** | THE VOLLEY | — | STANDARD | 8 | 34 | 64 | 40 | 80 | 10 |
| 218 | EASY VOLLEYS | **regular** | THE VOLLEY | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 8.5 |
| 219 | VOLLEY RECALL | **regular** | THE VOLLEY | — | STANDARD | 7 | 35 | 59 | 37 | 74 | 9.5 |
| 220 | VOLLEYS AND TWINS | **regular** | THE VOLLEY | — | STANDARD | 12 | 48 | 73 | 46 | 92 | 10.6 |
| 221 | VOLLEY PEAK | **regular** | THE VOLLEY | — | STANDARD | 15 | 46 | 68 | 43 | 86 | 12 |
| 222 | THE TASTER | boss | THE VOLLEY | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 223 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 224 | VEERS AGAIN | **regular** | THE VEER | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.6 |
| 225 | VEERS SPREAD | **regular** | THE VEER | — | STANDARD | 5 | 28 | 52 | 33 | 66 | 7.5 |
| 226 | VEERS FAR APART | **regular** | THE VEER | — | STANDARD | 6 | 29 | 53 | 33 | 66 | 8.7 |
| 227 | VEER AND VOLLEY | **regular** | THE VEER | — | STANDARD | 8 | 36 | 66 | 41 | 82 | 9.7 |
| 228 | EASY VEERS | **regular** | THE VEER | — | STANDARD | 6 | 34 | 50 | 31 | 62 | 8.2 |
| 229 | VEER RECALL | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.2 |
| 230 | VEERS AND TWINS | **regular** | THE VEER | — | STANDARD | 11 | 45 | 65 | 41 | 82 | 10.3 |
| 231 | VEER PEAK | **regular** | THE VEER | — | STANDARD | 14 | 45 | 75 | 47 | 94 | 11.3 |
| 232 | THE SINEW | boss | THE VEER | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 233 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 234 | STRANDS AGAIN | **regular** | THE STRAND | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6.6 |
| 235 | STRANDS SPREAD | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 7.5 |
| 236 | STRANDS FAR APART | **regular** | THE STRAND | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 237 | STRAND AND VEER | **regular** | THE STRAND | — | STANDARD | 8 | 33 | 39 | 24 | 48 | 9.4 |
| 238 | EASY STRANDS | **regular** | THE STRAND | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 7.9 |
| 239 | STRAND RECALL | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8.9 |
| 240 | STRANDS AND TWINS | **regular** | THE STRAND | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9.9 |
| 241 | STRAND PEAK | **regular** | THE STRAND | — | STANDARD | 14 | 46 | 60 | 38 | 76 | 10.9 |
| 242 | THE LEDGER | boss | THE STRAND | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 243 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 244 | CRAWLERS AGAIN | **regular** | THE CRAWLER | — | STANDARD | 5 | 28 | 40 | 25 | 50 | 6.8 |
| 245 | CRAWLERS SPREAD | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7.8 |
| 246 | CRAWLERS FAR APART | **regular** | THE CRAWLER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9 |
| 247 | CRAWLER AND STRAND | **regular** | THE CRAWLER | — | STANDARD | 8 | 39 | 56 | 35 | 70 | 10 |
| 248 | EASY CRAWLERS | **regular** | THE CRAWLER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 8.5 |
| 249 | CRAWLER RECALL | **regular** | THE CRAWLER | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 9.5 |
| 250 | CRAWLERS AND TWINS | **regular** | THE CRAWLER | — | STANDARD | 11 | 44 | 60 | 38 | 76 | 10.5 |
| 251 | CRAWLER PEAK | **regular** | THE CRAWLER | — | STANDARD | 14 | 46 | 57 | 36 | 72 | 11.5 |
| 252 | THE SURGE | boss | THE CRAWLER | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 253 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 254 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 255 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 256 | FENCES AGAIN | **regular** | THE FENCE | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 7 |
| 257 | FENCES SPREAD | **regular** | THE FENCE | — | STANDARD | 6 | 31 | 35 | 22 | 44 | 8 |
| 258 | FENCES FAR APART | **regular** | THE FENCE | — | STANDARD | 6 | 25 | 56 | 35 | 70 | 9 |
| 259 | FENCE AND CRAWLER | **regular** | THE FENCE | — | STANDARD | 8 | 36 | 44 | 28 | 56 | 10 |
| 260 | EASY FENCES | **regular** | THE FENCE | — | STANDARD | 7 | 39 | 46 | 29 | 58 | 8.6 |
| 261 | FENCE RECALL | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 10 |
| 262 | FENCES AND TWINS | **regular** | THE FENCE | — | STANDARD | 11 | 43 | 52 | 33 | 66 | 11 |
| 263 | FENCE PEAK | **regular** | THE FENCE | — | STANDARD | 15 | 47 | 54 | 34 | 68 | 12.1 |
| 264 | THE LEAD | boss | THE FENCE | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 265 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 266 | MAGNETS AGAIN | **regular** | THE MAGNET | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.1 |
| 267 | MAGNETS SPREAD | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 44 | 28 | 56 | 8.1 |
| 268 | MAGNETS FAR APART | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 9 |
| 269 | MAGNET AND FENCE | **regular** | THE MAGNET | — | STANDARD | 8 | 33 | 36 | 23 | 46 | 10 |
| 270 | EASY MAGNETS | **regular** | THE MAGNET | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 8.3 |
| 271 | MAGNET RECALL | **regular** | THE MAGNET | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.2 |
| 272 | MAGNETS AND TWINS | **regular** | THE MAGNET | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 10 |
| 273 | MAGNET PEAK | **regular** | THE MAGNET | — | STANDARD | 15 | 47 | 53 | 33 | 66 | 11 |
| 274 | THE SCUTTLE | boss | THE MAGNET | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 275 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 276 | JAM AGAIN | **regular** | THE JAM | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 10.1 |
| 277 | JAM WIDE | **regular** | THE JAM | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 11.1 |
| 278 | JAM AT THE EDGE | **regular** | THE JAM | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 12.2 |
| 279 | JAM IN PAIRS | **regular** | THE JAM | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 13.2 |
| 280 | JAM AT EASE | **regular** | THE JAM | — | STANDARD | 7 | 40 | 44 | 28 | 56 | 11.7 |
| 281 | JAM RECALLED | **regular** | THE JAM | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 12.7 |
| 282 | JAM TWICE | **regular** | THE JAM | — | STANDARD | 13 | 48 | 57 | 36 | 72 | 13.7 |
| 283 | JAM PEAK | **regular** | THE JAM | — | STANDARD | 19 | 46 | 58 | 36 | 72 | 14.7 |
| 284 | THE ANTIPHON | boss | THE JAM | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 285 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 286 | COILS AGAIN | **regular** | THE COIL | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 7.1 |
| 287 | COILS SPREAD | **regular** | THE COIL | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 8.1 |
| 288 | COILS FAR APART | **regular** | THE COIL | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 8.4 |
| 289 | COIL AND MAGNET | **regular** | THE COIL | — | STANDARD | 7 | 33 | 35 | 22 | 44 | 8.8 |
| 290 | EASY COILS | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 291 | COIL RECALL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 7.2 |
| 292 | COILS AND TWINS | **regular** | THE COIL | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 7.9 |
| 293 | THE TWITCH | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 294 | THE HIVE | boss | THE COIL | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 295 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 296 | CHOKE AGAIN | **regular** | THE CHOKE | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 9.8 |
| 297 | CHOKE WIDE | **regular** | THE CHOKE | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 11 |
| 298 | CHOKE AT THE EDGE | **regular** | THE CHOKE | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 12.2 |
| 299 | CHOKE IN PAIRS | **regular** | THE CHOKE | — | STANDARD | 10 | 37 | 45 | 28 | 56 | 13.3 |
| 300 | CHOKE AT EASE | **regular** | THE CHOKE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 11.8 |
| 301 | CHOKE RECALLED | **regular** | THE CHOKE | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 12.9 |
| 302 | CHOKE TWICE | **regular** | THE CHOKE | — | STANDARD | 13 | 47 | 57 | 36 | 72 | 14.3 |
| 303 | CHOKE PEAK | **regular** | THE CHOKE | — | STANDARD | 18 | 47 | 56 | 35 | 70 | 16 |
| 304 | THE CAIRN | boss | THE CHOKE | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 305 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 306 | LIMPET AGAIN | **regular** | THE LIMPET | — | STANDARD | 5 | 30 | 45 | 28 | 56 | 10.6 |
| 307 | LIMPET WIDE | **regular** | THE LIMPET | — | STANDARD | 6 | 27 | 33 | 21 | 42 | 11.6 |
| 308 | LIMPET AT THE EDGE | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 12.8 |
| 309 | LIMPET IN PAIRS | **regular** | THE LIMPET | — | STANDARD | 10 | 36 | 45 | 28 | 56 | 14 |
| 310 | LIMPET AT EASE | **regular** | THE LIMPET | — | STANDARD | 6 | 35 | 45 | 28 | 56 | 12.9 |
| 311 | LIMPET RECALLED | **regular** | THE LIMPET | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 14 |
| 312 | LIMPET TWICE | **regular** | THE LIMPET | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 15.1 |
| 313 | LIMPET PEAK | **regular** | THE LIMPET | — | STANDARD | 15 | 42 | 45 | 28 | 56 | 16.2 |
| 314 | THE WELL | boss (special) | THE LIMPET | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 315 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 316 | LEECH AGAIN | **regular** | THE LEECH | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.7 |
| 317 | LEECH WIDE | **regular** | THE LEECH | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 11.9 |
| 318 | LEECH AT THE EDGE | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 13.1 |
| 319 | LEECH IN PAIRS | **regular** | THE LEECH | — | STANDARD | 11 | 39 | 50 | 31 | 62 | 14.1 |
| 320 | LEECH AT EASE | **regular** | THE LEECH | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 12.6 |
| 321 | LEECH RECALLED | **regular** | THE LEECH | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 13.6 |
| 322 | LEECH TWICE | **regular** | THE LEECH | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 14.6 |
| 323 | LEECH PEAK | **regular** | THE LEECH | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 15.8 |
| 324 | THE REPRISE | boss | THE LEECH | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 325 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 6 | 52 | 57 | 36 | 72 | 4.9 |
| 326 | CLAW AGAIN | **regular** | THE CLAW | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.5 |
| 327 | CLAW WIDE | **regular** | THE CLAW | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 11.1 |
| 328 | CLAW AT THE EDGE | **regular** | THE CLAW | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 12 |
| 329 | CLAW IN PAIRS | **regular** | THE CLAW | — | STANDARD | 11 | 37 | 40 | 25 | 50 | 13 |
| 330 | CLAW AT EASE | **regular** | THE CLAW | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 10 |
| 331 | CLAW RECALLED | **regular** | THE CLAW | — | STANDARD | 9 | 40 | 42 | 26 | 52 | 11 |
| 332 | CLAW TWICE | **regular** | THE CLAW | — | STANDARD | 13 | 47 | 50 | 31 | 62 | 12 |
| 333 | CLAW PEAK | **regular** | THE CLAW | — | STANDARD | 19 | 47 | 51 | 32 | 64 | 13 |
| 334 | THE SPLICE | boss (special) | THE CLAW | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 335 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 336 | CROSSINGS AGAIN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 6.6 |
| 337 | CROSSINGS SPREAD | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 7.6 |
| 338 | CROSSINGS FAR APART | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.6 |
| 339 | CROSSING AND COIL | **regular** | THE CROSSING | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 9.6 |
| 340 | EASY CROSSINGS | **regular** | THE CROSSING | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.1 |
| 341 | CROSSING RECALL | **regular** | THE CROSSING | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 9.1 |
| 342 | CROSSINGS AND TWINS | **regular** | THE CROSSING | — | STANDARD | 14 | 45 | 49 | 31 | 62 | 10.2 |
| 343 | CROSSING PEAK | **regular** | THE CROSSING | — | STANDARD | 18 | 47 | 49 | 31 | 62 | 11.2 |
| 344 | THE FILAMENT | boss | THE CROSSING | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 345 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 346 | CHOIRS AGAIN | **regular** | THE CHOIR | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.3 |
| 347 | CHOIRS SPREAD | **regular** | THE CHOIR | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.3 |
| 348 | CHOIRS FAR APART | **regular** | THE CHOIR | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9.3 |
| 349 | CHOIR AND CROSSING | **regular** | THE CHOIR | — | STANDARD | 11 | 40 | 47 | 29 | 58 | 10.3 |
| 350 | EASY CHOIRS | **regular** | THE CHOIR | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8.8 |
| 351 | CHOIR RECALL | **regular** | THE CHOIR | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 9.8 |
| 352 | CHOIRS AND TWINS | **regular** | THE CHOIR | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.8 |
| 353 | CHOIR PEAK | **regular** | THE CHOIR | — | STANDARD | 20 | 48 | 52 | 33 | 66 | 12.2 |
| 354 | THE GIMBAL | boss | THE CHOIR | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 355 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 356 | BALLOONS AGAIN | **regular** | THE BALLOON | — | STANDARD | 5 | 30 | 56 | 35 | 70 | 7.8 |
| 357 | BALLOONS SPREAD | **regular** | THE BALLOON | — | STANDARD | 6 | 26 | 41 | 26 | 52 | 8.8 |
| 358 | BALLOONS FAR APART | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9.8 |
| 359 | BALLOON AND CHOIR | **regular** | THE BALLOON | — | STANDARD | 10 | 36 | 56 | 35 | 70 | 10.8 |
| 360 | EASY BALLOONS | **regular** | THE BALLOON | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 9.3 |
| 361 | BALLOON RECALL | **regular** | THE BALLOON | — | STANDARD | 10 | 38 | 54 | 34 | 68 | 10.3 |
| 362 | BALLOONS AND TWINS | **regular** | THE BALLOON | — | STANDARD | 12 | 43 | 64 | 40 | 80 | 11.3 |
| 363 | BALLOON PEAK | **regular** | THE BALLOON | — | STANDARD | 15 | 48 | 52 | 33 | 66 | 12.2 |
| 364 | THE SPOOL | boss | THE BALLOON | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 365 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 366 | BEATBOXES AGAIN | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 47 | 29 | 58 | 8.1 |
| 367 | BEATBOXES SPREAD | **regular** | THE BEATBOX | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 9.2 |
| 368 | BEATBOXES FAR APART | **regular** | THE BEATBOX | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 10.2 |
| 369 | BEATBOX AND BALLOON | **regular** | THE BEATBOX | — | STANDARD | 11 | 40 | 66 | 41 | 82 | 11.2 |
| 370 | EASY BEATBOXES | **regular** | THE BEATBOX | — | STANDARD | 6 | 34 | 47 | 29 | 58 | 9.7 |
| 371 | BEATBOX RECALL | **regular** | THE BEATBOX | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 10.7 |
| 372 | BEATBOXES AND TWINS | **regular** | THE BEATBOX | — | STANDARD | 12 | 44 | 59 | 37 | 74 | 11.7 |
| 373 | BEATBOX PEAK | **regular** | THE BEATBOX | — | STANDARD | 20 | 47 | 68 | 43 | 86 | 12.7 |
| 374 | THE HASP | boss | THE BEATBOX | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 375 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 376 | WEIGHTS AGAIN | **regular** | THE WEIGHT | — | STANDARD | 5 | 26 | 30 | 19 | 38 | 8.2 |
| 377 | WEIGHTS SPREAD | **regular** | THE WEIGHT | — | STANDARD | 6 | 32 | 40 | 25 | 50 | 9.2 |
| 378 | WEIGHTS FAR APART | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.2 |
| 379 | WEIGHT AND BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 11 | 38 | 43 | 27 | 54 | 11.2 |
| 380 | EASY WEIGHTS | **regular** | THE WEIGHT | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.7 |
| 381 | WEIGHT RECALL | **regular** | THE WEIGHT | — | STANDARD | 9 | 39 | 41 | 26 | 52 | 10.7 |
| 382 | WEIGHTS AND TWINS | **regular** | THE WEIGHT | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.7 |
| 383 | WEIGHT PEAK | **regular** | THE WEIGHT | — | STANDARD | 17 | 48 | 52 | 33 | 66 | 12.7 |
| 384 | THE RATCHET | boss | THE WEIGHT | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 385 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 386 | CODEX AGAIN | **regular** | THE CODEX | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 9.8 |
| 387 | CODEX WIDE | **regular** | THE CODEX | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 11 |
| 388 | CODEX AT THE EDGE | **regular** | THE CODEX | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 12.1 |
| 389 | CODEX IN PAIRS | **regular** | THE CODEX | — | STANDARD | 11 | 40 | 45 | 28 | 56 | 13.1 |
| 390 | CODEX AT EASE | **regular** | THE CODEX | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 11.6 |
| 391 | CODEX RECALLED | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 12.6 |
| 392 | CODEX TWICE | **regular** | THE CODEX | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 13.7 |
| 393 | CODEX PEAK | **regular** | THE CODEX | — | STANDARD | 15 | 43 | 47 | 29 | 58 | 14.7 |
| 394 | THE NETTLE | boss | THE CODEX | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 395 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 396 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 397 | HANDOVER AGAIN | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 10.1 |
| 398 | HANDOVER WIDE | **regular** | THE HANDOVER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 11.2 |
| 399 | HANDOVER AT THE EDGE | **regular** | THE HANDOVER | — | STANDARD | 6 | 28 | 58 | 36 | 72 | 12.2 |
| 400 | HANDOVER IN PAIRS | **regular** | THE HANDOVER | — | STANDARD | 11 | 37 | 41 | 26 | 52 | 13.3 |
| 401 | HANDOVER AT EASE | **regular** | THE HANDOVER | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 11.8 |
| 402 | HANDOVER RECALLED | **regular** | THE HANDOVER | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.8 |
| 403 | HANDOVER TWICE | **regular** | THE HANDOVER | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 13.8 |
| 404 | HANDOVER PEAK | **regular** | THE HANDOVER | — | STANDARD | 18 | 47 | 50 | 31 | 62 | 14.8 |
| 405 | THE MANTLE | boss | THE HANDOVER | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 406 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 407 | MINES AGAIN | **regular** | THE MINE | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 8.3 |
| 408 | MINES SPREAD | **regular** | THE MINE | — | STANDARD | 6 | 26 | 41 | 26 | 52 | 9.3 |
| 409 | MINES FAR APART | **regular** | THE MINE | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 10.3 |
| 410 | MINE AND WEIGHT | **regular** | THE MINE | — | STANDARD | 11 | 37 | 39 | 24 | 48 | 11.3 |
| 411 | EASY MINES | **regular** | THE MINE | — | STANDARD | 6 | 34 | 43 | 27 | 54 | 9.8 |
| 412 | MINE RECALL | **regular** | THE MINE | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 10.8 |
| 413 | MINES AND TWINS | **regular** | THE MINE | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.8 |
| 414 | MINE PEAK | **regular** | THE MINE | — | STANDARD | 18 | 48 | 52 | 33 | 66 | 12.8 |
| 415 | THE KEEL | boss | THE MINE | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 416 | THE BLISTER | intro | THE BLISTER | blister | STANDARD | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 417 | BLISTERS AGAIN | **regular** | THE BLISTER | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 8.4 |
| 418 | BLISTERS SPREAD | **regular** | THE BLISTER | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 9.3 |
| 419 | BLISTERS FAR APART | **regular** | THE BLISTER | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.3 |
| 420 | BLISTER AND MINE | **regular** | THE BLISTER | — | STANDARD | 11 | 40 | 42 | 26 | 52 | 11.4 |
| 421 | EASY BLISTERS | **regular** | THE BLISTER | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 10 |
| 422 | BLISTER RECALL | **regular** | THE BLISTER | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 423 | BLISTERS AND TWINS | **regular** | THE BLISTER | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 12 |
| 424 | BLISTER PEAK | **regular** | THE BLISTER | — | STANDARD | 18 | 46 | 54 | 34 | 68 | 13 |
| 425 | THE VALVE | boss | THE BLISTER | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 426 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 427 | MOULTS AGAIN | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 8.6 |
| 428 | MOULTS SPREAD | **regular** | THE MOULT | — | STANDARD | 6 | 32 | 47 | 29 | 58 | 9.6 |
| 429 | MOULTS FAR APART | **regular** | THE MOULT | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 10.5 |
| 430 | MOULT AND BLISTER | **regular** | THE MOULT | — | STANDARD | 10 | 36 | 77 | 48 | 96 | 11.5 |
| 431 | EASY MOULTS | **regular** | THE MOULT | — | STANDARD | 6 | 35 | 77 | 48 | 96 | 10 |
| 432 | MOULT RECALL | **regular** | THE MOULT | — | STANDARD | 10 | 36 | 97 | 61 | 122 | 11.1 |
| 433 | MOULTS AND TWINS | **regular** | THE MOULT | — | STANDARD | 12 | 45 | 97 | 61 | 122 | 12.1 |
| 434 | MOULT PEAK | **regular** | THE MOULT | — | STANDARD | 18 | 48 | 97 | 61 | 122 | 13.1 |
| 435 | THE SEAM | boss | THE MOULT | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 436 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 437 | FLIP AGAIN | **regular** | THE FLIP | — | STANDARD | 5 | 28 | 37 | 23 | 46 | 9.8 |
| 438 | FLIP WIDE | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 87 | 54 | 108 | 11 |
| 439 | FLIP AT THE EDGE | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 12.2 |
| 440 | FLIP IN PAIRS | **regular** | THE FLIP | — | STANDARD | 12 | 38 | 97 | 61 | 122 | 13.2 |
| 441 | FLIP AT EASE | **regular** | THE FLIP | — | STANDARD | 6 | 34 | 57 | 36 | 72 | 11.7 |
| 442 | FLIP RECALLED | **regular** | THE FLIP | — | STANDARD | 10 | 38 | 87 | 54 | 108 | 12.9 |
| 443 | FLIP TWICE | **regular** | THE FLIP | — | STANDARD | 14 | 47 | 97 | 61 | 122 | 14 |
| 444 | FLIP PEAK | **regular** | THE FLIP | — | STANDARD | 19 | 46 | 107 | 67 | 134 | 15 |
| 445 | THE OCULUS | boss | THE FLIP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 446 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 447 | DARK AGAIN | **regular** | THE DARK | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 9.9 |
| 448 | DARK WIDE | **regular** | THE DARK | — | STANDARD | 6 | 31 | 67 | 42 | 84 | 10.9 |
| 449 | DARK AT THE EDGE | **regular** | THE DARK | — | STANDARD | 6 | 28 | 77 | 48 | 96 | 11.9 |
| 450 | DARK IN PAIRS | **regular** | THE DARK | — | STANDARD | 12 | 40 | 77 | 48 | 96 | 12.9 |
| 451 | DARK AT EASE | **regular** | THE DARK | — | STANDARD | 7 | 40 | 77 | 48 | 96 | 11.4 |
| 452 | DARK RECALLED | **regular** | THE DARK | — | STANDARD | 10 | 40 | 77 | 48 | 96 | 12.4 |
| 453 | DARK TWICE | **regular** | THE DARK | — | STANDARD | 14 | 48 | 97 | 61 | 122 | 13.5 |
| 454 | DARK PEAK | **regular** | THE DARK | — | STANDARD | 18 | 46 | 97 | 61 | 122 | 14.5 |
| 455 | THE VISE | boss | THE DARK | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 456 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 457 | HUSKS AGAIN | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 87 | 54 | 108 | 8.7 |
| 458 | HUSKS SPREAD | **regular** | THE HUSK | — | STANDARD | 4 | 30 | 97 | 61 | 122 | 9.6 |
| 459 | HUSKS FAR APART | **regular** | THE HUSK | — | STANDARD | 4 | 26 | 57 | 36 | 72 | 10.5 |
| 460 | HUSK AND MOULT | **regular** | THE HUSK | — | STANDARD | 8 | 38 | 87 | 54 | 108 | 11.5 |
| 461 | EASY HUSKS | **regular** | THE HUSK | — | STANDARD | 6 | 40 | 47 | 29 | 58 | 10 |
| 462 | HUSK RECALL | **regular** | THE HUSK | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 11 |
| 463 | HUSKS AND TWINS | **regular** | THE HUSK | — | STANDARD | 9 | 45 | 87 | 54 | 108 | 12 |
| 464 | FIVE BLISTERS | **regular** | THE HUSK | — | STANDARD | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 465 | BLISTERS TO TAP | **regular** | THE HUSK | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.5 |
| 466 | BLISTERS TO HOLD | **regular** | THE HUSK | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.8 |
| 467 | BLISTERS TO SWIPE | **regular** | THE HUSK | — | STANDARD | 9 | 39 | 42 | 26 | 52 | 7.8 |
| 468 | BLISTERS TO TURN | **regular** | THE HUSK | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.4 |
| 469 | BLISTERS TO RUB | **regular** | THE HUSK | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 470 | BLISTERS TO COMBO | **regular** | THE HUSK | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.6 |
| 471 | BLISTERS TO LEVER | **regular** | THE HUSK | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 472 | THE PLUMB | boss | THE HUSK | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 473 | LURES RETURN | **regular** | LURES RETURN | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.8 |
| 474 | LURES WIDER | **regular** | LURES RETURN | — | STANDARD | 4 | 29 | 33 | 21 | 42 | 6.8 |
| 475 | LURES OUT WIDE | **regular** | LURES RETURN | — | STANDARD | 4 | 28 | 42 | 26 | 52 | 7.8 |
| 476 | LURES IN PAIRS | **regular** | LURES RETURN | — | STANDARD | 9 | 40 | 54 | 34 | 68 | 8.8 |
| 477 | LURES AT REST | **regular** | LURES RETURN | — | STANDARD | 5 | 36 | 50 | 31 | 62 | 7.3 |
| 478 | LURES RECALLED | **regular** | LURES RETURN | — | STANDARD | 9 | 39 | 53 | 33 | 66 | 8.3 |
| 479 | LURES DOUBLED | **regular** | LURES RETURN | — | STANDARD | 10 | 41 | 49 | 31 | 62 | 9.3 |
| 480 | LURES SUMMIT | **regular** | LURES RETURN | — | STANDARD | 15 | 46 | 54 | 34 | 68 | 10.3 |
| 481 | THE SLING | boss | LURES RETURN | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 482 | THROBS RETURN | **regular** | THROBS RETURN | — | STANDARD | 4 | 29 | 43 | 27 | 54 | 7.5 |
| 483 | THROBS WIDER | **regular** | THROBS RETURN | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 8.5 |
| 484 | THROBS OUT WIDE | **regular** | THROBS RETURN | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 9.5 |
| 485 | THROBS IN PAIRS | **regular** | THROBS RETURN | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 10.5 |
| 486 | THROBS AT REST | **regular** | THROBS RETURN | — | STANDARD | 6 | 34 | 36 | 23 | 46 | 9 |
| 487 | THROBS RECALLED | **regular** | THROBS RETURN | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 10 |
| 488 | THROBS DOUBLED | **regular** | THROBS RETURN | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.9 |
| 489 | THROBS SUMMIT | **regular** | THROBS RETURN | — | STANDARD | 15 | 43 | 57 | 36 | 72 | 11.8 |
| 490 | THE CAPSTAN | boss | THROBS RETURN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 491 | COUNTS RETURN | **regular** | COUNTS RETURN | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 7.6 |
| 492 | COUNTS WIDER | **regular** | COUNTS RETURN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 8.6 |
| 493 | COUNTS OUT WIDE | **regular** | COUNTS RETURN | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9.6 |
| 494 | COUNTS IN PAIRS | **regular** | COUNTS RETURN | — | STANDARD | 9 | 39 | 43 | 27 | 54 | 10.6 |
| 495 | COUNTS AT REST | **regular** | COUNTS RETURN | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 9.1 |
| 496 | COUNTS RECALLED | **regular** | COUNTS RETURN | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 10.1 |
| 497 | COUNTS DOUBLED | **regular** | COUNTS RETURN | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 11.1 |
| 498 | COUNTS SUMMIT | **regular** | COUNTS RETURN | — | STANDARD | 15 | 44 | 48 | 30 | 60 | 12.1 |
| 499 | THE GALL | boss | COUNTS RETURN | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 500 | SHELLS RETURN | **regular** | SHELLS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.7 |
| 501 | SHELLS WIDER | **regular** | SHELLS RETURN | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 8.7 |
| 502 | SHELLS OUT WIDE | **regular** | SHELLS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9.6 |
| 503 | SHELLS IN PAIRS | **regular** | SHELLS RETURN | — | STANDARD | 11 | 40 | 44 | 28 | 56 | 10.6 |
| 504 | SHELLS AT REST | **regular** | SHELLS RETURN | — | STANDARD | 7 | 40 | 48 | 30 | 60 | 9.1 |
| 505 | SHELLS RECALLED | **regular** | SHELLS RETURN | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 10.1 |
| 506 | SHELLS DOUBLED | **regular** | SHELLS RETURN | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.1 |
| 507 | SHELLS SUMMIT | **regular** | SHELLS RETURN | — | STANDARD | 17 | 48 | 52 | 33 | 66 | 12.1 |
| 508 | THE TRAPEZE | boss | SHELLS RETURN | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 509 | CLASPS RETURN | **regular** | CLASPS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.8 |
| 510 | CLASPS WIDER | **regular** | CLASPS RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 8.8 |
| 511 | CLASPS OUT WIDE | **regular** | CLASPS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.8 |
| 512 | CLASPS IN PAIRS | **regular** | CLASPS RETURN | — | STANDARD | 11 | 37 | 40 | 25 | 50 | 10.8 |
| 513 | CLASPS AT REST | **regular** | CLASPS RETURN | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.3 |
| 514 | CLASPS RECALLED | **regular** | CLASPS RETURN | — | STANDARD | 9 | 37 | 40 | 25 | 50 | 10.3 |
| 515 | CLASPS DOUBLED | **regular** | CLASPS RETURN | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.3 |
| 516 | CLASPS SUMMIT | **regular** | CLASPS RETURN | — | STANDARD | 15 | 44 | 48 | 30 | 60 | 12.3 |
| 517 | THE FLUE | boss | CLASPS RETURN | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 518 | DARTS RETURN | **regular** | DARTS RETURN | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7.9 |
| 519 | DARTS WIDER | **regular** | DARTS RETURN | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 9 |
| 520 | DARTS OUT WIDE | **regular** | DARTS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10 |
| 521 | DARTS IN PAIRS | **regular** | DARTS RETURN | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 11 |
| 522 | DARTS AT REST | **regular** | DARTS RETURN | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 9.6 |
| 523 | DARTS RECALLED | **regular** | DARTS RETURN | — | STANDARD | 9 | 36 | 39 | 24 | 48 | 10.6 |
| 524 | DARTS DOUBLED | **regular** | DARTS RETURN | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 11.6 |
| 525 | DARTS SUMMIT | **regular** | DARTS RETURN | — | STANDARD | 17 | 48 | 52 | 33 | 66 | 12.6 |
| 526 | THE GOVERNOR | boss | DARTS RETURN | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 527 | VEILS RETURN | **regular** | VEILS RETURN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8 |
| 528 | VEILS WIDER | **regular** | VEILS RETURN | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 9 |
| 529 | VEILS OUT WIDE | **regular** | VEILS RETURN | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 9.9 |
| 530 | VEILS IN PAIRS | **regular** | VEILS RETURN | — | STANDARD | 11 | 37 | 40 | 25 | 50 | 10.9 |
| 531 | VEILS AT REST | **regular** | VEILS RETURN | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.4 |
| 532 | VEILS RECALLED | **regular** | VEILS RETURN | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 10.4 |
| 533 | VEILS DOUBLED | **regular** | VEILS RETURN | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.4 |
| 534 | VEILS SUMMIT | **regular** | VEILS RETURN | — | STANDARD | 17 | 46 | 49 | 31 | 62 | 12.3 |
| 535 | THE LAMPREY | boss | VEILS RETURN | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 536 | HEAVY ROCKS RETURN | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 537 | HEAVY ROCKS WIDER | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 9.1 |
| 538 | HEAVY ROCKS OUT WIDE | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.1 |
| 539 | HEAVY ROCKS IN PAIRS | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 13 | 39 | 42 | 26 | 52 | 11.1 |
| 540 | HEAVY ROCKS AT REST | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 10 |
| 541 | HEAVY ROCKS RECALLED | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 10 | 35 | 38 | 24 | 48 | 11.8 |
| 542 | HEAVY ROCKS DOUBLED | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 18 | 47 | 51 | 32 | 64 | 13.8 |
| 543 | HEAVY ROCKS SUMMIT | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 20 | 48 | 53 | 33 | 66 | 15.3 |
| 544 | THE MIMIC | boss | HEAVY ROCKS RETURN | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 545 | WISPS RETURN | **regular** | WISPS RETURN | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 8.2 |
| 546 | WISPS WIDER | **regular** | WISPS RETURN | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 9.2 |
| 547 | WISPS OUT WIDE | **regular** | WISPS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.2 |
| 548 | WISPS IN PAIRS | **regular** | WISPS RETURN | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 11.2 |
| 549 | WISPS AT REST | **regular** | WISPS RETURN | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 9.8 |
| 550 | WISPS RECALLED | **regular** | WISPS RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11.8 |
| 551 | WISPS DOUBLED | **regular** | WISPS RETURN | — | STANDARD | 15 | 45 | 48 | 30 | 60 | 13.8 |
| 552 | WISPS SUMMIT | **regular** | WISPS RETURN | — | STANDARD | 21 | 46 | 52 | 33 | 66 | 15.8 |
| 553 | THE LATCH | boss | WISPS RETURN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 554 | GHOSTS RETURN | **regular** | GHOSTS RETURN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 8.4 |
| 555 | GHOSTS WIDER | **regular** | GHOSTS RETURN | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 9.5 |
| 556 | GHOSTS OUT WIDE | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 10.5 |
| 557 | GHOSTS IN PAIRS | **regular** | GHOSTS RETURN | — | STANDARD | 12 | 36 | 40 | 25 | 50 | 11.5 |
| 558 | GHOSTS AT REST | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 10 |
| 559 | GHOSTS RECALLED | **regular** | GHOSTS RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 560 | GHOSTS DOUBLED | **regular** | GHOSTS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 561 | GHOSTS SUMMIT | **regular** | GHOSTS RETURN | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 562 | THE CHRYSALIS | boss | GHOSTS RETURN | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 563 | ECHOES RETURN | **regular** | ECHOES RETURN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8.6 |
| 564 | ECHOES WIDER | **regular** | ECHOES RETURN | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 9.6 |
| 565 | ECHOES OUT WIDE | **regular** | ECHOES RETURN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 10.5 |
| 566 | ECHOES IN PAIRS | **regular** | ECHOES RETURN | — | STANDARD | 12 | 39 | 42 | 26 | 52 | 11.5 |
| 567 | ECHOES AT REST | **regular** | ECHOES RETURN | — | STANDARD | 7 | 40 | 48 | 30 | 60 | 10 |
| 568 | ECHOES RECALLED | **regular** | ECHOES RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 569 | ECHOES DOUBLED | **regular** | ECHOES RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 570 | ECHOES SUMMIT | **regular** | ECHOES RETURN | — | STANDARD | 16 | 44 | 48 | 30 | 60 | 13 |
| 571 | THE HYDRA | boss | ECHOES RETURN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 23 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 41 | BULB QUEEN | normal | 79 beats | 49 | 98 s | in band |
| 51 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 61 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 71 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 81 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 91 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 101 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 112 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 122 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 132 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 142 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 152 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 162 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 172 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 182 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 192 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 202 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 212 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 222 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 232 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 242 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 252 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 264 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 274 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 284 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 294 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 304 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 314 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 324 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 334 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 344 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 354 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 364 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 374 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 384 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 394 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 405 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 415 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 425 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 435 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 445 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 455 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 472 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 481 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 490 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 499 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 508 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 517 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 526 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 535 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 544 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 553 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 562 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 571 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
