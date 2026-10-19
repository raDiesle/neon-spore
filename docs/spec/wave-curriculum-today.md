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
| regular | 352 | 0 | 14 | 28 | 67 | 2 h 52 min | 5 h 44 min |
| intro | 64 | 0 | 3 | 26 | 51 | 30 min | 60 min |
| boss | 61 | 0 | 9 | 31 | 343 | 51 min | 1 h 42 min |
| every wave | 477 | 0 | 3 | 28 | 343 | 4 h 13 min | 8 h 26 min |

## Every wave

| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FIRST STEP | intro | FIRST STEP | slick, panel | STANDARD 1 | 9 | 64 | 67 | 42 | 84 | 2.4 |
| 2 | FIRST RED | **regular** | FIRST STEP | — | STANDARD 1 | 5 | 29 | 32 | 20 | 40 | 2.4 |
| 3 | RED WANDERER | **regular** | FIRST STEP | — | STANDARD 1 | 6 | 29 | 32 | 20 | 40 | 4.4 |
| 4 | RED TANGO | **regular** | FIRST STEP | — | STANDARD 1 | 8 | 41 | 44 | 28 | 56 | 5.4 |
| 5 | THE MOTH | boss | FIRST STEP | moth | STANDARD 1 | 0 | 0 | 44 | 28 | 56 | — |
| 6 | CYAN | intro | CYAN | bulb, panel | STANDARD 2 | 4 | 24 | 27 | 17 | 34 | 1.4 |
| 7 | CYAN AWAKENS | **regular** | CYAN | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 2.6 |
| 8 | CYAN PICNIC | **regular** | CYAN | — | STANDARD 2 | 7 | 36 | 39 | 24 | 48 | 3.4 |
| 9 | CYAN RAPTURE | **regular** | CYAN | — | STANDARD 2 | 8 | 42 | 45 | 28 | 56 | 4.6 |
| 10 | THE BROOD | boss | CYAN | brood | STANDARD 2 | 0 | 0 | 40 | 25 | 50 | — |
| 11 | THE SHELL | intro | THE SHELL | shell | STANDARD 2 | 2 | 10 | 15 | 9 | 18 | 3 |
| 12 | SHELL AND CYAN | **regular** | THE SHELL | — | STANDARD 2 | 7 | 38 | 41 | 26 | 52 | 7 |
| 13 | SHELL SAGA | **regular** | THE SHELL | — | STANDARD 2 | 6 | 38 | 43 | 27 | 54 | 8 |
| 14 | SHELL THUNDER | **regular** | THE SHELL | — | STANDARD 2 | 9 | 48 | 51 | 32 | 64 | 10 |
| 15 | HOLD AND AIM | intro | THE SHELL | — | STANDARD 2 | 6 | 33 | 36 | 23 | 46 | 6.8 |
| 16 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD 2 | 5 | 52 | 55 | 34 | 68 | 3.9 |
| 17 | MAGNET DUET | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 34 | 37 | 23 | 46 | 7.1 |
| 18 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 8.1 |
| 19 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 20 | THE THROB | intro | THE THROB | throb | STANDARD 2 | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 21 | THROB TANGO | **regular** | THE THROB | — | STANDARD 2 | 6 | 36 | 40 | 25 | 50 | 7.1 |
| 22 | THROB RELIC | **regular** | THE THROB | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 8.5 |
| 23 | THROB STORM | **regular** | THE THROB | — | STANDARD 2 | 9 | 43 | 46 | 29 | 58 | 10 |
| 24 | THE ECHO | intro | THE ECHO | echo | STANDARD 2 | 6 | 44 | 47 | 29 | 58 | 4 |
| 25 | ECHO ALLIANCE | **regular** | THE ECHO | — | STANDARD 2 | 6 | 39 | 42 | 26 | 52 | 7.5 |
| 26 | ECHO SAGA | **regular** | THE ECHO | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 27 | ECHO RAPTURE | **regular** | THE ECHO | — | STANDARD 2 | 9 | 44 | 47 | 29 | 58 | 10 |
| 28 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD 2 | 4 | 32 | 38 | 24 | 48 | 3.9 |
| 29 | RECOIL MEETS ECHO | **regular** | THE RECOIL | — | STANDARD 2 | 6 | 35 | 41 | 26 | 52 | 7.6 |
| 30 | OLD RECOIL SONG | **regular** | THE RECOIL | — | STANDARD 2 | 6 | 37 | 43 | 27 | 54 | 8.6 |
| 31 | RECOIL STORM | **regular** | THE RECOIL | — | STANDARD 2 | 9 | 44 | 47 | 29 | 58 | 10 |
| 32 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD 2 | 1 | 0 | 10 | 6 | 12 | 1.5 |
| 33 | GYRE DUET | **regular** | THE GYRE | — | STANDARD 2 | 6 | 36 | 46 | 29 | 58 | 7.8 |
| 34 | GYRE LEGEND | **regular** | THE GYRE | — | STANDARD 2 | 6 | 37 | 47 | 29 | 58 | 8.8 |
| 35 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 36 | THE LURE | intro | THE LURE | lure | STANDARD 2 | 6 | 40 | 47 | 29 | 58 | 3.9 |
| 37 | LURE AND GYRE | **regular** | THE LURE | — | STANDARD 2 | 6 | 34 | 49 | 31 | 62 | 7.9 |
| 38 | LURE REUNION | **regular** | THE LURE | — | STANDARD 2 | 6 | 37 | 52 | 33 | 66 | 8.4 |
| 39 | LURE INFERNO | **regular** | THE LURE | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 40 | THE RIND | intro | THE RIND | rind | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 41 | RIND MEETS LURE | **regular** | THE RIND | — | STANDARD 2 | 6 | 36 | 41 | 26 | 52 | 8 |
| 42 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD 2 | 6 | 35 | 40 | 25 | 50 | 8.8 |
| 43 | RIND THUNDER | **regular** | THE RIND | — | STANDARD 2 | 9 | 46 | 49 | 31 | 62 | 10 |
| 44 | THE STRAND | intro | THE STRAND | strand | STANDARD 2 | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 45 | STRAND WALTZ | **regular** | THE STRAND | — | STANDARD 2 | 6 | 34 | 40 | 25 | 50 | 8.1 |
| 46 | ANCIENT STRAND | **regular** | THE STRAND | — | STANDARD 2 | 6 | 37 | 41 | 26 | 52 | 8.7 |
| 47 | STRAND INFERNO | **regular** | THE STRAND | — | STANDARD 2 | 10 | 48 | 53 | 33 | 66 | 10 |
| 48 | THE VEIL | intro | THE VEIL | veil | STANDARD 2 | 5 | 34 | 37 | 23 | 46 | 3.3 |
| 49 | VEIL WALTZ | **regular** | THE VEIL | — | STANDARD 2 | 6 | 38 | 44 | 28 | 56 | 8.5 |
| 50 | VEIL HOMECOMING | **regular** | THE VEIL | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 51 | VEIL RAPTURE | **regular** | THE VEIL | — | STANDARD 2 | 9 | 48 | 51 | 32 | 64 | 10 |
| 52 | THE DART | intro | THE DART | dart | STANDARD 2 | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 53 | DART PARTY | **regular** | THE DART | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 8.7 |
| 54 | DART HOMECOMING | **regular** | THE DART | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 55 | DART THUNDER | **regular** | THE DART | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 56 | THE COUNT | intro | THE COUNT | countdown | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 57 | COUNT DUET | **regular** | THE COUNT | — | STANDARD 2 | 6 | 36 | 43 | 27 | 54 | 8.8 |
| 58 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD 2 | 6 | 36 | 39 | 24 | 48 | 9.5 |
| 59 | COUNT APOCALYPSE | **regular** | THE COUNT | — | STANDARD 2 | 9 | 45 | 48 | 30 | 60 | 10 |
| 60 | THE GHOST | intro | THE GHOST | ghost | STANDARD 2 | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 61 | GHOST MEETS COUNT | **regular** | THE GHOST | — | STANDARD 2 | 6 | 35 | 38 | 24 | 48 | 8.9 |
| 62 | GHOST LEGEND | **regular** | THE GHOST | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 9.3 |
| 63 | GHOST RAPTURE | **regular** | THE GHOST | — | STANDARD 2 | 8 | 45 | 50 | 31 | 62 | 10 |
| 64 | THE WISP | intro | THE WISP | wisp | STANDARD 2 | 3 | 28 | 31 | 19 | 38 | 3 |
| 65 | WISP AND GHOST | **regular** | THE WISP | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 66 | WISP LEGEND | **regular** | THE WISP | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9.4 |
| 67 | WISP THUNDER | **regular** | THE WISP | — | STANDARD 2 | 9 | 44 | 47 | 29 | 58 | 10 |
| 68 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 35 | 22 | 44 | 1.4 |
| 69 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 45 | 28 | 56 | 2.6 |
| 70 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 50 | 31 | 62 | 3.8 |
| 71 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 45 | 28 | 56 | 5 |
| 72 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 17 | 11 | 22 | 5.8 |
| 73 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 25 | 16 | 32 | 10.8 |
| 74 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 22 | 25 | 16 | 32 | 3.3 |
| 75 | TORCH DUET | **regular** | TORCH | — | STANDARD 4 | 6 | 34 | 37 | 23 | 46 | 6.5 |
| 76 | TORCH LEGEND | **regular** | TORCH | — | STANDARD 4 | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 77 | TORCH OVERDRIVE | **regular** | TORCH | — | STANDARD 4 | 9 | 46 | 49 | 31 | 62 | 10 |
| 78 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 79 | TAP | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 80 | TAP TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 33 | 37 | 23 | 46 | 7 |
| 81 | ANCIENT TAP | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.5 |
| 82 | TAP THUNDER | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 50 | 31 | 62 | 10 |
| 83 | HOLD | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 84 | HOLD DUET | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 7 |
| 85 | HOLD HOMECOMING | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.1 |
| 86 | HOLD STORM | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 57 | 36 | 72 | 10 |
| 87 | SWIPE | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 88 | SWIPE DUET | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 7 |
| 89 | SWIPE LEGEND | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.3 |
| 90 | SWIPE ECLIPSE | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 48 | 51 | 32 | 64 | 10 |
| 91 | TURN | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 92 | TURN TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 33 | 37 | 23 | 46 | 6.9 |
| 93 | TURN SAGA | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 8.2 |
| 94 | TURN APOCALYPSE | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 50 | 31 | 62 | 10 |
| 95 | RUB | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 96 | RUB DUET | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 7 |
| 97 | RUB SAGA | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 8.4 |
| 98 | RUB ECLIPSE | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 58 | 36 | 72 | 10 |
| 99 | COMBO | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 100 | COMBO TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 7 | 39 | 42 | 26 | 52 | 7 |
| 101 | COMBO REUNION | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 7.7 |
| 102 | COMBO INFERNO | **regular** | THE BLISTER | — | STANDARD 4 | 10 | 48 | 53 | 33 | 66 | 9.7 |
| 103 | LEVER | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 104 | LEVER PARTY | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 35 | 40 | 25 | 50 | 6.9 |
| 105 | LEVER LEGEND | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 42 | 26 | 52 | 8.3 |
| 106 | LEVER ECLIPSE | **regular** | THE BLISTER | — | STANDARD 4 | 10 | 46 | 52 | 33 | 66 | 10 |
| 107 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 108 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 87 | 54 | 108 | — |
| 109 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 110 | SALVAGE TANGO | **regular** | SALVAGE | — | STANDARD 5 | 4 | 32 | 35 | 22 | 44 | 3.6 |
| 111 | SALVAGE LEGEND | **regular** | SALVAGE | — | STANDARD 5 | 4 | 32 | 35 | 22 | 44 | 4.2 |
| 112 | SALVAGE ECLIPSE | **regular** | SALVAGE | — | STANDARD 5 | 7 | 40 | 43 | 27 | 54 | 5.7 |
| 113 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 114 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 35 | 38 | 24 | 48 | 7 |
| 115 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 38 | 42 | 26 | 52 | 8.2 |
| 116 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 117 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 118 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 119 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 120 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 121 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 17 | 11 | 22 | 2.4 |
| 122 | HUSK TANGO | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 3.8 |
| 123 | ANCIENT HUSK | **regular** | THE HUSK | — | STANDARD 5 | 5 | 37 | 40 | 25 | 50 | 5.8 |
| 124 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 9 | 45 | 49 | 31 | 62 | 7.7 |
| 125 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 126 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 24 | 15 | 30 | 3.6 |
| 127 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 128 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 129 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 130 | SWINDLE DREAM | **regular** | THE HUSK | — | STANDARD 5 | 6 | 36 | 40 | 25 | 50 | 6.3 |
| 131 | ANCIENT SWINDLE | **regular** | THE HUSK | — | STANDARD 5 | 7 | 40 | 44 | 28 | 56 | 7.3 |
| 132 | SWINDLE TRICK | **regular** | THE HUSK | — | STANDARD 5 | 11 | 45 | 60 | 38 | 76 | 8.5 |
| 133 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 134 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 35 | 22 | 44 | 3.6 |
| 135 | MORSEL TANGO | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 42 | 26 | 52 | 7.1 |
| 136 | MORSEL SAGA | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 37 | 47 | 29 | 58 | 9.1 |
| 137 | MORSEL THUNDER | **regular** | THE MORSEL | — | STANDARD 5 | 12 | 46 | 53 | 33 | 66 | 11.1 |
| 138 | SOFT INSTAR | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 34 | 39 | 24 | 48 | 7.2 |
| 139 | INSTAR RELIC | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 35 | 38 | 24 | 48 | 8.2 |
| 140 | INSTAR SPELL | **regular** | THE MORSEL | — | STANDARD 5 | 10 | 45 | 48 | 30 | 60 | 9.2 |
| 141 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 142 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 143 | LANCE PARTY | **regular** | THE LANCE | — | STANDARD | 8 | 34 | 37 | 23 | 46 | 7.3 |
| 144 | LANCE REUNION | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 55 | 34 | 68 | 9.3 |
| 145 | LANCE INFERNO | **regular** | THE LANCE | — | STANDARD | 15 | 47 | 50 | 31 | 62 | 11.3 |
| 146 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 147 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 148 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 149 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 28 | 18 | 36 | 3.6 |
| 150 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 39 | 24 | 48 | 3.4 |
| 151 | SLEEPY GEODE | **regular** | THE LANCE | — | STANDARD | 5 | 40 | 43 | 27 | 54 | 6.1 |
| 152 | GEODE RELIC | **regular** | THE LANCE | — | STANDARD | 6 | 34 | 37 | 23 | 46 | 7.1 |
| 153 | GEODE ILLUSION | **regular** | THE LANCE | — | STANDARD | 10 | 44 | 49 | 31 | 62 | 8.1 |
| 154 | THE GEODE | boss | THE LANCE | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 155 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 156 | SEEDER AND MORSEL | **regular** | THE SEEDER | — | STANDARD | 8 | 36 | 53 | 33 | 66 | 7.3 |
| 157 | SEEDER REUNION | **regular** | THE SEEDER | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.4 |
| 158 | SEEDER THUNDER | **regular** | THE SEEDER | — | STANDARD | 11 | 45 | 62 | 39 | 78 | 11.4 |
| 159 | MIRROR DREAM | **regular** | THE SEEDER | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 7.6 |
| 160 | MIRROR HOMECOMING | **regular** | THE SEEDER | — | STANDARD | 7 | 39 | 43 | 27 | 54 | 8.6 |
| 161 | MIRROR ILLUSION | **regular** | THE SEEDER | — | STANDARD | 11 | 46 | 61 | 38 | 76 | 9.6 |
| 162 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 163 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 2.8 |
| 164 | CROSSING AND SEEDER | **regular** | THE CROSSING | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 7.4 |
| 165 | OLD CROSSING SONG | **regular** | THE CROSSING | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.4 |
| 166 | CROSSING ECLIPSE | **regular** | THE CROSSING | — | STANDARD | 14 | 48 | 56 | 35 | 70 | 11.3 |
| 167 | SOFT MAZE | **regular** | THE CROSSING | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 7.5 |
| 168 | OLD MAZE SONG | **regular** | THE CROSSING | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 8.5 |
| 169 | MAZE RIDDLE | **regular** | THE CROSSING | — | STANDARD | 11 | 48 | 63 | 39 | 78 | 9.5 |
| 170 | THE MAZE | boss (special) | THE CROSSING | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 171 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 69 | 43 | 86 | 5 |
| 172 | LIMPET DUET | **regular** | THE LIMPET | — | STANDARD | 8 | 36 | 47 | 29 | 58 | 11.3 |
| 173 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 8 | 40 | 47 | 29 | 58 | 13.4 |
| 174 | LIMPET APOCALYPSE | **regular** | THE LIMPET | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 15.4 |
| 175 | GAUGE HUSH | **regular** | THE LIMPET | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 8.8 |
| 176 | GAUGE SAGA | **regular** | THE LIMPET | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 9.8 |
| 177 | CROOKED GAUGE | **regular** | THE LIMPET | — | STANDARD | 11 | 47 | 57 | 36 | 72 | 10.8 |
| 178 | THE GAUGE | boss (special) | THE LIMPET | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 179 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 180 | BEATBOX PARTY | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.5 |
| 181 | BEATBOX LEGEND | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.4 |
| 182 | BEATBOX ECLIPSE | **regular** | THE BEATBOX | — | STANDARD | 14 | 45 | 49 | 31 | 62 | 11.4 |
| 183 | LAZY FLEET | **regular** | THE BEATBOX | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.6 |
| 184 | FLEET SAGA | **regular** | THE BEATBOX | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.6 |
| 185 | FLEET TRICK | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 58 | 36 | 72 | 9.6 |
| 186 | THE FLEET | boss (special) | THE BEATBOX | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 187 | HOLD TOGETHER | intro | HOLD TOGETHER | blisterBoth | STANDARD | 5 | 42 | 46 | 29 | 58 | 3.9 |
| 188 | TOGETHER DUET | **regular** | HOLD TOGETHER | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 7.6 |
| 189 | OLD TOGETHER SONG | **regular** | HOLD TOGETHER | — | STANDARD | 8 | 38 | 42 | 26 | 52 | 9.6 |
| 190 | TOGETHER STORM | **regular** | HOLD TOGETHER | — | STANDARD | 14 | 43 | 47 | 29 | 58 | 11.5 |
| 191 | LAZY PLUMB | **regular** | HOLD TOGETHER | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.8 |
| 192 | PLUMB REUNION | **regular** | HOLD TOGETHER | — | STANDARD | 8 | 38 | 48 | 30 | 60 | 8.8 |
| 193 | PLUMB MIRAGE | **regular** | HOLD TOGETHER | — | STANDARD | 9 | 42 | 46 | 29 | 58 | 9.8 |
| 194 | THE PLUMB | boss | HOLD TOGETHER | plumb | STANDARD | 0 | 0 | 45 | 28 | 56 | — |
| 195 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 196 | LEECH DUET | **regular** | THE LEECH | — | STANDARD | 7 | 36 | 41 | 26 | 52 | 9.3 |
| 197 | LEECH SAGA | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 11.2 |
| 198 | LEECH THUNDER | **regular** | THE LEECH | — | STANDARD | 12 | 43 | 60 | 38 | 76 | 13.2 |
| 199 | LAMPREY DREAM | **regular** | THE LEECH | — | STANDARD | 6 | 37 | 52 | 33 | 66 | 9.4 |
| 200 | OLD LAMPREY SONG | **regular** | THE LEECH | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 201 | LAMPREY TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 45 | 60 | 38 | 76 | 11 |
| 202 | THE LAMPREY | boss | THE LEECH | lamprey | STANDARD | 0 | 0 | 132 | 83 | 166 | — |
| 203 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 204 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 205 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 6.7 |
| 206 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 34 | 39 | 24 | 48 | 7.7 |
| 207 | HIVE LULLABY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.7 |
| 208 | HIVE HOMECOMING | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 39 | 43 | 27 | 54 | 7.7 |
| 209 | HIVE MIRAGE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 45 | 52 | 33 | 66 | 8.7 |
| 210 | THE HIVE | boss | HEAVY ROCKS | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 211 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 57 | 36 | 72 | 3.6 |
| 212 | VEER AND HEAVY ROCK | **regular** | THE VEER | — | STANDARD | 7 | 36 | 46 | 29 | 58 | 7.3 |
| 213 | VEER REUNION | **regular** | THE VEER | — | STANDARD | 7 | 36 | 45 | 28 | 56 | 9.3 |
| 214 | VEER APOCALYPSE | **regular** | THE VEER | — | STANDARD | 14 | 45 | 54 | 34 | 68 | 11.3 |
| 215 | LAZY SNAKE | **regular** | THE VEER | — | STANDARD | 6 | 36 | 53 | 33 | 66 | 7.4 |
| 216 | ANCIENT SNAKE | **regular** | THE VEER | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.4 |
| 217 | CROOKED SNAKE | **regular** | THE VEER | — | STANDARD | 11 | 44 | 51 | 32 | 64 | 9.4 |
| 218 | SNAKE | boss (special) | THE VEER | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 219 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 220 | CHOKE ALLIANCE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 9.3 |
| 221 | CHOKE REUNION | **regular** | THE CHOKE | — | STANDARD | 7 | 36 | 45 | 28 | 56 | 11.1 |
| 222 | CHOKE THUNDER | **regular** | THE CHOKE | — | STANDARD | 12 | 47 | 62 | 39 | 78 | 12.7 |
| 223 | WARDEN HUSH | **regular** | THE CHOKE | — | STANDARD | 5 | 35 | 50 | 31 | 62 | 9.6 |
| 224 | WARDEN RELIC | **regular** | THE CHOKE | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 225 | WARDEN ILLUSION | **regular** | THE CHOKE | — | STANDARD | 11 | 46 | 61 | 38 | 76 | 11 |
| 226 | THE WARDEN | boss | THE CHOKE | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 227 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 34 | 21 | 42 | 1.5 |
| 228 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 66 | 41 | 82 | 4.5 |
| 229 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 58 | 36 | 72 | 1.5 |
| 230 | FENCE ALLIANCE | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 55 | 34 | 68 | 7.4 |
| 231 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 8 | 39 | 42 | 26 | 52 | 9.4 |
| 232 | FENCE INFERNO | **regular** | THE FENCE | — | STANDARD | 12 | 44 | 59 | 37 | 74 | 11.4 |
| 233 | SLEEPY STARE | **regular** | THE FENCE | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 7.5 |
| 234 | STARE SAGA | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 8.5 |
| 235 | STARE RIDDLE | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 51 | 32 | 64 | 9.5 |
| 236 | THE STARE | boss | THE FENCE | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 237 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 238 | CHOIR AND FENCE | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 55 | 34 | 68 | 7.8 |
| 239 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 10 |
| 240 | CHOIR RAPTURE | **regular** | THE CHOIR | — | STANDARD | 12 | 44 | 54 | 34 | 68 | 12 |
| 241 | VISE DREAM | **regular** | THE CHOIR | — | STANDARD | 6 | 35 | 45 | 28 | 56 | 7.9 |
| 242 | VISE SAGA | **regular** | THE CHOIR | — | STANDARD | 8 | 38 | 48 | 30 | 60 | 8.9 |
| 243 | CROOKED VISE | **regular** | THE CHOIR | — | STANDARD | 11 | 43 | 47 | 29 | 58 | 9.9 |
| 244 | THE VISE | boss | THE CHOIR | vise | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 245 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 246 | CLAW DUET | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 39 | 24 | 48 | 0 |
| 247 | CLAW HOMECOMING | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 31 | 19 | 38 | 0 |
| 248 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 35 | 22 | 44 | 0 |
| 249 | THROAT PICNIC | **regular** | THE CLAW | — | STANDARD | 6 | 36 | 46 | 29 | 58 | 7.9 |
| 250 | THROAT LEGEND | **regular** | THE CLAW | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 8.9 |
| 251 | THROAT PARADOX | **regular** | THE CLAW | — | STANDARD | 11 | 46 | 49 | 31 | 62 | 9.9 |
| 252 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 253 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 75 | 47 | 94 | 4.5 |
| 254 | BALLOON ALLIANCE | **regular** | THE BALLOON | — | STANDARD | 8 | 37 | 55 | 34 | 68 | 8 |
| 255 | BALLOON LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 36 | 60 | 38 | 76 | 10 |
| 256 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 14 | 48 | 65 | 41 | 82 | 12 |
| 257 | SOFT SINEW | **regular** | THE BALLOON | — | STANDARD | 6 | 35 | 40 | 25 | 50 | 8.1 |
| 258 | SINEW LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9 |
| 259 | SINEW MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 45 | 52 | 33 | 66 | 10 |
| 260 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 261 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.3 |
| 262 | MOULT WALTZ | **regular** | THE MOULT | — | STANDARD | 8 | 37 | 77 | 48 | 96 | 8.1 |
| 263 | MOULT RELIC | **regular** | THE MOULT | — | STANDARD | 7 | 37 | 67 | 42 | 84 | 10 |
| 264 | MOULT ECLIPSE | **regular** | THE MOULT | — | STANDARD | 12 | 44 | 87 | 54 | 108 | 12 |
| 265 | CHRYSALIS PICNIC | **regular** | THE MOULT | — | STANDARD | 6 | 35 | 43 | 27 | 54 | 8.2 |
| 266 | CHRYSALIS SAGA | **regular** | THE MOULT | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 9.2 |
| 267 | CHRYSALIS RIDDLE | **regular** | THE MOULT | — | STANDARD | 9 | 44 | 59 | 37 | 74 | 10.2 |
| 268 | THE CHRYSALIS | boss | THE MOULT | chrysalis | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 269 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 270 | DARK ALLIANCE | **regular** | THE DARK | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.2 |
| 271 | DARK LEGEND | **regular** | THE DARK | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.2 |
| 272 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 13.2 |
| 273 | SLEEPY CURTAIN | **regular** | THE DARK | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 9.4 |
| 274 | CURTAIN REUNION | **regular** | THE DARK | — | STANDARD | 7 | 38 | 60 | 38 | 76 | 9.8 |
| 275 | CURTAIN RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 10.8 |
| 276 | THE CURTAIN | boss | THE DARK | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 277 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 5.6 |
| 278 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 35 | 87 | 54 | 108 | 6.3 |
| 279 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 8 |
| 280 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 281 | PINBALL LULLABY | **regular** | THE COIL | — | STANDARD | 6 | 40 | 43 | 27 | 54 | 6.7 |
| 282 | PINBALL REUNION | **regular** | THE COIL | — | STANDARD | 8 | 40 | 77 | 48 | 96 | 7.7 |
| 283 | PINBALL ILLUSION | **regular** | THE COIL | — | STANDARD | 11 | 45 | 52 | 33 | 66 | 8.7 |
| 284 | PINBALL | boss (special) | THE COIL | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 285 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 77 | 48 | 96 | 6.2 |
| 286 | JAM DUET | **regular** | THE JAM | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 287 | OLD JAM SONG | **regular** | THE JAM | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 11.6 |
| 288 | JAM OVERDRIVE | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 13.6 |
| 289 | SCOUT HUSH | **regular** | THE JAM | — | STANDARD | 6 | 38 | 44 | 28 | 56 | 9.7 |
| 290 | SCOUT REUNION | **regular** | THE JAM | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 291 | SCOUT MIRAGE | **regular** | THE JAM | — | STANDARD | 11 | 45 | 53 | 33 | 66 | 11 |
| 292 | THE SCOUT | boss (special) | THE JAM | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 293 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 294 | CLASP WALTZ | **regular** | THE CLASP | — | STANDARD | 8 | 37 | 52 | 33 | 66 | 7.4 |
| 295 | CLASP HOMECOMING | **regular** | THE CLASP | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 9.5 |
| 296 | CLASP RAPTURE | **regular** | THE CLASP | — | STANDARD | 14 | 44 | 48 | 30 | 60 | 11.4 |
| 297 | BATON DREAM | **regular** | THE CLASP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.5 |
| 298 | BATON LEGEND | **regular** | THE CLASP | — | STANDARD | 8 | 40 | 71 | 44 | 88 | 8.5 |
| 299 | CROOKED BATON | **regular** | THE CLASP | — | STANDARD | 11 | 48 | 52 | 33 | 66 | 9.5 |
| 300 | THE BATON | boss | THE CLASP | baton | STANDARD | 0 | 0 | 286 | 179 | 358 | — |
| 301 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 302 | LID TANGO | **regular** | THE LID | — | STANDARD | 8 | 36 | 51 | 32 | 64 | 7.5 |
| 303 | ANCIENT LID | **regular** | THE LID | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 9.4 |
| 304 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 12 | 45 | 48 | 30 | 60 | 11.4 |
| 305 | OCULUS LULLABY | **regular** | THE LID | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.6 |
| 306 | OCULUS SAGA | **regular** | THE LID | — | STANDARD | 8 | 39 | 44 | 28 | 56 | 8.6 |
| 307 | OCULUS MIRAGE | **regular** | THE LID | — | STANDARD | 11 | 46 | 107 | 67 | 134 | 9.6 |
| 308 | THE OCULUS | boss | THE LID | oculus | STANDARD | 17 | 86 | 25 | 16 | 32 | — |
| 309 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.4 |
| 310 | CODEX TANGO | **regular** | THE CODEX | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 9.6 |
| 311 | CODEX LEGEND | **regular** | THE CODEX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 11.6 |
| 312 | CODEX OVERDRIVE | **regular** | THE CODEX | — | STANDARD | 14 | 45 | 49 | 31 | 62 | 13.7 |
| 313 | HAUL HUSH | **regular** | THE CODEX | — | STANDARD | 6 | 34 | 42 | 26 | 52 | 9.7 |
| 314 | HAUL RELIC | **regular** | THE CODEX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 315 | HAUL TRICK | **regular** | THE CODEX | — | STANDARD | 10 | 43 | 54 | 34 | 68 | 11 |
| 316 | THE HAUL | boss (special) | THE CODEX | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 317 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 51 | 32 | 64 | 7.2 |
| 318 | CRYSTAL WALTZ | **regular** | THE CRYSTAL | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 7.6 |
| 319 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.4 |
| 320 | CRYSTAL ECLIPSE | **regular** | THE CRYSTAL | — | STANDARD | 15 | 48 | 53 | 33 | 66 | 11.4 |
| 321 | PULSE DREAM | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 7.7 |
| 322 | PULSE HOMECOMING | **regular** | THE CRYSTAL | — | STANDARD | 10 | 40 | 58 | 36 | 72 | 8.7 |
| 323 | PULSE ILLUSION | **regular** | THE CRYSTAL | — | STANDARD | 10 | 44 | 48 | 30 | 60 | 9.7 |
| 324 | THE PULSE | boss (special) | THE CRYSTAL | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 325 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 57 | 36 | 72 | 3.3 |
| 326 | VOLLEY PARTY | **regular** | THE VOLLEY | — | STANDARD | 8 | 36 | 56 | 35 | 70 | 7.7 |
| 327 | VOLLEY LEGEND | **regular** | THE VOLLEY | — | STANDARD | 8 | 40 | 58 | 36 | 72 | 9.4 |
| 328 | VOLLEY APOCALYPSE | **regular** | THE VOLLEY | — | STANDARD | 11 | 48 | 77 | 48 | 96 | 11.4 |
| 329 | GORGE DREAM | **regular** | THE VOLLEY | — | STANDARD | 6 | 39 | 46 | 29 | 58 | 7.8 |
| 330 | GORGE REUNION | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 8.8 |
| 331 | GORGE MIRAGE | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 107 | 67 | 134 | 9.8 |
| 332 | THE GORGE | boss | THE VOLLEY | gorge | STANDARD | 10 | 82 | 259 | 162 | 324 | — |
| 333 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 334 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 335 | HANDOVER ALLIANCE | **regular** | THE HANDOVER | — | STANDARD | 8 | 37 | 55 | 34 | 68 | 11.5 |
| 336 | HANDOVER LEGEND | **regular** | THE HANDOVER | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 13.5 |
| 337 | HANDOVER OVERDRIVE | **regular** | THE HANDOVER | — | STANDARD | 13 | 45 | 87 | 54 | 108 | 15.5 |
| 338 | SOFT GIMBAL | **regular** | THE HANDOVER | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.8 |
| 339 | GIMBAL REUNION | **regular** | THE HANDOVER | — | STANDARD | 8 | 36 | 51 | 32 | 64 | 10.8 |
| 340 | GIMBAL RIDDLE | **regular** | THE HANDOVER | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.9 |
| 341 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 342 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 343 | CRAWLER TANGO | **regular** | THE CRAWLER | — | STANDARD | 8 | 36 | 46 | 29 | 58 | 7.8 |
| 344 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 43 | 27 | 54 | 10 |
| 345 | CRAWLER INFERNO | **regular** | THE CRAWLER | — | STANDARD | 14 | 46 | 73 | 46 | 92 | 12 |
| 346 | SOFT UNDERTOW | **regular** | THE CRAWLER | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 7.9 |
| 347 | UNDERTOW RELIC | **regular** | THE CRAWLER | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 8.9 |
| 348 | CROOKED UNDERTOW | **regular** | THE CRAWLER | — | STANDARD | 12 | 44 | 54 | 34 | 68 | 9.9 |
| 349 | THE UNDERTOW | boss | THE CRAWLER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 350 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 351 | FLIP WALTZ | **regular** | THE FLIP | — | STANDARD | 11 | 40 | 43 | 27 | 54 | 11.6 |
| 352 | OLD FLIP SONG | **regular** | THE FLIP | — | STANDARD | 10 | 38 | 47 | 29 | 58 | 13.6 |
| 353 | FLIP INFERNO | **regular** | THE FLIP | — | STANDARD | 14 | 44 | 48 | 30 | 60 | 15.6 |
| 354 | VANE DREAM | **regular** | THE FLIP | — | STANDARD | 6 | 36 | 42 | 26 | 52 | 10 |
| 355 | VANE REUNION | **regular** | THE FLIP | — | STANDARD | 10 | 36 | 42 | 26 | 52 | 11 |
| 356 | VANE PARADOX | **regular** | THE FLIP | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 12 |
| 357 | THE VANE | boss | THE FLIP | vane | STANDARD 5 | 2 | 3 | 82 | 51 | 102 | — |
| 358 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 36 | 39 | 24 | 48 | 6.3 |
| 359 | MINE ALLIANCE | **regular** | THE MINE | — | STANDARD | 8 | 35 | 37 | 23 | 46 | 7.9 |
| 360 | MINE SAGA | **regular** | THE MINE | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.6 |
| 361 | MINE STORM | **regular** | THE MINE | — | STANDARD | 12 | 48 | 60 | 38 | 76 | 11.7 |
| 362 | MIMIC HUSH | **regular** | THE MINE | — | STANDARD | 6 | 36 | 51 | 32 | 64 | 8 |
| 363 | ANCIENT MIMIC | **regular** | THE MINE | — | STANDARD | 10 | 40 | 51 | 32 | 64 | 9 |
| 364 | MIMIC ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 45 | 49 | 31 | 62 | 10 |
| 365 | THE MIMIC | boss | THE MINE | mimic, panel | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 366 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 44 | 28 | 56 | 7.2 |
| 367 | CAROM ALLIANCE | **regular** | THE CAROM | — | STANDARD | 7 | 36 | 48 | 30 | 60 | 8 |
| 368 | OLD CAROM SONG | **regular** | THE CAROM | — | STANDARD | 7 | 38 | 48 | 30 | 60 | 10 |
| 369 | CAROM INFERNO | **regular** | THE CAROM | — | STANDARD | 11 | 48 | 64 | 40 | 80 | 11.9 |
| 370 | SOFT TASTER | **regular** | THE CAROM | — | STANDARD | 6 | 35 | 53 | 33 | 66 | 8.1 |
| 371 | TASTER REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 9.1 |
| 372 | TASTER RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 10.1 |
| 373 | THE TASTER | boss | THE CAROM | taster | STANDARD | 10 | 80 | 44 | 28 | 56 | — |
| 374 | LEDGER ALLIANCE | **regular** | LEDGER ALLIANCE | — | STANDARD | 11 | 40 | 44 | 28 | 56 | 9.5 |
| 375 | ANCIENT LEDGER | **regular** | LEDGER ALLIANCE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 376 | LEDGER OVERDRIVE | **regular** | LEDGER ALLIANCE | — | STANDARD | 14 | 45 | 55 | 34 | 68 | 13.5 |
| 377 | THE LEDGER | boss | LEDGER ALLIANCE | ledger | STANDARD | 8 | 82 | 33 | 21 | 42 | — |
| 378 | SURGE PARTY | **regular** | SURGE PARTY | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 9.6 |
| 379 | SURGE SAGA | **regular** | SURGE PARTY | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 11.6 |
| 380 | SURGE ECLIPSE | **regular** | SURGE PARTY | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13.6 |
| 381 | THE SURGE | boss | SURGE PARTY | surge | STANDARD | 8 | 76 | 45 | 28 | 56 | — |
| 382 | LEAD WALTZ | **regular** | LEAD WALTZ | — | STANDARD | 9 | 39 | 49 | 31 | 62 | 9.7 |
| 383 | ANCIENT LEAD | **regular** | LEAD WALTZ | — | STANDARD | 10 | 39 | 47 | 29 | 58 | 11.7 |
| 384 | LEAD INFERNO | **regular** | LEAD WALTZ | — | STANDARD | 13 | 46 | 77 | 48 | 96 | 13.6 |
| 385 | THE LEAD | boss | LEAD WALTZ | lead | STANDARD | 8 | 84 | 41 | 26 | 52 | — |
| 386 | SCUTTLE WALTZ | **regular** | SCUTTLE WALTZ | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 9.8 |
| 387 | SCUTTLE LEGEND | **regular** | SCUTTLE WALTZ | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.8 |
| 388 | SCUTTLE ECLIPSE | **regular** | SCUTTLE WALTZ | — | STANDARD | 16 | 45 | 52 | 33 | 66 | 13.8 |
| 389 | THE SCUTTLE | boss | SCUTTLE WALTZ | scuttle | STANDARD | 0 | 0 | 49 | 31 | 62 | — |
| 390 | ANTIPHON WALTZ | **regular** | ANTIPHON WALTZ | — | STANDARD | 11 | 40 | 46 | 29 | 58 | 9.9 |
| 391 | ANTIPHON RELIC | **regular** | ANTIPHON WALTZ | — | STANDARD | 8 | 36 | 39 | 24 | 48 | 11.9 |
| 392 | ANTIPHON APOCALYPSE | **regular** | ANTIPHON WALTZ | — | STANDARD | 17 | 46 | 49 | 31 | 62 | 13.9 |
| 393 | THE ANTIPHON | boss | ANTIPHON WALTZ | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 394 | SPLICE TANGO | **regular** | SPLICE TANGO | — | STANDARD | 9 | 39 | 43 | 27 | 54 | 10 |
| 395 | SPLICE HOMECOMING | **regular** | SPLICE TANGO | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 12 |
| 396 | SPLICE STORM | **regular** | SPLICE TANGO | — | STANDARD | 13 | 44 | 48 | 30 | 60 | 14 |
| 397 | THE SPLICE | boss (special) | SPLICE TANGO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 398 | CAIRN PARTY | **regular** | CAIRN PARTY | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 10.1 |
| 399 | OLD CAIRN SONG | **regular** | CAIRN PARTY | — | STANDARD | 8 | 35 | 38 | 24 | 48 | 12 |
| 400 | CAIRN OVERDRIVE | **regular** | CAIRN PARTY | — | STANDARD | 13 | 45 | 50 | 31 | 62 | 14 |
| 401 | THE CAIRN | boss | CAIRN PARTY | cairn | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 402 | WELL WALTZ | **regular** | WELL WALTZ | — | STANDARD | 11 | 40 | 50 | 31 | 62 | 10.2 |
| 403 | WELL LEGEND | **regular** | WELL WALTZ | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 12.1 |
| 404 | WELL INFERNO | **regular** | WELL WALTZ | — | STANDARD | 16 | 41 | 45 | 28 | 56 | 14.3 |
| 405 | THE WELL | boss (special) | WELL WALTZ | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 406 | REPRISE PARTY | **regular** | REPRISE PARTY | — | STANDARD | 11 | 38 | 48 | 30 | 60 | 10.3 |
| 407 | REPRISE LEGEND | **regular** | REPRISE PARTY | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 12.3 |
| 408 | REPRISE INFERNO | **regular** | REPRISE PARTY | — | STANDARD | 14 | 47 | 52 | 33 | 66 | 14.3 |
| 409 | THE REPRISE | boss | REPRISE PARTY | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 410 | FILAMENT PARTY | **regular** | FILAMENT PARTY | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 10.8 |
| 411 | FILAMENT REUNION | **regular** | FILAMENT PARTY | — | STANDARD | 10 | 39 | 48 | 30 | 60 | 13 |
| 412 | FILAMENT RAPTURE | **regular** | FILAMENT PARTY | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 15 |
| 413 | THE FILAMENT | boss | FILAMENT PARTY | filament | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 414 | SPOOL DUET | **regular** | SPOOL DUET | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 10.9 |
| 415 | SPOOL RELIC | **regular** | SPOOL DUET | — | STANDARD | 10 | 37 | 45 | 28 | 56 | 12.7 |
| 416 | SPOOL OVERDRIVE | **regular** | SPOOL DUET | — | STANDARD | 18 | 45 | 52 | 33 | 66 | 14.7 |
| 417 | THE SPOOL | boss | SPOOL DUET | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 418 | HASP PARTY | **regular** | HASP PARTY | — | STANDARD | 10 | 39 | 48 | 30 | 60 | 11 |
| 419 | HASP HOMECOMING | **regular** | HASP PARTY | — | STANDARD | 10 | 38 | 53 | 33 | 66 | 13.1 |
| 420 | HASP APOCALYPSE | **regular** | HASP PARTY | — | STANDARD | 20 | 45 | 61 | 38 | 76 | 15.1 |
| 421 | THE HASP | boss | HASP PARTY | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 422 | FLUE PARTY | **regular** | FLUE PARTY | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 11.1 |
| 423 | FLUE SAGA | **regular** | FLUE PARTY | — | STANDARD | 10 | 35 | 43 | 27 | 54 | 12.6 |
| 424 | FLUE INFERNO | **regular** | FLUE PARTY | — | STANDARD | 22 | 48 | 52 | 33 | 66 | 14.7 |
| 425 | THE FLUE | boss | FLUE PARTY | flue, panel | SHOTS | 0 | 0 | 71 | 44 | 88 | — |
| 426 | RATCHET TANGO | **regular** | RATCHET TANGO | — | STANDARD | 10 | 36 | 53 | 33 | 66 | 11.2 |
| 427 | RATCHET RELIC | **regular** | RATCHET TANGO | — | STANDARD | 10 | 37 | 45 | 28 | 56 | 13.2 |
| 428 | RATCHET APOCALYPSE | **regular** | RATCHET TANGO | — | STANDARD | 18 | 48 | 60 | 38 | 76 | 15.2 |
| 429 | THE RATCHET | boss | RATCHET TANGO | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 430 | NETTLE WALTZ | **regular** | NETTLE WALTZ | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 11.3 |
| 431 | ANCIENT NETTLE | **regular** | NETTLE WALTZ | — | STANDARD | 10 | 35 | 50 | 31 | 62 | 13.4 |
| 432 | NETTLE ECLIPSE | **regular** | NETTLE WALTZ | — | STANDARD | 18 | 48 | 55 | 34 | 68 | 15.2 |
| 433 | THE NETTLE | boss | NETTLE WALTZ | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 434 | MANTLE PARTY | **regular** | MANTLE PARTY | — | STANDARD | 10 | 37 | 45 | 28 | 56 | 11.4 |
| 435 | MANTLE LEGEND | **regular** | MANTLE PARTY | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 13 |
| 436 | MANTLE STORM | **regular** | MANTLE PARTY | — | STANDARD | 16 | 47 | 52 | 33 | 66 | 14.9 |
| 437 | THE MANTLE | boss | MANTLE PARTY | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 438 | KEEL PARTY | **regular** | KEEL PARTY | — | STANDARD | 9 | 40 | 53 | 33 | 66 | 11.5 |
| 439 | KEEL SAGA | **regular** | KEEL PARTY | — | STANDARD | 10 | 37 | 52 | 33 | 66 | 13 |
| 440 | KEEL OVERDRIVE | **regular** | KEEL PARTY | — | STANDARD | 19 | 45 | 55 | 34 | 68 | 15 |
| 441 | THE KEEL | boss | KEEL PARTY | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 442 | VALVE WALTZ | **regular** | VALVE WALTZ | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 11.6 |
| 443 | VALVE SAGA | **regular** | VALVE WALTZ | — | STANDARD | 9 | 36 | 51 | 32 | 64 | 13 |
| 444 | VALVE ECLIPSE | **regular** | VALVE WALTZ | — | STANDARD | 16 | 47 | 55 | 34 | 68 | 15 |
| 445 | THE VALVE | boss | VALVE WALTZ | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 446 | SEAM TANGO | **regular** | SEAM TANGO | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.7 |
| 447 | OLD SEAM SONG | **regular** | SEAM TANGO | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 12.9 |
| 448 | SEAM RAPTURE | **regular** | SEAM TANGO | — | STANDARD | 16 | 46 | 51 | 32 | 64 | 15 |
| 449 | THE SEAM | boss | SEAM TANGO | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 450 | SLING TANGO | **regular** | SLING TANGO | — | STANDARD | 12 | 36 | 48 | 30 | 60 | 11.8 |
| 451 | OLD SLING SONG | **regular** | SLING TANGO | — | STANDARD | 12 | 39 | 49 | 31 | 62 | 13.6 |
| 452 | SLING STORM | **regular** | SLING TANGO | — | STANDARD | 16 | 43 | 48 | 30 | 60 | 15.6 |
| 453 | THE SLING | boss | SLING TANGO | sling | STANDARD | 0 | 0 | 43 | 27 | 54 | — |
| 454 | CAPSTAN TANGO | **regular** | CAPSTAN TANGO | — | STANDARD | 12 | 40 | 46 | 29 | 58 | 11.9 |
| 455 | CAPSTAN SAGA | **regular** | CAPSTAN TANGO | — | STANDARD | 10 | 36 | 40 | 25 | 50 | 13.8 |
| 456 | CAPSTAN ECLIPSE | **regular** | CAPSTAN TANGO | — | STANDARD | 19 | 46 | 61 | 38 | 76 | 15.9 |
| 457 | THE CAPSTAN | boss | CAPSTAN TANGO | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 458 | GALL PARTY | **regular** | GALL PARTY | — | STANDARD | 10 | 36 | 39 | 24 | 48 | 12 |
| 459 | GALL SAGA | **regular** | GALL PARTY | — | STANDARD | 10 | 37 | 52 | 33 | 66 | 14 |
| 460 | GALL ECLIPSE | **regular** | GALL PARTY | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 16 |
| 461 | THE GALL | boss | GALL PARTY | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 462 | TRAPEZE ALLIANCE | **regular** | TRAPEZE ALLIANCE | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 12.2 |
| 463 | TRAPEZE RELIC | **regular** | TRAPEZE ALLIANCE | — | STANDARD | 12 | 37 | 47 | 29 | 58 | 13.6 |
| 464 | TRAPEZE ECLIPSE | **regular** | TRAPEZE ALLIANCE | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 15.5 |
| 465 | THE TRAPEZE | boss | TRAPEZE ALLIANCE | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 466 | GOVERNOR DUET | **regular** | GOVERNOR DUET | — | STANDARD | 10 | 38 | 46 | 29 | 58 | 12.3 |
| 467 | ANCIENT GOVERNOR | **regular** | GOVERNOR DUET | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 13 |
| 468 | GOVERNOR RAPTURE | **regular** | GOVERNOR DUET | — | STANDARD | 18 | 46 | 50 | 31 | 62 | 14.9 |
| 469 | THE GOVERNOR | boss | GOVERNOR DUET | governor | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 470 | LATCH DUET | **regular** | LATCH DUET | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.4 |
| 471 | ANCIENT LATCH | **regular** | LATCH DUET | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 13.3 |
| 472 | LATCH OVERDRIVE | **regular** | LATCH DUET | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 15.3 |
| 473 | THE LATCH | boss | LATCH DUET | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 474 | HYDRA DUET | **regular** | HYDRA DUET | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 12.5 |
| 475 | ANCIENT HYDRA | **regular** | HYDRA DUET | — | STANDARD | 10 | 40 | 49 | 31 | 62 | 13 |
| 476 | HYDRA APOCALYPSE | **regular** | HYDRA DUET | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 15 |
| 477 | THE HYDRA | boss | HYDRA DUET | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

## The bosses against the bands

The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss
30–60 s, a special one 45–90 s. *A pair, about* is AUTO's
time × 2 — the owner's accepted guess, never measured.

| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |
|---|---|---|---|---|---|---|
| 5 | THE MOTH | normal | 44 beats | 28 | 56 s | short |
| 10 | THE BROOD | normal | 40 beats | 25 | 50 s | short |
| 108 | THE BASTION | normal | 87 beats | 54 | 108 s | in band |
| 116 | BULB QUEEN | normal | 75 beats | 47 | 94 s | in band |
| 120 | FINALE | normal | 79 beats | 49 | 98 s | in band |
| 133 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 141 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 154 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 162 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 170 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 178 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 186 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 194 | THE PLUMB | normal | 45 beats | 28 | 56 s | short |
| 202 | THE LAMPREY | normal | 132 beats | 83 | 166 s | long |
| 210 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 218 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 226 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 236 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 244 | THE VISE | normal | 42 beats | 26 | 52 s | short |
| 252 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 260 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 268 | THE CHRYSALIS | normal | 75 beats | 47 | 94 s | in band |
| 276 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 284 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 292 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 300 | THE BATON | normal | 286 beats | 179 | 358 s | long |
| 308 | THE OCULUS | normal | 25 beats | 16 | 32 s | short |
| 316 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 324 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 332 | THE GORGE | normal | 259 beats | 162 | 324 s | long |
| 341 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 349 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 357 | THE VANE | normal | 82 beats | 51 | 102 s | in band |
| 365 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 373 | THE TASTER | normal | 44 beats | 28 | 56 s | short |
| 377 | THE LEDGER | normal | 33 beats | 21 | 42 s | short |
| 381 | THE SURGE | normal | 45 beats | 28 | 56 s | short |
| 385 | THE LEAD | normal | 41 beats | 26 | 52 s | short |
| 389 | THE SCUTTLE | normal | 49 beats | 31 | 62 s | in band |
| 393 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 397 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 401 | THE CAIRN | normal | 25 beats | 16 | 32 s | short |
| 405 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 409 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 413 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 417 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 421 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 425 | THE FLUE | normal | 71 beats | 44 | 88 s | in band |
| 429 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 433 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 437 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 441 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 445 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 449 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 453 | THE SLING | normal | 43 beats | 27 | 54 s | short |
| 457 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 461 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 465 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 469 | THE GOVERNOR | normal | 25 beats | 16 | 32 s | short |
| 473 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 477 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
