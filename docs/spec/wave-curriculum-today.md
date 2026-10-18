# The waves today, measured

> **Status: a measurement of 2026-10-18**, the evidence for
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
| regular | 464 | 0 | 14 | 28 | 73 | 3 h 44 min | 7 h 28 min |
| intro | 64 | 0 | 3 | 26 | 51 | 30 min | 60 min |
| boss | 60 | 0 | 9 | 31 | 343 | 50 min | 1 h 41 min |
| every wave | 588 | 0 | 3 | 28 | 343 | 5 h 4 min | 10 h 8 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 64 | 67 | 42 | 84 | 2.4 |
| 2 | FIRST RED | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | RED WANDERER | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | RED TANGO | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 41 | 44 | 28 | 56 | 5.4 |
| 5 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 4 | 24 | 27 | 17 | 34 | 1.4 |
| 6 | CYAN AWAKENS | **regular** | CYAN | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 2.6 |
| 7 | CYAN PICNIC | **regular** | CYAN | — | STANDARD 2 | 7 | 36 | 39 | 24 | 48 | 3.4 |
| 8 | CYAN RAPTURE | **regular** | CYAN | — | STANDARD 2 | 8 | 42 | 45 | 28 | 56 | 4.6 |
| 9 | THE BROOD | boss | CYAN | brood | STANDARD 2 | 0 | 0 | 40 | 25 | 50 | — |
| 10 | THE SHELL | intro | THE SHELL | shell | STANDARD 2 | 2 | 10 | 15 | 9 | 18 | 3 |
| 11 | NEW SHELL MOON | **regular** | THE SHELL | — | STANDARD 2 | 5 | 30 | 35 | 22 | 44 | 3.6 |
| 12 | LONG SHELL ROAD | **regular** | THE SHELL | — | STANDARD 2 | 6 | 26 | 31 | 19 | 38 | 5.7 |
| 13 | SHELL AND CYAN | **regular** | THE SHELL | — | STANDARD 2 | 8 | 37 | 42 | 26 | 52 | 6.7 |
| 14 | THE THROB | intro | THE THROB | throb | STANDARD 2 | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 15 | FIRST THROB | **regular** | THE THROB | — | STANDARD 2 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 16 | THROB AT WORLD END | **regular** | THE THROB | — | STANDARD 2 | 6 | 29 | 34 | 21 | 42 | 6 |
| 17 | THROB TANGO | **regular** | THE THROB | — | STANDARD 2 | 8 | 36 | 41 | 26 | 52 | 7 |
| 18 | THE ECHO | intro | THE ECHO | echo | STANDARD 2 | 6 | 44 | 47 | 29 | 58 | 4 |
| 19 | NEW ECHO MOON | **regular** | THE ECHO | — | STANDARD 2 | 5 | 26 | 29 | 18 | 36 | 4.2 |
| 20 | ECHO HORIZON | **regular** | THE ECHO | — | STANDARD 2 | 6 | 28 | 31 | 19 | 38 | 6.3 |
| 21 | ECHO ALLIANCE | **regular** | THE ECHO | — | STANDARD 2 | 8 | 34 | 37 | 23 | 46 | 7.3 |
| 22 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD 2 | 4 | 32 | 38 | 24 | 48 | 3.9 |
| 23 | RECOIL AWAKENS | **regular** | THE RECOIL | — | STANDARD 2 | 5 | 29 | 35 | 22 | 44 | 4.2 |
| 24 | FAR RECOIL | **regular** | THE RECOIL | — | STANDARD 2 | 6 | 27 | 33 | 21 | 42 | 6.3 |
| 25 | RECOIL MEETS ECHO | **regular** | THE RECOIL | — | STANDARD 2 | 8 | 34 | 37 | 23 | 46 | 7.3 |
| 26 | HOLD AND AIM | intro | THE RECOIL | — | STANDARD 2 | 6 | 33 | 36 | 23 | 46 | 6.8 |
| 27 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD 2 | 5 | 52 | 55 | 34 | 68 | 3.9 |
| 28 | MAGNET RISING | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 32 | 35 | 22 | 44 | 4.2 |
| 29 | LONG MAGNET ROAD | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 28 | 31 | 19 | 38 | 6.3 |
| 30 | MAGNET DUET | **regular** | THE MAGNET | — | STANDARD 2 | 8 | 36 | 42 | 26 | 52 | 7.3 |
| 31 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD 2 | 1 | 0 | 10 | 6 | 12 | 1.5 |
| 32 | HELLO GYRE | **regular** | THE GYRE | — | STANDARD 2 | 5 | 27 | 37 | 23 | 46 | 4.2 |
| 33 | OUTER GYRE | **regular** | THE GYRE | — | STANDARD 2 | 6 | 28 | 36 | 23 | 46 | 6.3 |
| 34 | GYRE DUET | **regular** | THE GYRE | — | STANDARD 2 | 8 | 37 | 40 | 25 | 50 | 7.3 |
| 35 | THE LURE | intro | THE LURE | lure | STANDARD 2 | 6 | 40 | 47 | 29 | 58 | 3.9 |
| 36 | LURE RISING | **regular** | THE LURE | — | STANDARD 2 | 5 | 27 | 42 | 26 | 52 | 4.2 |
| 37 | OUTER LURE | **regular** | THE LURE | — | STANDARD 2 | 6 | 28 | 43 | 27 | 54 | 6.3 |
| 38 | LURE AND GYRE | **regular** | THE LURE | — | STANDARD 2 | 8 | 34 | 44 | 28 | 56 | 7.3 |
| 39 | THE RIND | intro | THE RIND | rind | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 40 | FIRST RIND | **regular** | THE RIND | — | STANDARD 2 | 5 | 28 | 33 | 21 | 42 | 4.2 |
| 41 | RIND HORIZON | **regular** | THE RIND | — | STANDARD 2 | 6 | 26 | 31 | 19 | 38 | 6.3 |
| 42 | RIND MEETS LURE | **regular** | THE RIND | — | STANDARD 2 | 8 | 37 | 52 | 33 | 66 | 7.3 |
| 43 | THE STRAND | intro | THE STRAND | strand | STANDARD 2 | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 44 | STRAND DAWN | **regular** | THE STRAND | — | STANDARD 2 | 5 | 28 | 32 | 20 | 40 | 4.2 |
| 45 | STRAND VOYAGE | **regular** | THE STRAND | — | STANDARD 2 | 6 | 27 | 34 | 21 | 42 | 6.3 |
| 46 | STRAND WALTZ | **regular** | THE STRAND | — | STANDARD 2 | 8 | 35 | 40 | 25 | 50 | 7.3 |
| 47 | THE VEIL | intro | THE VEIL | veil | STANDARD 2 | 5 | 34 | 37 | 23 | 46 | 3.3 |
| 48 | VEIL DAWN | **regular** | THE VEIL | — | STANDARD 2 | 5 | 27 | 30 | 19 | 38 | 4.2 |
| 49 | LONG VEIL ROAD | **regular** | THE VEIL | — | STANDARD 2 | 6 | 27 | 30 | 19 | 38 | 6.3 |
| 50 | VEIL WALTZ | **regular** | THE VEIL | — | STANDARD 2 | 8 | 38 | 43 | 27 | 54 | 7.3 |
| 51 | THE DART | intro | THE DART | dart | STANDARD 2 | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 52 | NEW DART MOON | **regular** | THE DART | — | STANDARD 2 | 5 | 29 | 32 | 20 | 40 | 4.2 |
| 53 | DART AT WORLD END | **regular** | THE DART | — | STANDARD 2 | 6 | 29 | 32 | 20 | 40 | 6.3 |
| 54 | DART PARTY | **regular** | THE DART | — | STANDARD 2 | 8 | 37 | 40 | 25 | 50 | 7.3 |
| 55 | THE COUNT | intro | THE COUNT | countdown | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 56 | FIRST COUNT | **regular** | THE COUNT | — | STANDARD 2 | 5 | 30 | 35 | 22 | 44 | 4.2 |
| 57 | COUNT VOYAGE | **regular** | THE COUNT | — | STANDARD 2 | 6 | 26 | 31 | 19 | 38 | 6.3 |
| 58 | COUNT DUET | **regular** | THE COUNT | — | STANDARD 2 | 8 | 35 | 38 | 24 | 48 | 7.3 |
| 59 | THE GHOST | intro | THE GHOST | ghost | STANDARD 2 | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 60 | FIRST GHOST | **regular** | THE GHOST | — | STANDARD 2 | 5 | 27 | 30 | 19 | 38 | 4.2 |
| 61 | GHOST HORIZON | **regular** | THE GHOST | — | STANDARD 2 | 6 | 28 | 31 | 19 | 38 | 6.3 |
| 62 | GHOST MEETS COUNT | **regular** | THE GHOST | — | STANDARD 2 | 8 | 39 | 44 | 28 | 56 | 7.3 |
| 63 | THE WISP | intro | THE WISP | wisp | STANDARD 2 | 3 | 28 | 31 | 19 | 38 | 3 |
| 64 | FIRST WISP | **regular** | THE WISP | — | STANDARD 2 | 5 | 28 | 31 | 19 | 38 | 4.2 |
| 65 | WISP VOYAGE | **regular** | THE WISP | — | STANDARD 2 | 6 | 26 | 29 | 18 | 36 | 6.3 |
| 66 | WISP AND GHOST | **regular** | THE WISP | — | STANDARD 2 | 8 | 36 | 39 | 24 | 48 | 7.3 |
| 67 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 35 | 22 | 44 | 1.4 |
| 68 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 45 | 28 | 56 | 2.6 |
| 69 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 50 | 31 | 62 | 3.8 |
| 70 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 45 | 28 | 56 | 5 |
| 71 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 17 | 11 | 22 | 5.8 |
| 72 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 25 | 16 | 32 | 10.8 |
| 73 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 22 | 25 | 16 | 32 | 3.3 |
| 74 | HELLO TORCH | **regular** | TORCH | — | STANDARD 4 | 5 | 25 | 28 | 18 | 36 | 3.6 |
| 75 | TORCH AT WORLD END | **regular** | TORCH | — | STANDARD 4 | 6 | 28 | 31 | 19 | 38 | 5.7 |
| 76 | TORCH ALLIANCE | **regular** | TORCH | — | STANDARD 4 | 8 | 37 | 52 | 33 | 66 | 6.7 |
| 77 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 78 | TAP | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 79 | TAP DAWN | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 80 | TAP PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 26 | 30 | 19 | 38 | 6 |
| 81 | TAP TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 35 | 38 | 24 | 48 | 7 |
| 82 | HOLD | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 83 | HOLD AWAKENS | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 30 | 34 | 21 | 42 | 3.9 |
| 84 | HOLD PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 27 | 31 | 19 | 38 | 6 |
| 85 | HOLD DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 38 | 41 | 26 | 52 | 7 |
| 86 | SWIPE | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 87 | LITTLE SWIPE | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 26 | 30 | 19 | 38 | 3.9 |
| 88 | FAR SWIPE | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 27 | 31 | 19 | 38 | 6 |
| 89 | SWIPE DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 39 | 42 | 26 | 52 | 7 |
| 90 | TURN | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 91 | TURN DAWN | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 92 | TURN VOYAGE | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 32 | 20 | 40 | 6 |
| 93 | TURN TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 35 | 38 | 24 | 48 | 7 |
| 94 | RUB | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 95 | RUB MORNING | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 31 | 19 | 38 | 3.9 |
| 96 | LONG RUB ROAD | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 32 | 20 | 40 | 6 |
| 97 | RUB DUET | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 36 | 39 | 24 | 48 | 7 |
| 98 | COMBO | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 99 | LITTLE COMBO | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 30 | 34 | 21 | 42 | 3.9 |
| 100 | COMBO PILGRIM | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 26 | 30 | 19 | 38 | 6 |
| 101 | COMBO TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 36 | 39 | 24 | 48 | 7 |
| 102 | LEVER | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 103 | HELLO LEVER | **regular** | THE BLISTER | — | STANDARD 4 | 5 | 27 | 32 | 20 | 40 | 3.9 |
| 104 | LEVER HORIZON | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 28 | 33 | 21 | 42 | 6 |
| 105 | LEVER PARTY | **regular** | THE BLISTER | — | STANDARD 4 | 8 | 37 | 40 | 25 | 50 | 7 |
| 106 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 107 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 87 | 54 | 108 | — |
| 108 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 109 | SALVAGE AWAKENS | **regular** | SALVAGE | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.4 |
| 110 | SALVAGE HORIZON | **regular** | SALVAGE | — | STANDARD 5 | 4 | 27 | 30 | 19 | 38 | 4.4 |
| 111 | SALVAGE DUET | **regular** | SALVAGE | — | STANDARD 5 | 6 | 34 | 37 | 23 | 46 | 5.7 |
| 112 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 113 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 35 | 38 | 24 | 48 | 7 |
| 114 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 38 | 42 | 26 | 52 | 8.2 |
| 115 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 116 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 117 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 118 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 119 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 120 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 17 | 11 | 22 | 2.4 |
| 121 | HELLO HUSK | **regular** | THE HUSK | — | STANDARD 5 | 3 | 27 | 30 | 19 | 38 | 2.6 |
| 122 | FAR HUSK | **regular** | THE HUSK | — | STANDARD 5 | 4 | 28 | 43 | 27 | 54 | 3.2 |
| 123 | HUSK TANGO | **regular** | THE HUSK | — | STANDARD 5 | 4 | 37 | 40 | 25 | 50 | 4 |
| 124 | ANCIENT HUSK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 40 | 55 | 34 | 68 | 6 |
| 125 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 8 | 47 | 53 | 33 | 66 | 8.1 |
| 126 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 127 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 24 | 15 | 30 | 3.6 |
| 128 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 129 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 130 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 131 | HUSK DREAM | **regular** | THE HUSK | — | STANDARD 5 | 4 | 38 | 41 | 26 | 52 | 2.8 |
| 132 | HUSK HOMECOMING | **regular** | THE HUSK | — | STANDARD 5 | 4 | 37 | 40 | 25 | 50 | 3.8 |
| 133 | HUSK TRICK | **regular** | THE HUSK | — | STANDARD 5 | 6 | 42 | 46 | 29 | 58 | 4.7 |
| 134 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 135 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 35 | 22 | 44 | 3.6 |
| 136 | MORSEL AWAKENS | **regular** | THE MORSEL | — | STANDARD 5 | 5 | 29 | 46 | 29 | 58 | 3.6 |
| 137 | MORSEL PILGRIM | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 27 | 44 | 28 | 56 | 5.7 |
| 138 | MORSEL TANGO | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 43 | 27 | 54 | 6.7 |
| 139 | MORSEL SAGA | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 39 | 47 | 29 | 58 | 8.7 |
| 140 | MORSEL THUNDER | **regular** | THE MORSEL | — | STANDARD 5 | 10 | 46 | 52 | 33 | 66 | 10.7 |
| 141 | SOFT MORSEL | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 34 | 51 | 32 | 64 | 6.2 |
| 142 | MORSEL RELIC | **regular** | THE MORSEL | — | STANDARD 5 | 8 | 39 | 45 | 28 | 56 | 7.2 |
| 143 | MORSEL SPELL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 46 | 63 | 39 | 78 | 8.2 |
| 144 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 145 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 146 | FIRST LANCE | **regular** | THE LANCE | — | STANDARD | 5 | 28 | 45 | 28 | 56 | 3.9 |
| 147 | LONG LANCE ROAD | **regular** | THE LANCE | — | STANDARD | 6 | 30 | 47 | 29 | 58 | 6 |
| 148 | LANCE PARTY | **regular** | THE LANCE | — | STANDARD | 6 | 32 | 44 | 28 | 56 | 7 |
| 149 | LANCE REUNION | **regular** | THE LANCE | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 9 |
| 150 | LANCE INFERNO | **regular** | THE LANCE | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 11 |
| 151 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 152 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 153 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 154 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 28 | 18 | 36 | 3.6 |
| 155 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 39 | 24 | 48 | 3.4 |
| 156 | SLEEPY LANCE | **regular** | THE LANCE | — | STANDARD | 6 | 36 | 53 | 33 | 66 | 6.2 |
| 157 | LANCE RELIC | **regular** | THE LANCE | — | STANDARD | 8 | 38 | 45 | 28 | 56 | 7.2 |
| 158 | LANCE ILLUSION | **regular** | THE LANCE | — | STANDARD | 9 | 43 | 60 | 38 | 76 | 8.2 |
| 159 | THE GEODE | boss | THE LANCE | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 160 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 161 | SEEDER AWAKENS | **regular** | THE SEEDER | — | STANDARD | 5 | 29 | 37 | 23 | 46 | 3.9 |
| 162 | SEEDER VOYAGE | **regular** | THE SEEDER | — | STANDARD | 6 | 26 | 37 | 23 | 46 | 6 |
| 163 | SEEDER AND MORSEL | **regular** | THE SEEDER | — | STANDARD | 8 | 36 | 53 | 33 | 66 | 7 |
| 164 | SEEDER REUNION | **regular** | THE SEEDER | — | STANDARD | 8 | 39 | 44 | 28 | 56 | 9 |
| 165 | SEEDER THUNDER | **regular** | THE SEEDER | — | STANDARD | 15 | 47 | 57 | 36 | 72 | 11 |
| 166 | SEEDER DREAM | **regular** | THE SEEDER | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.5 |
| 167 | SEEDER HOMECOMING | **regular** | THE SEEDER | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.6 |
| 168 | SEEDER ILLUSION | **regular** | THE SEEDER | — | STANDARD | 11 | 45 | 57 | 36 | 72 | 8.6 |
| 169 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 170 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 2.8 |
| 171 | CROSSING DAWN | **regular** | THE CROSSING | — | STANDARD | 5 | 27 | 34 | 21 | 42 | 2.8 |
| 172 | OUTER CROSSING | **regular** | THE CROSSING | — | STANDARD | 6 | 29 | 36 | 23 | 46 | 4.8 |
| 173 | CROSSING AND SEEDER | **regular** | THE CROSSING | — | STANDARD | 8 | 35 | 43 | 27 | 54 | 5.9 |
| 174 | OLD CROSSING SONG | **regular** | THE CROSSING | — | STANDARD | 8 | 38 | 43 | 27 | 54 | 7.9 |
| 175 | CROSSING ECLIPSE | **regular** | THE CROSSING | — | STANDARD | 15 | 46 | 49 | 31 | 62 | 9.9 |
| 176 | SOFT CROSSING | **regular** | THE CROSSING | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 5.2 |
| 177 | CROSSING SAGA | **regular** | THE CROSSING | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 6.3 |
| 178 | CROSSING RIDDLE | **regular** | THE CROSSING | — | STANDARD | 10 | 42 | 46 | 29 | 58 | 7.3 |
| 179 | THE MAZE | boss (special) | THE CROSSING | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 180 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 69 | 43 | 86 | 5 |
| 181 | LITTLE LIMPET | **regular** | THE LIMPET | — | STANDARD | 5 | 29 | 36 | 23 | 46 | 5 |
| 182 | FAR LIMPET | **regular** | THE LIMPET | — | STANDARD | 6 | 31 | 47 | 29 | 58 | 8.6 |
| 183 | LIMPET DUET | **regular** | THE LIMPET | — | STANDARD | 8 | 36 | 47 | 29 | 58 | 9.8 |
| 184 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 37 | 47 | 29 | 58 | 11.8 |
| 185 | LIMPET APOCALYPSE | **regular** | THE LIMPET | — | STANDARD | 14 | 47 | 54 | 34 | 68 | 13.8 |
| 186 | LIMPET HUSH | **regular** | THE LIMPET | — | STANDARD | 6 | 36 | 43 | 27 | 54 | 5.2 |
| 187 | LIMPET SAGA | **regular** | THE LIMPET | — | STANDARD | 8 | 40 | 45 | 28 | 56 | 6.2 |
| 188 | CROOKED LIMPET | **regular** | THE LIMPET | — | STANDARD | 10 | 44 | 48 | 30 | 60 | 7.3 |
| 189 | THE GAUGE | boss (special) | THE LIMPET | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 190 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 191 | HELLO BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 5 | 27 | 33 | 21 | 42 | 4.2 |
| 192 | BEATBOX VOYAGE | **regular** | THE BEATBOX | — | STANDARD | 6 | 27 | 30 | 19 | 38 | 7.2 |
| 193 | BEATBOX PARTY | **regular** | THE BEATBOX | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.9 |
| 194 | BEATBOX LEGEND | **regular** | THE BEATBOX | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 9.8 |
| 195 | BEATBOX ECLIPSE | **regular** | THE BEATBOX | — | STANDARD | 14 | 46 | 50 | 31 | 62 | 11.8 |
| 196 | LAZY BEATBOX | **regular** | THE BEATBOX | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 6.6 |
| 197 | BEATBOX SAGA | **regular** | THE BEATBOX | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 7.6 |
| 198 | BEATBOX TRICK | **regular** | THE BEATBOX | — | STANDARD | 11 | 47 | 51 | 32 | 64 | 8.6 |
| 199 | THE FLEET | boss (special) | THE BEATBOX | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 200 | THE WEIGHT | intro | THE WEIGHT | weight | STANDARD | 5 | 42 | 44 | 28 | 56 | 3.9 |
| 201 | WEIGHT DAWN | **regular** | THE WEIGHT | — | STANDARD | 5 | 28 | 30 | 19 | 38 | 4.5 |
| 202 | WEIGHT AT WORLD END | **regular** | THE WEIGHT | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 7 |
| 203 | WEIGHT DUET | **regular** | THE WEIGHT | — | STANDARD | 8 | 37 | 43 | 27 | 54 | 8 |
| 204 | OLD WEIGHT SONG | **regular** | THE WEIGHT | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 205 | WEIGHT STORM | **regular** | THE WEIGHT | — | STANDARD | 12 | 42 | 57 | 36 | 72 | 12 |
| 206 | LAZY WEIGHT | **regular** | THE WEIGHT | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 6.8 |
| 207 | WEIGHT REUNION | **regular** | THE WEIGHT | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 7.8 |
| 208 | WEIGHT MIRAGE | **regular** | THE WEIGHT | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 8.8 |
| 209 | THE PLUMB | boss | THE WEIGHT | plumb | STANDARD | 0 | 0 | 45 | 28 | 56 | — |
| 210 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 211 | NEW LEECH MOON | **regular** | THE LEECH | — | STANDARD | 5 | 30 | 32 | 20 | 40 | 6.8 |
| 212 | OUTER LEECH | **regular** | THE LEECH | — | STANDARD | 6 | 29 | 33 | 21 | 42 | 10.4 |
| 213 | LEECH DUET | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 11.3 |
| 214 | LEECH SAGA | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 12 |
| 215 | LEECH THUNDER | **regular** | THE LEECH | — | STANDARD | 12 | 48 | 62 | 39 | 78 | 14 |
| 216 | LEECH DREAM | **regular** | THE LEECH | — | STANDARD | 6 | 34 | 36 | 23 | 46 | 6.9 |
| 217 | OLD LEECH SONG | **regular** | THE LEECH | — | STANDARD | 8 | 39 | 43 | 27 | 54 | 7.9 |
| 218 | LEECH TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 8.9 |
| 219 | THE LAMPREY | boss | THE LEECH | lamprey | STANDARD | 0 | 0 | 132 | 83 | 166 | — |
| 220 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 221 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 5 | 31 | 39 | 24 | 48 | 4.7 |
| 222 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 32 | 47 | 29 | 58 | 6.7 |
| 223 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 224 | HEAVY ROCK SAGA | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 9.6 |
| 225 | HEAVY ROCK ECLIPSE | **regular** | HEAVY ROCKS | — | STANDARD | 14 | 48 | 52 | 33 | 66 | 11.6 |
| 226 | HEAVY ROCK LULLABY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 6.3 |
| 227 | HEAVY ROCK LEGEND | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 7.3 |
| 228 | HEAVY ROCK MIRAGE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 47 | 29 | 58 | 8.3 |
| 229 | THE HIVE | boss | HEAVY ROCKS | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 230 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 57 | 36 | 72 | 3.6 |
| 231 | VEER AWAKENS | **regular** | THE VEER | — | STANDARD | 5 | 29 | 44 | 28 | 56 | 5.1 |
| 232 | LONG VEER ROAD | **regular** | THE VEER | — | STANDARD | 6 | 27 | 42 | 26 | 52 | 7.2 |
| 233 | VEER AND HEAVY ROCK | **regular** | THE VEER | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 8 |
| 234 | VEER REUNION | **regular** | THE VEER | — | STANDARD | 7 | 38 | 46 | 29 | 58 | 10 |
| 235 | VEER APOCALYPSE | **regular** | THE VEER | — | STANDARD | 12 | 44 | 50 | 31 | 62 | 12 |
| 236 | LAZY VEER | **regular** | THE VEER | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 6.7 |
| 237 | ANCIENT VEER | **regular** | THE VEER | — | STANDARD | 8 | 38 | 46 | 29 | 58 | 7.7 |
| 238 | CROOKED VEER | **regular** | THE VEER | — | STANDARD | 11 | 44 | 59 | 37 | 74 | 8.7 |
| 239 | SNAKE | boss (special) | THE VEER | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 240 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 241 | CHOKE DAWN | **regular** | THE CHOKE | — | STANDARD | 5 | 28 | 43 | 27 | 54 | 6.8 |
| 242 | CHOKE HORIZON | **regular** | THE CHOKE | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 9.8 |
| 243 | CHOKE ALLIANCE | **regular** | THE CHOKE | — | STANDARD | 8 | 37 | 63 | 39 | 78 | 10.4 |
| 244 | CHOKE REUNION | **regular** | THE CHOKE | — | STANDARD | 7 | 36 | 46 | 29 | 58 | 11.1 |
| 245 | CHOKE THUNDER | **regular** | THE CHOKE | — | STANDARD | 14 | 45 | 57 | 36 | 72 | 13.2 |
| 246 | CHOKE HUSH | **regular** | THE CHOKE | — | STANDARD | 7 | 39 | 48 | 30 | 60 | 6.9 |
| 247 | CHOKE RELIC | **regular** | THE CHOKE | — | STANDARD | 8 | 38 | 55 | 34 | 68 | 7.9 |
| 248 | CHOKE ILLUSION | **regular** | THE CHOKE | — | STANDARD | 11 | 44 | 59 | 37 | 74 | 8.9 |
| 249 | THE WARDEN | boss | THE CHOKE | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 250 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 34 | 21 | 42 | 1.5 |
| 251 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 66 | 41 | 82 | 4.5 |
| 252 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 58 | 36 | 72 | 1.5 |
| 253 | NEW FENCE MOON | **regular** | THE FENCE | — | STANDARD | 5 | 29 | 39 | 24 | 48 | 6.3 |
| 254 | OUTER FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 28 | 43 | 27 | 54 | 8.7 |
| 255 | FENCE ALLIANCE | **regular** | THE FENCE | — | STANDARD | 8 | 39 | 49 | 31 | 62 | 9.1 |
| 256 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 7 | 36 | 41 | 26 | 52 | 9.6 |
| 257 | FENCE INFERNO | **regular** | THE FENCE | — | STANDARD | 14 | 46 | 52 | 33 | 66 | 11.6 |
| 258 | SLEEPY FENCE | **regular** | THE FENCE | — | STANDARD | 6 | 34 | 44 | 28 | 56 | 6.9 |
| 259 | FENCE SAGA | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 48 | 30 | 60 | 7.9 |
| 260 | FENCE RIDDLE | **regular** | THE FENCE | — | STANDARD | 11 | 47 | 57 | 36 | 72 | 8.9 |
| 261 | THE STARE | boss | THE FENCE | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 262 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 263 | FIRST CHOIR | **regular** | THE CHOIR | — | STANDARD | 5 | 28 | 32 | 20 | 40 | 6.6 |
| 264 | CHOIR VOYAGE | **regular** | THE CHOIR | — | STANDARD | 6 | 30 | 40 | 25 | 50 | 8.4 |
| 265 | CHOIR AND FENCE | **regular** | THE CHOIR | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 9.1 |
| 266 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 9.8 |
| 267 | CHOIR RAPTURE | **regular** | THE CHOIR | — | STANDARD | 14 | 46 | 52 | 33 | 66 | 11.8 |
| 268 | CHOIR DREAM | **regular** | THE CHOIR | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.8 |
| 269 | CHOIR SAGA | **regular** | THE CHOIR | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 7.8 |
| 270 | CROOKED CHOIR | **regular** | THE CHOIR | — | STANDARD | 12 | 46 | 56 | 35 | 70 | 8.8 |
| 271 | THE VISE | boss | THE CHOIR | vise | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 272 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 273 | FIRST CLAW | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 26 | 16 | 32 | 0 |
| 274 | CLAW HORIZON | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 22 | 14 | 28 | 0 |
| 275 | CLAW DUET | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 276 | CLAW HOMECOMING | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 30 | 19 | 38 | 0 |
| 277 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 34 | 21 | 42 | 0 |
| 278 | CLAW PICNIC | **regular** | THE CLAW | — | STANDARD | 6 | 35 | 39 | 24 | 48 | 7 |
| 279 | CLAW LEGEND | **regular** | THE CLAW | — | STANDARD | 8 | 39 | 41 | 26 | 52 | 8 |
| 280 | CLAW PARADOX | **regular** | THE CLAW | — | STANDARD | 11 | 46 | 50 | 31 | 62 | 9 |
| 281 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 282 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 75 | 47 | 94 | 4.5 |
| 283 | FIRST BALLOON | **regular** | THE BALLOON | — | STANDARD | 5 | 29 | 60 | 38 | 76 | 6.6 |
| 284 | BALLOON VOYAGE | **regular** | THE BALLOON | — | STANDARD | 6 | 30 | 53 | 33 | 66 | 8.7 |
| 285 | BALLOON ALLIANCE | **regular** | THE BALLOON | — | STANDARD | 7 | 35 | 41 | 26 | 52 | 9.2 |
| 286 | BALLOON LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 37 | 62 | 39 | 78 | 9.7 |
| 287 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 14 | 45 | 57 | 36 | 72 | 11.8 |
| 288 | SOFT BALLOON | **regular** | THE BALLOON | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 6.9 |
| 289 | BALLOON RELIC | **regular** | THE BALLOON | — | STANDARD | 7 | 37 | 63 | 39 | 78 | 7.9 |
| 290 | BALLOON MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 73 | 46 | 92 | 8.9 |
| 291 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 292 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.3 |
| 293 | FIRST MOULT | **regular** | THE MOULT | — | STANDARD | 5 | 27 | 87 | 54 | 108 | 6.6 |
| 294 | FAR MOULT | **regular** | THE MOULT | — | STANDARD | 6 | 27 | 56 | 35 | 70 | 8.7 |
| 295 | MOULT WALTZ | **regular** | THE MOULT | — | STANDARD | 7 | 35 | 77 | 48 | 96 | 9 |
| 296 | MOULT RELIC | **regular** | THE MOULT | — | STANDARD | 7 | 36 | 77 | 48 | 96 | 9.6 |
| 297 | MOULT ECLIPSE | **regular** | THE MOULT | — | STANDARD | 14 | 47 | 77 | 48 | 96 | 11.6 |
| 298 | MOULT PICNIC | **regular** | THE MOULT | — | STANDARD | 6 | 37 | 51 | 32 | 64 | 6.9 |
| 299 | MOULT SAGA | **regular** | THE MOULT | — | STANDARD | 8 | 40 | 77 | 48 | 96 | 7.9 |
| 300 | MOULT RIDDLE | **regular** | THE MOULT | — | STANDARD | 11 | 46 | 107 | 67 | 134 | 8.9 |
| 301 | THE CHRYSALIS | boss | THE MOULT | chrysalis | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 302 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 303 | DARK MORNING | **regular** | THE DARK | — | STANDARD | 5 | 31 | 97 | 61 | 122 | 7.1 |
| 304 | LONG DARK ROAD | **regular** | THE DARK | — | STANDARD | 4 | 25 | 67 | 42 | 84 | 9.5 |
| 305 | DARK ALLIANCE | **regular** | THE DARK | — | STANDARD | 7 | 35 | 77 | 48 | 96 | 10.3 |
| 306 | DARK LEGEND | **regular** | THE DARK | — | STANDARD | 7 | 37 | 67 | 42 | 84 | 11.1 |
| 307 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 11 | 43 | 107 | 67 | 134 | 13.1 |
| 308 | SLEEPY DARK | **regular** | THE DARK | — | STANDARD | 7 | 39 | 67 | 42 | 84 | 7.2 |
| 309 | DARK REUNION | **regular** | THE DARK | — | STANDARD | 8 | 39 | 67 | 42 | 84 | 8.2 |
| 310 | DARK RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 117 | 73 | 146 | 9.2 |
| 311 | THE CURTAIN | boss | THE DARK | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 312 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 5.6 |
| 313 | FIRST COIL | **regular** | THE COIL | — | STANDARD | 5 | 27 | 29 | 18 | 36 | 6.3 |
| 314 | OUTER COIL | **regular** | THE COIL | — | STANDARD | 4 | 26 | 87 | 54 | 108 | 6.9 |
| 315 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 37 | 87 | 54 | 108 | 7.5 |
| 316 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8 |
| 317 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 318 | COIL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 34 | 38 | 24 | 48 | 6.9 |
| 319 | COIL REUNION | **regular** | THE COIL | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 7.9 |
| 320 | COIL ILLUSION | **regular** | THE COIL | — | STANDARD | 11 | 47 | 97 | 61 | 122 | 8.9 |
| 321 | PINBALL | boss (special) | THE COIL | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 322 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 77 | 48 | 96 | 6.2 |
| 323 | JAM DAWN | **regular** | THE JAM | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 6.6 |
| 324 | FAR JAM | **regular** | THE JAM | — | STANDARD | 6 | 29 | 97 | 61 | 122 | 9 |
| 325 | JAM DUET | **regular** | THE JAM | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 9.7 |
| 326 | OLD JAM SONG | **regular** | THE JAM | — | STANDARD | 8 | 39 | 47 | 29 | 58 | 11.7 |
| 327 | JAM OVERDRIVE | **regular** | THE JAM | — | STANDARD | 15 | 48 | 97 | 61 | 122 | 13.7 |
| 328 | JAM HUSH | **regular** | THE JAM | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 6.8 |
| 329 | JAM REUNION | **regular** | THE JAM | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 7.8 |
| 330 | JAM MIRAGE | **regular** | THE JAM | — | STANDARD | 11 | 46 | 107 | 67 | 134 | 8.8 |
| 331 | THE SCOUT | boss (special) | THE JAM | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 332 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 333 | NEW CLASP MOON | **regular** | THE CLASP | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 6.6 |
| 334 | CLASP AT WORLD END | **regular** | THE CLASP | — | STANDARD | 6 | 28 | 31 | 19 | 38 | 8.4 |
| 335 | CLASP WALTZ | **regular** | THE CLASP | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 8.9 |
| 336 | CLASP HOMECOMING | **regular** | THE CLASP | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 10 |
| 337 | CLASP RAPTURE | **regular** | THE CLASP | — | STANDARD | 11 | 44 | 46 | 29 | 58 | 12 |
| 338 | CLASP DREAM | **regular** | THE CLASP | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 7 |
| 339 | CLASP LEGEND | **regular** | THE CLASP | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 8 |
| 340 | CROOKED CLASP | **regular** | THE CLASP | — | STANDARD | 11 | 45 | 48 | 30 | 60 | 9 |
| 341 | THE BATON | boss | THE CLASP | baton | STANDARD | 0 | 0 | 286 | 179 | 358 | — |
| 342 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 343 | NEW LID MOON | **regular** | THE LID | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 6.9 |
| 344 | LID HORIZON | **regular** | THE LID | — | STANDARD | 4 | 26 | 29 | 18 | 36 | 8.1 |
| 345 | LID TANGO | **regular** | THE LID | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 8.4 |
| 346 | ANCIENT LID | **regular** | THE LID | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.2 |
| 347 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 11.2 |
| 348 | LID LULLABY | **regular** | THE LID | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.1 |
| 349 | LID SAGA | **regular** | THE LID | — | STANDARD | 8 | 37 | 40 | 25 | 50 | 8.1 |
| 350 | LID MIRAGE | **regular** | THE LID | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.1 |
| 351 | THE OCULUS | boss | THE LID | oculus | STANDARD | 17 | 86 | 25 | 16 | 32 | — |
| 352 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.4 |
| 353 | FIRST CODEX | **regular** | THE CODEX | — | STANDARD | 5 | 29 | 36 | 23 | 46 | 8.5 |
| 354 | CODEX AT WORLD END | **regular** | THE CODEX | — | STANDARD | 4 | 24 | 30 | 19 | 38 | 9.5 |
| 355 | CODEX TANGO | **regular** | THE CODEX | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 10.1 |
| 356 | CODEX LEGEND | **regular** | THE CODEX | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 11.6 |
| 357 | CODEX OVERDRIVE | **regular** | THE CODEX | — | STANDARD | 13 | 48 | 54 | 34 | 68 | 13.6 |
| 358 | CODEX HUSH | **regular** | THE CODEX | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 8.6 |
| 359 | CODEX RELIC | **regular** | THE CODEX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.4 |
| 360 | CODEX TRICK | **regular** | THE CODEX | — | STANDARD | 11 | 47 | 50 | 31 | 62 | 10.4 |
| 361 | THE HAUL | boss (special) | THE CODEX | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 362 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 51 | 32 | 64 | 7.2 |
| 363 | CRYSTAL RISING | **regular** | THE CRYSTAL | — | STANDARD | 5 | 28 | 33 | 21 | 42 | 7.2 |
| 364 | LONG CRYSTAL ROAD | **regular** | THE CRYSTAL | — | STANDARD | 4 | 25 | 28 | 18 | 36 | 8.1 |
| 365 | CRYSTAL WALTZ | **regular** | THE CRYSTAL | — | STANDARD | 8 | 37 | 42 | 26 | 52 | 8.7 |
| 366 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.6 |
| 367 | CRYSTAL ECLIPSE | **regular** | THE CRYSTAL | — | STANDARD | 12 | 43 | 50 | 31 | 62 | 11.6 |
| 368 | CRYSTAL DREAM | **regular** | THE CRYSTAL | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7.3 |
| 369 | CRYSTAL HOMECOMING | **regular** | THE CRYSTAL | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 8.3 |
| 370 | CRYSTAL ILLUSION | **regular** | THE CRYSTAL | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 9.3 |
| 371 | THE PULSE | boss (special) | THE CRYSTAL | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 372 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 57 | 36 | 72 | 3.3 |
| 373 | HELLO VOLLEY | **regular** | THE VOLLEY | — | STANDARD | 6 | 31 | 62 | 39 | 78 | 7.5 |
| 374 | VOLLEY HORIZON | **regular** | THE VOLLEY | — | STANDARD | 4 | 24 | 50 | 31 | 62 | 8.1 |
| 375 | VOLLEY PARTY | **regular** | THE VOLLEY | — | STANDARD | 7 | 35 | 41 | 26 | 52 | 8.4 |
| 376 | VOLLEY LEGEND | **regular** | THE VOLLEY | — | STANDARD | 7 | 35 | 59 | 37 | 74 | 9.5 |
| 377 | VOLLEY APOCALYPSE | **regular** | THE VOLLEY | — | STANDARD | 14 | 48 | 61 | 38 | 76 | 11.5 |
| 378 | VOLLEY DREAM | **regular** | THE VOLLEY | — | STANDARD | 6 | 33 | 48 | 30 | 60 | 7.6 |
| 379 | VOLLEY REUNION | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 59 | 37 | 74 | 8.6 |
| 380 | VOLLEY MIRAGE | **regular** | THE VOLLEY | — | STANDARD | 12 | 44 | 70 | 44 | 88 | 9.6 |
| 381 | THE GORGE | boss | THE VOLLEY | gorge | STANDARD | 10 | 82 | 259 | 162 | 324 | — |
| 382 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 383 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 384 | LITTLE HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 6 | 31 | 56 | 35 | 70 | 10.1 |
| 385 | LONG HANDOVER ROAD | **regular** | THE HANDOVER | — | STANDARD | 6 | 29 | 49 | 31 | 62 | 11.6 |
| 386 | HANDOVER ALLIANCE | **regular** | THE HANDOVER | — | STANDARD | 10 | 38 | 64 | 40 | 80 | 12.6 |
| 387 | HANDOVER LEGEND | **regular** | THE HANDOVER | — | STANDARD | 8 | 36 | 61 | 38 | 76 | 14 |
| 388 | HANDOVER OVERDRIVE | **regular** | THE HANDOVER | — | STANDARD | 14 | 46 | 77 | 48 | 96 | 16 |
| 389 | SOFT HANDOVER | **regular** | THE HANDOVER | — | STANDARD | 7 | 37 | 42 | 26 | 52 | 10 |
| 390 | HANDOVER REUNION | **regular** | THE HANDOVER | — | STANDARD | 10 | 39 | 60 | 38 | 76 | 11 |
| 391 | HANDOVER RIDDLE | **regular** | THE HANDOVER | — | STANDARD | 13 | 48 | 70 | 44 | 88 | 12 |
| 392 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 393 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 394 | CRAWLER DAWN | **regular** | THE CRAWLER | — | STANDARD | 5 | 28 | 40 | 25 | 50 | 7.8 |
| 395 | FAR CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 4 | 25 | 56 | 35 | 70 | 8.1 |
| 396 | CRAWLER TANGO | **regular** | THE CRAWLER | — | STANDARD | 8 | 38 | 69 | 43 | 86 | 8.7 |
| 397 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 7 | 36 | 43 | 27 | 54 | 9.3 |
| 398 | CRAWLER INFERNO | **regular** | THE CRAWLER | — | STANDARD | 14 | 48 | 67 | 42 | 84 | 11.3 |
| 399 | SOFT CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 7 | 36 | 50 | 31 | 62 | 7.9 |
| 400 | CRAWLER RELIC | **regular** | THE CRAWLER | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.9 |
| 401 | CROOKED CRAWLER | **regular** | THE CRAWLER | — | STANDARD | 12 | 45 | 65 | 41 | 82 | 9.9 |
| 402 | THE UNDERTOW | boss | THE CRAWLER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 403 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 404 | LITTLE FLIP | **regular** | THE FLIP | — | STANDARD | 5 | 27 | 50 | 31 | 62 | 10.1 |
| 405 | FAR FLIP | **regular** | THE FLIP | — | STANDARD | 6 | 31 | 56 | 35 | 70 | 11.9 |
| 406 | FLIP WALTZ | **regular** | THE FLIP | — | STANDARD | 10 | 37 | 50 | 31 | 62 | 12.9 |
| 407 | OLD FLIP SONG | **regular** | THE FLIP | — | STANDARD | 8 | 35 | 45 | 28 | 56 | 14.6 |
| 408 | FLIP INFERNO | **regular** | THE FLIP | — | STANDARD | 16 | 48 | 68 | 43 | 86 | 16.6 |
| 409 | FLIP DREAM | **regular** | THE FLIP | — | STANDARD | 7 | 40 | 50 | 31 | 62 | 10 |
| 410 | FLIP REUNION | **regular** | THE FLIP | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 11 |
| 411 | FLIP PARADOX | **regular** | THE FLIP | — | STANDARD | 12 | 47 | 67 | 42 | 84 | 12 |
| 412 | THE VANE | boss | THE FLIP | vane | STANDARD 5 | 2 | 3 | 82 | 51 | 102 | — |
| 413 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 36 | 39 | 24 | 48 | 6.3 |
| 414 | LITTLE MINE | **regular** | THE MINE | — | STANDARD | 5 | 27 | 29 | 18 | 36 | 8.1 |
| 415 | FAR MINE | **regular** | THE MINE | — | STANDARD | 6 | 25 | 33 | 21 | 42 | 8.7 |
| 416 | MINE ALLIANCE | **regular** | THE MINE | — | STANDARD | 8 | 40 | 56 | 35 | 70 | 9 |
| 417 | MINE SAGA | **regular** | THE MINE | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 9.3 |
| 418 | MINE STORM | **regular** | THE MINE | — | STANDARD | 14 | 45 | 57 | 36 | 72 | 11.3 |
| 419 | MINE HUSH | **regular** | THE MINE | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 8.2 |
| 420 | ANCIENT MINE | **regular** | THE MINE | — | STANDARD | 8 | 35 | 42 | 26 | 52 | 9.2 |
| 421 | MINE ILLUSION | **regular** | THE MINE | — | STANDARD | 10 | 44 | 50 | 31 | 62 | 10.2 |
| 422 | THE MIMIC | boss | THE MINE | mimic, panel | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 423 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 44 | 28 | 56 | 7.2 |
| 424 | CAROM RISING | **regular** | THE CAROM | — | STANDARD | 5 | 28 | 43 | 27 | 54 | 8.4 |
| 425 | CAROM VOYAGE | **regular** | THE CAROM | — | STANDARD | 6 | 31 | 36 | 23 | 46 | 9 |
| 426 | CAROM ALLIANCE | **regular** | THE CAROM | — | STANDARD | 8 | 38 | 54 | 34 | 68 | 9.4 |
| 427 | OLD CAROM SONG | **regular** | THE CAROM | — | STANDARD | 7 | 38 | 47 | 29 | 58 | 10 |
| 428 | CAROM INFERNO | **regular** | THE CAROM | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 12 |
| 429 | SOFT CAROM | **regular** | THE CAROM | — | STANDARD | 6 | 37 | 68 | 43 | 86 | 8.5 |
| 430 | CAROM REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 9.5 |
| 431 | CAROM RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 44 | 55 | 34 | 68 | 10.5 |
| 432 | THE TASTER | boss | THE CAROM | taster | STANDARD | 10 | 80 | 44 | 28 | 56 | — |
| 433 | HELLO CAROM | **regular** | HELLO CAROM | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 9 |
| 434 | FAR CAROM | **regular** | HELLO CAROM | — | STANDARD | 6 | 29 | 44 | 28 | 56 | 10.8 |
| 435 | CAROM TANGO | **regular** | HELLO CAROM | — | STANDARD | 10 | 38 | 50 | 31 | 62 | 11.4 |
| 436 | ANCIENT CAROM | **regular** | HELLO CAROM | — | STANDARD | 8 | 38 | 48 | 30 | 60 | 12.3 |
| 437 | CAROM OVERDRIVE | **regular** | HELLO CAROM | — | STANDARD | 14 | 46 | 62 | 39 | 78 | 14.3 |
| 438 | THE LEDGER | boss | HELLO CAROM | ledger | STANDARD | 8 | 82 | 33 | 21 | 42 | — |
| 439 | MINE AWAKENS | **regular** | MINE AWAKENS | — | STANDARD | 5 | 28 | 44 | 28 | 56 | 9.2 |
| 440 | MINE VOYAGE | **regular** | MINE AWAKENS | — | STANDARD | 6 | 27 | 44 | 28 | 56 | 11.1 |
| 441 | MINE AND CRAWLER | **regular** | MINE AWAKENS | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 12 |
| 442 | MINE HOMECOMING | **regular** | MINE AWAKENS | — | STANDARD | 8 | 38 | 44 | 28 | 56 | 12.9 |
| 443 | MINE ECLIPSE | **regular** | MINE AWAKENS | — | STANDARD | 14 | 45 | 51 | 32 | 64 | 14.9 |
| 444 | THE SURGE | boss | MINE AWAKENS | surge | STANDARD | 8 | 76 | 45 | 28 | 56 | — |
| 445 | FIRST CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 5 | 28 | 59 | 37 | 74 | 9.3 |
| 446 | OUTER CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 6 | 30 | 56 | 35 | 70 | 11.1 |
| 447 | CRAWLER WALTZ | **regular** | FIRST CRAWLER | — | STANDARD | 8 | 39 | 56 | 35 | 70 | 11.9 |
| 448 | ANCIENT CRAWLER | **regular** | FIRST CRAWLER | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 12.7 |
| 449 | CRAWLER THUNDER | **regular** | FIRST CRAWLER | — | STANDARD | 16 | 46 | 62 | 39 | 78 | 14.7 |
| 450 | THE LEAD | boss | FIRST CRAWLER | lead | STANDARD | 8 | 84 | 41 | 26 | 52 | — |
| 451 | VOLLEY MORNING | **regular** | VOLLEY MORNING | — | STANDARD | 5 | 26 | 51 | 32 | 64 | 9.6 |
| 452 | VOLLEY PILGRIM | **regular** | VOLLEY MORNING | — | STANDARD | 6 | 32 | 53 | 33 | 66 | 10.8 |
| 453 | VOLLEY AND CRYSTAL | **regular** | VOLLEY MORNING | — | STANDARD | 11 | 40 | 71 | 44 | 88 | 11.5 |
| 454 | VOLLEY RELIC | **regular** | VOLLEY MORNING | — | STANDARD | 8 | 39 | 63 | 39 | 78 | 12.9 |
| 455 | VOLLEY ECLIPSE | **regular** | VOLLEY MORNING | — | STANDARD | 16 | 46 | 73 | 46 | 92 | 14.9 |
| 456 | THE SCUTTLE | boss | VOLLEY MORNING | scuttle | STANDARD | 0 | 0 | 49 | 31 | 62 | — |
| 457 | NEW CRYSTAL MOON | **regular** | NEW CRYSTAL MOON | — | STANDARD | 5 | 27 | 30 | 19 | 38 | 9.9 |
| 458 | CRYSTAL PILGRIM | **regular** | NEW CRYSTAL MOON | — | STANDARD | 6 | 29 | 57 | 36 | 72 | 10.5 |
| 459 | CRYSTAL DUET | **regular** | NEW CRYSTAL MOON | — | STANDARD | 8 | 37 | 42 | 26 | 52 | 10.8 |
| 460 | CRYSTAL RELIC | **regular** | NEW CRYSTAL MOON | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 12.1 |
| 461 | CRYSTAL APOCALYPSE | **regular** | NEW CRYSTAL MOON | — | STANDARD | 17 | 47 | 51 | 32 | 64 | 14.1 |
| 462 | THE ANTIPHON | boss | NEW CRYSTAL MOON | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 463 | LID AWAKENS | **regular** | LID AWAKENS | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 10.2 |
| 464 | LONG LID ROAD | **regular** | LID AWAKENS | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 11.1 |
| 465 | LID ALLIANCE | **regular** | LID AWAKENS | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.7 |
| 466 | LID HOMECOMING | **regular** | LID AWAKENS | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 12.6 |
| 467 | LID STORM | **regular** | LID AWAKENS | — | STANDARD | 17 | 48 | 87 | 54 | 108 | 14.6 |
| 468 | THE SPLICE | boss (special) | LID AWAKENS | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 469 | CLASP RISING | **regular** | CLASP RISING | — | STANDARD | 5 | 28 | 43 | 27 | 54 | 10.5 |
| 470 | CLASP HORIZON | **regular** | CLASP RISING | — | STANDARD | 6 | 31 | 38 | 24 | 48 | 11.1 |
| 471 | CLASP ALLIANCE | **regular** | CLASP RISING | — | STANDARD | 11 | 39 | 41 | 26 | 52 | 12 |
| 472 | OLD CLASP SONG | **regular** | CLASP RISING | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 13 |
| 473 | CLASP OVERDRIVE | **regular** | CLASP RISING | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 15 |
| 474 | THE CAIRN | boss | CLASP RISING | cairn | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 475 | COIL RISING | **regular** | COIL RISING | — | STANDARD | 5 | 28 | 67 | 42 | 84 | 10.8 |
| 476 | COIL VOYAGE | **regular** | COIL RISING | — | STANDARD | 6 | 31 | 97 | 61 | 122 | 11.4 |
| 477 | COIL WALTZ | **regular** | COIL RISING | — | STANDARD | 10 | 39 | 67 | 42 | 84 | 11.8 |
| 478 | COIL LEGEND | **regular** | COIL RISING | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 12.2 |
| 479 | COIL THUNDER | **regular** | COIL RISING | — | STANDARD | 14 | 46 | 77 | 48 | 96 | 14.2 |
| 480 | THE WELL | boss (special) | COIL RISING | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 481 | MOULT DAWN | **regular** | MOULT DAWN | — | STANDARD | 5 | 28 | 57 | 36 | 72 | 11.1 |
| 482 | MOULT PILGRIM | **regular** | MOULT DAWN | — | STANDARD | 6 | 30 | 67 | 42 | 84 | 11.7 |
| 483 | MOULT AND BALLOON | **regular** | MOULT DAWN | — | STANDARD | 8 | 36 | 97 | 61 | 122 | 12 |
| 484 | MOULT LEGEND | **regular** | MOULT DAWN | — | STANDARD | 8 | 36 | 67 | 42 | 84 | 12.7 |
| 485 | MOULT INFERNO | **regular** | MOULT DAWN | — | STANDARD | 14 | 48 | 87 | 54 | 108 | 14.7 |
| 486 | THE REPRISE | boss | MOULT DAWN | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 487 | BALLOON MORNING | **regular** | BALLOON MORNING | — | STANDARD | 5 | 26 | 51 | 32 | 64 | 11.4 |
| 488 | BALLOON AT WORLD END | **regular** | BALLOON MORNING | — | STANDARD | 6 | 31 | 46 | 29 | 58 | 12 |
| 489 | BALLOON WALTZ | **regular** | BALLOON MORNING | — | STANDARD | 10 | 39 | 63 | 39 | 78 | 12.5 |
| 490 | BALLOON REUNION | **regular** | BALLOON MORNING | — | STANDARD | 10 | 40 | 59 | 37 | 74 | 13 |
| 491 | BALLOON RAPTURE | **regular** | BALLOON MORNING | — | STANDARD | 14 | 48 | 79 | 49 | 98 | 15 |
| 492 | THE FILAMENT | boss | BALLOON MORNING | filament | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 493 | CHOIR MORNING | **regular** | CHOIR MORNING | — | STANDARD | 5 | 29 | 39 | 24 | 48 | 11.7 |
| 494 | LONG CHOIR ROAD | **regular** | CHOIR MORNING | — | STANDARD | 6 | 31 | 35 | 22 | 44 | 12 |
| 495 | CHOIR PARTY | **regular** | CHOIR MORNING | — | STANDARD | 10 | 38 | 48 | 30 | 60 | 12.4 |
| 496 | CHOIR RELIC | **regular** | CHOIR MORNING | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 13 |
| 497 | CHOIR OVERDRIVE | **regular** | CHOIR MORNING | — | STANDARD | 16 | 47 | 57 | 36 | 72 | 15 |
| 498 | THE SPOOL | boss | CHOIR MORNING | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 499 | FENCE AWAKENS | **regular** | FENCE AWAKENS | — | STANDARD | 5 | 27 | 42 | 26 | 52 | 9.9 |
| 500 | FAR FENCE | **regular** | FENCE AWAKENS | — | STANDARD | 5 | 25 | 40 | 25 | 50 | 11.1 |
| 501 | FENCE MEETS VEER | **regular** | FENCE AWAKENS | — | STANDARD | 10 | 37 | 52 | 33 | 66 | 11.8 |
| 502 | FENCE HOMECOMING | **regular** | FENCE AWAKENS | — | STANDARD | 10 | 40 | 50 | 31 | 62 | 13.3 |
| 503 | FENCE APOCALYPSE | **regular** | FENCE AWAKENS | — | STANDARD | 16 | 47 | 62 | 39 | 78 | 15.1 |
| 504 | THE HASP | boss | FENCE AWAKENS | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 505 | LITTLE VEER | **regular** | LITTLE VEER | — | STANDARD | 6 | 32 | 36 | 23 | 46 | 10.2 |
| 506 | VEER AT WORLD END | **regular** | LITTLE VEER | — | STANDARD | 6 | 30 | 45 | 28 | 56 | 11.1 |
| 507 | VEER ALLIANCE | **regular** | LITTLE VEER | — | STANDARD | 13 | 38 | 44 | 28 | 56 | 12.1 |
| 508 | VEER SAGA | **regular** | LITTLE VEER | — | STANDARD | 10 | 40 | 55 | 34 | 68 | 13.2 |
| 509 | VEER INFERNO | **regular** | LITTLE VEER | — | STANDARD | 19 | 46 | 61 | 38 | 76 | 15.1 |
| 510 | THE FLUE | boss | LITTLE VEER | flue, panel | SHOTS | 0 | 0 | 71 | 44 | 88 | — |
| 511 | NEW CAROM MOON | **regular** | NEW CAROM MOON | — | STANDARD | 5 | 29 | 31 | 19 | 38 | 10.4 |
| 512 | CAROM AT WORLD END | **regular** | NEW CAROM MOON | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 11.4 |
| 513 | CAROM PICNIC | **regular** | NEW CAROM MOON | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 12.4 |
| 514 | CAROM RELIC | **regular** | NEW CAROM MOON | — | STANDARD | 11 | 35 | 38 | 24 | 48 | 14.4 |
| 515 | CAROM APOCALYPSE | **regular** | NEW CAROM MOON | — | STANDARD | 18 | 47 | 51 | 32 | 64 | 16.4 |
| 516 | THE RATCHET | boss | NEW CAROM MOON | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 517 | NEW WEIGHT MOON | **regular** | NEW WEIGHT MOON | — | STANDARD | 5 | 27 | 32 | 20 | 40 | 10.5 |
| 518 | LONG WEIGHT ROAD | **regular** | NEW WEIGHT MOON | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 11.1 |
| 519 | WEIGHT MEETS BEATBOX | **regular** | NEW WEIGHT MOON | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.9 |
| 520 | WEIGHT RELIC | **regular** | NEW WEIGHT MOON | — | STANDARD | 10 | 40 | 42 | 26 | 52 | 12.8 |
| 521 | WEIGHT INFERNO | **regular** | NEW WEIGHT MOON | — | STANDARD | 16 | 46 | 52 | 33 | 66 | 14.4 |
| 522 | THE NETTLE | boss | NEW WEIGHT MOON | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 523 | BEATBOX RISING | **regular** | BEATBOX RISING | — | STANDARD | 5 | 28 | 35 | 22 | 44 | 11.1 |
| 524 | BEATBOX HORIZON | **regular** | BEATBOX RISING | — | STANDARD | 6 | 30 | 33 | 21 | 42 | 11.4 |
| 525 | BEATBOX AND CROSSING | **regular** | BEATBOX RISING | — | STANDARD | 13 | 40 | 44 | 28 | 56 | 11.8 |
| 526 | BEATBOX RELIC | **regular** | BEATBOX RISING | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 13.3 |
| 527 | BEATBOX STORM | **regular** | BEATBOX RISING | — | STANDARD | 20 | 48 | 52 | 33 | 66 | 15.3 |
| 528 | THE MANTLE | boss | BEATBOX RISING | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 529 | CAROM MORNING | **regular** | CAROM MORNING | — | STANDARD | 5 | 28 | 36 | 23 | 46 | 11.7 |
| 530 | CAROM HORIZON | **regular** | CAROM MORNING | — | STANDARD | 6 | 30 | 34 | 21 | 42 | 12 |
| 531 | SLEEPY CAROM | **regular** | CAROM MORNING | — | STANDARD | 14 | 40 | 45 | 28 | 56 | 13 |
| 532 | CAROM SAGA | **regular** | CAROM MORNING | — | STANDARD | 11 | 36 | 39 | 24 | 48 | 14.8 |
| 533 | CAROM RAPTURE | **regular** | CAROM MORNING | — | STANDARD | 18 | 43 | 50 | 31 | 62 | 16.9 |
| 534 | THE KEEL | boss | CAROM MORNING | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 535 | LITTLE SEEDER | **regular** | LITTLE SEEDER | — | STANDARD | 5 | 27 | 44 | 28 | 56 | 9 |
| 536 | SEEDER AT WORLD END | **regular** | LITTLE SEEDER | — | STANDARD | 6 | 28 | 40 | 25 | 50 | 10.2 |
| 537 | SEEDER TANGO | **regular** | LITTLE SEEDER | — | STANDARD | 12 | 40 | 51 | 32 | 64 | 10.9 |
| 538 | SEEDER SAGA | **regular** | LITTLE SEEDER | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 12.9 |
| 539 | SEEDER ECLIPSE | **regular** | LITTLE SEEDER | — | STANDARD | 16 | 46 | 63 | 39 | 78 | 14.9 |
| 540 | THE VALVE | boss | LITTLE SEEDER | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 541 | LITTLE MORSEL | **regular** | LITTLE MORSEL | — | STANDARD | 4 | 31 | 39 | 24 | 48 | 9.9 |
| 542 | FAR MORSEL | **regular** | LITTLE MORSEL | — | STANDARD | 4 | 29 | 39 | 24 | 48 | 11.1 |
| 543 | MORSEL DUET | **regular** | LITTLE MORSEL | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 11.7 |
| 544 | OLD MORSEL SONG | **regular** | LITTLE MORSEL | — | STANDARD | 10 | 39 | 56 | 35 | 70 | 13 |
| 545 | MORSEL RAPTURE | **regular** | LITTLE MORSEL | — | STANDARD | 17 | 46 | 63 | 39 | 78 | 14.9 |
| 546 | THE SEAM | boss | LITTLE MORSEL | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 547 | HUSK MORNING | **regular** | HUSK MORNING | — | STANDARD | 2 | 31 | 37 | 23 | 46 | 3 |
| 548 | OUTER HUSK | **regular** | HUSK MORNING | — | STANDARD | 2 | 28 | 35 | 22 | 44 | 4.5 |
| 549 | HUSK WALTZ | **regular** | HUSK MORNING | — | STANDARD | 7 | 40 | 44 | 28 | 56 | 6.5 |
| 550 | OLD HUSK SONG | **regular** | HUSK MORNING | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 9.3 |
| 551 | HUSK STORM | **regular** | HUSK MORNING | — | STANDARD | 12 | 47 | 53 | 33 | 66 | 10.5 |
| 552 | THE SLING | boss | HUSK MORNING | sling | STANDARD | 0 | 0 | 43 | 27 | 54 | — |
| 553 | LITTLE CAROM | **regular** | LITTLE CAROM | — | STANDARD | 3 | 28 | 32 | 20 | 40 | 5.4 |
| 554 | LONG CAROM ROAD | **regular** | LITTLE CAROM | — | STANDARD | 4 | 30 | 34 | 21 | 42 | 7.8 |
| 555 | CAROM HUSH | **regular** | LITTLE CAROM | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 8.8 |
| 556 | CAROM HOMECOMING | **regular** | LITTLE CAROM | — | STANDARD | 9 | 40 | 44 | 28 | 56 | 10.8 |
| 557 | CAROM ECLIPSE | **regular** | LITTLE CAROM | — | STANDARD | 13 | 48 | 52 | 33 | 66 | 12.7 |
| 558 | THE CAPSTAN | boss | LITTLE CAROM | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 559 | NEW TORCH MOON | **regular** | NEW TORCH MOON | — | STANDARD | 5 | 28 | 43 | 27 | 54 | 7 |
| 560 | LONG TORCH ROAD | **regular** | NEW TORCH MOON | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 9 |
| 561 | TORCH AND ROCK | **regular** | NEW TORCH MOON | — | STANDARD | 13 | 40 | 50 | 31 | 62 | 9.8 |
| 562 | TORCH SAGA | **regular** | NEW TORCH MOON | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11.8 |
| 563 | TORCH ECLIPSE | **regular** | NEW TORCH MOON | — | STANDARD | 16 | 43 | 53 | 33 | 66 | 13.8 |
| 564 | THE GALL | boss | NEW TORCH MOON | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 565 | CAROM DAWN | **regular** | CAROM DAWN | — | STANDARD | 5 | 30 | 37 | 23 | 46 | 7.3 |
| 566 | CAROM PILGRIM | **regular** | CAROM DAWN | — | STANDARD | 6 | 32 | 35 | 22 | 44 | 9.3 |
| 567 | LAZY CAROM | **regular** | CAROM DAWN | — | STANDARD | 13 | 39 | 46 | 29 | 58 | 10.3 |
| 568 | CAROM LEGEND | **regular** | CAROM DAWN | — | STANDARD | 12 | 39 | 45 | 28 | 56 | 12.2 |
| 569 | CAROM THUNDER | **regular** | CAROM DAWN | — | STANDARD | 16 | 47 | 55 | 34 | 68 | 14.2 |
| 570 | THE TRAPEZE | boss | CAROM DAWN | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 571 | WISP AWAKENS | **regular** | WISP AWAKENS | — | STANDARD | 5 | 31 | 34 | 21 | 42 | 7.8 |
| 572 | WISP PILGRIM | **regular** | WISP AWAKENS | — | STANDARD | 6 | 28 | 38 | 24 | 48 | 9.9 |
| 573 | WISP MEETS GHOST | **regular** | WISP AWAKENS | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 10.8 |
| 574 | ANCIENT WISP | **regular** | WISP AWAKENS | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 12.8 |
| 575 | WISP RAPTURE | **regular** | WISP AWAKENS | — | STANDARD | 16 | 45 | 48 | 30 | 60 | 14.8 |
| 576 | THE GOVERNOR | boss | WISP AWAKENS | governor | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 577 | GHOST DAWN | **regular** | GHOST DAWN | — | STANDARD | 5 | 30 | 33 | 21 | 42 | 7.9 |
| 578 | GHOST AT WORLD END | **regular** | GHOST DAWN | — | STANDARD | 6 | 30 | 35 | 22 | 44 | 9.9 |
| 579 | GHOST AND COUNT | **regular** | GHOST DAWN | — | STANDARD | 10 | 37 | 44 | 28 | 56 | 10.9 |
| 580 | ANCIENT GHOST | **regular** | GHOST DAWN | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.3 |
| 581 | GHOST OVERDRIVE | **regular** | GHOST DAWN | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 14.3 |
| 582 | THE LATCH | boss | GHOST DAWN | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 583 | FIRST CAROM | **regular** | FIRST CAROM | — | STANDARD | 5 | 28 | 31 | 19 | 38 | 8.1 |
| 584 | OUTER CAROM | **regular** | FIRST CAROM | — | STANDARD | 6 | 30 | 45 | 28 | 56 | 10.2 |
| 585 | CAROM DREAM | **regular** | FIRST CAROM | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 11.1 |
| 586 | GOLDEN ANCIENT CAROM | **regular** | FIRST CAROM | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 13.1 |
| 587 | CAROM STORM | **regular** | FIRST CAROM | — | STANDARD | 16 | 46 | 49 | 31 | 62 | 15 |
| 588 | THE HYDRA | boss | FIRST CAROM | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 9 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 107 | THE BASTION | normal | 87 beats | 54 | 108 s | in band |
| 115 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 119 | FINALE | normal | 79 beats | 49 | 98 s | in band |
| 134 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 144 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 159 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 169 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 179 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 189 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 199 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 209 | THE PLUMB | normal | 45 beats | 28 | 56 s | short |
| 219 | THE LAMPREY | normal | 132 beats | 83 | 166 s | long |
| 229 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 239 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 249 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 261 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 271 | THE VISE | normal | 42 beats | 26 | 52 s | short |
| 281 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 291 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 301 | THE CHRYSALIS | normal | 75 beats | 47 | 94 s | in band |
| 311 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 321 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 331 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 341 | THE BATON | normal | 286 beats | 179 | 358 s | long |
| 351 | THE OCULUS | normal | 25 beats | 16 | 32 s | short |
| 361 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 371 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 381 | THE GORGE | normal | 259 beats | 162 | 324 s | long |
| 392 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 402 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 412 | THE VANE | normal | 82 beats | 51 | 102 s | in band |
| 422 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 432 | THE TASTER | normal | 44 beats | 28 | 56 s | short |
| 438 | THE LEDGER | normal | 33 beats | 21 | 42 s | short |
| 444 | THE SURGE | normal | 45 beats | 28 | 56 s | short |
| 450 | THE LEAD | normal | 41 beats | 26 | 52 s | short |
| 456 | THE SCUTTLE | normal | 49 beats | 31 | 62 s | in band |
| 462 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 468 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 474 | THE CAIRN | normal | 25 beats | 16 | 32 s | short |
| 480 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 486 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 492 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 498 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 504 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 510 | THE FLUE | normal | 71 beats | 44 | 88 s | in band |
| 516 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 522 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 528 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 534 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 540 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 546 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 552 | THE SLING | normal | 43 beats | 27 | 54 s | short |
| 558 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 564 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 570 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 576 | THE GOVERNOR | normal | 25 beats | 16 | 32 s | short |
| 582 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 588 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
