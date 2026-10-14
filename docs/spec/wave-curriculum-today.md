# The waves today, measured

> **Status: a measurement of 2026-10-14**, the evidence for
> `wave-curriculum.md`. Written by `bun run waves:measure`
> (`tools/probe/measure-waves.ts`) — run it again rather than editing a
> number here.

**How it was read.** *Kind* and *New* are content's own answers —
`isRegularWave` and `waveIntroduces` (`packages/content/src/wave-regular.ts`).
*Span* is the beat of the last authored arrival. *AUTO clears in* is the beat
the field was clear, with AUTO playing both seats — perfect hands, no
talking, so a lower bound on what a pair needs; *AUTO fails* means it lost
the wave. *Pressure* is `wavePressure`
(`packages/content/src/wave-pressure.ts`); a boss wave has none.

## Every wave

| # | Wave | Kind | New | Panel | Arrivals | Span (beats) | AUTO clears in | Pressure |
|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | slick, panel | STANDARD 1 | 9 | 48 | 51 b · 32 s | 4.6 |
| 2 | CYAN | intro | bulb, panel | STANDARD 2 | 2 | 3 | 6 b · 4 s | 3.2 |
| 3 | TWO COLOURS | **regular** | — | STANDARD 2 | 2 | 3 | 6 b · 4 s | 4.2 |
| 4 | ALTERNATING | **regular** | — | STANDARD 2 | 3 | 4 | 7 b · 4 s | 6.8 |
| 5 | THE INSTAR | boss | instar, panel | STANDARD 5 | 0 | 0 | 549 b · 343 s | — |
| 6 | THE ROCK | intro | meteor, panel | STANDARD 3 | 1 | 0 | 14 b · 9 s | 1 |
| 7 | TWO ROCKS | intro | panel | STANDARD 4 | 2 | 4 | 18 b · 11 s | 2.4 |
| 8 | THE HAND | intro | — | STANDARD 4 | 3 | 0 | 16 b · 10 s | 5.8 |
| 9 | TORCH | intro | torch | STANDARD 4 | 3 | 18 | 21 b · 13 s | 5.7 |
| 10 | ONE LAST CHANCE | intro | — | STANDARD 4 | 6 | 13 | 24 b · 15 s | 10.8 |
| 11 | SHIELD, THEN CANNON | **regular** | — | STANDARD 4 | 2 | 5 | 15 b · 9 s | 3 |
| 12 | THE WALL | **regular** | — | STANDARD 4 | 4 | 3 | 6 b · 4 s | 10 |
| 13 | SHOOT AND SHIELD | **regular** | — | STANDARD 4 | 4 | 9 | 23 b · 14 s | 8 |
| 14 | IN ITS SHADOW | **regular** | — | STANDARD 4 | 4 | 9 | 23 b · 14 s | 4.6 |
| 15 | CROWDED | **regular** | — | STANDARD 4 | 5 | 6 | 17 b · 11 s | 14.4 |
| 16 | THE BASTION | boss | bastion | STANDARD 5 | 0 | 0 | 82 b · 51 s | — |
| 17 | SALVAGE | intro | purge | STANDARD 5 | 2 | 7 | 10 b · 6 s | 4.8 |
| 18 | CATCH AND AIM | intro | ward | STANDARD 5 | 3 | 15 | 18 b · 11 s | 4.4 |
| 19 | FINALE | **regular** | — | STANDARD 5 | 7 | 7 | 22 b · 14 s | 20.9 |
| 20 | BULB QUEEN | boss | queen | STANDARD 5 | 0 | 0 | AUTO fails | — |
| 21 | THE MIRROR | boss (special) | mirror | STANDARD 5 | 0 | 0 | 53 b · 33 s | — |
| 22 | THE MAZE | boss (special) | maze | STANDARD 5 | 0 | 0 | 92 b · 58 s | — |
| 23 | THE GAUGE | boss (special) | gauge, panel | THE GAUGE | 0 | 0 | 62 b · 39 s | — |
| 24 | THE WARDEN | boss | warden, tether | STANDARD 5 | 0 | 0 | 39 b · 24 s | — |
| 25 | THE FLEET | boss (special) | fleet, panel | THE FLEET | 0 | 0 | 14 b · 9 s | — |
| 26 | THE LURE | intro | lure | STANDARD 5 | 6 | 16 | 29 b · 18 s | 10.5 |
| 27 | THE THROB | intro | throb | STANDARD 5 | 1 | 0 | 4 b · 3 s | 1.5 |
| 28 | THE COUNT | intro | countdown | STANDARD 5 | 4 | 19 | AUTO fails | 4.8 |
| 29 | THE SHELL | intro | shell | STANDARD 5 | 2 | 10 | 14 b · 9 s | 3 |
| 30 | THE CLASP | intro | clasp | STANDARD 5 | 5 | 28 | 31 b · 19 s | 5.7 |
| 31 | THE DART | intro | dart | STANDARD 5 | 5 | 26 | 29 b · 18 s | 7.2 |
| 32 | THE VEIL | intro | veil | STANDARD 5 | 5 | 24 | 27 b · 17 s | 6.3 |
| 33 | THE VANE | boss | vane | STANDARD 5 | 2 | 3 | AUTO fails | — |
| 34 | THE LANCE | intro | panel | STANDARD | 6 | 12 | 15 b · 9 s | 5 |
| 35 | THE PURGE | intro | — | STANDARD | 3 | 3 | 8 b · 5 s | 8.6 |
| 36 | THE WARD | intro | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 8 | 14 b · 9 s | 14.4 |
| 37 | THE WISP | intro | wisp | STANDARD | 3 | 28 | 31 b · 19 s | 3 |
| 38 | THE GHOST | intro | ghost | STANDARD | 3 | 18 | 21 b · 13 s | 2.1 |
| 39 | SNAKE | boss (special) | snake, panel | SNAKE | 0 | 0 | 124 b · 78 s | — |
| 40 | THE ECHO | intro | echo | STANDARD | 6 | 24 | 27 b · 17 s | 10.9 |
| 41 | PINBALL | boss (special) | pinball, panel | PINBALL | 0 | 0 | 411 b · 257 s | — |
| 42 | THE RIND | intro | rind | STANDARD | 4 | 21 | 25 b · 16 s | 4.8 |
| 43 | THE GYRE | intro | gyre, mount | STANDARD | 1 | 0 | 8 b · 5 s | 1.5 |
| 44 | THE LID | intro | lid | STANDARD | 3 | 24 | 27 b · 17 s | 3.3 |
| 45 | THE RECOIL | intro | recoil | STANDARD | 4 | 28 | 34 b · 21 s | 6.6 |
| 46 | THE CAROM | intro | carom, chute | STANDARD | 4 | 28 | 43 b · 27 s | 7.2 |
| 47 | THE CRYSTAL | intro | crystal | STANDARD | 4 | 46 | 50 b · 31 s | 7.2 |
| 48 | THE VOLLEY | intro | volley | STANDARD | 2 | 26 | 56 b · 35 s | 3.3 |
| 49 | THE VEER | intro | veer | STANDARD | 4 | 38 | 52 b · 33 s | 6.6 |
| 50 | THE STRAND | intro | strand | STANDARD | 3 | 36 | 42 b · 26 s | 2.4 |
| 51 | THE CRAWLER | intro | crawler | STANDARD | 3 | 48 | 64 b · 40 s | 4.5 |
| 52 | THE FENCE | intro | fence | STANDARD | 3 | 24 | 33 b · 21 s | 1.5 |
| 53 | THE GAP | intro | — | STANDARD | 5 | 56 | 65 b · 41 s | 4.5 |
| 54 | THE CUT | intro | — | STANDARD | 4 | 48 | 57 b · 36 s | 1.5 |
| 55 | THE MAGNET | intro | magnet | STANDARD | 5 | 46 | 49 b · 31 s | 8.1 |
| 56 | THE JAM | intro | cannonFault | STANDARD | 8 | 50 | 62 b · 39 s | 13.3 |
| 57 | THE COIL | intro | coil, shieldFault | STANDARD | 6 | 46 | 58 b · 36 s | 9.9 |
| 58 | THE CHOKE | intro | steerFault | STANDARD | 10 | 48 | 60 b · 38 s | 10.6 |
| 59 | THE LIMPET | intro | limpet | STANDARD | 6 | 50 | 64 b · 40 s | 8.2 |
| 60 | THE LEECH | intro | leech | STANDARD | 7 | 48 | 51 b · 32 s | 11.4 |
| 61 | THE TWITCH | **regular** | — | STANDARD | 10 | 62 | 70 b · 44 s | 8 |
| 62 | THE CLAW | intro | panel | THE CLAW | 6 | 54 | AUTO fails | 2.9 |
| 63 | THE SCOUT | boss (special) | scout, panel | THE SCOUT | 0 | 0 | 73 b · 46 s | — |
| 64 | THE HAUL | boss (special) | — | THE SCOUT | 0 | 0 | 22 b · 14 s | — |
| 65 | THE STARE | boss | stare | STANDARD | 0 | 0 | 245 b · 153 s | — |
| 66 | THE CROSSING | intro | rockCross | STANDARD | 8 | 34 | 41 b · 26 s | 9 |
| 67 | THE CHOIR | intro | choir | STANDARD | 4 | 34 | 38 b · 24 s | 3.6 |
| 68 | THE PULSE | boss (special) | pulse, panel | THE PULSE | 0 | 0 | 137 b · 86 s | — |
| 69 | THE BALLOON | intro | balloon | STANDARD | 6 | 36 | 65 b · 41 s | 8.1 |
| 70 | THE BATON | boss | baton | STANDARD | 0 | 0 | 283 b · 177 s | — |
| 71 | THE UNDERTOW | boss | undertow | STANDARD | 6 | 94 | 156 b · 98 s | — |
| 72 | THE THROAT | boss | throat, panel | THE THROAT | 12 | 78 | 40 b · 25 s | — |
| 73 | THE GORGE | boss | gorge | STANDARD | 10 | 82 | 236 b · 148 s | — |
| 74 | THE CURTAIN | boss | curtain | STANDARD | 0 | 0 | AUTO fails | — |
| 75 | THE TASTER | boss | taster | STANDARD | 10 | 80 | AUTO fails | — |
| 76 | THE SINEW | boss | sinew | STANDARD | 0 | 0 | 44 b · 28 s | — |
| 77 | THE LEDGER | boss | ledger | STANDARD | 8 | 82 | 32 b · 20 s | — |
| 78 | THE SURGE | boss | surge | STANDARD | 8 | 76 | 44 b · 28 s | — |
| 79 | THE LEAD | boss | lead | STANDARD | 8 | 84 | AUTO fails | — |
| 80 | THE SCUTTLE | boss | scuttle | STANDARD | 0 | 0 | AUTO fails | — |
| 81 | THE ANTIPHON | boss | antiphon | STANDARD | 0 | 0 | 56 b · 35 s | — |
| 82 | THE HIVE | boss | hive | STANDARD | 0 | 0 | 74 b · 46 s | — |
| 83 | THE BEATBOX | intro | beatbox | STANDARD | 5 | 42 | 47 b · 29 s | 5.7 |
| 84 | THE WEIGHT | intro | weight | STANDARD | 5 | 32 | 34 b · 21 s | 7.2 |
| 85 | THE CAIRN | boss | cairn | STANDARD | 0 | 0 | 24 b · 15 s | — |
| 86 | THE CODEX | intro | codexFault | STANDARD | 8 | 36 | 39 b · 24 s | 8.4 |
| 87 | THE WELL | boss (special) | well | STANDARD | 7 | 58 | 61 b · 38 s | — |
| 88 | THE HANDOVER | intro | handoverFault | STANDARD | 7 | 24 | 27 b · 17 s | 11 |
| 89 | THE LEAK | intro | — | STANDARD 5 | 16 | 35 | 38 b · 24 s | 10.4 |
| 90 | THE SPLICE | boss (special) | splice, panel | THE SPLICE | 0 | 0 | 21 b · 13 s | — |
| 91 | THE MINE | intro | mine | STANDARD | 6 | 30 | 33 b · 21 s | 12.5 |
| 92 | THE BLISTER | intro | blister | STANDARD | 2 | 12 | 20 b · 13 s | 2.4 |
| 93 | THE MOULT | intro | moult | STANDARD | 5 | 19 | 77 b · 48 s | 6.9 |
| 94 | THE REPRISE | boss | reprise | STANDARD | 7 | 21 | 41 b · 26 s | — |
| 95 | THE FLIP | intro | flipFault | STANDARD | 10 | 40 | 43 b · 27 s | 10.8 |
| 96 | THE DARK | intro | darkFault | STANDARD | 10 | 36 | 39 b · 24 s | 9.4 |
| 97 | THE HUSK | intro | husk | STANDARD | 2 | 9 | 16 b · 10 s | 6 |
| 98 | THE FILAMENT | boss | filament, panel | THE SCENE | 0 | 0 | 82 b · 51 s | — |
| 99 | THE GIMBAL | boss | gimbal | STANDARD | 0 | 0 | 23 b · 14 s | — |
| 100 | THE SPOOL | boss | spool | STANDARD | 0 | 0 | 80 b · 50 s | — |
| 101 | THE HASP | boss | hasp | STANDARD | 0 | 0 | 21 b · 13 s | — |
| 102 | THE RATCHET | boss | ratchet | STANDARD | 0 | 0 | 23 b · 14 s | — |
| 103 | THE NETTLE | boss | nettle | STANDARD 5 | 0 | 0 | 106 b · 66 s | — |
| 104 | THE MANTLE | boss | mantle | STANDARD | 0 | 0 | 18 b · 11 s | — |
| 105 | THE KEEL | boss | keel | STANDARD | 0 | 0 | 28 b · 18 s | — |
| 106 | THE VALVE | boss | valve | STANDARD | 0 | 0 | 16 b · 10 s | — |
| 107 | THE SEAM | boss | seam | STANDARD | 0 | 0 | 31 b · 19 s | — |
| 108 | THE OCULUS | boss | oculus | STANDARD | 17 | 86 | 21 b · 13 s | — |
| 109 | THE VISE | boss | vise | STANDARD | 0 | 0 | 39 b · 24 s | — |
| 110 | THE PLUMB | boss | plumb | STANDARD | 0 | 0 | 42 b · 26 s | — |
| 111 | THE SLING | boss | sling | STANDARD | 0 | 0 | 40 b · 25 s | — |
| 112 | THE CAPSTAN | boss | capstan | STANDARD | 0 | 0 | 21 b · 13 s | — |
| 113 | THE GALL | boss | gall | STANDARD | 0 | 0 | 23 b · 14 s | — |
| 114 | THE TRAPEZE | boss | trapeze | STANDARD | 0 | 0 | 53 b · 33 s | — |
| 115 | THE FLUE | boss | flue, panel | SHOTS | 0 | 0 | 70 b · 44 s | — |
| 116 | THE GOVERNOR | boss | governor | STANDARD | 0 | 0 | 22 b · 14 s | — |
| 117 | THE LAMPREY | boss | lamprey | STANDARD | 0 | 0 | 130 b · 81 s | — |
| 118 | THE MIMIC | boss | mimic | THE SCENE | 0 | 0 | 75 b · 47 s | — |
| 119 | THE LATCH | boss | latch | THE SCENE | 0 | 0 | 23 b · 14 s | — |
| 120 | FIVE BLISTERS | **regular** | — | STANDARD | 6 | 41 | 49 b · 31 s | 5.7 |
| 121 | THE CHRYSALIS | boss | chrysalis | STANDARD 5 | 0 | 0 | 77 b · 48 s | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 5 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 16 | THE BASTION | normal | 82 beats | 51 | 102 s | in band |
| 20 | BULB QUEEN | normal | — | — | — | unknown — AUTO cannot finish it |
| 21 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 22 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 23 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 24 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 25 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 33 | THE VANE | normal | — | — | — | unknown — AUTO cannot finish it |
| 39 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 41 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 63 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 64 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 65 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 68 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 70 | THE BATON | normal | 283 beats | 177 | 354 s | long |
| 71 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 72 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 73 | THE GORGE | normal | 236 beats | 148 | 296 s | long |
| 74 | THE CURTAIN | normal | — | — | — | unknown — AUTO cannot finish it |
| 75 | THE TASTER | normal | — | — | — | unknown — AUTO cannot finish it |
| 76 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 77 | THE LEDGER | normal | 32 beats | 20 | 40 s | short |
| 78 | THE SURGE | normal | 44 beats | 28 | 56 s | short |
| 79 | THE LEAD | normal | — | — | — | unknown — AUTO cannot finish it |
| 80 | THE SCUTTLE | normal | — | — | — | unknown — AUTO cannot finish it |
| 81 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 82 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 85 | THE CAIRN | normal | 24 beats | 15 | 30 s | short |
| 87 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 90 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 94 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 98 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 99 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 100 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 101 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 102 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 103 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 104 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 105 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 106 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 107 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 108 | THE OCULUS | normal | 21 beats | 13 | 26 s | short |
| 109 | THE VISE | normal | 39 beats | 24 | 48 s | short |
| 110 | THE PLUMB | normal | 42 beats | 26 | 52 s | short |
| 111 | THE SLING | normal | 40 beats | 25 | 50 s | short |
| 112 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 113 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 114 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 115 | THE FLUE | normal | 70 beats | 44 | 88 s | in band |
| 116 | THE GOVERNOR | normal | 22 beats | 14 | 28 s | short |
| 117 | THE LAMPREY | normal | 130 beats | 81 | 162 s | long |
| 118 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 119 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 121 | THE CHRYSALIS | normal | 77 beats | 48 | 96 s | in band |
