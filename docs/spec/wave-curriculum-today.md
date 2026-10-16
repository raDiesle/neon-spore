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
| regular | 452 | 0 | 4 | 26 | 73 | 3 h 32 min | 7 h 4 min |
| intro | 56 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 56 | 0 | 9 | 28 | 343 | 46 min | 1 h 33 min |
| every wave | 564 | 0 | 3 | 26 | 343 | 4 h 39 min | 9 h 18 min |

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
| 32 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 33 | THE PURGE | intro | THE LANCE | — | STANDARD | 3 | 3 | 8 | 5 | 10 | 8.6 |
| 34 | LANCE AGAIN | **regular** | THE LANCE | — | STANDARD | 3 | 30 | 44 | 28 | 56 | 2.2 |
| 35 | LANCE WIDE | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 2.6 |
| 36 | LANCE AT THE EDGE | **regular** | THE LANCE | — | STANDARD | 4 | 27 | 41 | 26 | 52 | 3.2 |
| 37 | LANCE IN PAIRS | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 4 |
| 38 | LANCE AT EASE | **regular** | THE LANCE | — | STANDARD | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 39 | LANCE RECALLED | **regular** | THE LANCE | — | STANDARD | 4 | 33 | 36 | 23 | 46 | 3.4 |
| 40 | LANCE TWICE | **regular** | THE LANCE | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 41 | LANCE PEAK | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 42 | 26 | 52 | 5.5 |
| 42 | BULB QUEEN | boss | THE LANCE | queen | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 43 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 44 | CROSSINGS AGAIN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 2.4 |
| 45 | CROSSINGS SPREAD | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 3.4 |
| 46 | CROSSINGS FAR APART | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 4.4 |
| 47 | CROSSING AND SHIELD | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 5.4 |
| 48 | EASY CROSSINGS | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 4.6 |
| 49 | CROSSING RECALL | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 5.6 |
| 50 | CROSSINGS AND TWINS | **regular** | THE CROSSING | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 6.9 |
| 51 | CROSSING PEAK | **regular** | THE CROSSING | — | STANDARD | 13 | 44 | 47 | 29 | 58 | 7.9 |
| 52 | THE MIRROR | boss (special) | THE CROSSING | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 53 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 54 | BEATBOXES AGAIN | **regular** | THE BEATBOX | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 3.6 |
| 55 | BEATBOXES SPREAD | **regular** | THE BEATBOX | — | STANDARD | 6 | 30 | 36 | 23 | 46 | 4.5 |
| 56 | BEATBOXES FAR APART | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 5.4 |
| 57 | BEATBOX AND CROSSING | **regular** | THE BEATBOX | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 6.4 |
| 58 | EASY BEATBOXES | **regular** | THE BEATBOX | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 4.8 |
| 59 | BEATBOX RECALL | **regular** | THE BEATBOX | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 6.5 |
| 60 | BEATBOXES AND TWINS | **regular** | THE BEATBOX | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 7.6 |
| 61 | BEATBOX PEAK | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 8.6 |
| 62 | THE MAZE | boss (special) | THE BEATBOX | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 63 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 64 | WEIGHTS AGAIN | **regular** | THE WEIGHT | — | STANDARD | 5 | 30 | 32 | 20 | 40 | 3.9 |
| 65 | WEIGHTS SPREAD | **regular** | THE WEIGHT | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 5.1 |
| 66 | WEIGHTS FAR APART | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 6.3 |
| 67 | WEIGHT AND BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 41 | 26 | 52 | 7.4 |
| 68 | EASY WEIGHTS | **regular** | THE WEIGHT | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 5.9 |
| 69 | WEIGHT RECALL | **regular** | THE WEIGHT | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7 |
| 70 | WEIGHTS AND TWINS | **regular** | THE WEIGHT | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.2 |
| 71 | WEIGHT PEAK | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 9.2 |
| 72 | THE GAUGE | boss (special) | THE WEIGHT | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 73 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 74 | LIMPET AGAIN | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 6.8 |
| 75 | LIMPET WIDE | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 8 |
| 76 | LIMPET AT THE EDGE | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9.8 |
| 77 | LIMPET IN PAIRS | **regular** | THE LIMPET | — | STANDARD | 8 | 34 | 45 | 28 | 56 | 11.1 |
| 78 | LIMPET AT EASE | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 10 |
| 79 | LIMPET RECALLED | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 11 |
| 80 | LIMPET TWICE | **regular** | THE LIMPET | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 12.1 |
| 81 | LIMPET PEAK | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 54 | 34 | 68 | 13.1 |
| 82 | THE WARDEN | boss | THE LIMPET | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 83 | THE BLISTER | intro | THE BLISTER | blister | STANDARD | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 84 | FIVE BLISTERS | **regular** | THE BLISTER | — | STANDARD | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 85 | BLISTERS TO TAP | **regular** | THE BLISTER | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.5 |
| 86 | BLISTERS TO HOLD | **regular** | THE BLISTER | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.8 |
| 87 | BLISTERS TO SWIPE | **regular** | THE BLISTER | — | STANDARD | 9 | 39 | 42 | 26 | 52 | 7.8 |
| 88 | BLISTERS TO TURN | **regular** | THE BLISTER | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.4 |
| 89 | BLISTERS TO RUB | **regular** | THE BLISTER | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 90 | BLISTERS TO COMBO | **regular** | THE BLISTER | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.6 |
| 91 | BLISTERS TO LEVER | **regular** | THE BLISTER | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 92 | THE FLEET | boss (special) | THE BLISTER | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 93 | THE WARD | intro | THE WARD | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 94 | HEAVY ROCKS AGAIN | **regular** | THE WARD | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.2 |
| 95 | HEAVY ROCKS SPREAD | **regular** | THE WARD | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 5.2 |
| 96 | HEAVY ROCKS APART | **regular** | THE WARD | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 6.2 |
| 97 | HEAVY ROCK IN PAIRS | **regular** | THE WARD | — | STANDARD | 7 | 34 | 42 | 26 | 52 | 7.2 |
| 98 | EASY HEAVY ROCKS | **regular** | THE WARD | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 5.7 |
| 99 | HEAVY ROCK RECALL | **regular** | THE WARD | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 6.7 |
| 100 | HEAVY ROCKS, TWINS | **regular** | THE WARD | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.2 |
| 101 | HEAVY ROCK PEAK | **regular** | THE WARD | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.2 |
| 102 | THE VANE | boss | THE WARD | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 103 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 104 | LEECH AGAIN | **regular** | THE LEECH | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 5.6 |
| 105 | LEECH WIDE | **regular** | THE LEECH | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 6.7 |
| 106 | LEECH AT THE EDGE | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.5 |
| 107 | LEECH IN PAIRS | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 50 | 31 | 62 | 10.1 |
| 108 | LEECH AT EASE | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 8.6 |
| 109 | LEECH RECALLED | **regular** | THE LEECH | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 10.3 |
| 110 | LEECH TWICE | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 111 | LEECH PEAK | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12.9 |
| 112 | SNAKE | boss (special) | THE LEECH | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 113 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 114 | THROBS AGAIN | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 4.5 |
| 115 | THROBS SPREAD | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6 |
| 116 | THROBS FAR APART | **regular** | THE THROB | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.2 |
| 117 | THROB AND HEAVY ROCK | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.2 |
| 118 | EASY THROBS | **regular** | THE THROB | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.7 |
| 119 | THROB RECALL | **regular** | THE THROB | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.7 |
| 120 | THROBS AND TWINS | **regular** | THE THROB | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 8.7 |
| 121 | THROB PEAK | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.7 |
| 122 | PINBALL | boss (special) | THE THROB | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 123 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 124 | COUNTS AGAIN | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 4.8 |
| 125 | COUNTS SPREAD | **regular** | THE COUNT | — | STANDARD | 6 | 31 | 37 | 23 | 46 | 6 |
| 126 | COUNTS FAR APART | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 127 | COUNT AND THROB | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.1 |
| 128 | EASY COUNTS | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 6.6 |
| 129 | COUNT RECALL | **regular** | THE COUNT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.6 |
| 130 | COUNTS AND TWINS | **regular** | THE COUNT | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 8.6 |
| 131 | COUNT PEAK | **regular** | THE COUNT | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 9.6 |
| 132 | THE SCOUT | boss (special) | THE COUNT | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 133 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 134 | SHELLS AGAIN | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 5.1 |
| 135 | SHELLS SPREAD | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 136 | SHELLS FAR APART | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 137 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.2 |
| 138 | EASY SHELLS | **regular** | THE SHELL | — | STANDARD | 6 | 39 | 43 | 27 | 54 | 6.4 |
| 139 | SHELL RECALL | **regular** | THE SHELL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.4 |
| 140 | SHELLS AND TWINS | **regular** | THE SHELL | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.4 |
| 141 | SHELL PEAK | **regular** | THE SHELL | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 9.4 |
| 142 | THE HAUL | boss (special) | THE SHELL | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 143 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 144 | HUSKS AGAIN | **regular** | THE HUSK | — | STANDARD | 3 | 30 | 33 | 21 | 42 | 3.2 |
| 145 | HUSKS SPREAD | **regular** | THE HUSK | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 3.8 |
| 146 | HUSKS FAR APART | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 31 | 19 | 38 | 4.5 |
| 147 | HUSK AND SHELL | **regular** | THE HUSK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 6.3 |
| 148 | EASY HUSKS | **regular** | THE HUSK | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 5.6 |
| 149 | HUSK RECALL | **regular** | THE HUSK | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 6.9 |
| 150 | HUSKS AND TWINS | **regular** | THE HUSK | — | STANDARD | 9 | 48 | 52 | 33 | 66 | 8.2 |
| 151 | HUSK PEAK | **regular** | THE HUSK | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.2 |
| 152 | THE STARE | boss | THE HUSK | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 153 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 154 | CHOKE AGAIN | **regular** | THE CHOKE | — | STANDARD | 3 | 28 | 42 | 26 | 52 | 3.4 |
| 155 | CHOKE WIDE | **regular** | THE CHOKE | — | STANDARD | 3 | 29 | 32 | 20 | 40 | 4.6 |
| 156 | CHOKE AT THE EDGE | **regular** | THE CHOKE | — | STANDARD | 4 | 27 | 30 | 19 | 38 | 5.8 |
| 157 | CHOKE IN PAIRS | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 6.8 |
| 158 | CHOKE AT EASE | **regular** | THE CHOKE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.7 |
| 159 | CHOKE RECALLED | **regular** | THE CHOKE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7 |
| 160 | CHOKE TWICE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.1 |
| 161 | CHOKE PEAK | **regular** | THE CHOKE | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.1 |
| 162 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 163 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 164 | RINDS AGAIN | **regular** | THE RIND | — | STANDARD | 5 | 32 | 36 | 23 | 46 | 3 |
| 165 | RINDS SPREAD | **regular** | THE RIND | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 3.9 |
| 166 | RINDS FAR APART | **regular** | THE RIND | — | STANDARD | 3 | 24 | 28 | 18 | 36 | 4.5 |
| 167 | RIND AND HUSK | **regular** | THE RIND | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 5.9 |
| 168 | EASY RINDS | **regular** | THE RIND | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.8 |
| 169 | RIND RECALL | **regular** | THE RIND | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 6.1 |
| 170 | RINDS AND TWINS | **regular** | THE RIND | — | STANDARD | 9 | 46 | 50 | 31 | 62 | 7.4 |
| 171 | RIND PEAK | **regular** | THE RIND | — | STANDARD | 13 | 44 | 48 | 30 | 60 | 8.3 |
| 172 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 173 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 174 | VEERS AGAIN | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 5.4 |
| 175 | VEERS SPREAD | **regular** | THE VEER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 6.9 |
| 176 | VEERS FAR APART | **regular** | THE VEER | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 177 | VEER AND RIND | **regular** | THE VEER | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.4 |
| 178 | EASY VEERS | **regular** | THE VEER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 7.9 |
| 179 | VEER RECALL | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8.9 |
| 180 | VEERS AND TWINS | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 181 | VEER PEAK | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 182 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 183 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 184 | STRANDS AGAIN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 5.7 |
| 185 | STRANDS SPREAD | **regular** | THE STRAND | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 7.5 |
| 186 | STRANDS FAR APART | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.7 |
| 187 | STRAND AND VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 188 | EASY STRANDS | **regular** | THE STRAND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.8 |
| 189 | STRAND RECALL | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 8.8 |
| 190 | STRANDS AND TWINS | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 60 | 38 | 76 | 9.8 |
| 191 | STRAND PEAK | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.8 |
| 192 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 193 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 6 | 52 | 57 | 36 | 72 | 4.9 |
| 194 | CLAW AGAIN | **regular** | THE CLAW | — | THE CLAW | 4 | 26 | 42 | 26 | 52 | 1 |
| 195 | CLAW WIDE | **regular** | THE CLAW | — | THE CLAW | 3 | 19 | 32 | 20 | 40 | 2 |
| 196 | CLAW AT THE EDGE | **regular** | THE CLAW | — | THE CLAW | 3 | 17 | 23 | 14 | 28 | 3 |
| 197 | CLAW IN PAIRS | **regular** | THE CLAW | — | THE CLAW | 6 | 20 | 34 | 21 | 42 | 4 |
| 198 | CLAW AT EASE | **regular** | THE CLAW | — | THE CLAW | 4 | 21 | 25 | 16 | 32 | 2.5 |
| 199 | CLAW RECALLED | **regular** | THE CLAW | — | THE CLAW | 7 | 31 | 35 | 22 | 44 | 3.5 |
| 200 | CLAW TWICE | **regular** | THE CLAW | — | THE CLAW | 5 | 27 | 35 | 22 | 44 | 4.4 |
| 201 | CLAW PEAK | **regular** | THE CLAW | — | THE CLAW | 10 | 43 | 51 | 32 | 64 | 5.4 |
| 202 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 203 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 204 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 205 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 206 | FENCES AGAIN | **regular** | THE FENCE | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 6 |
| 207 | FENCES SPREAD | **regular** | THE FENCE | — | STANDARD | 6 | 28 | 33 | 21 | 42 | 7.1 |
| 208 | FENCES FAR APART | **regular** | THE FENCE | — | STANDARD | 4 | 24 | 29 | 18 | 36 | 8.1 |
| 209 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.1 |
| 210 | EASY FENCES | **regular** | THE FENCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 7.6 |
| 211 | FENCE RECALL | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 47 | 29 | 58 | 8.6 |
| 212 | FENCES AND TWINS | **regular** | THE FENCE | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 9.6 |
| 213 | FENCE PEAK | **regular** | THE FENCE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 10.6 |
| 214 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 215 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 216 | MAGNETS AGAIN | **regular** | THE MAGNET | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 6.3 |
| 217 | MAGNETS SPREAD | **regular** | THE MAGNET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.3 |
| 218 | MAGNETS FAR APART | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.4 |
| 219 | MAGNET AND FENCE | **regular** | THE MAGNET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 9.4 |
| 220 | EASY MAGNETS | **regular** | THE MAGNET | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 7.9 |
| 221 | MAGNET RECALL | **regular** | THE MAGNET | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.9 |
| 222 | MAGNETS AND TWINS | **regular** | THE MAGNET | — | STANDARD | 12 | 48 | 57 | 36 | 72 | 9.9 |
| 223 | MAGNET PEAK | **regular** | THE MAGNET | — | STANDARD | 16 | 48 | 57 | 36 | 72 | 10.9 |
| 224 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 225 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 226 | CHOIRS AGAIN | **regular** | THE CHOIR | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 227 | CHOIRS SPREAD | **regular** | THE CHOIR | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.6 |
| 228 | CHOIRS FAR APART | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.6 |
| 229 | CHOIR AND MAGNET | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 230 | EASY CHOIRS | **regular** | THE CHOIR | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 8.1 |
| 231 | CHOIR RECALL | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.1 |
| 232 | CHOIRS AND TWINS | **regular** | THE CHOIR | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 10.1 |
| 233 | CHOIR PEAK | **regular** | THE CHOIR | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 11.1 |
| 234 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 235 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 236 | DARK AGAIN | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 237 | DARK WIDE | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 238 | DARK AT THE EDGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 239 | DARK IN PAIRS | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 240 | DARK AT EASE | **regular** | THE DARK | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 10.5 |
| 241 | DARK RECALLED | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 242 | DARK TWICE | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 243 | DARK PEAK | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 244 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 245 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 246 | BALLOONS AGAIN | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 6.9 |
| 247 | BALLOONS SPREAD | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 8 |
| 248 | BALLOONS FAR APART | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 249 | BALLOON AND CHOIR | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 250 | EASY BALLOONS | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 58 | 36 | 72 | 8.5 |
| 251 | BALLOON RECALL | **regular** | THE BALLOON | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 9.5 |
| 252 | BALLOONS AND TWINS | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 253 | BALLOON PEAK | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 254 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 255 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 256 | MOULTS AGAIN | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 7.2 |
| 257 | MOULTS SPREAD | **regular** | THE MOULT | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 8.1 |
| 258 | MOULTS FAR APART | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 259 | MOULT AND BALLOON | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 260 | EASY MOULTS | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 57 | 36 | 72 | 8.5 |
| 261 | MOULT RECALL | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 262 | MOULTS AND TWINS | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 263 | MOULT PEAK | **regular** | THE MOULT | — | STANDARD | 15 | 45 | 82 | 51 | 102 | 11.7 |
| 264 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 265 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 266 | COILS AGAIN | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 7.5 |
| 267 | COILS SPREAD | **regular** | THE COIL | — | STANDARD | 6 | 30 | 67 | 42 | 84 | 8.1 |
| 268 | COILS FAR APART | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 8.4 |
| 269 | COIL AND MOULT | **regular** | THE COIL | — | STANDARD | 8 | 33 | 87 | 54 | 108 | 8.8 |
| 270 | EASY COILS | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 271 | COIL RECALL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.2 |
| 272 | COILS AND TWINS | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 273 | THE TWITCH | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 274 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 275 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 276 | CODEX AGAIN | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 277 | CODEX WIDE | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 278 | CODEX AT THE EDGE | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 77 | 48 | 96 | 12 |
| 279 | CODEX IN PAIRS | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 77 | 48 | 96 | 13 |
| 280 | CODEX AT EASE | **regular** | THE CODEX | — | STANDARD | 6 | 36 | 47 | 29 | 58 | 11.5 |
| 281 | CODEX RECALLED | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 12.5 |
| 282 | CODEX TWICE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 13.5 |
| 283 | CODEX PEAK | **regular** | THE CODEX | — | STANDARD | 15 | 43 | 59 | 37 | 74 | 14.6 |
| 284 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 285 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 286 | LURES AGAIN | **regular** | THE LURE | — | STANDARD | 5 | 25 | 39 | 24 | 48 | 6.6 |
| 287 | LURES SPREAD | **regular** | THE LURE | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.8 |
| 288 | LURES FAR APART | **regular** | THE LURE | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 289 | LURE AND COIL | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 290 | EASY LURES | **regular** | THE LURE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 8.5 |
| 291 | LURE RECALL | **regular** | THE LURE | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.5 |
| 292 | LURES AND TWINS | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.5 |
| 293 | LURE PEAK | **regular** | THE LURE | — | STANDARD | 15 | 46 | 53 | 33 | 66 | 11.5 |
| 294 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 295 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 296 | JAM AGAIN | **regular** | THE JAM | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 10.1 |
| 297 | JAM WIDE | **regular** | THE JAM | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 298 | JAM AT THE EDGE | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 12.1 |
| 299 | JAM IN PAIRS | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 13.1 |
| 300 | JAM AT EASE | **regular** | THE JAM | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 11.6 |
| 301 | JAM RECALLED | **regular** | THE JAM | — | STANDARD | 10 | 40 | 47 | 29 | 58 | 12.6 |
| 302 | JAM TWICE | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 14 |
| 303 | JAM PEAK | **regular** | THE JAM | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 15.1 |
| 304 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 305 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 306 | CLASPS AGAIN | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.9 |
| 307 | CLASPS SPREAD | **regular** | THE CLASP | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 7.2 |
| 308 | CLASPS FAR APART | **regular** | THE CLASP | — | STANDARD | 4 | 24 | 38 | 24 | 48 | 8.1 |
| 309 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 8.7 |
| 310 | EASY CLASPS | **regular** | THE CLASP | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.1 |
| 311 | CLASP RECALL | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.1 |
| 312 | CLASPS AND TWINS | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.1 |
| 313 | CLASP PEAK | **regular** | THE CLASP | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.1 |
| 314 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 315 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 316 | DARTS AGAIN | **regular** | THE DART | — | STANDARD | 5 | 26 | 34 | 21 | 42 | 7 |
| 317 | DARTS SPREAD | **regular** | THE DART | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 8.1 |
| 318 | DARTS FAR APART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 319 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 10 |
| 320 | EASY DARTS | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 321 | DART RECALL | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 322 | DARTS AND TWINS | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 323 | DART PEAK | **regular** | THE DART | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 11.5 |
| 324 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 325 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 326 | ECHOES AGAIN | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 7.1 |
| 327 | ECHOES SPREAD | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 328 | ECHOES FAR APART | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 329 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 330 | EASY ECHOES | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 331 | ECHO RECALL | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 48 | 30 | 60 | 9.3 |
| 332 | ECHOES AND TWINS | **regular** | THE ECHO | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 10.4 |
| 333 | ECHO PEAK | **regular** | THE ECHO | — | STANDARD | 15 | 47 | 50 | 31 | 62 | 11.5 |
| 334 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 335 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 336 | GYRES AGAIN | **regular** | THE GYRE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 7.2 |
| 337 | GYRES SPREAD | **regular** | THE GYRE | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 8.1 |
| 338 | GYRES FAR APART | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9 |
| 339 | GYRE AND ECHO | **regular** | THE GYRE | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 10 |
| 340 | EASY GYRES | **regular** | THE GYRE | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 8.7 |
| 341 | GYRE RECALL | **regular** | THE GYRE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.5 |
| 342 | GYRES AND TWINS | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 10.5 |
| 343 | GYRE PEAK | **regular** | THE GYRE | — | STANDARD | 16 | 45 | 51 | 32 | 64 | 11.3 |
| 344 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 345 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 346 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 347 | HANDOVER AGAIN | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.1 |
| 348 | HANDOVER WIDE | **regular** | THE HANDOVER | — | STANDARD | 6 | 31 | 47 | 29 | 58 | 11 |
| 349 | HANDOVER AT THE EDGE | **regular** | THE HANDOVER | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 11.9 |
| 350 | HANDOVER IN PAIRS | **regular** | THE HANDOVER | — | STANDARD | 11 | 38 | 46 | 29 | 58 | 12.9 |
| 351 | HANDOVER AT EASE | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 11.4 |
| 352 | HANDOVER RECALLED | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 353 | HANDOVER TWICE | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 354 | HANDOVER PEAK | **regular** | THE HANDOVER | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 14.4 |
| 355 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 356 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 357 | LIDS AGAIN | **regular** | THE LID | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 358 | LIDS SPREAD | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 8.1 |
| 359 | LIDS FAR APART | **regular** | THE LID | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 9 |
| 360 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 10 |
| 361 | EASY LIDS | **regular** | THE LID | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 8.5 |
| 362 | LID RECALL | **regular** | THE LID | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.5 |
| 363 | LIDS AND TWINS | **regular** | THE LID | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 10.5 |
| 364 | LID PEAK | **regular** | THE LID | — | STANDARD | 16 | 46 | 54 | 34 | 68 | 11.5 |
| 365 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 366 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 367 | RECOILS AGAIN | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 8.1 |
| 368 | RECOILS SPREAD | **regular** | THE RECOIL | — | STANDARD | 6 | 28 | 34 | 21 | 42 | 9 |
| 369 | RECOILS FAR APART | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.9 |
| 370 | RECOIL AND LID | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 10.9 |
| 371 | EASY RECOILS | **regular** | THE RECOIL | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 9.4 |
| 372 | RECOIL RECALL | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.4 |
| 373 | RECOILS AND TWINS | **regular** | THE RECOIL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.4 |
| 374 | RECOIL PEAK | **regular** | THE RECOIL | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 12.1 |
| 375 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 376 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 377 | CRYSTALS AGAIN | **regular** | THE CRYSTAL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.4 |
| 378 | CRYSTALS SPREAD | **regular** | THE CRYSTAL | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 9.6 |
| 379 | CRYSTALS FAR APART | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.6 |
| 380 | CRYSTAL AND RECOIL | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 381 | EASY CRYSTALS | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 63 | 39 | 78 | 10 |
| 382 | CRYSTAL RECALL | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 383 | CRYSTALS AND TWINS | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 384 | CRYSTAL PEAK | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 385 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 386 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 387 | VOLLEYS AGAIN | **regular** | THE VOLLEY | — | STANDARD | 5 | 31 | 61 | 38 | 76 | 8.7 |
| 388 | VOLLEYS SPREAD | **regular** | THE VOLLEY | — | STANDARD | 4 | 24 | 27 | 17 | 34 | 9.6 |
| 389 | VOLLEYS FAR APART | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 47 | 29 | 58 | 10.5 |
| 390 | VOLLEY AND CRYSTAL | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 63 | 39 | 78 | 11.5 |
| 391 | EASY VOLLEYS | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 392 | VOLLEY RECALL | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 11 |
| 393 | VOLLEYS AND TWINS | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 394 | VOLLEY PEAK | **regular** | THE VOLLEY | — | STANDARD | 15 | 45 | 71 | 44 | 88 | 13.1 |
| 395 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 396 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 397 | FLIP AGAIN | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 10.1 |
| 398 | FLIP WIDE | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 399 | FLIP AT THE EDGE | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 54 | 34 | 68 | 11.9 |
| 400 | FLIP IN PAIRS | **regular** | THE FLIP | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.9 |
| 401 | FLIP AT EASE | **regular** | THE FLIP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.4 |
| 402 | FLIP RECALLED | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 58 | 36 | 72 | 12.4 |
| 403 | FLIP TWICE | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 69 | 43 | 86 | 13.4 |
| 404 | FLIP PEAK | **regular** | THE FLIP | — | STANDARD | 18 | 46 | 66 | 41 | 82 | 14.3 |
| 405 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 406 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 407 | CRAWLERS AGAIN | **regular** | THE CRAWLER | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 9 |
| 408 | CRAWLERS SPREAD | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 9.9 |
| 409 | CRAWLERS FAR APART | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 410 | CRAWLER AND VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 34 | 64 | 40 | 80 | 11.5 |
| 411 | EASY CRAWLERS | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 412 | CRAWLER RECALL | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 413 | CRAWLERS AND TWINS | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 414 | CRAWLER PEAK | **regular** | THE CRAWLER | — | STANDARD | 17 | 46 | 65 | 41 | 82 | 13 |
| 415 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 416 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 417 | MINES AGAIN | **regular** | THE MINE | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 9.3 |
| 418 | MINES SPREAD | **regular** | THE MINE | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 9.9 |
| 419 | MINES FAR APART | **regular** | THE MINE | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 10.5 |
| 420 | MINE AND CRAWLER | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.5 |
| 421 | EASY MINES | **regular** | THE MINE | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 422 | MINE RECALL | **regular** | THE MINE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 11 |
| 423 | MINES AND TWINS | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 424 | MINE PEAK | **regular** | THE MINE | — | STANDARD | 18 | 47 | 107 | 67 | 134 | 13.1 |
| 425 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 426 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 427 | VEILS AGAIN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 428 | VEILS SPREAD | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 429 | VEILS FAR APART | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 11.1 |
| 430 | VEIL AND MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 431 | EASY VEILS | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 432 | VEIL RECALL | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 433 | VEILS AND TWINS | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 434 | VEIL PEAK | **regular** | THE VEIL | — | STANDARD | 15 | 44 | 46 | 29 | 58 | 13 |
| 435 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 436 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 437 | WISPS AGAIN | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 438 | WISPS SPREAD | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 439 | WISPS FAR APART | **regular** | THE WISP | — | STANDARD | 6 | 26 | 54 | 34 | 68 | 10.8 |
| 440 | WISP AND VEIL | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 441 | EASY WISPS | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 442 | WISP RECALL | **regular** | THE WISP | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11 |
| 443 | WISPS AND TWINS | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 444 | WISP PEAK | **regular** | THE WISP | — | STANDARD | 18 | 47 | 53 | 33 | 66 | 13 |
| 445 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 446 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 447 | GHOSTS AGAIN | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.2 |
| 448 | GHOSTS SPREAD | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 10.5 |
| 449 | GHOSTS FAR APART | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 28 | 18 | 36 | 11.1 |
| 450 | GHOST AND WISP | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 451 | EASY GHOSTS | **regular** | THE GHOST | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 10 |
| 452 | GHOST RECALL | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 453 | GHOSTS AND TWINS | **regular** | THE GHOST | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.9 |
| 454 | GHOST PEAK | **regular** | THE GHOST | — | STANDARD | 15 | 42 | 45 | 28 | 56 | 12.9 |
| 455 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 456 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 457 | CAROMS AGAIN | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 458 | CAROMS SPREAD | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 10.5 |
| 459 | CAROMS FAR APART | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 35 | 22 | 44 | 11.1 |
| 460 | CAROM AND GHOST | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 461 | EASY CAROMS | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 462 | CAROM RECALL | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 463 | CAROMS AND TWINS | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 464 | CAROM PEAK | **regular** | THE CAROM | — | STANDARD | 18 | 46 | 51 | 32 | 64 | 13.1 |
| 465 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 466 | CAROMS RETURN | **regular** | CAROMS RETURN | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 10.2 |
| 467 | CAROMS WIDER | **regular** | CAROMS RETURN | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 468 | CAROMS OUT WIDE | **regular** | CAROMS RETURN | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 469 | CAROMS IN PAIRS | **regular** | CAROMS RETURN | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 470 | CAROMS AT REST | **regular** | CAROMS RETURN | — | STANDARD | 7 | 36 | 44 | 28 | 56 | 10 |
| 471 | CAROMS RECALLED | **regular** | CAROMS RETURN | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 11 |
| 472 | CAROMS DOUBLED | **regular** | CAROMS RETURN | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 473 | CAROMS SUMMIT | **regular** | CAROMS RETURN | — | STANDARD | 17 | 48 | 72 | 45 | 90 | 13 |
| 474 | THE SLING | boss | CAROMS RETURN | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 475 | GHOSTS RETURN | **regular** | GHOSTS RETURN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.5 |
| 476 | GHOSTS WIDER | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 477 | GHOSTS OUT WIDE | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 11.4 |
| 478 | GHOSTS IN PAIRS | **regular** | GHOSTS RETURN | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.8 |
| 479 | GHOSTS AT REST | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 10 |
| 480 | GHOSTS RECALLED | **regular** | GHOSTS RETURN | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 11 |
| 481 | GHOSTS DOUBLED | **regular** | GHOSTS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 482 | GHOSTS SUMMIT | **regular** | GHOSTS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 483 | THE CAPSTAN | boss | GHOSTS RETURN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 484 | WISPS RETURN | **regular** | WISPS RETURN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 485 | WISPS WIDER | **regular** | WISPS RETURN | — | STANDARD | 6 | 32 | 34 | 21 | 42 | 10.5 |
| 486 | WISPS OUT WIDE | **regular** | WISPS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 487 | WISPS IN PAIRS | **regular** | WISPS RETURN | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 488 | WISPS AT REST | **regular** | WISPS RETURN | — | STANDARD | 7 | 40 | 63 | 39 | 78 | 10 |
| 489 | WISPS RECALLED | **regular** | WISPS RETURN | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 11 |
| 490 | WISPS DOUBLED | **regular** | WISPS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 491 | WISPS SUMMIT | **regular** | WISPS RETURN | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13 |
| 492 | THE GALL | boss | WISPS RETURN | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 493 | VEILS RETURN | **regular** | VEILS RETURN | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.2 |
| 494 | VEILS WIDER | **regular** | VEILS RETURN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 10.5 |
| 495 | VEILS OUT WIDE | **regular** | VEILS RETURN | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 496 | VEILS IN PAIRS | **regular** | VEILS RETURN | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11.8 |
| 497 | VEILS AT REST | **regular** | VEILS RETURN | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 498 | VEILS RECALLED | **regular** | VEILS RETURN | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 11 |
| 499 | VEILS DOUBLED | **regular** | VEILS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 500 | VEILS SUMMIT | **regular** | VEILS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 501 | THE TRAPEZE | boss | VEILS RETURN | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 502 | MINES RETURN | **regular** | MINES RETURN | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 10.2 |
| 503 | MINES WIDER | **regular** | MINES RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 504 | MINES OUT WIDE | **regular** | MINES RETURN | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 11.4 |
| 505 | MINES IN PAIRS | **regular** | MINES RETURN | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 11.8 |
| 506 | MINES AT REST | **regular** | MINES RETURN | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 10 |
| 507 | MINES RECALLED | **regular** | MINES RETURN | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 508 | MINES DOUBLED | **regular** | MINES RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 509 | MINES SUMMIT | **regular** | MINES RETURN | — | STANDARD | 19 | 48 | 50 | 31 | 62 | 13 |
| 510 | THE FLUE | boss | MINES RETURN | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 511 | CRAWLERS RETURN | **regular** | CRAWLERS RETURN | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.1 |
| 512 | CRAWLERS WIDER | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 32 | 57 | 36 | 72 | 10.5 |
| 513 | CRAWLERS OUT WIDE | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 514 | CRAWLERS IN PAIRS | **regular** | CRAWLERS RETURN | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 515 | CRAWLERS AT REST | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 516 | CRAWLERS RECALLED | **regular** | CRAWLERS RETURN | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 517 | CRAWLERS DOUBLED | **regular** | CRAWLERS RETURN | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 518 | CRAWLERS SUMMIT | **regular** | CRAWLERS RETURN | — | STANDARD | 19 | 48 | 70 | 44 | 88 | 13.2 |
| 519 | THE GOVERNOR | boss | CRAWLERS RETURN | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 520 | VOLLEYS RETURN | **regular** | VOLLEYS RETURN | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 10.5 |
| 521 | VOLLEYS WIDER | **regular** | VOLLEYS RETURN | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 11.1 |
| 522 | VOLLEYS OUT WIDE | **regular** | VOLLEYS RETURN | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 523 | VOLLEYS IN PAIRS | **regular** | VOLLEYS RETURN | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 524 | VOLLEYS AT REST | **regular** | VOLLEYS RETURN | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 525 | VOLLEYS RECALLED | **regular** | VOLLEYS RETURN | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 526 | VOLLEYS DOUBLED | **regular** | VOLLEYS RETURN | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 527 | VOLLEYS SUMMIT | **regular** | VOLLEYS RETURN | — | STANDARD | 19 | 46 | 66 | 41 | 82 | 13 |
| 528 | THE LAMPREY | boss | VOLLEYS RETURN | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 529 | CRYSTALS RETURN | **regular** | CRYSTALS RETURN | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 10.5 |
| 530 | CRYSTALS WIDER | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.8 |
| 531 | CRYSTALS OUT WIDE | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 532 | CRYSTALS IN PAIRS | **regular** | CRYSTALS RETURN | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.8 |
| 533 | CRYSTALS AT REST | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 10 |
| 534 | CRYSTALS RECALLED | **regular** | CRYSTALS RETURN | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 535 | CRYSTALS DOUBLED | **regular** | CRYSTALS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 536 | CRYSTALS SUMMIT | **regular** | CRYSTALS RETURN | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 537 | THE MIMIC | boss | CRYSTALS RETURN | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 538 | RECOILS RETURN | **regular** | RECOILS RETURN | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 539 | RECOILS WIDER | **regular** | RECOILS RETURN | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 540 | RECOILS OUT WIDE | **regular** | RECOILS RETURN | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 11.1 |
| 541 | RECOILS IN PAIRS | **regular** | RECOILS RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 542 | RECOILS AT REST | **regular** | RECOILS RETURN | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 543 | RECOILS RECALLED | **regular** | RECOILS RETURN | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 544 | RECOILS DOUBLED | **regular** | RECOILS RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 545 | RECOILS SUMMIT | **regular** | RECOILS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 546 | THE LATCH | boss | RECOILS RETURN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 547 | LIDS RETURN | **regular** | LIDS RETURN | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 548 | LIDS WIDER | **regular** | LIDS RETURN | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 549 | LIDS OUT WIDE | **regular** | LIDS RETURN | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 550 | LIDS IN PAIRS | **regular** | LIDS RETURN | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 551 | LIDS AT REST | **regular** | LIDS RETURN | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 552 | LIDS RECALLED | **regular** | LIDS RETURN | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 553 | LIDS DOUBLED | **regular** | LIDS RETURN | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 554 | LIDS SUMMIT | **regular** | LIDS RETURN | — | STANDARD | 19 | 46 | 52 | 33 | 66 | 13.1 |
| 555 | THE CHRYSALIS | boss | LIDS RETURN | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 556 | GYRES RETURN | **regular** | GYRES RETURN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 557 | GYRES WIDER | **regular** | GYRES RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 558 | GYRES OUT WIDE | **regular** | GYRES RETURN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 12 |
| 559 | GYRES IN PAIRS | **regular** | GYRES RETURN | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.4 |
| 560 | GYRES AT REST | **regular** | GYRES RETURN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 561 | GYRES RECALLED | **regular** | GYRES RETURN | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 10.8 |
| 562 | GYRES DOUBLED | **regular** | GYRES RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 563 | GYRES SUMMIT | **regular** | GYRES RETURN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 564 | THE HYDRA | boss | GYRES RETURN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 23 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 42 | BULB QUEEN | normal | 79 beats | 49 | 98 s | in band |
| 52 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 62 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 72 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 82 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 92 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 102 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
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
| 214 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 224 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 234 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 244 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 254 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 264 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 274 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 284 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 294 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 304 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 314 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 324 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 334 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 344 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 355 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 365 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 375 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 385 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 395 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 405 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 415 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 425 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 435 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 445 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 455 | THE VISE | normal | 39 beats | 24 | 48 s | short |
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
