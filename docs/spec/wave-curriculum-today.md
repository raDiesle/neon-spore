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
| regular | 452 | 0 | 4 | 27 | 73 | 3 h 33 min | 7 h 6 min |
| intro | 54 | 0 | 3 | 21 | 48 | 20 min | 41 min |
| boss | 56 | 0 | 9 | 28 | 343 | 46 min | 1 h 33 min |
| every wave | 562 | 0 | 3 | 26 | 343 | 4 h 40 min | 9 h 20 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 48 | 51 | 32 | 64 | 4.6 |
| 2 | STEADY | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | SIDE TO SIDE | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | QUICKER | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 36 | 39 | 24 | 48 | 5.4 |
| 5 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 4 | 24 | 27 | 17 | 34 | 1.4 |
| 6 | ONLY CYAN | **regular** | CYAN | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 2.6 |
| 7 | TWO COLOURS | **regular** | CYAN | — | STANDARD 2 | 7 | 36 | 39 | 24 | 48 | 3.4 |
| 8 | ALTERNATING | **regular** | CYAN | — | STANDARD 2 | 8 | 42 | 45 | 28 | 56 | 4.6 |
| 9 | THE INSTAR | boss | CYAN | instar, panel | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 10 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 34 | 21 | 42 | 1.4 |
| 11 | FIVE ROCKS | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 44 | 28 | 56 | 2.6 |
| 12 | WIDE ROCKS | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 49 | 31 | 62 | 3.8 |
| 13 | ROCKS BETWEEN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 44 | 28 | 56 | 5 |
| 14 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 16 | 10 | 20 | 5.8 |
| 15 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 18 | 20 | 13 | 26 | 5.7 |
| 16 | ONE LAST CHANCE | intro | TORCH | — | STANDARD 4 | 6 | 13 | 24 | 15 | 30 | 10.8 |
| 17 | SHIELD, THEN CANNON | **regular** | TORCH | — | STANDARD 4 | 2 | 5 | 15 | 9 | 18 | 3 |
| 18 | THE WALL | **regular** | TORCH | — | STANDARD 4 | 4 | 3 | 6 | 4 | 8 | 10 |
| 19 | SHOOT AND SHIELD | **regular** | TORCH | — | STANDARD 4 | 4 | 9 | 23 | 14 | 28 | 8 |
| 20 | IN ITS SHADOW | **regular** | TORCH | — | STANDARD 4 | 4 | 9 | 23 | 14 | 28 | 4.6 |
| 21 | CROWDED | **regular** | TORCH | — | STANDARD 4 | 5 | 6 | 17 | 11 | 22 | 14.4 |
| 22 | THE BASTION | boss | TORCH | bastion | STANDARD 5 | 0 | 0 | 82 | 51 | 102 | — |
| 23 | SALVAGE | intro | SALVAGE | pod | STANDARD 5 | 2 | 7 | 10 | 6 | 12 | 4.8 |
| 24 | SAVE IT | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 25 | SALVAGE WIDE | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 26 | SALVAGE THE TORCH | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 36 | 23 | 46 | 5.7 |
| 27 | CATCH AND AIM | intro | SALVAGE | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 28 | SHIELD HELD | **regular** | SALVAGE | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 29 | HELD WIDE | **regular** | SALVAGE | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 30 | FINALE | **regular** | SALVAGE | — | STANDARD 5 | 7 | 7 | 22 | 14 | 28 | 20.9 |
| 31 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 12 | 15 | 9 | 18 | 5 |
| 32 | LANCE AGAIN | **regular** | THE LANCE | — | STANDARD | 3 | 30 | 44 | 28 | 56 | 2.2 |
| 33 | LANCE WIDE | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 2.6 |
| 34 | LANCE AT THE EDGE | **regular** | THE LANCE | — | STANDARD | 4 | 27 | 41 | 26 | 52 | 3.2 |
| 35 | LANCE IN PAIRS | **regular** | THE LANCE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 4 |
| 36 | LANCE AT EASE | **regular** | THE LANCE | — | STANDARD | 4 | 39 | 42 | 26 | 52 | 2.4 |
| 37 | LANCE RECALLED | **regular** | THE LANCE | — | STANDARD | 4 | 33 | 36 | 23 | 46 | 3.4 |
| 38 | LANCE TWICE | **regular** | THE LANCE | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.5 |
| 39 | LANCE PEAK | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 5.5 |
| 40 | BULB QUEEN | boss | THE LANCE | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 41 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 34 | 41 | 26 | 52 | 9 |
| 42 | CROSSINGS AGAIN | **regular** | THE CROSSING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 2.4 |
| 43 | CROSSINGS SPREAD | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 3.4 |
| 44 | CROSSINGS FAR APART | **regular** | THE CROSSING | — | STANDARD | 6 | 27 | 34 | 21 | 42 | 4.4 |
| 45 | CROSSING AND SHIELD | **regular** | THE CROSSING | — | STANDARD | 6 | 33 | 36 | 23 | 46 | 5.4 |
| 46 | EASY CROSSINGS | **regular** | THE CROSSING | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 4.6 |
| 47 | CROSSING RECALL | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 5.6 |
| 48 | CROSSINGS AND TWINS | **regular** | THE CROSSING | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 6.9 |
| 49 | CROSSING PEAK | **regular** | THE CROSSING | — | STANDARD | 13 | 44 | 47 | 29 | 58 | 7.9 |
| 50 | THE MIRROR | boss (special) | THE CROSSING | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 51 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 42 | 47 | 29 | 58 | 5.7 |
| 52 | BEATBOXES AGAIN | **regular** | THE BEATBOX | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 3.6 |
| 53 | BEATBOXES SPREAD | **regular** | THE BEATBOX | — | STANDARD | 6 | 30 | 36 | 23 | 46 | 4.5 |
| 54 | BEATBOXES FAR APART | **regular** | THE BEATBOX | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 5.4 |
| 55 | BEATBOX AND CROSSING | **regular** | THE BEATBOX | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 6.4 |
| 56 | EASY BEATBOXES | **regular** | THE BEATBOX | — | STANDARD | 6 | 40 | 45 | 28 | 56 | 4.8 |
| 57 | BEATBOX RECALL | **regular** | THE BEATBOX | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 6.5 |
| 58 | BEATBOXES AND TWINS | **regular** | THE BEATBOX | — | STANDARD | 11 | 44 | 50 | 31 | 62 | 7.6 |
| 59 | BEATBOX PEAK | **regular** | THE BEATBOX | — | STANDARD | 16 | 48 | 55 | 34 | 68 | 8.6 |
| 60 | THE MAZE | boss (special) | THE BEATBOX | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 61 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 32 | 34 | 21 | 42 | 7.2 |
| 62 | WEIGHTS AGAIN | **regular** | THE WEIGHT | — | STANDARD | 5 | 30 | 32 | 20 | 40 | 3.9 |
| 63 | WEIGHTS SPREAD | **regular** | THE WEIGHT | — | STANDARD | 6 | 29 | 31 | 19 | 38 | 5.1 |
| 64 | WEIGHTS FAR APART | **regular** | THE WEIGHT | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 6.3 |
| 65 | WEIGHT AND BEATBOX | **regular** | THE WEIGHT | — | STANDARD | 8 | 35 | 41 | 26 | 52 | 7.4 |
| 66 | EASY WEIGHTS | **regular** | THE WEIGHT | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 5.9 |
| 67 | WEIGHT RECALL | **regular** | THE WEIGHT | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7 |
| 68 | WEIGHTS AND TWINS | **regular** | THE WEIGHT | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.2 |
| 69 | WEIGHT PEAK | **regular** | THE WEIGHT | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 9.2 |
| 70 | THE GAUGE | boss (special) | THE WEIGHT | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 71 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 50 | 64 | 40 | 80 | 8.2 |
| 72 | LIMPET AGAIN | **regular** | THE LIMPET | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 6.8 |
| 73 | LIMPET WIDE | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 8 |
| 74 | LIMPET AT THE EDGE | **regular** | THE LIMPET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9.8 |
| 75 | LIMPET IN PAIRS | **regular** | THE LIMPET | — | STANDARD | 8 | 34 | 45 | 28 | 56 | 11.1 |
| 76 | LIMPET AT EASE | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 10 |
| 77 | LIMPET RECALLED | **regular** | THE LIMPET | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 11 |
| 78 | LIMPET TWICE | **regular** | THE LIMPET | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 12.1 |
| 79 | LIMPET PEAK | **regular** | THE LIMPET | — | STANDARD | 14 | 48 | 54 | 34 | 68 | 13.1 |
| 80 | THE WARDEN | boss | THE LIMPET | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 81 | THE BLISTER | intro | THE BLISTER | blister | STANDARD | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 82 | FIVE BLISTERS | **regular** | THE BLISTER | — | STANDARD | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 83 | BLISTERS TO TAP | **regular** | THE BLISTER | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.5 |
| 84 | BLISTERS TO HOLD | **regular** | THE BLISTER | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.8 |
| 85 | BLISTERS TO SWIPE | **regular** | THE BLISTER | — | STANDARD | 9 | 39 | 42 | 26 | 52 | 7.8 |
| 86 | BLISTERS TO TURN | **regular** | THE BLISTER | — | STANDARD | 9 | 42 | 45 | 28 | 56 | 7.4 |
| 87 | BLISTERS TO RUB | **regular** | THE BLISTER | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 88 | BLISTERS TO COMBO | **regular** | THE BLISTER | — | STANDARD | 9 | 41 | 44 | 28 | 56 | 7.6 |
| 89 | BLISTERS TO LEVER | **regular** | THE BLISTER | — | STANDARD | 9 | 40 | 43 | 27 | 54 | 7.6 |
| 90 | THE FLEET | boss (special) | THE BLISTER | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 91 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 | 9 | 18 | 14.4 |
| 92 | HEAVY ROCKS AGAIN | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.2 |
| 93 | HEAVY ROCKS SPREAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 5.2 |
| 94 | HEAVY ROCKS APART | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 6.2 |
| 95 | HEAVY ROCK IN PAIRS | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 34 | 42 | 26 | 52 | 7.2 |
| 96 | EASY HEAVY ROCKS | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 5.7 |
| 97 | HEAVY ROCK RECALL | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 6.7 |
| 98 | HEAVY ROCKS, TWINS | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 8.2 |
| 99 | HEAVY ROCK PEAK | **regular** | HEAVY ROCKS | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.2 |
| 100 | THE VANE | boss | HEAVY ROCKS | vane | STANDARD 5 | 2 | 3 | 51 | 32 | 64 | — |
| 101 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 48 | 51 | 32 | 64 | 11.4 |
| 102 | LEECH AGAIN | **regular** | THE LEECH | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 5.6 |
| 103 | LEECH WIDE | **regular** | THE LEECH | — | STANDARD | 6 | 30 | 38 | 24 | 48 | 6.7 |
| 104 | LEECH AT THE EDGE | **regular** | THE LEECH | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.5 |
| 105 | LEECH IN PAIRS | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 50 | 31 | 62 | 10.1 |
| 106 | LEECH AT EASE | **regular** | THE LEECH | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 8.6 |
| 107 | LEECH RECALLED | **regular** | THE LEECH | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 10.3 |
| 108 | LEECH TWICE | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 11.9 |
| 109 | LEECH PEAK | **regular** | THE LEECH | — | STANDARD | 16 | 48 | 52 | 33 | 66 | 12.9 |
| 110 | SNAKE | boss (special) | THE LEECH | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 111 | THE THROB | intro | THE THROB | throb | STANDARD | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 112 | THROBS AGAIN | **regular** | THE THROB | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 4.5 |
| 113 | THROBS SPREAD | **regular** | THE THROB | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 6 |
| 114 | THROBS FAR APART | **regular** | THE THROB | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.2 |
| 115 | THROB AND HEAVY ROCK | **regular** | THE THROB | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 8.2 |
| 116 | EASY THROBS | **regular** | THE THROB | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.7 |
| 117 | THROB RECALL | **regular** | THE THROB | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.7 |
| 118 | THROBS AND TWINS | **regular** | THE THROB | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 8.7 |
| 119 | THROB PEAK | **regular** | THE THROB | — | STANDARD | 16 | 48 | 56 | 35 | 70 | 9.7 |
| 120 | PINBALL | boss (special) | THE THROB | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 121 | THE COUNT | intro | THE COUNT | countdown | STANDARD | 4 | 19 | 25 | 16 | 32 | 4.8 |
| 122 | COUNTS AGAIN | **regular** | THE COUNT | — | STANDARD | 5 | 30 | 35 | 22 | 44 | 4.8 |
| 123 | COUNTS SPREAD | **regular** | THE COUNT | — | STANDARD | 6 | 31 | 37 | 23 | 46 | 6 |
| 124 | COUNTS FAR APART | **regular** | THE COUNT | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 125 | COUNT AND THROB | **regular** | THE COUNT | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.1 |
| 126 | EASY COUNTS | **regular** | THE COUNT | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 6.6 |
| 127 | COUNT RECALL | **regular** | THE COUNT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.6 |
| 128 | COUNTS AND TWINS | **regular** | THE COUNT | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 8.6 |
| 129 | COUNT PEAK | **regular** | THE COUNT | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 9.6 |
| 130 | THE SCOUT | boss (special) | THE COUNT | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 131 | THE SHELL | intro | THE SHELL | shell | STANDARD | 2 | 10 | 14 | 9 | 18 | 3 |
| 132 | SHELLS AGAIN | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 5.1 |
| 133 | SHELLS SPREAD | **regular** | THE SHELL | — | STANDARD | 5 | 27 | 31 | 19 | 38 | 6 |
| 134 | SHELLS FAR APART | **regular** | THE SHELL | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 7.2 |
| 135 | SHELL AND COUNT | **regular** | THE SHELL | — | STANDARD | 8 | 34 | 38 | 24 | 48 | 8.2 |
| 136 | EASY SHELLS | **regular** | THE SHELL | — | STANDARD | 6 | 39 | 43 | 27 | 54 | 6.4 |
| 137 | SHELL RECALL | **regular** | THE SHELL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.4 |
| 138 | SHELLS AND TWINS | **regular** | THE SHELL | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.4 |
| 139 | SHELL PEAK | **regular** | THE SHELL | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 9.4 |
| 140 | THE HAUL | boss (special) | THE SHELL | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 141 | THE HUSK | intro | THE HUSK | husk | STANDARD | 2 | 9 | 16 | 10 | 20 | 6 |
| 142 | HUSKS AGAIN | **regular** | THE HUSK | — | STANDARD | 3 | 30 | 33 | 21 | 42 | 3.2 |
| 143 | HUSKS SPREAD | **regular** | THE HUSK | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 3.8 |
| 144 | HUSKS FAR APART | **regular** | THE HUSK | — | STANDARD | 3 | 27 | 31 | 19 | 38 | 4.5 |
| 145 | HUSK AND SHELL | **regular** | THE HUSK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 6.3 |
| 146 | EASY HUSKS | **regular** | THE HUSK | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 5.6 |
| 147 | HUSK RECALL | **regular** | THE HUSK | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 6.9 |
| 148 | HUSKS AND TWINS | **regular** | THE HUSK | — | STANDARD | 9 | 48 | 52 | 33 | 66 | 8.2 |
| 149 | HUSK PEAK | **regular** | THE HUSK | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.2 |
| 150 | THE STARE | boss | THE HUSK | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 151 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 48 | 57 | 36 | 72 | 10.6 |
| 152 | CHOKE AGAIN | **regular** | THE CHOKE | — | STANDARD | 3 | 28 | 42 | 26 | 52 | 3.4 |
| 153 | CHOKE WIDE | **regular** | THE CHOKE | — | STANDARD | 3 | 29 | 32 | 20 | 40 | 4.6 |
| 154 | CHOKE AT THE EDGE | **regular** | THE CHOKE | — | STANDARD | 4 | 27 | 30 | 19 | 38 | 5.8 |
| 155 | CHOKE IN PAIRS | **regular** | THE CHOKE | — | STANDARD | 6 | 33 | 37 | 23 | 46 | 6.8 |
| 156 | CHOKE AT EASE | **regular** | THE CHOKE | — | STANDARD | 4 | 32 | 35 | 22 | 44 | 5.7 |
| 157 | CHOKE RECALLED | **regular** | THE CHOKE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 7 |
| 158 | CHOKE TWICE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.1 |
| 159 | CHOKE PEAK | **regular** | THE CHOKE | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 9.1 |
| 160 | THE PULSE | boss (special) | THE CHOKE | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 161 | THE RIND | intro | THE RIND | rind | STANDARD | 4 | 21 | 25 | 16 | 32 | 4.8 |
| 162 | RINDS AGAIN | **regular** | THE RIND | — | STANDARD | 5 | 32 | 36 | 23 | 46 | 3 |
| 163 | RINDS SPREAD | **regular** | THE RIND | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 3.9 |
| 164 | RINDS FAR APART | **regular** | THE RIND | — | STANDARD | 3 | 24 | 28 | 18 | 36 | 4.5 |
| 165 | RIND AND HUSK | **regular** | THE RIND | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 5.9 |
| 166 | EASY RINDS | **regular** | THE RIND | — | STANDARD | 6 | 40 | 44 | 28 | 56 | 4.8 |
| 167 | RIND RECALL | **regular** | THE RIND | — | STANDARD | 8 | 37 | 39 | 24 | 48 | 6.1 |
| 168 | RINDS AND TWINS | **regular** | THE RIND | — | STANDARD | 9 | 46 | 50 | 31 | 62 | 7.4 |
| 169 | RIND PEAK | **regular** | THE RIND | — | STANDARD | 13 | 44 | 48 | 30 | 60 | 8.3 |
| 170 | THE BATON | boss | THE RIND | baton | STANDARD | 0 | 0 | 283 | 177 | 354 | — |
| 171 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 38 | 52 | 33 | 66 | 6.6 |
| 172 | VEERS AGAIN | **regular** | THE VEER | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 5.4 |
| 173 | VEERS SPREAD | **regular** | THE VEER | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 6.9 |
| 174 | VEERS FAR APART | **regular** | THE VEER | — | STANDARD | 6 | 26 | 35 | 22 | 44 | 8.4 |
| 175 | VEER AND RIND | **regular** | THE VEER | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.4 |
| 176 | EASY VEERS | **regular** | THE VEER | — | STANDARD | 6 | 35 | 49 | 31 | 62 | 7.9 |
| 177 | VEER RECALL | **regular** | THE VEER | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8.9 |
| 178 | VEERS AND TWINS | **regular** | THE VEER | — | STANDARD | 11 | 45 | 59 | 37 | 74 | 9.9 |
| 179 | VEER PEAK | **regular** | THE VEER | — | STANDARD | 16 | 48 | 58 | 36 | 72 | 10.9 |
| 180 | THE UNDERTOW | boss | THE VEER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 181 | THE STRAND | intro | THE STRAND | strand | STANDARD | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 182 | STRANDS AGAIN | **regular** | THE STRAND | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 5.7 |
| 183 | STRANDS SPREAD | **regular** | THE STRAND | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 7.5 |
| 184 | STRANDS FAR APART | **regular** | THE STRAND | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 8.7 |
| 185 | STRAND AND VEER | **regular** | THE STRAND | — | STANDARD | 8 | 35 | 40 | 25 | 50 | 9.7 |
| 186 | EASY STRANDS | **regular** | THE STRAND | — | STANDARD | 6 | 37 | 41 | 26 | 52 | 7.8 |
| 187 | STRAND RECALL | **regular** | THE STRAND | — | STANDARD | 8 | 38 | 52 | 33 | 66 | 8.8 |
| 188 | STRANDS AND TWINS | **regular** | THE STRAND | — | STANDARD | 12 | 46 | 60 | 38 | 76 | 9.8 |
| 189 | STRAND PEAK | **regular** | THE STRAND | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.8 |
| 190 | THE THROAT | boss | THE STRAND | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 191 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 192 | CLAW AGAIN | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 28 | 18 | 36 | 0 |
| 193 | CLAW WIDE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 194 | CLAW AT THE EDGE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 19 | 12 | 24 | 0 |
| 195 | CLAW IN PAIRS | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 21 | 13 | 26 | 0 |
| 196 | CLAW AT EASE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 23 | 14 | 28 | 0 |
| 197 | CLAW RECALLED | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 32 | 20 | 40 | 0 |
| 198 | CLAW TWICE | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 27 | 17 | 34 | 0 |
| 199 | CLAW PEAK | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 45 | 28 | 56 | 0 |
| 200 | THE GORGE | boss | THE CLAW | gorge | STANDARD | 10 | 82 | 236 | 148 | 296 | — |
| 201 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 33 | 21 | 42 | 1.5 |
| 202 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 65 | 41 | 82 | 4.5 |
| 203 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 57 | 36 | 72 | 1.5 |
| 204 | FENCES AGAIN | **regular** | THE FENCE | — | STANDARD | 6 | 32 | 41 | 26 | 52 | 6 |
| 205 | FENCES SPREAD | **regular** | THE FENCE | — | STANDARD | 6 | 28 | 33 | 21 | 42 | 7.1 |
| 206 | FENCES FAR APART | **regular** | THE FENCE | — | STANDARD | 4 | 24 | 29 | 18 | 36 | 8.1 |
| 207 | FENCE AND STRAND | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.1 |
| 208 | EASY FENCES | **regular** | THE FENCE | — | STANDARD | 7 | 37 | 41 | 26 | 52 | 7.6 |
| 209 | FENCE RECALL | **regular** | THE FENCE | — | STANDARD | 8 | 40 | 47 | 29 | 58 | 8.6 |
| 210 | FENCES AND TWINS | **regular** | THE FENCE | — | STANDARD | 12 | 48 | 56 | 35 | 70 | 9.6 |
| 211 | FENCE PEAK | **regular** | THE FENCE | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 10.6 |
| 212 | THE CURTAIN | boss | THE FENCE | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 213 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD | 5 | 46 | 49 | 31 | 62 | 8.1 |
| 214 | MAGNETS AGAIN | **regular** | THE MAGNET | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 6.3 |
| 215 | MAGNETS SPREAD | **regular** | THE MAGNET | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 7.3 |
| 216 | MAGNETS FAR APART | **regular** | THE MAGNET | — | STANDARD | 6 | 29 | 43 | 27 | 54 | 8.4 |
| 217 | MAGNET AND FENCE | **regular** | THE MAGNET | — | STANDARD | 8 | 38 | 47 | 29 | 58 | 9.4 |
| 218 | EASY MAGNETS | **regular** | THE MAGNET | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 7.9 |
| 219 | MAGNET RECALL | **regular** | THE MAGNET | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.9 |
| 220 | MAGNETS AND TWINS | **regular** | THE MAGNET | — | STANDARD | 12 | 48 | 57 | 36 | 72 | 9.9 |
| 221 | MAGNET PEAK | **regular** | THE MAGNET | — | STANDARD | 16 | 48 | 57 | 36 | 72 | 10.9 |
| 222 | THE TASTER | boss | THE MAGNET | taster | STANDARD | 10 | 80 | 43 | 27 | 54 | — |
| 223 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 224 | CHOIRS AGAIN | **regular** | THE CHOIR | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 225 | CHOIRS SPREAD | **regular** | THE CHOIR | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 7.6 |
| 226 | CHOIRS FAR APART | **regular** | THE CHOIR | — | STANDARD | 6 | 27 | 35 | 22 | 44 | 8.6 |
| 227 | CHOIR AND MAGNET | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 228 | EASY CHOIRS | **regular** | THE CHOIR | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 8.1 |
| 229 | CHOIR RECALL | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.1 |
| 230 | CHOIRS AND TWINS | **regular** | THE CHOIR | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 10.1 |
| 231 | CHOIR PEAK | **regular** | THE CHOIR | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 11.1 |
| 232 | THE SINEW | boss | THE CHOIR | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 233 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 36 | 39 | 24 | 48 | 9.4 |
| 234 | DARK AGAIN | **regular** | THE DARK | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.7 |
| 235 | DARK WIDE | **regular** | THE DARK | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.7 |
| 236 | DARK AT THE EDGE | **regular** | THE DARK | — | STANDARD | 6 | 27 | 41 | 26 | 52 | 10.7 |
| 237 | DARK IN PAIRS | **regular** | THE DARK | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.7 |
| 238 | DARK AT EASE | **regular** | THE DARK | — | STANDARD | 6 | 36 | 50 | 31 | 62 | 10.5 |
| 239 | DARK RECALLED | **regular** | THE DARK | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 240 | DARK TWICE | **regular** | THE DARK | — | STANDARD | 11 | 44 | 48 | 30 | 60 | 12.6 |
| 241 | DARK PEAK | **regular** | THE DARK | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 13.7 |
| 242 | THE LEDGER | boss | THE DARK | ledger | STANDARD | 8 | 82 | 32 | 20 | 40 | — |
| 243 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 36 | 64 | 40 | 80 | 8.1 |
| 244 | BALLOONS AGAIN | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 59 | 37 | 74 | 6.9 |
| 245 | BALLOONS SPREAD | **regular** | THE BALLOON | — | STANDARD | 6 | 31 | 50 | 31 | 62 | 8 |
| 246 | BALLOONS FAR APART | **regular** | THE BALLOON | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 9 |
| 247 | BALLOON AND CHOIR | **regular** | THE BALLOON | — | STANDARD | 8 | 34 | 60 | 38 | 76 | 10 |
| 248 | EASY BALLOONS | **regular** | THE BALLOON | — | STANDARD | 7 | 39 | 58 | 36 | 72 | 8.5 |
| 249 | BALLOON RECALL | **regular** | THE BALLOON | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 9.5 |
| 250 | BALLOONS AND TWINS | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 70 | 44 | 88 | 10.5 |
| 251 | BALLOON PEAK | **regular** | THE BALLOON | — | STANDARD | 16 | 46 | 68 | 43 | 86 | 11.5 |
| 252 | THE SURGE | boss | THE BALLOON | surge | STANDARD | 8 | 76 | 44 | 28 | 56 | — |
| 253 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.9 |
| 254 | MOULTS AGAIN | **regular** | THE MOULT | — | STANDARD | 5 | 29 | 87 | 54 | 108 | 7.2 |
| 255 | MOULTS SPREAD | **regular** | THE MOULT | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 8.1 |
| 256 | MOULTS FAR APART | **regular** | THE MOULT | — | STANDARD | 6 | 28 | 87 | 54 | 108 | 9 |
| 257 | MOULT AND BALLOON | **regular** | THE MOULT | — | STANDARD | 8 | 35 | 107 | 67 | 134 | 10 |
| 258 | EASY MOULTS | **regular** | THE MOULT | — | STANDARD | 6 | 36 | 57 | 36 | 72 | 8.5 |
| 259 | MOULT RECALL | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 87 | 54 | 108 | 9.5 |
| 260 | MOULTS AND TWINS | **regular** | THE MOULT | — | STANDARD | 11 | 44 | 117 | 73 | 146 | 10.5 |
| 261 | MOULT PEAK | **regular** | THE MOULT | — | STANDARD | 15 | 45 | 77 | 48 | 96 | 11.7 |
| 262 | THE LEAD | boss | THE MOULT | lead | STANDARD | 8 | 84 | 40 | 25 | 50 | — |
| 263 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 46 | 48 | 30 | 60 | 9.9 |
| 264 | COILS AGAIN | **regular** | THE COIL | — | STANDARD | 6 | 31 | 33 | 21 | 42 | 7.5 |
| 265 | COILS SPREAD | **regular** | THE COIL | — | STANDARD | 6 | 30 | 67 | 42 | 84 | 8.1 |
| 266 | COILS FAR APART | **regular** | THE COIL | — | STANDARD | 6 | 27 | 77 | 48 | 96 | 8.4 |
| 267 | COIL AND MOULT | **regular** | THE COIL | — | STANDARD | 8 | 33 | 87 | 54 | 108 | 8.8 |
| 268 | EASY COILS | **regular** | THE COIL | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.5 |
| 269 | COIL RECALL | **regular** | THE COIL | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 7.2 |
| 270 | COILS AND TWINS | **regular** | THE COIL | — | STANDARD | 11 | 45 | 107 | 67 | 134 | 7.9 |
| 271 | THE TWITCH | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 272 | THE SCUTTLE | boss | THE COIL | scuttle | STANDARD | 0 | 0 | 48 | 30 | 60 | — |
| 273 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 39 | 24 | 48 | 8.4 |
| 274 | CODEX AGAIN | **regular** | THE CODEX | — | STANDARD | 5 | 26 | 77 | 48 | 96 | 10.1 |
| 275 | CODEX WIDE | **regular** | THE CODEX | — | STANDARD | 6 | 26 | 77 | 48 | 96 | 11 |
| 276 | CODEX AT THE EDGE | **regular** | THE CODEX | — | STANDARD | 6 | 29 | 77 | 48 | 96 | 12 |
| 277 | CODEX IN PAIRS | **regular** | THE CODEX | — | STANDARD | 10 | 37 | 77 | 48 | 96 | 13 |
| 278 | CODEX AT EASE | **regular** | THE CODEX | — | STANDARD | 6 | 36 | 47 | 29 | 58 | 11.5 |
| 279 | CODEX RECALLED | **regular** | THE CODEX | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 12.5 |
| 280 | CODEX TWICE | **regular** | THE CODEX | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 13.5 |
| 281 | CODEX PEAK | **regular** | THE CODEX | — | STANDARD | 15 | 43 | 97 | 61 | 122 | 14.6 |
| 282 | THE ANTIPHON | boss | THE CODEX | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 283 | THE LURE | intro | THE LURE | lure | STANDARD | 6 | 16 | 29 | 18 | 36 | 10.5 |
| 284 | LURES AGAIN | **regular** | THE LURE | — | STANDARD | 5 | 25 | 39 | 24 | 48 | 6.6 |
| 285 | LURES SPREAD | **regular** | THE LURE | — | STANDARD | 6 | 32 | 39 | 24 | 48 | 7.8 |
| 286 | LURES FAR APART | **regular** | THE LURE | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 9 |
| 287 | LURE AND COIL | **regular** | THE LURE | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 10 |
| 288 | EASY LURES | **regular** | THE LURE | — | STANDARD | 6 | 38 | 42 | 26 | 52 | 8.5 |
| 289 | LURE RECALL | **regular** | THE LURE | — | STANDARD | 8 | 37 | 51 | 32 | 64 | 9.5 |
| 290 | LURES AND TWINS | **regular** | THE LURE | — | STANDARD | 11 | 46 | 60 | 38 | 76 | 10.5 |
| 291 | LURE PEAK | **regular** | THE LURE | — | STANDARD | 15 | 46 | 53 | 33 | 66 | 11.5 |
| 292 | THE HIVE | boss | THE LURE | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 293 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 50 | 62 | 39 | 78 | 13.3 |
| 294 | JAM AGAIN | **regular** | THE JAM | — | STANDARD | 5 | 28 | 42 | 26 | 52 | 10.1 |
| 295 | JAM WIDE | **regular** | THE JAM | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 11.1 |
| 296 | JAM AT THE EDGE | **regular** | THE JAM | — | STANDARD | 6 | 28 | 36 | 23 | 46 | 12.1 |
| 297 | JAM IN PAIRS | **regular** | THE JAM | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 13.1 |
| 298 | JAM AT EASE | **regular** | THE JAM | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 11.6 |
| 299 | JAM RECALLED | **regular** | THE JAM | — | STANDARD | 10 | 40 | 47 | 29 | 58 | 12.6 |
| 300 | JAM TWICE | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 14 |
| 301 | JAM PEAK | **regular** | THE JAM | — | STANDARD | 18 | 45 | 50 | 31 | 62 | 15.1 |
| 302 | THE CAIRN | boss | THE JAM | cairn | STANDARD | 0 | 0 | 24 | 15 | 30 | — |
| 303 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 304 | CLASPS AGAIN | **regular** | THE CLASP | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 6.9 |
| 305 | CLASPS SPREAD | **regular** | THE CLASP | — | STANDARD | 6 | 31 | 45 | 28 | 56 | 7.2 |
| 306 | CLASPS FAR APART | **regular** | THE CLASP | — | STANDARD | 4 | 24 | 38 | 24 | 48 | 8.1 |
| 307 | CLASP AND LURE | **regular** | THE CLASP | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 8.7 |
| 308 | EASY CLASPS | **regular** | THE CLASP | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.1 |
| 309 | CLASP RECALL | **regular** | THE CLASP | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 8.1 |
| 310 | CLASPS AND TWINS | **regular** | THE CLASP | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.1 |
| 311 | CLASP PEAK | **regular** | THE CLASP | — | STANDARD | 16 | 48 | 62 | 39 | 78 | 10.1 |
| 312 | THE WELL | boss (special) | THE CLASP | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 313 | THE DART | intro | THE DART | dart | STANDARD | 5 | 26 | 29 | 18 | 36 | 7.2 |
| 314 | DARTS AGAIN | **regular** | THE DART | — | STANDARD | 5 | 26 | 34 | 21 | 42 | 7 |
| 315 | DARTS SPREAD | **regular** | THE DART | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 8.1 |
| 316 | DARTS FAR APART | **regular** | THE DART | — | STANDARD | 6 | 27 | 29 | 18 | 36 | 9 |
| 317 | DART AND CLASP | **regular** | THE DART | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 10 |
| 318 | EASY DARTS | **regular** | THE DART | — | STANDARD | 6 | 39 | 65 | 41 | 82 | 8.5 |
| 319 | DART RECALL | **regular** | THE DART | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 9.5 |
| 320 | DARTS AND TWINS | **regular** | THE DART | — | STANDARD | 12 | 47 | 50 | 31 | 62 | 10.5 |
| 321 | DART PEAK | **regular** | THE DART | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 11.5 |
| 322 | THE REPRISE | boss | THE DART | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 323 | THE ECHO | intro | THE ECHO | echo | STANDARD | 6 | 24 | 27 | 17 | 34 | 10.9 |
| 324 | ECHOES AGAIN | **regular** | THE ECHO | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 7.1 |
| 325 | ECHOES SPREAD | **regular** | THE ECHO | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 8.1 |
| 326 | ECHOES FAR APART | **regular** | THE ECHO | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 9 |
| 327 | ECHO AND DART | **regular** | THE ECHO | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 10 |
| 328 | EASY ECHOES | **regular** | THE ECHO | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 329 | ECHO RECALL | **regular** | THE ECHO | — | STANDARD | 8 | 39 | 48 | 30 | 60 | 9.3 |
| 330 | ECHOES AND TWINS | **regular** | THE ECHO | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 10.4 |
| 331 | ECHO PEAK | **regular** | THE ECHO | — | STANDARD | 15 | 47 | 50 | 31 | 62 | 11.5 |
| 332 | THE SPLICE | boss (special) | THE ECHO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 333 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD | 1 | 0 | 8 | 5 | 10 | 1.5 |
| 334 | GYRES AGAIN | **regular** | THE GYRE | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 7.2 |
| 335 | GYRES SPREAD | **regular** | THE GYRE | — | STANDARD | 5 | 26 | 29 | 18 | 36 | 8.1 |
| 336 | GYRES FAR APART | **regular** | THE GYRE | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 9 |
| 337 | GYRE AND ECHO | **regular** | THE GYRE | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 10 |
| 338 | EASY GYRES | **regular** | THE GYRE | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 8.7 |
| 339 | GYRE RECALL | **regular** | THE GYRE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 9.5 |
| 340 | GYRES AND TWINS | **regular** | THE GYRE | — | STANDARD | 11 | 43 | 51 | 32 | 64 | 10.5 |
| 341 | GYRE PEAK | **regular** | THE GYRE | — | STANDARD | 16 | 45 | 51 | 32 | 64 | 11.3 |
| 342 | THE FILAMENT | boss | THE GYRE | filament, panel | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 343 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 24 | 27 | 17 | 34 | 11 |
| 344 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 345 | HANDOVER AGAIN | **regular** | THE HANDOVER | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.1 |
| 346 | HANDOVER WIDE | **regular** | THE HANDOVER | — | STANDARD | 6 | 31 | 47 | 29 | 58 | 11 |
| 347 | HANDOVER AT THE EDGE | **regular** | THE HANDOVER | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 11.9 |
| 348 | HANDOVER IN PAIRS | **regular** | THE HANDOVER | — | STANDARD | 11 | 38 | 46 | 29 | 58 | 12.9 |
| 349 | HANDOVER AT EASE | **regular** | THE HANDOVER | — | STANDARD | 6 | 36 | 45 | 28 | 56 | 11.4 |
| 350 | HANDOVER RECALLED | **regular** | THE HANDOVER | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.4 |
| 351 | HANDOVER TWICE | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 51 | 32 | 64 | 13.4 |
| 352 | HANDOVER PEAK | **regular** | THE HANDOVER | — | STANDARD | 18 | 48 | 50 | 31 | 62 | 14.4 |
| 353 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 354 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 355 | LIDS AGAIN | **regular** | THE LID | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 7.3 |
| 356 | LIDS SPREAD | **regular** | THE LID | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 8.1 |
| 357 | LIDS FAR APART | **regular** | THE LID | — | STANDARD | 6 | 28 | 35 | 22 | 44 | 9 |
| 358 | LID AND GYRE | **regular** | THE LID | — | STANDARD | 8 | 36 | 50 | 31 | 62 | 10 |
| 359 | EASY LIDS | **regular** | THE LID | — | STANDARD | 6 | 33 | 49 | 31 | 62 | 8.5 |
| 360 | LID RECALL | **regular** | THE LID | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.5 |
| 361 | LIDS AND TWINS | **regular** | THE LID | — | STANDARD | 12 | 47 | 55 | 34 | 68 | 10.5 |
| 362 | LID PEAK | **regular** | THE LID | — | STANDARD | 16 | 46 | 54 | 34 | 68 | 11.5 |
| 363 | THE SPOOL | boss | THE LID | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 364 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD | 4 | 28 | 34 | 21 | 42 | 6.6 |
| 365 | RECOILS AGAIN | **regular** | THE RECOIL | — | STANDARD | 5 | 29 | 35 | 22 | 44 | 8.1 |
| 366 | RECOILS SPREAD | **regular** | THE RECOIL | — | STANDARD | 6 | 28 | 34 | 21 | 42 | 9 |
| 367 | RECOILS FAR APART | **regular** | THE RECOIL | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 9.9 |
| 368 | RECOIL AND LID | **regular** | THE RECOIL | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 10.9 |
| 369 | EASY RECOILS | **regular** | THE RECOIL | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 9.4 |
| 370 | RECOIL RECALL | **regular** | THE RECOIL | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 10.4 |
| 371 | RECOILS AND TWINS | **regular** | THE RECOIL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.4 |
| 372 | RECOIL PEAK | **regular** | THE RECOIL | — | STANDARD | 17 | 47 | 50 | 31 | 62 | 12.1 |
| 373 | THE HASP | boss | THE RECOIL | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 374 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 50 | 31 | 62 | 7.2 |
| 375 | CRYSTALS AGAIN | **regular** | THE CRYSTAL | — | STANDARD | 5 | 30 | 34 | 21 | 42 | 8.4 |
| 376 | CRYSTALS SPREAD | **regular** | THE CRYSTAL | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 9.6 |
| 377 | CRYSTALS FAR APART | **regular** | THE CRYSTAL | — | STANDARD | 6 | 29 | 37 | 23 | 46 | 10.6 |
| 378 | CRYSTAL AND RECOIL | **regular** | THE CRYSTAL | — | STANDARD | 11 | 37 | 43 | 27 | 54 | 11.6 |
| 379 | EASY CRYSTALS | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 63 | 39 | 78 | 10 |
| 380 | CRYSTAL RECALL | **regular** | THE CRYSTAL | — | STANDARD | 8 | 35 | 49 | 31 | 62 | 11 |
| 381 | CRYSTALS AND TWINS | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 12.2 |
| 382 | CRYSTAL PEAK | **regular** | THE CRYSTAL | — | STANDARD | 18 | 46 | 56 | 35 | 70 | 13.2 |
| 383 | THE RATCHET | boss | THE CRYSTAL | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 384 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 56 | 35 | 70 | 3.3 |
| 385 | VOLLEYS AGAIN | **regular** | THE VOLLEY | — | STANDARD | 5 | 31 | 61 | 38 | 76 | 8.7 |
| 386 | VOLLEYS SPREAD | **regular** | THE VOLLEY | — | STANDARD | 4 | 24 | 49 | 31 | 62 | 9.6 |
| 387 | VOLLEYS FAR APART | **regular** | THE VOLLEY | — | STANDARD | 6 | 27 | 47 | 29 | 58 | 10.5 |
| 388 | VOLLEY AND CRYSTAL | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 63 | 39 | 78 | 11.5 |
| 389 | EASY VOLLEYS | **regular** | THE VOLLEY | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 390 | VOLLEY RECALL | **regular** | THE VOLLEY | — | STANDARD | 10 | 40 | 60 | 38 | 76 | 11 |
| 391 | VOLLEYS AND TWINS | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 70 | 44 | 88 | 12 |
| 392 | VOLLEY PEAK | **regular** | THE VOLLEY | — | STANDARD | 15 | 45 | 68 | 43 | 86 | 13.1 |
| 393 | THE NETTLE | boss | THE VOLLEY | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 394 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 395 | FLIP AGAIN | **regular** | THE FLIP | — | STANDARD | 5 | 29 | 51 | 32 | 64 | 10.1 |
| 396 | FLIP WIDE | **regular** | THE FLIP | — | STANDARD | 6 | 30 | 46 | 29 | 58 | 11 |
| 397 | FLIP AT THE EDGE | **regular** | THE FLIP | — | STANDARD | 6 | 28 | 54 | 34 | 68 | 11.9 |
| 398 | FLIP IN PAIRS | **regular** | THE FLIP | — | STANDARD | 10 | 40 | 64 | 40 | 80 | 12.9 |
| 399 | FLIP AT EASE | **regular** | THE FLIP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.4 |
| 400 | FLIP RECALLED | **regular** | THE FLIP | — | STANDARD | 10 | 39 | 58 | 36 | 72 | 12.4 |
| 401 | FLIP TWICE | **regular** | THE FLIP | — | STANDARD | 12 | 45 | 69 | 43 | 86 | 13.4 |
| 402 | FLIP PEAK | **regular** | THE FLIP | — | STANDARD | 18 | 46 | 66 | 41 | 82 | 14.3 |
| 403 | THE MANTLE | boss | THE FLIP | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 404 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 405 | CRAWLERS AGAIN | **regular** | THE CRAWLER | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 9 |
| 406 | CRAWLERS SPREAD | **regular** | THE CRAWLER | — | STANDARD | 6 | 31 | 55 | 34 | 68 | 9.9 |
| 407 | CRAWLERS FAR APART | **regular** | THE CRAWLER | — | STANDARD | 6 | 30 | 54 | 34 | 68 | 10.5 |
| 408 | CRAWLER AND VOLLEY | **regular** | THE CRAWLER | — | STANDARD | 11 | 34 | 64 | 40 | 80 | 11.5 |
| 409 | EASY CRAWLERS | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 49 | 31 | 62 | 10 |
| 410 | CRAWLER RECALL | **regular** | THE CRAWLER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 411 | CRAWLERS AND TWINS | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 62 | 39 | 78 | 12 |
| 412 | CRAWLER PEAK | **regular** | THE CRAWLER | — | STANDARD | 17 | 46 | 70 | 44 | 88 | 13 |
| 413 | THE KEEL | boss | THE CRAWLER | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 414 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 30 | 33 | 21 | 42 | 12.5 |
| 415 | MINES AGAIN | **regular** | THE MINE | — | STANDARD | 5 | 30 | 38 | 24 | 48 | 9.3 |
| 416 | MINES SPREAD | **regular** | THE MINE | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 9.9 |
| 417 | MINES FAR APART | **regular** | THE MINE | — | STANDARD | 6 | 28 | 39 | 24 | 48 | 10.5 |
| 418 | MINE AND CRAWLER | **regular** | THE MINE | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.5 |
| 419 | EASY MINES | **regular** | THE MINE | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 10 |
| 420 | MINE RECALL | **regular** | THE MINE | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 11 |
| 421 | MINES AND TWINS | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12 |
| 422 | MINE PEAK | **regular** | THE MINE | — | STANDARD | 18 | 47 | 107 | 67 | 134 | 13.1 |
| 423 | THE VALVE | boss | THE MINE | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 424 | THE VEIL | intro | THE VEIL | veil | STANDARD | 5 | 24 | 27 | 17 | 34 | 6.3 |
| 425 | VEILS AGAIN | **regular** | THE VEIL | — | STANDARD | 5 | 31 | 33 | 21 | 42 | 9.9 |
| 426 | VEILS SPREAD | **regular** | THE VEIL | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 427 | VEILS FAR APART | **regular** | THE VEIL | — | STANDARD | 6 | 28 | 30 | 19 | 38 | 11.1 |
| 428 | VEIL AND MINE | **regular** | THE VEIL | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 11.7 |
| 429 | EASY VEILS | **regular** | THE VEIL | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 10 |
| 430 | VEIL RECALL | **regular** | THE VEIL | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 11 |
| 431 | VEILS AND TWINS | **regular** | THE VEIL | — | STANDARD | 13 | 47 | 49 | 31 | 62 | 12 |
| 432 | VEIL PEAK | **regular** | THE VEIL | — | STANDARD | 15 | 44 | 46 | 29 | 58 | 13 |
| 433 | THE SEAM | boss | THE VEIL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 434 | THE WISP | intro | THE WISP | wisp | STANDARD | 3 | 28 | 31 | 19 | 38 | 3 |
| 435 | WISPS AGAIN | **regular** | THE WISP | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 10.2 |
| 436 | WISPS SPREAD | **regular** | THE WISP | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 10.5 |
| 437 | WISPS FAR APART | **regular** | THE WISP | — | STANDARD | 6 | 26 | 54 | 34 | 68 | 10.8 |
| 438 | WISP AND VEIL | **regular** | THE WISP | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 11.6 |
| 439 | EASY WISPS | **regular** | THE WISP | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 10 |
| 440 | WISP RECALL | **regular** | THE WISP | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11 |
| 441 | WISPS AND TWINS | **regular** | THE WISP | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 12 |
| 442 | WISP PEAK | **regular** | THE WISP | — | STANDARD | 18 | 47 | 53 | 33 | 66 | 13 |
| 443 | THE OCULUS | boss | THE WISP | oculus | STANDARD | 17 | 86 | 21 | 13 | 26 | — |
| 444 | THE GHOST | intro | THE GHOST | ghost | STANDARD | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 445 | GHOSTS AGAIN | **regular** | THE GHOST | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.2 |
| 446 | GHOSTS SPREAD | **regular** | THE GHOST | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 10.5 |
| 447 | GHOSTS FAR APART | **regular** | THE GHOST | — | STANDARD | 6 | 25 | 28 | 18 | 36 | 11.1 |
| 448 | GHOST AND WISP | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 449 | EASY GHOSTS | **regular** | THE GHOST | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 10 |
| 450 | GHOST RECALL | **regular** | THE GHOST | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11 |
| 451 | GHOSTS AND TWINS | **regular** | THE GHOST | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 11.9 |
| 452 | GHOST PEAK | **regular** | THE GHOST | — | STANDARD | 15 | 42 | 45 | 28 | 56 | 12.9 |
| 453 | THE VISE | boss | THE GHOST | vise | STANDARD | 0 | 0 | 39 | 24 | 48 | — |
| 454 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 43 | 27 | 54 | 7.2 |
| 455 | CAROMS AGAIN | **regular** | THE CAROM | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 456 | CAROMS SPREAD | **regular** | THE CAROM | — | STANDARD | 6 | 27 | 36 | 23 | 46 | 10.5 |
| 457 | CAROMS FAR APART | **regular** | THE CAROM | — | STANDARD | 6 | 25 | 35 | 22 | 44 | 11.1 |
| 458 | CAROM AND GHOST | **regular** | THE CAROM | — | STANDARD | 11 | 40 | 54 | 34 | 68 | 11.9 |
| 459 | EASY CAROMS | **regular** | THE CAROM | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 460 | CAROM RECALL | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11 |
| 461 | CAROMS AND TWINS | **regular** | THE CAROM | — | STANDARD | 12 | 45 | 56 | 35 | 70 | 12 |
| 462 | CAROM PEAK | **regular** | THE CAROM | — | STANDARD | 18 | 46 | 51 | 32 | 64 | 13.1 |
| 463 | THE PLUMB | boss | THE CAROM | plumb | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 464 | CAROMS RETURN | **regular** | CAROMS RETURN | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 10.2 |
| 465 | CAROMS WIDER | **regular** | CAROMS RETURN | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 10.5 |
| 466 | CAROMS OUT WIDE | **regular** | CAROMS RETURN | — | STANDARD | 6 | 29 | 34 | 21 | 42 | 10.8 |
| 467 | CAROMS IN PAIRS | **regular** | CAROMS RETURN | — | STANDARD | 10 | 36 | 46 | 29 | 58 | 11.7 |
| 468 | CAROMS AT REST | **regular** | CAROMS RETURN | — | STANDARD | 7 | 36 | 44 | 28 | 56 | 10 |
| 469 | CAROMS RECALLED | **regular** | CAROMS RETURN | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 11 |
| 470 | CAROMS DOUBLED | **regular** | CAROMS RETURN | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 12 |
| 471 | CAROMS SUMMIT | **regular** | CAROMS RETURN | — | STANDARD | 17 | 48 | 62 | 39 | 78 | 13 |
| 472 | THE SLING | boss | CAROMS RETURN | sling | STANDARD | 0 | 0 | 40 | 25 | 50 | — |
| 473 | GHOSTS RETURN | **regular** | GHOSTS RETURN | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.5 |
| 474 | GHOSTS WIDER | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 11.1 |
| 475 | GHOSTS OUT WIDE | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 11.4 |
| 476 | GHOSTS IN PAIRS | **regular** | GHOSTS RETURN | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 11.8 |
| 477 | GHOSTS AT REST | **regular** | GHOSTS RETURN | — | STANDARD | 6 | 33 | 41 | 26 | 52 | 10 |
| 478 | GHOSTS RECALLED | **regular** | GHOSTS RETURN | — | STANDARD | 10 | 40 | 61 | 38 | 76 | 11 |
| 479 | GHOSTS DOUBLED | **regular** | GHOSTS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 480 | GHOSTS SUMMIT | **regular** | GHOSTS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 481 | THE CAPSTAN | boss | GHOSTS RETURN | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 482 | WISPS RETURN | **regular** | WISPS RETURN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 483 | WISPS WIDER | **regular** | WISPS RETURN | — | STANDARD | 6 | 32 | 34 | 21 | 42 | 10.5 |
| 484 | WISPS OUT WIDE | **regular** | WISPS RETURN | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 11.1 |
| 485 | WISPS IN PAIRS | **regular** | WISPS RETURN | — | STANDARD | 11 | 36 | 40 | 25 | 50 | 12 |
| 486 | WISPS AT REST | **regular** | WISPS RETURN | — | STANDARD | 7 | 40 | 63 | 39 | 78 | 10 |
| 487 | WISPS RECALLED | **regular** | WISPS RETURN | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 11 |
| 488 | WISPS DOUBLED | **regular** | WISPS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 489 | WISPS SUMMIT | **regular** | WISPS RETURN | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13 |
| 490 | THE GALL | boss | WISPS RETURN | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 491 | VEILS RETURN | **regular** | VEILS RETURN | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.2 |
| 492 | VEILS WIDER | **regular** | VEILS RETURN | — | STANDARD | 6 | 28 | 32 | 20 | 40 | 10.5 |
| 493 | VEILS OUT WIDE | **regular** | VEILS RETURN | — | STANDARD | 6 | 26 | 29 | 18 | 36 | 11.1 |
| 494 | VEILS IN PAIRS | **regular** | VEILS RETURN | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11.8 |
| 495 | VEILS AT REST | **regular** | VEILS RETURN | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 10 |
| 496 | VEILS RECALLED | **regular** | VEILS RETURN | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 11 |
| 497 | VEILS DOUBLED | **regular** | VEILS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 498 | VEILS SUMMIT | **regular** | VEILS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 12.6 |
| 499 | THE TRAPEZE | boss | VEILS RETURN | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 500 | MINES RETURN | **regular** | MINES RETURN | — | STANDARD | 5 | 29 | 38 | 24 | 48 | 10.2 |
| 501 | MINES WIDER | **regular** | MINES RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 10.5 |
| 502 | MINES OUT WIDE | **regular** | MINES RETURN | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 11.4 |
| 503 | MINES IN PAIRS | **regular** | MINES RETURN | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 11.8 |
| 504 | MINES AT REST | **regular** | MINES RETURN | — | STANDARD | 6 | 37 | 45 | 28 | 56 | 10 |
| 505 | MINES RECALLED | **regular** | MINES RETURN | — | STANDARD | 10 | 37 | 39 | 24 | 48 | 11 |
| 506 | MINES DOUBLED | **regular** | MINES RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 507 | MINES SUMMIT | **regular** | MINES RETURN | — | STANDARD | 19 | 48 | 50 | 31 | 62 | 13 |
| 508 | THE FLUE | boss | MINES RETURN | flue, panel | SHOTS | 0 | 0 | 70 | 44 | 88 | — |
| 509 | CRAWLERS RETURN | **regular** | CRAWLERS RETURN | — | STANDARD | 5 | 28 | 58 | 36 | 72 | 10.1 |
| 510 | CRAWLERS WIDER | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 32 | 57 | 36 | 72 | 10.5 |
| 511 | CRAWLERS OUT WIDE | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 28 | 52 | 33 | 66 | 11.1 |
| 512 | CRAWLERS IN PAIRS | **regular** | CRAWLERS RETURN | — | STANDARD | 10 | 37 | 67 | 42 | 84 | 11.8 |
| 513 | CRAWLERS AT REST | **regular** | CRAWLERS RETURN | — | STANDARD | 6 | 34 | 51 | 32 | 64 | 10 |
| 514 | CRAWLERS RECALLED | **regular** | CRAWLERS RETURN | — | STANDARD | 10 | 39 | 52 | 33 | 66 | 11.1 |
| 515 | CRAWLERS DOUBLED | **regular** | CRAWLERS RETURN | — | STANDARD | 14 | 48 | 73 | 46 | 92 | 12.1 |
| 516 | CRAWLERS SUMMIT | **regular** | CRAWLERS RETURN | — | STANDARD | 19 | 48 | 70 | 44 | 88 | 13.2 |
| 517 | THE GOVERNOR | boss | CRAWLERS RETURN | governor | STANDARD | 0 | 0 | 22 | 14 | 28 | — |
| 518 | VOLLEYS RETURN | **regular** | VOLLEYS RETURN | — | STANDARD | 5 | 31 | 53 | 33 | 66 | 10.5 |
| 519 | VOLLEYS WIDER | **regular** | VOLLEYS RETURN | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 11.1 |
| 520 | VOLLEYS OUT WIDE | **regular** | VOLLEYS RETURN | — | STANDARD | 6 | 26 | 46 | 29 | 58 | 11.4 |
| 521 | VOLLEYS IN PAIRS | **regular** | VOLLEYS RETURN | — | STANDARD | 12 | 36 | 58 | 36 | 72 | 11.8 |
| 522 | VOLLEYS AT REST | **regular** | VOLLEYS RETURN | — | STANDARD | 7 | 39 | 59 | 37 | 74 | 10 |
| 523 | VOLLEYS RECALLED | **regular** | VOLLEYS RETURN | — | STANDARD | 10 | 39 | 69 | 43 | 86 | 11 |
| 524 | VOLLEYS DOUBLED | **regular** | VOLLEYS RETURN | — | STANDARD | 14 | 48 | 68 | 43 | 86 | 12 |
| 525 | VOLLEYS SUMMIT | **regular** | VOLLEYS RETURN | — | STANDARD | 19 | 46 | 66 | 41 | 82 | 13 |
| 526 | THE LAMPREY | boss | VOLLEYS RETURN | lamprey | STANDARD | 0 | 0 | 130 | 81 | 162 | — |
| 527 | CRYSTALS RETURN | **regular** | CRYSTALS RETURN | — | STANDARD | 5 | 28 | 34 | 21 | 42 | 10.5 |
| 528 | CRYSTALS WIDER | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 10.8 |
| 529 | CRYSTALS OUT WIDE | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.4 |
| 530 | CRYSTALS IN PAIRS | **regular** | CRYSTALS RETURN | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.8 |
| 531 | CRYSTALS AT REST | **regular** | CRYSTALS RETURN | — | STANDARD | 6 | 37 | 43 | 27 | 54 | 10 |
| 532 | CRYSTALS RECALLED | **regular** | CRYSTALS RETURN | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 533 | CRYSTALS DOUBLED | **regular** | CRYSTALS RETURN | — | STANDARD | 14 | 47 | 51 | 32 | 64 | 12 |
| 534 | CRYSTALS SUMMIT | **regular** | CRYSTALS RETURN | — | STANDARD | 16 | 43 | 47 | 29 | 58 | 13 |
| 535 | THE MIMIC | boss | CRYSTALS RETURN | mimic | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 536 | RECOILS RETURN | **regular** | RECOILS RETURN | — | STANDARD | 5 | 29 | 32 | 20 | 40 | 10.2 |
| 537 | RECOILS WIDER | **regular** | RECOILS RETURN | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 10.5 |
| 538 | RECOILS OUT WIDE | **regular** | RECOILS RETURN | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 11.1 |
| 539 | RECOILS IN PAIRS | **regular** | RECOILS RETURN | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.1 |
| 540 | RECOILS AT REST | **regular** | RECOILS RETURN | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 541 | RECOILS RECALLED | **regular** | RECOILS RETURN | — | STANDARD | 10 | 39 | 45 | 28 | 56 | 11 |
| 542 | RECOILS DOUBLED | **regular** | RECOILS RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 12 |
| 543 | RECOILS SUMMIT | **regular** | RECOILS RETURN | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 13 |
| 544 | THE LATCH | boss | RECOILS RETURN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 545 | LIDS RETURN | **regular** | LIDS RETURN | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 10.2 |
| 546 | LIDS WIDER | **regular** | LIDS RETURN | — | STANDARD | 6 | 27 | 53 | 33 | 66 | 10.5 |
| 547 | LIDS OUT WIDE | **regular** | LIDS RETURN | — | STANDARD | 6 | 26 | 30 | 19 | 38 | 11.1 |
| 548 | LIDS IN PAIRS | **regular** | LIDS RETURN | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12 |
| 549 | LIDS AT REST | **regular** | LIDS RETURN | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 10 |
| 550 | LIDS RECALLED | **regular** | LIDS RETURN | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 11 |
| 551 | LIDS DOUBLED | **regular** | LIDS RETURN | — | STANDARD | 14 | 48 | 53 | 33 | 66 | 12 |
| 552 | LIDS SUMMIT | **regular** | LIDS RETURN | — | STANDARD | 19 | 46 | 52 | 33 | 66 | 13.1 |
| 553 | THE CHRYSALIS | boss | LIDS RETURN | chrysalis | STANDARD 5 | 0 | 0 | 74 | 46 | 92 | — |
| 554 | GYRES RETURN | **regular** | GYRES RETURN | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 10.2 |
| 555 | GYRES WIDER | **regular** | GYRES RETURN | — | STANDARD | 6 | 30 | 44 | 28 | 56 | 11.1 |
| 556 | GYRES OUT WIDE | **regular** | GYRES RETURN | — | STANDARD | 6 | 28 | 42 | 26 | 52 | 12 |
| 557 | GYRES IN PAIRS | **regular** | GYRES RETURN | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.4 |
| 558 | GYRES AT REST | **regular** | GYRES RETURN | — | STANDARD | 6 | 36 | 40 | 25 | 50 | 9.8 |
| 559 | GYRES RECALLED | **regular** | GYRES RETURN | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 10.8 |
| 560 | GYRES DOUBLED | **regular** | GYRES RETURN | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.8 |
| 561 | GYRES SUMMIT | **regular** | GYRES RETURN | — | STANDARD | 18 | 47 | 52 | 33 | 66 | 12.7 |
| 562 | THE HYDRA | boss | GYRES RETURN | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 22 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 40 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 50 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 60 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 70 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 80 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 90 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 100 | THE VANE | normal | 51 beats | 32 | 64 s | in band |
| 110 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 120 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 130 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 140 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 150 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 160 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 170 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 180 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 190 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 200 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 212 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 222 | THE TASTER | normal | 43 beats | 27 | 54 s | short |
| 232 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 242 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 252 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 262 | THE LEAD | normal | 40 beats | 25 | 50 s | short |
| 272 | THE SCUTTLE | normal | 48 beats | 30 | 60 s | in band |
| 282 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 292 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 302 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 312 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 322 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 332 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 342 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 353 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 363 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 373 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 383 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 393 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 403 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 413 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 423 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 433 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 443 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 453 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 463 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 472 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 481 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 490 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 499 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 508 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 517 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 526 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 535 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 544 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 553 | THE CHRYSALIS | normal | 74 beats | 46 | 92 s | in band |
| 562 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
