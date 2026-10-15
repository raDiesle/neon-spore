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
| regular | 452 | 0 | 4 | 26 | 61 | 3 h 28 min | 6 h 56 min |
| intro | 56 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 56 | 0 | 9 | 28 | 343 | 46 min | 1 h 33 min |
| every wave | 564 | 0 | 3 | 26 | 343 | 4 h 35 min | 9 h 10 min |

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
| 11 | TWO ROCKS | intro | THE ROCK | panel | STANDARD 4 | 2 | 4 | 18 | 11 | 22 | 2.4 |
| 12 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 16 | 10 | 20 | 5.8 |
| 13 | FIVE ROCKS | **regular** | THE ROCK | — | STANDARD 4 | 5 | 28 | 42 | 26 | 52 | 2.4 |
| 14 | WIDE ROCKS | **regular** | THE ROCK | — | STANDARD 4 | 6 | 26 | 40 | 25 | 50 | 4.4 |
| 15 | ROCKS BETWEEN | **regular** | THE ROCK | — | STANDARD 4 | 8 | 34 | 48 | 30 | 60 | 5.4 |
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
| 101 | THE LANCE | intro | THE VEIL | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 102 | THE PURGE | intro | THE VEIL | — | STANDARD | 3 | 3 | 8 | 5 | 10 | 8.6 |
| 103 | THE VANE | boss | THE VEIL | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 104 | THE WARD | intro | THE WARD | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 105 | HEAVY ROCKS AGAIN | **regular** | THE WARD | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 106 | HEAVY ROCKS SPREAD | **regular** | THE WARD | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 5.7 |
| 107 | HEAVY ROCKS APART | **regular** | THE WARD | — | STANDARD | 6 | 26 | 40 | 25 | 50 | 6.7 |
| 108 | HEAVY ROCK AND VEIL | **regular** | THE WARD | — | STANDARD | 8 | 33 | 41 | 26 | 52 | 7.7 |
| 109 | EASY HEAVY ROCKS | **regular** | THE WARD | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 6.2 |
| 110 | HEAVY ROCK RECALL | **regular** | THE WARD | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 7.2 |
| 111 | HEAVY ROCKS, TWINS | **regular** | THE WARD | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 8.2 |
| 112 | HEAVY ROCK PEAK | **regular** | THE WARD | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.1 |
| 113 | SNAKE | boss (special) | THE WARD | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 114 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 115 | WISPS AGAIN | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 4.8 |
| 116 | WISPS SPREAD | **regular** | THE WISP | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 6 |
| 117 | WISPS FAR APART | **regular** | THE WISP | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 7.8 |
| 118 | WISP AND ROCK | **regular** | THE WISP | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 8.8 |
| 119 | EASY WISPS | **regular** | THE WISP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.3 |
| 120 | WISP RECALL | **regular** | THE WISP | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 8.3 |
| 121 | WISPS AND TWINS | **regular** | THE WISP | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.3 |
| 122 | WISP PEAK | **regular** | THE WISP | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 10.3 |
| 123 | PINBALL | boss (special) | THE WISP | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 124 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 125 | GHOSTS AGAIN | **regular** | THE GHOST | — | STANDARD | 5 | 25 | 28 | 18 | 36 | 5.7 |
| 126 | GHOSTS SPREAD | **regular** | THE GHOST | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 6.9 |
| 127 | GHOSTS FAR APART | **regular** | THE GHOST | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 8.7 |
| 128 | GHOST AND WISP | **regular** | THE GHOST | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 9.7 |
| 129 | EASY GHOSTS | **regular** | THE GHOST | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 8.2 |
| 130 | GHOST RECALL | **regular** | THE GHOST | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.2 |
| 131 | GHOSTS AND TWINS | **regular** | THE GHOST | — | STANDARD | 11 | 43 | 46 | 29 | 58 | 10.2 |
| 132 | GHOST PEAK | **regular** | THE GHOST | — | STANDARD | 14 | 48 | 51 | 32 | 64 | 11.2 |
| 133 | THE SCOUT | boss (special) | THE GHOST | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 134 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 135 | ECHOES AGAIN | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6 |
| 136 | ECHOES SPREAD | **regular** | THE ECHO | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7.2 |
| 137 | ECHOES FAR APART | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 8.4 |
| 138 | ECHO AND GHOST | **regular** | THE ECHO | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 9.4 |
| 139 | EASY ECHOES | **regular** | THE ECHO | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 7.9 |
| 140 | ECHO RECALL | **regular** | THE ECHO | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 8.9 |
| 141 | ECHOES AND TWINS | **regular** | THE ECHO | — | STANDARD | 11 | 47 | 50 | 31 | 62 | 9.9 |
| 142 | ECHO PEAK | **regular** | THE ECHO | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 10.9 |
| 143 | THE HAUL | boss (special) | THE ECHO | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 144 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 145 | RINDS AGAIN | **regular** | THE RIND | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 6.3 |
| 146 | RINDS SPREAD | **regular** | THE RIND | — | STANDARD | 6 | 31 | 35 | 22 | 44 | 7.5 |
| 147 | RINDS FAR APART | **regular** | THE RIND | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8.4 |
| 148 | RIND AND ECHO | **regular** | THE RIND | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 9.4 |
| 149 | EASY RINDS | **regular** | THE RIND | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.9 |
| 150 | RIND RECALL | **regular** | THE RIND | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 8.9 |
| 151 | RINDS AND TWINS | **regular** | THE RIND | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 9.9 |
| 152 | RIND PEAK | **regular** | THE RIND | — | STANDARD | 16 | 48 | 51 | 32 | 64 | 10.9 |
| 153 | THE STARE | boss | THE RIND | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 154 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 155 | GYRES AGAIN | **regular** | THE GYRE | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 6.3 |
| 156 | GYRES SPREAD | **regular** | THE GYRE | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7.3 |
| 157 | GYRES FAR APART | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 8.4 |
| 158 | GYRE AND RIND | **regular** | THE GYRE | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 9.4 |
| 159 | EASY GYRES | **regular** | THE GYRE | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 7.9 |
| 160 | GYRE RECALL | **regular** | THE GYRE | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 8.9 |
| 161 | GYRES AND TWINS | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 9.9 |
| 162 | GYRE PEAK | **regular** | THE GYRE | — | STANDARD | 16 | 48 | 54 | 34 | 68 | 10.9 |
| 163 | THE PULSE | boss (special) | THE GYRE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 164 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 165 | LIDS AGAIN | **regular** | THE LID | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6.3 |
| 166 | LIDS SPREAD | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.3 |
| 167 | LIDS FAR APART | **regular** | THE LID | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 8.4 |
| 168 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 9.4 |
| 169 | EASY LIDS | **regular** | THE LID | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.9 |
| 170 | LID RECALL | **regular** | THE LID | — | STANDARD | 8 | 39 | 53 | 33 | 66 | 8.9 |
| 171 | LIDS AND TWINS | **regular** | THE LID | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 9.9 |
| 172 | LID PEAK | **regular** | THE LID | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 10.9 |
| 173 | THE BATON | boss | THE LID | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 174 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 175 | RECOILS AGAIN | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 6.3 |
| 176 | RECOILS SPREAD | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 7.3 |
| 177 | RECOILS FAR APART | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 8.4 |
| 178 | RECOIL AND LID | **regular** | THE RECOIL | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 9.5 |
| 179 | EASY RECOILS | **regular** | THE RECOIL | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8 |
| 180 | RECOIL RECALL | **regular** | THE RECOIL | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9 |
| 181 | RECOILS AND TWINS | **regular** | THE RECOIL | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 10 |
| 182 | RECOIL PEAK | **regular** | THE RECOIL | — | STANDARD | 15 | 44 | 47 | 29 | 58 | 11.1 |
| 183 | THE UNDERTOW | boss | THE RECOIL | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 184 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 185 | CAROMS AGAIN | **regular** | THE CAROM | — | STANDARD | 5 | 27 | 41 | 26 | 52 | 6.6 |
| 186 | CAROMS SPREAD | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 37 | 23 | 46 | 7.8 |
| 187 | CAROMS FAR APART | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 33 | 21 | 42 | 9 |
| 188 | CAROM AND RECOIL | **regular** | THE CAROM | — | STANDARD | 8 | 33 | 48 | 30 | 60 | 10 |
| 189 | EASY CAROMS | **regular** | THE CAROM | — | STANDARD | 6 | 37 | 52 | 33 | 66 | 8.5 |
| 190 | CAROM RECALL | **regular** | THE CAROM | — | STANDARD | 8 | 37 | 43 | 27 | 54 | 9.5 |
| 191 | CAROMS AND TWINS | **regular** | THE CAROM | — | STANDARD | 11 | 43 | 57 | 36 | 72 | 10.5 |
| 192 | CAROM PEAK | **regular** | THE CAROM | — | STANDARD | 15 | 47 | 58 | 36 | 72 | 11.8 |
| 193 | THE THROAT | boss | THE CAROM | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 194 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 195 | CRYSTALS AGAIN | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 196 | CRYSTALS SPREAD | **regular** | THE CRYSTAL | — | STANDARD | 6 | 32 | 47 | 29 | 58 | 7.8 |
| 197 | CRYSTALS FAR APART | **regular** | THE CRYSTAL | — | STANDARD | 6 | 27 | 38 | 24 | 48 | 8.8 |
| 198 | CRYSTAL AND CAROM | **regular** | THE CRYSTAL | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.8 |
| 199 | EASY CRYSTALS | **regular** | THE CRYSTAL | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 8.3 |
| 200 | CRYSTAL RECALL | **regular** | THE CRYSTAL | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 9.3 |
| 201 | CRYSTALS AND TWINS | **regular** | THE CRYSTAL | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 10.3 |
| 202 | CRYSTAL PEAK | **regular** | THE CRYSTAL | — | STANDARD | 15 | 48 | 59 | 37 | 74 | 11.7 |
| 203 | THE GORGE | boss | THE CRYSTAL | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 204 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 205 | VOLLEYS AGAIN | **regular** | THE VOLLEY | — | STANDARD | 5 | 28 | 59 | 37 | 74 | 6.6 |
| 206 | VOLLEYS SPREAD | **regular** | THE VOLLEY | — | STANDARD | 6 | 32 | 55 | 34 | 68 | 7.8 |
| 207 | VOLLEYS FAR APART | **regular** | THE VOLLEY | — | STANDARD | 6 | 28 | 46 | 29 | 58 | 9 |
| 208 | VOLLEY AND CRYSTAL | **regular** | THE VOLLEY | — | STANDARD | 8 | 34 | 64 | 40 | 80 | 10 |
| 209 | EASY VOLLEYS | **regular** | THE VOLLEY | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 8.5 |
| 210 | VOLLEY RECALL | **regular** | THE VOLLEY | — | STANDARD | 7 | 35 | 59 | 37 | 74 | 9.5 |
| 211 | VOLLEYS AND TWINS | **regular** | THE VOLLEY | — | STANDARD | 12 | 48 | 73 | 46 | 92 | 10.6 |
| 212 | VOLLEY PEAK | **regular** | THE VOLLEY | — | STANDARD | 15 | 46 | 68 | 43 | 86 | 12 |
| 213 | THE CURTAIN | boss | THE VOLLEY | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 214 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 215 | VEERS AGAIN | **regular** | THE VEER | — | STANDARD | 6 | 32 | 46 | 29 | 58 | 6.6 |
| 216 | VEERS SPREAD | **regular** | THE VEER | — | STANDARD | 5 | 28 | 52 | 33 | 66 | 7.5 |
| 217 | VEERS FAR APART | **regular** | THE VEER | — | STANDARD | 6 | 29 | 53 | 33 | 66 | 8.7 |
| 218 | VEER AND VOLLEY | **regular** | THE VEER | — | STANDARD | 8 | 36 | 66 | 41 | 82 | 9.7 |
| 219 | EASY VEERS | **regular** | THE VEER | — | STANDARD | 6 | 34 | 50 | 31 | 62 | 8.2 |
| 220 | VEER RECALL | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.2 |
| 221 | VEERS AND TWINS | **regular** | THE VEER | — | STANDARD | 11 | 45 | 65 | 41 | 82 | 10.3 |
| 222 | VEER PEAK | **regular** | THE VEER | — | STANDARD | 14 | 45 | 75 | 47 | 94 | 11.3 |
| 223 | THE TASTER | boss | THE VEER | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 224 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 225 | STRANDS AGAIN | **regular** | THE STRAND | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6.6 |
| 226 | STRANDS SPREAD | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 7.5 |
| 227 | STRANDS FAR APART | **regular** | THE STRAND | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 228 | STRAND AND VEER | **regular** | THE STRAND | — | STANDARD | 8 | 33 | 39 | 24 | 48 | 9.4 |
| 229 | EASY STRANDS | **regular** | THE STRAND | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 7.9 |
| 230 | STRAND RECALL | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 8.9 |
| 231 | STRANDS AND TWINS | **regular** | THE STRAND | — | STANDARD | 11 | 45 | 49 | 31 | 62 | 9.9 |
| 232 | STRAND PEAK | **regular** | THE STRAND | — | STANDARD | 14 | 46 | 60 | 38 | 76 | 10.9 |
| 233 | THE SINEW | boss | THE STRAND | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 234 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 235 | CRAWLERS AGAIN | **regular** | THE CRAWLER | — | STANDARD | 5 | 28 | 40 | 25 | 50 | 6.8 |
| 236 | CRAWLERS SPREAD | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7.8 |
| 237 | CRAWLERS FAR APART | **regular** | THE CRAWLER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9 |
| 238 | CRAWLER AND STRAND | **regular** | THE CRAWLER | — | STANDARD | 8 | 39 | 56 | 35 | 70 | 10 |
| 239 | EASY CRAWLERS | **regular** | THE CRAWLER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 8.5 |
| 240 | CRAWLER RECALL | **regular** | THE CRAWLER | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 9.5 |
| 241 | CRAWLERS AND TWINS | **regular** | THE CRAWLER | — | STANDARD | 11 | 44 | 60 | 38 | 76 | 10.5 |
| 242 | CRAWLER PEAK | **regular** | THE CRAWLER | — | STANDARD | 14 | 46 | 57 | 36 | 72 | 11.5 |
| 243 | THE LEDGER | boss | THE CRAWLER | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 244 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 245 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 246 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 247 | FENCES AGAIN | **regular** | THE FENCE | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 7 |
| 248 | FENCES SPREAD | **regular** | THE FENCE | — | STANDARD | 6 | 31 | 35 | 22 | 44 | 8 |
| 249 | FENCES FAR APART | **regular** | THE FENCE | — | STANDARD | 6 | 25 | 56 | 35 | 70 | 9 |
| 250 | FENCE AND CRAWLER | **regular** | THE FENCE | — | STANDARD | 8 | 36 | 44 | 28 | 56 | 10 |
| 251 | EASY FENCES | **regular** | THE FENCE | — | STANDARD | 7 | 39 | 46 | 29 | 58 | 8.6 |
| 252 | FENCE RECALL | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 10 |
| 253 | FENCES AND TWINS | **regular** | THE FENCE | — | STANDARD | 11 | 43 | 52 | 33 | 66 | 11 |
| 254 | FENCE PEAK | **regular** | THE FENCE | — | STANDARD | 15 | 47 | 54 | 34 | 68 | 12.1 |
| 255 | THE SURGE | boss | THE FENCE | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 256 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 257 | THE JAM | intro | THE MAGNET | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 258 | MAGNETS AGAIN | **regular** | THE MAGNET | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.1 |
| 259 | MAGNETS SPREAD | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 44 | 28 | 56 | 8.1 |
| 260 | MAGNETS FAR APART | **regular** | THE MAGNET | — | STANDARD | 6 | 27 | 31 | 19 | 38 | 9 |
| 261 | MAGNET AND FENCE | **regular** | THE MAGNET | — | STANDARD | 8 | 33 | 36 | 23 | 46 | 10 |
| 262 | EASY MAGNETS | **regular** | THE MAGNET | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 8.3 |
| 263 | MAGNET RECALL | **regular** | THE MAGNET | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.2 |
| 264 | MAGNETS AND TWINS | **regular** | THE MAGNET | — | STANDARD | 11 | 44 | 47 | 29 | 58 | 10 |
| 265 | MAGNET PEAK | **regular** | THE MAGNET | — | STANDARD | 15 | 47 | 53 | 33 | 66 | 11 |
| 266 | THE LEAD | boss | THE MAGNET | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 267 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 268 | THE CHOKE | intro | THE COIL | steerFault | STANDARD | 10 | 48 | 60 | 38 | 76 | 10.6 |
| 269 | THE LIMPET | intro | THE COIL | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 270 | THE LEECH | intro | THE COIL | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 271 | COILS AGAIN | **regular** | THE COIL | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 7.1 |
| 272 | COILS SPREAD | **regular** | THE COIL | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 8.1 |
| 273 | COILS FAR APART | **regular** | THE COIL | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 8.4 |
| 274 | COIL AND MAGNET | **regular** | THE COIL | — | STANDARD | 7 | 33 | 35 | 22 | 44 | 8.8 |
| 275 | EASY COILS | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 276 | COIL RECALL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 7.2 |
| 277 | COILS AND TWINS | **regular** | THE COIL | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 7.9 |
| 278 | THE TWITCH | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 279 | THE CLAW | intro | THE COIL | panel | THE CLAW | 6 | 52 | 57 | 36 | 72 | 4.9 |
| 280 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 281 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 282 | CROSSINGS AGAIN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 6.6 |
| 283 | CROSSINGS SPREAD | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 7.6 |
| 284 | CROSSINGS FAR APART | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.6 |
| 285 | CROSSING AND COIL | **regular** | THE CROSSING | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 9.6 |
| 286 | EASY CROSSINGS | **regular** | THE CROSSING | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 8.1 |
| 287 | CROSSING RECALL | **regular** | THE CROSSING | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 9.1 |
| 288 | CROSSINGS AND TWINS | **regular** | THE CROSSING | — | STANDARD | 14 | 45 | 49 | 31 | 62 | 10.2 |
| 289 | CROSSING PEAK | **regular** | THE CROSSING | — | STANDARD | 18 | 47 | 49 | 31 | 62 | 11.2 |
| 290 | THE ANTIPHON | boss | THE CROSSING | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 291 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 292 | CHOIRS AGAIN | **regular** | THE CHOIR | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.3 |
| 293 | CHOIRS SPREAD | **regular** | THE CHOIR | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.3 |
| 294 | CHOIRS FAR APART | **regular** | THE CHOIR | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9.3 |
| 295 | CHOIR AND CROSSING | **regular** | THE CHOIR | — | STANDARD | 11 | 40 | 47 | 29 | 58 | 10.3 |
| 296 | EASY CHOIRS | **regular** | THE CHOIR | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 8.8 |
| 297 | CHOIR RECALL | **regular** | THE CHOIR | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 9.8 |
| 298 | CHOIRS AND TWINS | **regular** | THE CHOIR | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.8 |
| 299 | CHOIR PEAK | **regular** | THE CHOIR | — | STANDARD | 20 | 48 | 52 | 33 | 66 | 12.2 |
| 300 | THE HIVE | boss | THE CHOIR | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 301 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 302 | BALLOONS AGAIN | **regular** | THE BALLOON | — | STANDARD | 5 | 30 | 56 | 35 | 70 | 7.8 |
| 303 | BALLOONS SPREAD | **regular** | THE BALLOON | — | STANDARD | 6 | 26 | 41 | 26 | 52 | 8.8 |
| 304 | BALLOONS FAR APART | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9.8 |
| 305 | BALLOON AND CHOIR | **regular** | THE BALLOON | — | STANDARD | 10 | 36 | 56 | 35 | 70 | 10.8 |
| 306 | EASY BALLOONS | **regular** | THE BALLOON | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 9.3 |
| 307 | BALLOON RECALL | **regular** | THE BALLOON | — | STANDARD | 10 | 38 | 54 | 34 | 68 | 10.3 |
| 308 | BALLOONS AND TWINS | **regular** | THE BALLOON | — | STANDARD | 12 | 43 | 64 | 40 | 80 | 11.3 |
| 309 | BALLOON PEAK | **regular** | THE BALLOON | — | STANDARD | 15 | 48 | 52 | 33 | 66 | 12.2 |
| 310 | THE CAIRN | boss | THE BALLOON | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 311 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 312 | BEATBOXES AGAIN | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 47 | 29 | 58 | 8.1 |
| 313 | BEATBOXES SPREAD | **regular** | THE BEATBOX | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 9.2 |
| 314 | BEATBOXES FAR APART | **regular** | THE BEATBOX | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 10.2 |
| 315 | BEATBOX AND BALLOON | **regular** | THE BEATBOX | — | STANDARD | 11 | 40 | 66 | 41 | 82 | 11.2 |
| 316 | EASY BEATBOXES | **regular** | THE BEATBOX | — | STANDARD | 6 | 34 | 47 | 29 | 58 | 9.7 |
| 317 | BEATBOX RECALL | **regular** | THE BEATBOX | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 10.7 |
| 318 | BEATBOXES AND TWINS | **regular** | THE BEATBOX | — | STANDARD | 12 | 44 | 59 | 37 | 74 | 11.7 |
| 319 | BEATBOX PEAK | **regular** | THE BEATBOX | — | STANDARD | 20 | 47 | 68 | 43 | 86 | 12.7 |
| 320 | THE WELL | boss (special) | THE BEATBOX | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 321 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 322 | WEIGHTS AGAIN | **regular** | THE WEIGHT | — | STANDARD | 5 | 26 | 30 | 19 | 38 | 8.2 |
| 323 | WEIGHTS SPREAD | **regular** | THE WEIGHT | — | STANDARD | 6 | 32 | 40 | 25 | 50 | 9.2 |
| 324 | WEIGHTS FAR APART | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.2 |
| 325 | WEIGHT AND BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 11 | 38 | 43 | 27 | 54 | 11.2 |
| 326 | EASY WEIGHTS | **regular** | THE WEIGHT | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 9.7 |
| 327 | WEIGHT RECALL | **regular** | THE WEIGHT | — | STANDARD | 9 | 39 | 41 | 26 | 52 | 10.7 |
| 328 | WEIGHTS AND TWINS | **regular** | THE WEIGHT | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.7 |
| 329 | WEIGHT PEAK | **regular** | THE WEIGHT | — | STANDARD | 17 | 48 | 52 | 33 | 66 | 12.7 |
| 330 | THE CODEX | intro | THE WEIGHT | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 331 | THE HANDOVER | intro | THE WEIGHT | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 332 | THE LEAK | intro | THE WEIGHT | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 333 | THE SPLICE | boss (special) | THE WEIGHT | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 334 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 335 | MINES AGAIN | **regular** | THE MINE | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 8.3 |
| 336 | MINES SPREAD | **regular** | THE MINE | — | STANDARD | 6 | 26 | 41 | 26 | 52 | 9.3 |
| 337 | MINES FAR APART | **regular** | THE MINE | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 10.3 |
| 338 | MINE AND WEIGHT | **regular** | THE MINE | — | STANDARD | 11 | 37 | 39 | 24 | 48 | 11.3 |
| 339 | EASY MINES | **regular** | THE MINE | — | STANDARD | 6 | 34 | 43 | 27 | 54 | 9.8 |
| 340 | MINE RECALL | **regular** | THE MINE | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 10.8 |
| 341 | MINES AND TWINS | **regular** | THE MINE | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.8 |
| 342 | MINE PEAK | **regular** | THE MINE | — | STANDARD | 18 | 48 | 52 | 33 | 66 | 12.8 |
| 343 | THE REPRISE | boss | THE MINE | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 344 | THE BLISTER | intro | THE BLISTER | blister | STANDARD | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 345 | BLISTERS AGAIN | **regular** | THE BLISTER | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 8.4 |
| 346 | BLISTERS SPREAD | **regular** | THE BLISTER | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 9.3 |
| 347 | BLISTERS FAR APART | **regular** | THE BLISTER | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.3 |
| 348 | BLISTER AND MINE | **regular** | THE BLISTER | — | STANDARD | 11 | 40 | 42 | 26 | 52 | 11.4 |
| 349 | EASY BLISTERS | **regular** | THE BLISTER | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 10 |
| 350 | BLISTER RECALL | **regular** | THE BLISTER | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 351 | BLISTERS AND TWINS | **regular** | THE BLISTER | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 12 |
| 352 | BLISTER PEAK | **regular** | THE BLISTER | — | STANDARD | 18 | 46 | 54 | 34 | 68 | 13 |
| 353 | THE FILAMENT | boss | THE BLISTER | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 354 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 355 | MOULTS AGAIN | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 8.6 |
| 356 | MOULTS SPREAD | **regular** | THE MOULT | — | STANDARD | 6 | 32 | 47 | 29 | 58 | 9.6 |
| 357 | MOULTS FAR APART | **regular** | THE MOULT | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 10.5 |
| 358 | MOULT AND BLISTER | **regular** | THE MOULT | — | STANDARD | 10 | 36 | 77 | 48 | 96 | 11.5 |
| 359 | EASY MOULTS | **regular** | THE MOULT | — | STANDARD | 6 | 35 | 77 | 48 | 96 | 10 |
| 360 | MOULT RECALL | **regular** | THE MOULT | — | STANDARD | 10 | 36 | 97 | 61 | 122 | 11.1 |
| 361 | MOULTS AND TWINS | **regular** | THE MOULT | — | STANDARD | 12 | 45 | 97 | 61 | 122 | 12.1 |
| 362 | MOULT PEAK | **regular** | THE MOULT | — | STANDARD | 18 | 48 | 97 | 61 | 122 | 13.1 |
| 363 | THE FLIP | intro | THE MOULT | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 364 | THE DARK | intro | THE MOULT | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 365 | THE GIMBAL | boss | THE MOULT | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 366 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 367 | HUSKS AGAIN | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 87 | 54 | 108 | 8.7 |
| 368 | HUSKS SPREAD | **regular** | THE HUSK | — | STANDARD | 4 | 30 | 97 | 61 | 122 | 9.6 |
| 369 | HUSKS FAR APART | **regular** | THE HUSK | — | STANDARD | 4 | 26 | 57 | 36 | 72 | 10.5 |
| 370 | HUSK AND MOULT | **regular** | THE HUSK | — | STANDARD | 8 | 38 | 87 | 54 | 108 | 11.5 |
| 371 | EASY HUSKS | **regular** | THE HUSK | — | STANDARD | 6 | 40 | 47 | 29 | 58 | 10 |
| 372 | HUSK RECALL | **regular** | THE HUSK | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 11 |
| 373 | HUSKS AND TWINS | **regular** | THE HUSK | — | STANDARD | 9 | 45 | 87 | 54 | 108 | 12 |
| 374 | FIVE BLISTERS | **regular** | THE HUSK | — | STANDARD | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 375 | THE SPOOL | boss | THE HUSK | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 376 | LURES RETURN | **regular** | LURES RETURN | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.8 |
| 377 | LURES WIDER | **regular** | LURES RETURN | — | STANDARD | 4 | 29 | 33 | 21 | 42 | 6.8 |
| 378 | LURES OUT WIDE | **regular** | LURES RETURN | — | STANDARD | 4 | 28 | 42 | 26 | 52 | 7.8 |
| 379 | LURES IN PAIRS | **regular** | LURES RETURN | — | STANDARD | 9 | 40 | 54 | 34 | 68 | 8.8 |
| 380 | LURES AT REST | **regular** | LURES RETURN | — | STANDARD | 5 | 36 | 50 | 31 | 62 | 7.3 |
| 381 | LURES RECALLED | **regular** | LURES RETURN | — | STANDARD | 9 | 39 | 53 | 33 | 66 | 8.3 |
| 382 | LURES DOUBLED | **regular** | LURES RETURN | — | STANDARD | 10 | 41 | 49 | 31 | 62 | 9.3 |
| 383 | LURES SUMMIT | **regular** | LURES RETURN | — | STANDARD | 15 | 46 | 54 | 34 | 68 | 10.3 |
| 384 | THE HASP | boss | LURES RETURN | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 385 | THROBS RETURN | **regular** | THROBS RETURN | — | STANDARD | 4 | 29 | 43 | 27 | 54 | 7.5 |
| 386 | THROBS WIDER | **regular** | THROBS RETURN | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 8.5 |
| 387 | THROBS OUT WIDE | **regular** | THROBS RETURN | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 9.5 |
| 388 | THROBS IN PAIRS | **regular** | THROBS RETURN | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 10.5 |
| 389 | THROBS AT REST | **regular** | THROBS RETURN | — | STANDARD | 6 | 34 | 36 | 23 | 46 | 9 |
| 390 | THROBS RECALLED | **regular** | THROBS RETURN | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 10 |
| 391 | THROBS DOUBLED | **regular** | THROBS RETURN | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 10.9 |
| 392 | THROBS SUMMIT | **regular** | THROBS RETURN | — | STANDARD | 15 | 43 | 57 | 36 | 72 | 11.8 |
| 393 | THE RATCHET | boss | THROBS RETURN | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 394 | COUNTS RETURN | **regular** | COUNTS RETURN | — | STANDARD | 5 | 29 | 33 | 21 | 42 | 7.6 |
| 395 | COUNTS WIDER | **regular** | COUNTS RETURN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 8.6 |
| 396 | COUNTS OUT WIDE | **regular** | COUNTS RETURN | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 9.6 |
| 397 | COUNTS IN PAIRS | **regular** | COUNTS RETURN | — | STANDARD | 9 | 39 | 43 | 27 | 54 | 10.6 |
| 398 | COUNTS AT REST | **regular** | COUNTS RETURN | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 9.1 |
| 399 | COUNTS RECALLED | **regular** | COUNTS RETURN | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 10.1 |
| 400 | COUNTS DOUBLED | **regular** | COUNTS RETURN | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 11.1 |
| 401 | COUNTS SUMMIT | **regular** | COUNTS RETURN | — | STANDARD | 15 | 44 | 48 | 30 | 60 | 12.1 |
| 402 | THE NETTLE | boss | COUNTS RETURN | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 403 | SHELLS RETURN | **regular** | SHELLS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.7 |
| 404 | SHELLS WIDER | **regular** | SHELLS RETURN | — | STANDARD | 4 | 24 | 28 | 18 | 36 | 8.7 |
| 405 | SHELLS OUT WIDE | **regular** | SHELLS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9.6 |
| 406 | SHELLS IN PAIRS | **regular** | SHELLS RETURN | — | STANDARD | 11 | 40 | 44 | 28 | 56 | 10.6 |
| 407 | SHELLS AT REST | **regular** | SHELLS RETURN | — | STANDARD | 7 | 40 | 48 | 30 | 60 | 9.1 |
| 408 | SHELLS RECALLED | **regular** | SHELLS RETURN | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 10.1 |
| 409 | SHELLS DOUBLED | **regular** | SHELLS RETURN | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.1 |
| 410 | SHELLS SUMMIT | **regular** | SHELLS RETURN | — | STANDARD | 17 | 48 | 52 | 33 | 66 | 12.1 |
| 411 | THE MANTLE | boss | SHELLS RETURN | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 412 | CLASPS RETURN | **regular** | CLASPS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 7.8 |
| 413 | CLASPS WIDER | **regular** | CLASPS RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 8.8 |
| 414 | CLASPS OUT WIDE | **regular** | CLASPS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.8 |
| 415 | CLASPS IN PAIRS | **regular** | CLASPS RETURN | — | STANDARD | 11 | 37 | 40 | 25 | 50 | 10.8 |
| 416 | CLASPS AT REST | **regular** | CLASPS RETURN | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.3 |
| 417 | CLASPS RECALLED | **regular** | CLASPS RETURN | — | STANDARD | 9 | 37 | 40 | 25 | 50 | 10.3 |
| 418 | CLASPS DOUBLED | **regular** | CLASPS RETURN | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.3 |
| 419 | CLASPS SUMMIT | **regular** | CLASPS RETURN | — | STANDARD | 15 | 44 | 48 | 30 | 60 | 12.3 |
| 420 | THE KEEL | boss | CLASPS RETURN | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 421 | DARTS RETURN | **regular** | DARTS RETURN | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 7.9 |
| 422 | DARTS WIDER | **regular** | DARTS RETURN | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 9 |
| 423 | DARTS OUT WIDE | **regular** | DARTS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10 |
| 424 | DARTS IN PAIRS | **regular** | DARTS RETURN | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 11 |
| 425 | DARTS AT REST | **regular** | DARTS RETURN | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 9.6 |
| 426 | DARTS RECALLED | **regular** | DARTS RETURN | — | STANDARD | 9 | 36 | 39 | 24 | 48 | 10.6 |
| 427 | DARTS DOUBLED | **regular** | DARTS RETURN | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 11.6 |
| 428 | DARTS SUMMIT | **regular** | DARTS RETURN | — | STANDARD | 17 | 48 | 52 | 33 | 66 | 12.6 |
| 429 | THE VALVE | boss | DARTS RETURN | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 430 | VEILS RETURN | **regular** | VEILS RETURN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8 |
| 431 | VEILS WIDER | **regular** | VEILS RETURN | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 9 |
| 432 | VEILS OUT WIDE | **regular** | VEILS RETURN | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 9.9 |
| 433 | VEILS IN PAIRS | **regular** | VEILS RETURN | — | STANDARD | 11 | 37 | 40 | 25 | 50 | 10.9 |
| 434 | VEILS AT REST | **regular** | VEILS RETURN | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 9.4 |
| 435 | VEILS RECALLED | **regular** | VEILS RETURN | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 10.4 |
| 436 | VEILS DOUBLED | **regular** | VEILS RETURN | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.4 |
| 437 | VEILS SUMMIT | **regular** | VEILS RETURN | — | STANDARD | 17 | 46 | 49 | 31 | 62 | 12.3 |
| 438 | THE SEAM | boss | VEILS RETURN | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 439 | HEAVY ROCKS RETURN | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 440 | HEAVY ROCKS WIDER | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 9.1 |
| 441 | HEAVY ROCKS OUT WIDE | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.1 |
| 442 | HEAVY ROCKS IN PAIRS | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 13 | 39 | 42 | 26 | 52 | 11.1 |
| 443 | HEAVY ROCKS AT REST | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 10 |
| 444 | HEAVY ROCKS RECALLED | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 10 | 35 | 38 | 24 | 48 | 11.8 |
| 445 | HEAVY ROCKS DOUBLED | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 18 | 47 | 51 | 32 | 64 | 13.8 |
| 446 | HEAVY ROCKS SUMMIT | **regular** | HEAVY ROCKS RETURN | — | STANDARD | 20 | 48 | 53 | 33 | 66 | 15.3 |
| 447 | THE OCULUS | boss | HEAVY ROCKS RETURN | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 448 | WISPS RETURN | **regular** | WISPS RETURN | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 8.2 |
| 449 | WISPS WIDER | **regular** | WISPS RETURN | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 9.2 |
| 450 | WISPS OUT WIDE | **regular** | WISPS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.2 |
| 451 | WISPS IN PAIRS | **regular** | WISPS RETURN | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 11.2 |
| 452 | WISPS AT REST | **regular** | WISPS RETURN | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 9.8 |
| 453 | WISPS RECALLED | **regular** | WISPS RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11.8 |
| 454 | WISPS DOUBLED | **regular** | WISPS RETURN | — | STANDARD | 15 | 45 | 48 | 30 | 60 | 13.8 |
| 455 | WISPS SUMMIT | **regular** | WISPS RETURN | — | STANDARD | 21 | 46 | 52 | 33 | 66 | 15.8 |
| 456 | THE VISE | boss | WISPS RETURN | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 457 | GHOSTS RETURN | **regular** | GHOSTS RETURN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 8.4 |
| 458 | GHOSTS WIDER | **regular** | GHOSTS RETURN | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 9.5 |
| 459 | GHOSTS OUT WIDE | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 10.5 |
| 460 | GHOSTS IN PAIRS | **regular** | GHOSTS RETURN | — | STANDARD | 12 | 36 | 40 | 25 | 50 | 11.5 |
| 461 | GHOSTS AT REST | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 10 |
| 462 | GHOSTS RECALLED | **regular** | GHOSTS RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 463 | GHOSTS DOUBLED | **regular** | GHOSTS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 464 | GHOSTS SUMMIT | **regular** | GHOSTS RETURN | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 465 | THE PLUMB | boss | GHOSTS RETURN | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 466 | ECHOES RETURN | **regular** | ECHOES RETURN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 8.6 |
| 467 | ECHOES WIDER | **regular** | ECHOES RETURN | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 9.6 |
| 468 | ECHOES OUT WIDE | **regular** | ECHOES RETURN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 10.5 |
| 469 | ECHOES IN PAIRS | **regular** | ECHOES RETURN | — | STANDARD | 12 | 39 | 42 | 26 | 52 | 11.5 |
| 470 | ECHOES AT REST | **regular** | ECHOES RETURN | — | STANDARD | 7 | 40 | 48 | 30 | 60 | 10 |
| 471 | ECHOES RECALLED | **regular** | ECHOES RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11 |
| 472 | ECHOES DOUBLED | **regular** | ECHOES RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 473 | ECHOES SUMMIT | **regular** | ECHOES RETURN | — | STANDARD | 16 | 44 | 48 | 30 | 60 | 13 |
| 474 | THE SLING | boss | ECHOES RETURN | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 475 | RINDS RETURN | **regular** | RINDS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 8.7 |
| 476 | RINDS WIDER | **regular** | RINDS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.6 |
| 477 | RINDS OUT WIDE | **regular** | RINDS RETURN | — | STANDARD | 6 | 26 | 34 | 21 | 42 | 10.6 |
| 478 | RINDS IN PAIRS | **regular** | RINDS RETURN | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.6 |
| 479 | RINDS AT REST | **regular** | RINDS RETURN | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 480 | RINDS RECALLED | **regular** | RINDS RETURN | — | STANDARD | 10 | 36 | 45 | 28 | 56 | 10.9 |
| 481 | RINDS DOUBLED | **regular** | RINDS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 11.9 |
| 482 | RINDS SUMMIT | **regular** | RINDS RETURN | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 12.9 |
| 483 | THE CAPSTAN | boss | RINDS RETURN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 484 | GYRES RETURN | **regular** | GYRES RETURN | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 8.7 |
| 485 | GYRES WIDER | **regular** | GYRES RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 9.6 |
| 486 | GYRES OUT WIDE | **regular** | GYRES RETURN | — | STANDARD | 6 | 29 | 32 | 20 | 40 | 10.5 |
| 487 | GYRES IN PAIRS | **regular** | GYRES RETURN | — | STANDARD | 9 | 38 | 44 | 28 | 56 | 11.5 |
| 488 | GYRES AT REST | **regular** | GYRES RETURN | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 489 | GYRES RECALLED | **regular** | GYRES RETURN | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 11 |
| 490 | GYRES DOUBLED | **regular** | GYRES RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 491 | GYRES SUMMIT | **regular** | GYRES RETURN | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 13 |
| 492 | THE GALL | boss | GYRES RETURN | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 493 | LIDS RETURN | **regular** | LIDS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 8.7 |
| 494 | LIDS WIDER | **regular** | LIDS RETURN | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 9.6 |
| 495 | LIDS OUT WIDE | **regular** | LIDS RETURN | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 496 | LIDS IN PAIRS | **regular** | LIDS RETURN | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 11.5 |
| 497 | LIDS AT REST | **regular** | LIDS RETURN | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 498 | LIDS RECALLED | **regular** | LIDS RETURN | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 11 |
| 499 | LIDS DOUBLED | **regular** | LIDS RETURN | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 500 | LIDS SUMMIT | **regular** | LIDS RETURN | — | STANDARD | 19 | 48 | 51 | 32 | 64 | 13 |
| 501 | THE TRAPEZE | boss | LIDS RETURN | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 502 | RECOILS RETURN | **regular** | RECOILS RETURN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 8.7 |
| 503 | RECOILS WIDER | **regular** | RECOILS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.6 |
| 504 | RECOILS OUT WIDE | **regular** | RECOILS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.5 |
| 505 | RECOILS IN PAIRS | **regular** | RECOILS RETURN | — | STANDARD | 11 | 38 | 42 | 26 | 52 | 11.5 |
| 506 | RECOILS AT REST | **regular** | RECOILS RETURN | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 10 |
| 507 | RECOILS RECALLED | **regular** | RECOILS RETURN | — | STANDARD | 10 | 38 | 44 | 28 | 56 | 11 |
| 508 | RECOILS DOUBLED | **regular** | RECOILS RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 509 | RECOILS SUMMIT | **regular** | RECOILS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 510 | THE FLUE | boss | RECOILS RETURN | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 511 | CAROMS RETURN | **regular** | CAROMS RETURN | — | STANDARD | 5 | 29 | 40 | 25 | 50 | 8.7 |
| 512 | CAROMS WIDER | **regular** | CAROMS RETURN | — | STANDARD | 5 | 27 | 38 | 24 | 48 | 9.6 |
| 513 | CAROMS OUT WIDE | **regular** | CAROMS RETURN | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 10.6 |
| 514 | CAROMS IN PAIRS | **regular** | CAROMS RETURN | — | STANDARD | 12 | 37 | 46 | 29 | 58 | 11.6 |
| 515 | CAROMS AT REST | **regular** | CAROMS RETURN | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 516 | CAROMS RECALLED | **regular** | CAROMS RETURN | — | STANDARD | 10 | 39 | 54 | 34 | 68 | 11 |
| 517 | CAROMS DOUBLED | **regular** | CAROMS RETURN | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 518 | CAROMS SUMMIT | **regular** | CAROMS RETURN | — | STANDARD | 16 | 43 | 49 | 31 | 62 | 13 |
| 519 | THE GOVERNOR | boss | CAROMS RETURN | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 520 | CRYSTALS RETURN | **regular** | CRYSTALS RETURN | — | STANDARD | 4 | 28 | 43 | 27 | 54 | 8.7 |
| 521 | CRYSTALS WIDER | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 9.6 |
| 522 | CRYSTALS OUT WIDE | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 10.5 |
| 523 | CRYSTALS IN PAIRS | **regular** | CRYSTALS RETURN | — | STANDARD | 10 | 36 | 51 | 32 | 64 | 11.5 |
| 524 | CRYSTALS AT REST | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 10 |
| 525 | CRYSTALS RECALLED | **regular** | CRYSTALS RETURN | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 11 |
| 526 | CRYSTALS DOUBLED | **regular** | CRYSTALS RETURN | — | STANDARD | 14 | 47 | 57 | 36 | 72 | 12 |
| 527 | CRYSTALS SUMMIT | **regular** | CRYSTALS RETURN | — | STANDARD | 17 | 47 | 63 | 39 | 78 | 13 |
| 528 | THE LAMPREY | boss | CRYSTALS RETURN | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 529 | VOLLEYS RETURN | **regular** | VOLLEYS RETURN | — | STANDARD | 5 | 29 | 52 | 33 | 66 | 8.7 |
| 530 | VOLLEYS WIDER | **regular** | VOLLEYS RETURN | — | STANDARD | 5 | 26 | 50 | 31 | 62 | 9.6 |
| 531 | VOLLEYS OUT WIDE | **regular** | VOLLEYS RETURN | — | STANDARD | 6 | 27 | 46 | 29 | 58 | 10.5 |
| 532 | VOLLEYS IN PAIRS | **regular** | VOLLEYS RETURN | — | STANDARD | 9 | 38 | 43 | 27 | 54 | 11.5 |
| 533 | VOLLEYS AT REST | **regular** | VOLLEYS RETURN | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 534 | VOLLEYS RECALLED | **regular** | VOLLEYS RETURN | — | STANDARD | 10 | 40 | 70 | 44 | 88 | 11 |
| 535 | VOLLEYS DOUBLED | **regular** | VOLLEYS RETURN | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 536 | VOLLEYS SUMMIT | **regular** | VOLLEYS RETURN | — | STANDARD | 19 | 45 | 66 | 41 | 82 | 13 |
| 537 | THE MIMIC | boss | VOLLEYS RETURN | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 538 | VEERS RETURN | **regular** | VEERS RETURN | — | STANDARD | 5 | 29 | 59 | 37 | 74 | 8.7 |
| 539 | VEERS WIDER | **regular** | VEERS RETURN | — | STANDARD | 6 | 31 | 54 | 34 | 68 | 9.6 |
| 540 | VEERS OUT WIDE | **regular** | VEERS RETURN | — | STANDARD | 6 | 29 | 53 | 33 | 66 | 10.5 |
| 541 | VEERS IN PAIRS | **regular** | VEERS RETURN | — | STANDARD | 12 | 40 | 65 | 41 | 82 | 11.5 |
| 542 | VEERS AT REST | **regular** | VEERS RETURN | — | STANDARD | 6 | 35 | 51 | 32 | 64 | 10 |
| 543 | VEERS RECALLED | **regular** | VEERS RETURN | — | STANDARD | 10 | 40 | 54 | 34 | 68 | 11 |
| 544 | VEERS DOUBLED | **regular** | VEERS RETURN | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12 |
| 545 | VEERS SUMMIT | **regular** | VEERS RETURN | — | STANDARD | 19 | 48 | 70 | 44 | 88 | 13 |
| 546 | THE LATCH | boss | VEERS RETURN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 547 | STRANDS RETURN | **regular** | STRANDS RETURN | — | STANDARD | 5 | 30 | 44 | 28 | 56 | 8.7 |
| 548 | STRANDS WIDER | **regular** | STRANDS RETURN | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 9.6 |
| 549 | STRANDS OUT WIDE | **regular** | STRANDS RETURN | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 10.5 |
| 550 | STRANDS IN PAIRS | **regular** | STRANDS RETURN | — | STANDARD | 13 | 40 | 45 | 28 | 56 | 11.5 |
| 551 | STRANDS AT REST | **regular** | STRANDS RETURN | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 552 | STRANDS RECALLED | **regular** | STRANDS RETURN | — | STANDARD | 10 | 37 | 42 | 26 | 52 | 11 |
| 553 | STRANDS DOUBLED | **regular** | STRANDS RETURN | — | STANDARD | 14 | 47 | 56 | 35 | 70 | 12 |
| 554 | STRANDS SUMMIT | **regular** | STRANDS RETURN | — | STANDARD | 19 | 45 | 53 | 33 | 66 | 13 |
| 555 | THE CHRYSALIS | boss | STRANDS RETURN | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 556 | CRAWLERS RETURN | **regular** | CRAWLERS RETURN | — | STANDARD | 5 | 28 | 39 | 24 | 48 | 8.7 |
| 557 | CRAWLERS WIDER | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 9.6 |
| 558 | CRAWLERS OUT WIDE | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 29 | 59 | 37 | 74 | 10.5 |
| 559 | CRAWLERS IN PAIRS | **regular** | CRAWLERS RETURN | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 11.5 |
| 560 | CRAWLERS AT REST | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 10 |
| 561 | CRAWLERS RECALLED | **regular** | CRAWLERS RETURN | — | STANDARD | 10 | 37 | 50 | 31 | 62 | 10.9 |
| 562 | CRAWLERS DOUBLED | **regular** | CRAWLERS RETURN | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 11.9 |
| 563 | CRAWLERS SUMMIT | **regular** | CRAWLERS RETURN | — | STANDARD | 16 | 44 | 62 | 39 | 78 | 12.9 |
| 564 | THE HYDRA | boss | CRAWLERS RETURN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

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
| 103 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 113 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 123 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 133 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 143 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 153 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 163 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 173 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 183 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 193 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 203 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 213 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 223 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 233 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 243 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 255 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 266 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 280 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 290 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 300 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 310 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 320 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 333 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 343 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 353 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 365 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 375 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 384 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 393 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 402 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 411 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 420 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 429 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 438 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 447 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 456 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 465 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 474 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 483 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 492 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 501 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 510 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 519 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 528 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 537 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 546 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 555 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 564 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
