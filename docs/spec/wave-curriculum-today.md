# The waves today, measured

> **Status: a measurement of 2026-10-19**, the evidence for
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
| regular | 83 | 0 | 17 | 31 | 44 | 42 min | 1 h 23 min |
| intro | 64 | 0 | 3 | 26 | 51 | 30 min | 60 min |
| boss | 61 | 0 | 9 | 31 | 343 | 51 min | 1 h 42 min |
| every wave | 208 | 0 | 3 | 29 | 343 | 2 h 2 min | 4 h 5 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro, no guide | FIRST STEP | slick, panel | STANDARD 1 | 9 | 64 | 67 | 42 | 84 | 2.4 |
| 2 | RED TANGO | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 41 | 44 | 28 | 56 | 5.4 |
| 3 | THE MOTH | boss | FIRST STEP | moth | STANDARD 1 | 0 | 0 | 44 | 28 | 56 | — |
| 4 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 4 | 24 | 27 | 17 | 34 | 1.4 |
| 5 | CYAN RAPTURE | **regular** | CYAN | — | STANDARD 2 | 8 | 42 | 45 | 28 | 56 | 4.6 |
| 6 | THE BROOD | boss | CYAN | brood | STANDARD 2 | 0 | 0 | 40 | 25 | 50 | — |
| 7 | THE ECHO | intro | THE ECHO | echo | STANDARD 2 | 6 | 44 | 47 | 29 | 58 | 4 |
| 8 | ECHO SAGA | **regular** | THE ECHO | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 8.4 |
| 9 | THE STRAND | intro | THE STRAND | strand | STANDARD 2 | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 10 | ANCIENT STRAND | **regular** | THE STRAND | — | STANDARD 2 | 6 | 36 | 41 | 26 | 52 | 8.5 |
| 11 | THE VEIL | intro | THE VEIL | veil | STANDARD 2 | 5 | 34 | 37 | 23 | 46 | 3.3 |
| 12 | VEIL HOMECOMING | **regular** | THE VEIL | — | STANDARD 2 | 6 | 38 | 44 | 28 | 56 | 8.1 |
| 13 | THE SHELL | intro | THE SHELL | shell | STANDARD 2 | 2 | 10 | 15 | 9 | 18 | 3 |
| 14 | SHELL SAGA | **regular** | THE SHELL | — | STANDARD 2 | 6 | 38 | 43 | 27 | 54 | 8 |
| 15 | HOLD AND AIM | intro | THE SHELL | — | STANDARD 2 | 6 | 33 | 36 | 23 | 46 | 6.8 |
| 16 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD 2 | 5 | 52 | 55 | 34 | 68 | 3.9 |
| 17 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 8.1 |
| 18 | THE THROB | intro | THE THROB | throb | STANDARD 2 | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 19 | THROB RELIC | **regular** | THE THROB | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 8.5 |
| 20 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD 2 | 4 | 32 | 38 | 24 | 48 | 3.9 |
| 21 | OLD RECOIL SONG | **regular** | THE RECOIL | — | STANDARD 2 | 6 | 37 | 43 | 27 | 54 | 8.6 |
| 22 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD 2 | 1 | 0 | 10 | 6 | 12 | 1.5 |
| 23 | GYRE LEGEND | **regular** | THE GYRE | — | STANDARD 2 | 6 | 37 | 47 | 29 | 58 | 8.8 |
| 24 | THE LURE | intro | THE LURE | lure | STANDARD 2 | 6 | 40 | 47 | 29 | 58 | 3.9 |
| 25 | LURE REUNION | **regular** | THE LURE | — | STANDARD 2 | 6 | 37 | 52 | 33 | 66 | 8.4 |
| 26 | THE RIND | intro | THE RIND | rind | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 27 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD 2 | 6 | 35 | 40 | 25 | 50 | 8.8 |
| 28 | THE DART | intro | THE DART | dart | STANDARD 2 | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 29 | DART HOMECOMING | **regular** | THE DART | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 30 | THE COUNT | intro | THE COUNT | countdown | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 31 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD 2 | 6 | 36 | 39 | 24 | 48 | 9.5 |
| 32 | THE GHOST | intro | THE GHOST | ghost | STANDARD 2 | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 33 | GHOST LEGEND | **regular** | THE GHOST | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 9.3 |
| 34 | THE WISP | intro | THE WISP | wisp | STANDARD 2 | 3 | 28 | 31 | 19 | 38 | 3 |
| 35 | WISP LEGEND | **regular** | THE WISP | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9.4 |
| 36 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 35 | 22 | 44 | 1.4 |
| 37 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 45 | 28 | 56 | 5 |
| 38 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 17 | 11 | 22 | 5.8 |
| 39 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 25 | 16 | 32 | 10.8 |
| 40 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 22 | 25 | 16 | 32 | 3.3 |
| 41 | TORCH LEGEND | **regular** | TORCH | — | STANDARD 4 | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 42 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 43 | TAP | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 44 | ANCIENT TAP | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.5 |
| 45 | HOLD | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 46 | HOLD HOMECOMING | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.1 |
| 47 | SWIPE | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 48 | SWIPE LEGEND | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.3 |
| 49 | TURN | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 50 | TURN SAGA | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 8.2 |
| 51 | RUB | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 52 | RUB SAGA | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 8.4 |
| 53 | COMBO | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 54 | COMBO REUNION | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 7.7 |
| 55 | LEVER | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 56 | LEVER LEGEND | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 42 | 26 | 52 | 8.3 |
| 57 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 87 | 54 | 108 | — |
| 58 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 59 | SALVAGE LEGEND | **regular** | SALVAGE | — | STANDARD 5 | 4 | 32 | 35 | 22 | 44 | 4.2 |
| 60 | BULB QUEEN | boss | SALVAGE | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 61 | CATCH AND AIM | intro | SALVAGE | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 2.4 |
| 62 | LONG AIM ROAD | **regular** | SALVAGE | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 63 | FINALE | boss | SALVAGE | matron | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 64 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 17 | 11 | 22 | 2.4 |
| 65 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 66 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 67 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 35 | 22 | 44 | 3.6 |
| 68 | MORSEL SAGA | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 45 | 48 | 30 | 60 | 7.6 |
| 69 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 70 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 71 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 28 | 18 | 36 | 3.6 |
| 72 | THE GEODE | boss | THE LANCE | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 73 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 74 | SEEDER REUNION | **regular** | THE SEEDER | — | STANDARD | 9 | 47 | 57 | 36 | 72 | 7.7 |
| 75 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 76 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 2.8 |
| 77 | OLD CROSSING SONG | **regular** | THE CROSSING | — | STANDARD | 9 | 48 | 57 | 36 | 72 | 7.8 |
| 78 | THE MAZE | boss (special) | THE CROSSING | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 79 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 69 | 43 | 86 | 5 |
| 80 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 44 | 56 | 35 | 70 | 11.3 |
| 81 | THE GAUGE | boss (special) | THE LIMPET | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 82 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 83 | BEATBOX LEGEND | **regular** | THE BEATBOX | — | STANDARD | 9 | 46 | 49 | 31 | 62 | 8 |
| 84 | THE FLEET | boss (special) | THE BEATBOX | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 85 | HOLD TOGETHER | intro | HOLD TOGETHER | blisterBoth | STANDARD | 5 | 42 | 46 | 29 | 58 | 3.9 |
| 86 | OLD TOGETHER SONG | **regular** | HOLD TOGETHER | — | STANDARD | 9 | 46 | 50 | 31 | 62 | 8.1 |
| 87 | THE PLUMB | boss | HOLD TOGETHER | plumb | STANDARD | 0 | 0 | 45 | 28 | 56 | — |
| 88 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 89 | LEECH SAGA | **regular** | THE LEECH | — | STANDARD | 8 | 48 | 62 | 39 | 78 | 11.2 |
| 90 | THE LAMPREY | boss | THE LEECH | lamprey | STANDARD | 0 | 0 | 132 | 83 | 166 | — |
| 91 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 92 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 10 | 46 | 55 | 34 | 68 | 8.2 |
| 93 | THE HIVE | boss | HEAVY ROCKS | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 94 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 57 | 36 | 72 | 3.6 |
| 95 | VEER REUNION | **regular** | THE VEER | — | STANDARD | 9 | 48 | 51 | 32 | 64 | 8.3 |
| 96 | SNAKE | boss (special) | THE VEER | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 97 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 98 | CHOKE REUNION | **regular** | THE CHOKE | — | STANDARD | 9 | 45 | 56 | 35 | 70 | 9.5 |
| 99 | THE WARDEN | boss | THE CHOKE | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 100 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 34 | 21 | 42 | 1.5 |
| 101 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 66 | 41 | 82 | 4.5 |
| 102 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 58 | 36 | 72 | 1.5 |
| 103 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 9 | 46 | 49 | 31 | 62 | 8.4 |
| 104 | THE STARE | boss | THE FENCE | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 105 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 106 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 9 | 44 | 47 | 29 | 58 | 8.5 |
| 107 | THE VISE | boss | THE CHOIR | vise | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 108 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 109 | CLAW HOMECOMING | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 110 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 111 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 75 | 47 | 94 | 4.5 |
| 112 | BALLOON LEGEND | **regular** | THE BALLOON | — | STANDARD | 9 | 46 | 58 | 36 | 72 | 8.6 |
| 113 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 114 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.3 |
| 115 | MOULT RELIC | **regular** | THE MOULT | — | STANDARD | 9 | 45 | 67 | 42 | 84 | 8.7 |
| 116 | THE CHRYSALIS | boss | THE MOULT | chrysalis | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 117 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 118 | DARK LEGEND | **regular** | THE DARK | — | STANDARD | 9 | 46 | 55 | 34 | 68 | 9.4 |
| 119 | THE CURTAIN | boss | THE DARK | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 120 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 5.6 |
| 121 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 122 | PINBALL | boss (special) | THE COIL | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 123 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 77 | 48 | 96 | 6.2 |
| 124 | OLD JAM SONG | **regular** | THE JAM | — | STANDARD | 10 | 48 | 67 | 42 | 84 | 9.3 |
| 125 | THE SCOUT | boss (special) | THE JAM | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 126 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 127 | CLASP HOMECOMING | **regular** | THE CLASP | — | STANDARD | 9 | 46 | 49 | 31 | 62 | 8.8 |
| 128 | THE BATON | boss | THE CLASP | baton | STANDARD | 0 | 0 | 286 | 179 | 358 | — |
| 129 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 130 | ANCIENT LID | **regular** | THE LID | — | STANDARD | 9 | 46 | 49 | 31 | 62 | 8.9 |
| 131 | THE OCULUS | boss | THE LID | oculus | STANDARD | 17 | 86 | 25 | 16 | 32 | — |
| 132 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.4 |
| 133 | CODEX LEGEND | **regular** | THE CODEX | — | STANDARD | 8 | 47 | 50 | 31 | 62 | 9.6 |
| 134 | THE HAUL | boss (special) | THE CODEX | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 135 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 51 | 32 | 64 | 7.2 |
| 136 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 9 | 46 | 49 | 31 | 62 | 9 |
| 137 | THE PULSE | boss (special) | THE CRYSTAL | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 138 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 57 | 36 | 72 | 3.3 |
| 139 | VOLLEY LEGEND | **regular** | THE VOLLEY | — | STANDARD | 8 | 43 | 60 | 38 | 76 | 9.1 |
| 140 | THE GORGE | boss | THE VOLLEY | gorge | STANDARD | 10 | 82 | 259 | 162 | 324 | — |
| 141 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 142 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 143 | HANDOVER LEGEND | **regular** | THE HANDOVER | — | STANDARD | 11 | 45 | 52 | 33 | 66 | 11.6 |
| 144 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 145 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 146 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 9 | 46 | 49 | 31 | 62 | 9.2 |
| 147 | THE UNDERTOW | boss | THE CRAWLER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 148 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 149 | OLD FLIP SONG | **regular** | THE FLIP | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 11.9 |
| 150 | THE VANE | boss | THE FLIP | vane | STANDARD 5 | 2 | 3 | 82 | 51 | 102 | — |
| 151 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 36 | 39 | 24 | 48 | 6.3 |
| 152 | MINE SAGA | **regular** | THE MINE | — | STANDARD | 9 | 47 | 50 | 31 | 62 | 9.3 |
| 153 | THE MIMIC | boss | THE MINE | mimic, panel | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 154 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 44 | 28 | 56 | 7.2 |
| 155 | OLD CAROM SONG | **regular** | THE CAROM | — | STANDARD | 9 | 46 | 52 | 33 | 66 | 9.4 |
| 156 | THE TASTER | boss | THE CAROM | taster | STANDARD | 10 | 80 | 44 | 28 | 56 | — |
| 157 | ANCIENT LEDGER | **regular** | ANCIENT LEDGER | — | STANDARD | 9 | 42 | 46 | 29 | 58 | 9.9 |
| 158 | THE LEDGER | boss | ANCIENT LEDGER | ledger | STANDARD | 8 | 82 | 33 | 21 | 42 | — |
| 159 | SURGE SAGA | **regular** | SURGE SAGA | — | STANDARD | 12 | 47 | 57 | 36 | 72 | 10 |
| 160 | THE SURGE | boss | SURGE SAGA | surge | STANDARD | 8 | 76 | 45 | 28 | 56 | — |
| 161 | ANCIENT LEAD | **regular** | ANCIENT LEAD | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 10.1 |
| 162 | THE LEAD | boss | ANCIENT LEAD | lead | STANDARD | 8 | 84 | 41 | 26 | 52 | — |
| 163 | SCUTTLE LEGEND | **regular** | SCUTTLE LEGEND | — | STANDARD | 11 | 45 | 52 | 33 | 66 | 10.2 |
| 164 | THE SCUTTLE | boss | SCUTTLE LEGEND | scuttle | STANDARD | 0 | 0 | 49 | 31 | 62 | — |
| 165 | ANTIPHON RELIC | **regular** | ANTIPHON RELIC | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 10.3 |
| 166 | THE ANTIPHON | boss | ANTIPHON RELIC | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 167 | SPLICE HOMECOMING | **regular** | SPLICE HOMECOMING | — | STANDARD | 11 | 47 | 54 | 34 | 68 | 10.4 |
| 168 | THE SPLICE | boss (special) | SPLICE HOMECOMING | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 169 | OLD CAIRN SONG | **regular** | OLD CAIRN SONG | — | STANDARD | 12 | 48 | 63 | 39 | 78 | 10.5 |
| 170 | THE CAIRN | boss | OLD CAIRN SONG | cairn | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 171 | WELL LEGEND | **regular** | WELL LEGEND | — | STANDARD | 8 | 43 | 50 | 31 | 62 | 10.6 |
| 172 | THE WELL | boss (special) | WELL LEGEND | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 173 | REPRISE REUNION | **regular** | REPRISE REUNION | — | STANDARD | 10 | 43 | 47 | 29 | 58 | 10.7 |
| 174 | THE REPRISE | boss | REPRISE REUNION | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 175 | FILAMENT RELIC | **regular** | FILAMENT RELIC | — | STANDARD | 10 | 44 | 48 | 30 | 60 | 10.8 |
| 176 | THE FILAMENT | boss | FILAMENT RELIC | filament | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 177 | SPOOL HOMECOMING | **regular** | SPOOL HOMECOMING | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 10.9 |
| 178 | THE SPOOL | boss | SPOOL HOMECOMING | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 179 | HASP SAGA | **regular** | HASP SAGA | — | STANDARD | 13 | 47 | 58 | 36 | 72 | 11 |
| 180 | THE HASP | boss | HASP SAGA | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 181 | FLUE RELIC | **regular** | FLUE RELIC | — | STANDARD | 11 | 48 | 53 | 33 | 66 | 11.1 |
| 182 | THE FLUE | boss | FLUE RELIC | flue, panel | SHOTS | 0 | 0 | 71 | 44 | 88 | — |
| 183 | ANCIENT RATCHET | **regular** | ANCIENT RATCHET | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 11.3 |
| 184 | THE RATCHET | boss | ANCIENT RATCHET | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 185 | NETTLE LEGEND | **regular** | NETTLE LEGEND | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 11.4 |
| 186 | THE NETTLE | boss | NETTLE LEGEND | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 187 | MANTLE SAGA | **regular** | MANTLE SAGA | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 11.5 |
| 188 | THE MANTLE | boss | MANTLE SAGA | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 189 | KEEL SAGA | **regular** | KEEL SAGA | — | STANDARD | 13 | 47 | 57 | 36 | 72 | 11.6 |
| 190 | THE KEEL | boss | KEEL SAGA | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 191 | OLD VALVE SONG | **regular** | OLD VALVE SONG | — | STANDARD | 12 | 43 | 47 | 29 | 58 | 11.7 |
| 192 | THE VALVE | boss | OLD VALVE SONG | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 193 | SEAM SAGA | **regular** | SEAM SAGA | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 11.8 |
| 194 | THE SEAM | boss | SEAM SAGA | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 195 | SLING SAGA | **regular** | SLING SAGA | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 11.9 |
| 196 | THE SLING | boss | SLING SAGA | sling | STANDARD | 0 | 0 | 43 | 27 | 54 | — |
| 197 | CAPSTAN RELIC | **regular** | CAPSTAN RELIC | — | STANDARD | 12 | 46 | 53 | 33 | 66 | 12 |
| 198 | THE CAPSTAN | boss | CAPSTAN RELIC | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 199 | ANCIENT GALL | **regular** | ANCIENT GALL | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12.1 |
| 200 | THE GALL | boss | ANCIENT GALL | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 201 | ANCIENT TRAPEZE | **regular** | ANCIENT TRAPEZE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 12.3 |
| 202 | THE TRAPEZE | boss | ANCIENT TRAPEZE | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 203 | ANCIENT GOVERNOR | **regular** | ANCIENT GOVERNOR | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 12.4 |
| 204 | THE GOVERNOR | boss | ANCIENT GOVERNOR | governor | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 205 | ANCIENT LATCH | **regular** | ANCIENT LATCH | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 12.6 |
| 206 | THE LATCH | boss | ANCIENT LATCH | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 207 | HYDRA LEGEND | **regular** | HYDRA LEGEND | — | STANDARD | 12 | 45 | 51 | 32 | 64 | 12.7 |
| 208 | THE HYDRA | boss | HYDRA LEGEND | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 3 | THE MOTH | normal | 44 beats | 28 | 56 s | short |
| 6 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 57 | THE BASTION | normal | 87 beats | 54 | 108 s | in band |
| 60 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 63 | FINALE | normal | 79 beats | 49 | 98 s | in band |
| 66 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 69 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 72 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 75 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 78 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 81 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 84 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 87 | THE PLUMB | normal | 45 beats | 28 | 56 s | short |
| 90 | THE LAMPREY | normal | 132 beats | 83 | 166 s | long |
| 93 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 96 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 99 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 104 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 107 | THE VISE | normal | 42 beats | 26 | 52 s | short |
| 110 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 113 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 116 | THE CHRYSALIS | normal | 75 beats | 47 | 94 s | in band |
| 119 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 122 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 125 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 128 | THE BATON | normal | 286 beats | 179 | 358 s | long |
| 131 | THE OCULUS | normal | 25 beats | 16 | 32 s | short |
| 134 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 137 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 140 | THE GORGE | normal | 259 beats | 162 | 324 s | long |
| 144 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 147 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 150 | THE VANE | normal | 82 beats | 51 | 102 s | in band |
| 153 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 156 | THE TASTER | normal | 44 beats | 28 | 56 s | short |
| 158 | THE LEDGER | normal | 33 beats | 21 | 42 s | short |
| 160 | THE SURGE | normal | 45 beats | 28 | 56 s | short |
| 162 | THE LEAD | normal | 41 beats | 26 | 52 s | short |
| 164 | THE SCUTTLE | normal | 49 beats | 31 | 62 s | in band |
| 166 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 168 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 170 | THE CAIRN | normal | 25 beats | 16 | 32 s | short |
| 172 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 174 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 176 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 178 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 180 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 182 | THE FLUE | normal | 71 beats | 44 | 88 s | in band |
| 184 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 186 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 188 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 190 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 192 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 194 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 196 | THE SLING | normal | 43 beats | 27 | 54 s | short |
| 198 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 200 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 202 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 204 | THE GOVERNOR | normal | 25 beats | 16 | 32 s | short |
| 206 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 208 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
