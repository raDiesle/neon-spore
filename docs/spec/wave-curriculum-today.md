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
| boss | 60 | 0 | 9 | 31 | 343 | 50 min | 1 h 41 min |
| every wave | 476 | 0 | 3 | 28 | 343 | 4 h 12 min | 8 h 24 min |

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
| 11 | SHELL AND CYAN | **regular** | THE SHELL | — | STANDARD 2 | 7 | 38 | 41 | 26 | 52 | 7 |
| 12 | SHELL SAGA | **regular** | THE SHELL | — | STANDARD 2 | 6 | 38 | 43 | 27 | 54 | 8 |
| 13 | SHELL THUNDER | **regular** | THE SHELL | — | STANDARD 2 | 9 | 48 | 51 | 32 | 64 | 10 |
| 14 | THE THROB | intro | THE THROB | throb | STANDARD 2 | 1 | 0 | 4 | 3 | 6 | 1.5 |
| 15 | THROB TANGO | **regular** | THE THROB | — | STANDARD 2 | 6 | 36 | 40 | 25 | 50 | 7.1 |
| 16 | THROB RELIC | **regular** | THE THROB | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 8.5 |
| 17 | THROB STORM | **regular** | THE THROB | — | STANDARD 2 | 9 | 43 | 46 | 29 | 58 | 10 |
| 18 | THE ECHO | intro | THE ECHO | echo | STANDARD 2 | 6 | 44 | 47 | 29 | 58 | 4 |
| 19 | ECHO ALLIANCE | **regular** | THE ECHO | — | STANDARD 2 | 6 | 39 | 42 | 26 | 52 | 7.5 |
| 20 | ECHO SAGA | **regular** | THE ECHO | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 21 | ECHO RAPTURE | **regular** | THE ECHO | — | STANDARD 2 | 9 | 44 | 47 | 29 | 58 | 10 |
| 22 | THE RECOIL | intro | THE RECOIL | recoil | STANDARD 2 | 4 | 32 | 38 | 24 | 48 | 3.9 |
| 23 | HOLD AND AIM | intro | THE RECOIL | — | STANDARD 2 | 6 | 33 | 36 | 23 | 46 | 6.8 |
| 24 | RECOIL MEETS ECHO | **regular** | THE RECOIL | — | STANDARD 2 | 6 | 35 | 41 | 26 | 52 | 7.6 |
| 25 | OLD RECOIL SONG | **regular** | THE RECOIL | — | STANDARD 2 | 6 | 37 | 43 | 27 | 54 | 8.6 |
| 26 | RECOIL STORM | **regular** | THE RECOIL | — | STANDARD 2 | 9 | 44 | 47 | 29 | 58 | 10 |
| 27 | THE MAGNET | intro | THE MAGNET | magnet | STANDARD 2 | 5 | 52 | 55 | 34 | 68 | 3.9 |
| 28 | MAGNET DUET | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 7.7 |
| 29 | MAGNET LEGEND | **regular** | THE MAGNET | — | STANDARD 2 | 6 | 36 | 39 | 24 | 48 | 8 |
| 30 | MAGNET OVERDRIVE | **regular** | THE MAGNET | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 31 | THE GYRE | intro | THE GYRE | gyre, mount | STANDARD 2 | 1 | 0 | 10 | 6 | 12 | 1.5 |
| 32 | GYRE DUET | **regular** | THE GYRE | — | STANDARD 2 | 6 | 36 | 46 | 29 | 58 | 7.8 |
| 33 | GYRE LEGEND | **regular** | THE GYRE | — | STANDARD 2 | 6 | 37 | 47 | 29 | 58 | 8.8 |
| 34 | GYRE RAPTURE | **regular** | THE GYRE | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 35 | THE LURE | intro | THE LURE | lure | STANDARD 2 | 6 | 40 | 47 | 29 | 58 | 3.9 |
| 36 | LURE AND GYRE | **regular** | THE LURE | — | STANDARD 2 | 6 | 34 | 49 | 31 | 62 | 7.9 |
| 37 | LURE REUNION | **regular** | THE LURE | — | STANDARD 2 | 6 | 37 | 52 | 33 | 66 | 8.4 |
| 38 | LURE INFERNO | **regular** | THE LURE | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 39 | THE RIND | intro | THE RIND | rind | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 40 | RIND MEETS LURE | **regular** | THE RIND | — | STANDARD 2 | 6 | 36 | 41 | 26 | 52 | 8 |
| 41 | ANCIENT RIND | **regular** | THE RIND | — | STANDARD 2 | 6 | 35 | 40 | 25 | 50 | 8.8 |
| 42 | RIND THUNDER | **regular** | THE RIND | — | STANDARD 2 | 9 | 46 | 49 | 31 | 62 | 10 |
| 43 | THE STRAND | intro | THE STRAND | strand | STANDARD 2 | 3 | 36 | 42 | 26 | 52 | 2.4 |
| 44 | STRAND WALTZ | **regular** | THE STRAND | — | STANDARD 2 | 6 | 34 | 40 | 25 | 50 | 8.1 |
| 45 | ANCIENT STRAND | **regular** | THE STRAND | — | STANDARD 2 | 6 | 37 | 41 | 26 | 52 | 8.7 |
| 46 | STRAND INFERNO | **regular** | THE STRAND | — | STANDARD 2 | 10 | 48 | 53 | 33 | 66 | 10 |
| 47 | THE VEIL | intro | THE VEIL | veil | STANDARD 2 | 5 | 34 | 37 | 23 | 46 | 3.3 |
| 48 | VEIL WALTZ | **regular** | THE VEIL | — | STANDARD 2 | 6 | 38 | 44 | 28 | 56 | 8.5 |
| 49 | VEIL HOMECOMING | **regular** | THE VEIL | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 50 | VEIL RAPTURE | **regular** | THE VEIL | — | STANDARD 2 | 9 | 48 | 51 | 32 | 64 | 10 |
| 51 | THE DART | intro | THE DART | dart | STANDARD 2 | 5 | 33 | 36 | 23 | 46 | 3.9 |
| 52 | DART PARTY | **regular** | THE DART | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 8.7 |
| 53 | DART HOMECOMING | **regular** | THE DART | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 54 | DART THUNDER | **regular** | THE DART | — | STANDARD 2 | 9 | 47 | 50 | 31 | 62 | 10 |
| 55 | THE COUNT | intro | THE COUNT | countdown | STANDARD 2 | 4 | 26 | 31 | 19 | 38 | 3 |
| 56 | COUNT DUET | **regular** | THE COUNT | — | STANDARD 2 | 6 | 36 | 43 | 27 | 54 | 8.8 |
| 57 | ANCIENT COUNT | **regular** | THE COUNT | — | STANDARD 2 | 6 | 36 | 39 | 24 | 48 | 9.5 |
| 58 | COUNT APOCALYPSE | **regular** | THE COUNT | — | STANDARD 2 | 9 | 45 | 48 | 30 | 60 | 10 |
| 59 | THE GHOST | intro | THE GHOST | ghost | STANDARD 2 | 3 | 18 | 21 | 13 | 26 | 2.1 |
| 60 | GHOST MEETS COUNT | **regular** | THE GHOST | — | STANDARD 2 | 6 | 35 | 38 | 24 | 48 | 8.9 |
| 61 | GHOST LEGEND | **regular** | THE GHOST | — | STANDARD 2 | 6 | 38 | 41 | 26 | 52 | 9.3 |
| 62 | GHOST RAPTURE | **regular** | THE GHOST | — | STANDARD 2 | 8 | 45 | 50 | 31 | 62 | 10 |
| 63 | THE WISP | intro | THE WISP | wisp | STANDARD 2 | 3 | 28 | 31 | 19 | 38 | 3 |
| 64 | WISP AND GHOST | **regular** | THE WISP | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9 |
| 65 | WISP LEGEND | **regular** | THE WISP | — | STANDARD 2 | 6 | 37 | 40 | 25 | 50 | 9.4 |
| 66 | WISP THUNDER | **regular** | THE WISP | — | STANDARD 2 | 9 | 44 | 47 | 29 | 58 | 10 |
| 67 | THE ROCK | intro | THE ROCK | meteor, panel | STANDARD 4 | 3 | 20 | 35 | 22 | 44 | 1.4 |
| 68 | NEW ROCK MOON | **regular** | THE ROCK | — | STANDARD 4 | 5 | 30 | 45 | 28 | 56 | 2.6 |
| 69 | FAR ROCK | **regular** | THE ROCK | — | STANDARD 4 | 6 | 35 | 50 | 31 | 62 | 3.8 |
| 70 | ROCK AND CYAN | **regular** | THE ROCK | — | STANDARD 4 | 7 | 36 | 45 | 28 | 56 | 5 |
| 71 | THE HAND | intro | THE ROCK | — | STANDARD 4 | 3 | 0 | 17 | 11 | 22 | 5.8 |
| 72 | ONE LAST CHANCE | intro | THE ROCK | — | STANDARD 4 | 6 | 13 | 25 | 16 | 32 | 10.8 |
| 73 | TORCH | intro | TORCH | torch | STANDARD 4 | 3 | 22 | 25 | 16 | 32 | 3.3 |
| 74 | TORCH DUET | **regular** | TORCH | — | STANDARD 4 | 6 | 34 | 37 | 23 | 46 | 6.5 |
| 75 | TORCH LEGEND | **regular** | TORCH | — | STANDARD 4 | 6 | 38 | 41 | 26 | 52 | 8.3 |
| 76 | TORCH OVERDRIVE | **regular** | TORCH | — | STANDARD 4 | 9 | 46 | 49 | 31 | 62 | 10 |
| 77 | THE BLISTER | intro | THE BLISTER | blister | STANDARD 4 | 2 | 12 | 16 | 10 | 20 | 2.4 |
| 78 | TAP | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 79 | TAP TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 33 | 37 | 23 | 46 | 7 |
| 80 | ANCIENT TAP | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.5 |
| 81 | TAP THUNDER | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 50 | 31 | 62 | 10 |
| 82 | HOLD | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 83 | HOLD DUET | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 7 |
| 84 | HOLD HOMECOMING | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.1 |
| 85 | HOLD STORM | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 57 | 36 | 72 | 10 |
| 86 | SWIPE | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 87 | SWIPE DUET | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 7 |
| 88 | SWIPE LEGEND | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 41 | 26 | 52 | 8.3 |
| 89 | SWIPE ECLIPSE | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 48 | 51 | 32 | 64 | 10 |
| 90 | TURN | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.6 |
| 91 | TURN TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 33 | 37 | 23 | 46 | 6.9 |
| 92 | TURN SAGA | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 8.2 |
| 93 | TURN APOCALYPSE | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 50 | 31 | 62 | 10 |
| 94 | RUB | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 95 | RUB DUET | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 7 |
| 96 | RUB SAGA | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 8.4 |
| 97 | RUB ECLIPSE | **regular** | THE BLISTER | — | STANDARD 4 | 9 | 47 | 58 | 36 | 72 | 10 |
| 98 | COMBO | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 99 | COMBO TANGO | **regular** | THE BLISTER | — | STANDARD 4 | 7 | 39 | 42 | 26 | 52 | 7 |
| 100 | COMBO REUNION | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 36 | 40 | 25 | 50 | 7.7 |
| 101 | COMBO INFERNO | **regular** | THE BLISTER | — | STANDARD 4 | 10 | 48 | 53 | 33 | 66 | 9.7 |
| 102 | LEVER | intro | THE BLISTER | — | STANDARD 4 | 9 | 64 | 67 | 42 | 84 | 3.9 |
| 103 | LEVER PARTY | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 35 | 40 | 25 | 50 | 6.9 |
| 104 | LEVER LEGEND | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 37 | 42 | 26 | 52 | 8.3 |
| 105 | LEVER ECLIPSE | **regular** | THE BLISTER | — | STANDARD 4 | 10 | 46 | 52 | 33 | 66 | 10 |
| 106 | HELLO BLISTER | **regular** | THE BLISTER | — | STANDARD 4 | 6 | 41 | 45 | 28 | 56 | 5.7 |
| 107 | THE BASTION | boss | THE BLISTER | bastion | STANDARD 4 | 0 | 0 | 87 | 54 | 108 | — |
| 108 | SALVAGE | intro | SALVAGE | pod, panel | STANDARD 5 | 2 | 10 | 13 | 8 | 16 | 2.4 |
| 109 | SALVAGE TANGO | **regular** | SALVAGE | — | STANDARD 5 | 4 | 32 | 35 | 22 | 44 | 3.6 |
| 110 | SALVAGE LEGEND | **regular** | SALVAGE | — | STANDARD 5 | 4 | 32 | 35 | 22 | 44 | 4.2 |
| 111 | SALVAGE ECLIPSE | **regular** | SALVAGE | — | STANDARD 5 | 7 | 40 | 43 | 27 | 54 | 5.7 |
| 112 | SCRAP FIELD | **regular** | SCRAP FIELD | — | STANDARD 5 | 5 | 31 | 34 | 21 | 42 | 5.8 |
| 113 | SCRAP RAIN | **regular** | SCRAP FIELD | — | STANDARD 5 | 6 | 35 | 38 | 24 | 48 | 7 |
| 114 | SCRAP AND TORCH | **regular** | SCRAP FIELD | — | STANDARD 5 | 7 | 38 | 42 | 26 | 52 | 8.2 |
| 115 | BULB QUEEN | boss | SCRAP FIELD | queen | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 116 | CATCH AND AIM | intro | SCRAP FIELD | — | STANDARD 5 | 3 | 15 | 18 | 11 | 22 | 4.4 |
| 117 | AIM RISING | **regular** | SCRAP FIELD | — | STANDARD 5 | 3 | 28 | 31 | 19 | 38 | 1.4 |
| 118 | LONG AIM ROAD | **regular** | SCRAP FIELD | — | STANDARD 5 | 4 | 28 | 31 | 19 | 38 | 3.4 |
| 119 | FINALE | boss | SCRAP FIELD | matron | STANDARD 5 | 0 | 0 | 79 | 49 | 98 | — |
| 120 | THE HUSK | intro | THE HUSK | husk | STANDARD 5 | 2 | 11 | 17 | 11 | 22 | 2.4 |
| 121 | HUSK TANGO | **regular** | THE HUSK | — | STANDARD 5 | 4 | 33 | 36 | 23 | 46 | 3.8 |
| 122 | ANCIENT HUSK | **regular** | THE HUSK | — | STANDARD 5 | 5 | 37 | 40 | 25 | 50 | 5.8 |
| 123 | HUSK RAPTURE | **regular** | THE HUSK | — | STANDARD 5 | 9 | 45 | 49 | 31 | 62 | 7.7 |
| 124 | THE ROE | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 23 | 14 | 28 | 3.2 |
| 125 | THE CLUTCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 20 | 24 | 15 | 30 | 3.6 |
| 126 | THE DROP | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 127 | THE WATCH | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 128 | THE NEIGHBOUR | **regular** | THE HUSK | — | STANDARD 5 | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 129 | SWINDLE DREAM | **regular** | THE HUSK | — | STANDARD 5 | 6 | 36 | 40 | 25 | 50 | 6.3 |
| 130 | ANCIENT SWINDLE | **regular** | THE HUSK | — | STANDARD 5 | 7 | 40 | 44 | 28 | 56 | 7.3 |
| 131 | SWINDLE TRICK | **regular** | THE HUSK | — | STANDARD 5 | 11 | 45 | 60 | 38 | 76 | 8.5 |
| 132 | THE SWINDLE | boss | THE HUSK | swindle | STANDARD 5 | 0 | 0 | 128 | 80 | 160 | — |
| 133 | THE MORSEL | intro | THE MORSEL | morsel | STANDARD 5 | 3 | 18 | 35 | 22 | 44 | 3.6 |
| 134 | MORSEL TANGO | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 32 | 42 | 26 | 52 | 7.1 |
| 135 | MORSEL SAGA | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 37 | 47 | 29 | 58 | 9.1 |
| 136 | MORSEL THUNDER | **regular** | THE MORSEL | — | STANDARD 5 | 12 | 46 | 53 | 33 | 66 | 11.1 |
| 137 | SOFT INSTAR | **regular** | THE MORSEL | — | STANDARD 5 | 6 | 34 | 39 | 24 | 48 | 7.2 |
| 138 | INSTAR RELIC | **regular** | THE MORSEL | — | STANDARD 5 | 7 | 35 | 38 | 24 | 48 | 8.2 |
| 139 | INSTAR SPELL | **regular** | THE MORSEL | — | STANDARD 5 | 9 | 41 | 45 | 28 | 56 | 9.2 |
| 140 | THE INSTAR | boss | THE MORSEL | instar | STANDARD 5 | 0 | 0 | 549 | 343 | 686 | — |
| 141 | THE LANCE | intro | THE LANCE | panel | STANDARD | 6 | 40 | 43 | 27 | 54 | 3 |
| 142 | LANCE PARTY | **regular** | THE LANCE | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 7.3 |
| 143 | LANCE REUNION | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 55 | 34 | 68 | 9.3 |
| 144 | LANCE INFERNO | **regular** | THE LANCE | — | STANDARD | 15 | 47 | 53 | 33 | 66 | 11.3 |
| 145 | THE CAGE | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 25 | 16 | 32 | 3.2 |
| 146 | THE ANCHOR | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.2 |
| 147 | THE PENDULUM | **regular** | THE LANCE | — | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.6 |
| 148 | THE TWINS | **regular** | THE LANCE | — | STANDARD | 3 | 22 | 28 | 18 | 36 | 3.6 |
| 149 | THE LAST ROCK | **regular** | THE LANCE | — | STANDARD | 5 | 24 | 39 | 24 | 48 | 3.4 |
| 150 | SLEEPY GEODE | **regular** | THE LANCE | — | STANDARD | 5 | 40 | 43 | 27 | 54 | 6.1 |
| 151 | GEODE RELIC | **regular** | THE LANCE | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 7.1 |
| 152 | GEODE ILLUSION | **regular** | THE LANCE | — | STANDARD | 10 | 44 | 49 | 31 | 62 | 8.1 |
| 153 | THE GEODE | boss | THE LANCE | geode | STANDARD | 0 | 0 | 52 | 33 | 66 | — |
| 154 | THE SEEDER | intro | THE SEEDER | seeder | STANDARD | 4 | 24 | 32 | 20 | 40 | 3.9 |
| 155 | SEEDER AND MORSEL | **regular** | THE SEEDER | — | STANDARD | 8 | 36 | 53 | 33 | 66 | 7.3 |
| 156 | SEEDER REUNION | **regular** | THE SEEDER | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.4 |
| 157 | SEEDER THUNDER | **regular** | THE SEEDER | — | STANDARD | 11 | 45 | 62 | 39 | 78 | 11.4 |
| 158 | MIRROR DREAM | **regular** | THE SEEDER | — | STANDARD | 6 | 36 | 44 | 28 | 56 | 7.6 |
| 159 | MIRROR HOMECOMING | **regular** | THE SEEDER | — | STANDARD | 7 | 39 | 43 | 27 | 54 | 8.6 |
| 160 | MIRROR ILLUSION | **regular** | THE SEEDER | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 9.6 |
| 161 | THE MIRROR | boss (special) | THE SEEDER | mirror | STANDARD 5 | 0 | 0 | 53 | 33 | 66 | — |
| 162 | THE CROSSING | intro | THE CROSSING | rockCross | STANDARD | 8 | 56 | 63 | 39 | 78 | 2.8 |
| 163 | CROSSING AND SEEDER | **regular** | THE CROSSING | — | STANDARD | 8 | 34 | 42 | 26 | 52 | 7.4 |
| 164 | OLD CROSSING SONG | **regular** | THE CROSSING | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9 |
| 165 | CROSSING ECLIPSE | **regular** | THE CROSSING | — | STANDARD | 14 | 44 | 48 | 30 | 60 | 11 |
| 166 | SOFT MAZE | **regular** | THE CROSSING | — | STANDARD | 5 | 39 | 42 | 26 | 52 | 7.5 |
| 167 | OLD MAZE SONG | **regular** | THE CROSSING | — | STANDARD | 6 | 36 | 39 | 24 | 48 | 8.5 |
| 168 | MAZE RIDDLE | **regular** | THE CROSSING | — | STANDARD | 11 | 48 | 63 | 39 | 78 | 9.5 |
| 169 | THE MAZE | boss (special) | THE CROSSING | maze | STANDARD 5 | 0 | 0 | 92 | 58 | 116 | — |
| 170 | THE LIMPET | intro | THE LIMPET | limpet | STANDARD | 6 | 54 | 69 | 43 | 86 | 5 |
| 171 | LIMPET DUET | **regular** | THE LIMPET | — | STANDARD | 8 | 36 | 47 | 29 | 58 | 11.3 |
| 172 | OLD LIMPET SONG | **regular** | THE LIMPET | — | STANDARD | 7 | 36 | 47 | 29 | 58 | 13.4 |
| 173 | LIMPET APOCALYPSE | **regular** | THE LIMPET | — | STANDARD | 13 | 47 | 51 | 32 | 64 | 15.4 |
| 174 | GAUGE HUSH | **regular** | THE LIMPET | — | STANDARD | 6 | 35 | 38 | 24 | 48 | 8.8 |
| 175 | GAUGE SAGA | **regular** | THE LIMPET | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 9.8 |
| 176 | CROOKED GAUGE | **regular** | THE LIMPET | — | STANDARD | 11 | 47 | 57 | 36 | 72 | 10.8 |
| 177 | THE GAUGE | boss (special) | THE LIMPET | gauge, panel | THE GAUGE | 0 | 0 | 62 | 39 | 78 | — |
| 178 | THE BEATBOX | intro | THE BEATBOX | beatbox | STANDARD | 5 | 48 | 53 | 33 | 66 | 3.6 |
| 179 | BEATBOX PARTY | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.5 |
| 180 | BEATBOX LEGEND | **regular** | THE BEATBOX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 9.4 |
| 181 | BEATBOX ECLIPSE | **regular** | THE BEATBOX | — | STANDARD | 14 | 45 | 49 | 31 | 62 | 11.4 |
| 182 | LAZY FLEET | **regular** | THE BEATBOX | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.6 |
| 183 | FLEET SAGA | **regular** | THE BEATBOX | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 8.6 |
| 184 | FLEET TRICK | **regular** | THE BEATBOX | — | STANDARD | 11 | 43 | 58 | 36 | 72 | 9.6 |
| 185 | THE FLEET | boss (special) | THE BEATBOX | fleet, panel | THE FLEET | 0 | 0 | 14 | 9 | 18 | — |
| 186 | HOLD TOGETHER | intro | HOLD TOGETHER | blisterBoth | STANDARD | 5 | 42 | 46 | 29 | 58 | 3.9 |
| 187 | TOGETHER DUET | **regular** | HOLD TOGETHER | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 7.6 |
| 188 | OLD TOGETHER SONG | **regular** | HOLD TOGETHER | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.6 |
| 189 | TOGETHER STORM | **regular** | HOLD TOGETHER | — | STANDARD | 12 | 46 | 52 | 33 | 66 | 11.6 |
| 190 | LAZY PLUMB | **regular** | HOLD TOGETHER | — | STANDARD | 6 | 39 | 42 | 26 | 52 | 7.8 |
| 191 | PLUMB REUNION | **regular** | HOLD TOGETHER | — | STANDARD | 8 | 38 | 48 | 30 | 60 | 8.8 |
| 192 | PLUMB MIRAGE | **regular** | HOLD TOGETHER | — | STANDARD | 9 | 42 | 46 | 29 | 58 | 9.8 |
| 193 | THE PLUMB | boss | HOLD TOGETHER | plumb | STANDARD | 0 | 0 | 45 | 28 | 56 | — |
| 194 | THE LEECH | intro | THE LEECH | leech | STANDARD | 7 | 60 | 63 | 39 | 78 | 6.2 |
| 195 | LEECH DUET | **regular** | THE LEECH | — | STANDARD | 7 | 36 | 41 | 26 | 52 | 9.3 |
| 196 | LEECH SAGA | **regular** | THE LEECH | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 11.2 |
| 197 | LEECH THUNDER | **regular** | THE LEECH | — | STANDARD | 12 | 43 | 60 | 38 | 76 | 13.2 |
| 198 | LAMPREY DREAM | **regular** | THE LEECH | — | STANDARD | 6 | 37 | 54 | 34 | 68 | 9.4 |
| 199 | OLD LAMPREY SONG | **regular** | THE LEECH | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 10 |
| 200 | LAMPREY TRICK | **regular** | THE LEECH | — | STANDARD | 11 | 47 | 52 | 33 | 66 | 11 |
| 201 | THE LAMPREY | boss | THE LEECH | lamprey | STANDARD | 0 | 0 | 132 | 83 | 166 | — |
| 202 | HEAVY ROCKS | intro | HEAVY ROCKS | meteorMedium, meteorFast, meteorFaster, meteorFastest | STANDARD | 5 | 32 | 36 | 23 | 46 | 4.4 |
| 203 | HEAVY ROCK RISING | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 39 | 24 | 48 | 4.7 |
| 204 | LONG HEAVY ROCK ROAD | **regular** | HEAVY ROCKS | — | STANDARD | 6 | 31 | 34 | 21 | 42 | 6.7 |
| 205 | HEAVY ROCK PARTY | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 34 | 39 | 24 | 48 | 7.7 |
| 206 | HIVE LULLABY | **regular** | HEAVY ROCKS | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 6.7 |
| 207 | HIVE HOMECOMING | **regular** | HEAVY ROCKS | — | STANDARD | 8 | 36 | 43 | 27 | 54 | 7.7 |
| 208 | HIVE MIRAGE | **regular** | HEAVY ROCKS | — | STANDARD | 11 | 47 | 54 | 34 | 68 | 8.7 |
| 209 | THE HIVE | boss | HEAVY ROCKS | hive | STANDARD | 0 | 0 | 74 | 46 | 92 | — |
| 210 | THE VEER | intro | THE VEER | veer | STANDARD | 4 | 42 | 57 | 36 | 72 | 3.6 |
| 211 | VEER AND HEAVY ROCK | **regular** | THE VEER | — | STANDARD | 7 | 36 | 46 | 29 | 58 | 7.3 |
| 212 | VEER REUNION | **regular** | THE VEER | — | STANDARD | 7 | 36 | 45 | 28 | 56 | 9.3 |
| 213 | VEER APOCALYPSE | **regular** | THE VEER | — | STANDARD | 14 | 45 | 54 | 34 | 68 | 11.3 |
| 214 | LAZY SNAKE | **regular** | THE VEER | — | STANDARD | 6 | 36 | 53 | 33 | 66 | 7.4 |
| 215 | ANCIENT SNAKE | **regular** | THE VEER | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 8.4 |
| 216 | CROOKED SNAKE | **regular** | THE VEER | — | STANDARD | 11 | 44 | 51 | 32 | 64 | 9.4 |
| 217 | SNAKE | boss (special) | THE VEER | snake, panel | SNAKE | 0 | 0 | 124 | 78 | 156 | — |
| 218 | THE CHOKE | intro | THE CHOKE | steerFault | STANDARD | 10 | 76 | 81 | 51 | 102 | 5.6 |
| 219 | CHOKE ALLIANCE | **regular** | THE CHOKE | — | STANDARD | 8 | 40 | 46 | 29 | 58 | 9.3 |
| 220 | CHOKE REUNION | **regular** | THE CHOKE | — | STANDARD | 7 | 37 | 46 | 29 | 58 | 11.3 |
| 221 | CHOKE THUNDER | **regular** | THE CHOKE | — | STANDARD | 12 | 44 | 59 | 37 | 74 | 13.4 |
| 222 | WARDEN HUSH | **regular** | THE CHOKE | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.6 |
| 223 | WARDEN RELIC | **regular** | THE CHOKE | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 224 | WARDEN ILLUSION | **regular** | THE CHOKE | — | STANDARD | 11 | 46 | 61 | 38 | 76 | 11 |
| 225 | THE WARDEN | boss | THE CHOKE | warden, tether | STANDARD 5 | 0 | 0 | 39 | 24 | 48 | — |
| 226 | THE FENCE | intro | THE FENCE | fence | STANDARD | 3 | 24 | 34 | 21 | 42 | 1.5 |
| 227 | THE GAP | intro | THE FENCE | — | STANDARD | 5 | 56 | 66 | 41 | 82 | 4.5 |
| 228 | THE CUT | intro | THE FENCE | — | STANDARD | 4 | 48 | 58 | 36 | 72 | 1.5 |
| 229 | FENCE ALLIANCE | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 55 | 34 | 68 | 7.4 |
| 230 | ANCIENT FENCE | **regular** | THE FENCE | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 9.4 |
| 231 | FENCE INFERNO | **regular** | THE FENCE | — | STANDARD | 12 | 44 | 59 | 37 | 74 | 11.4 |
| 232 | SLEEPY STARE | **regular** | THE FENCE | — | STANDARD | 6 | 37 | 44 | 28 | 56 | 7.5 |
| 233 | STARE SAGA | **regular** | THE FENCE | — | STANDARD | 8 | 38 | 41 | 26 | 52 | 8.5 |
| 234 | STARE RIDDLE | **regular** | THE FENCE | — | STANDARD | 11 | 44 | 51 | 32 | 64 | 9.5 |
| 235 | THE STARE | boss | THE FENCE | stare | STANDARD | 0 | 0 | 245 | 153 | 306 | — |
| 236 | THE CHOIR | intro | THE CHOIR | choir | STANDARD | 4 | 34 | 38 | 24 | 48 | 3.6 |
| 237 | CHOIR AND FENCE | **regular** | THE CHOIR | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 7.5 |
| 238 | ANCIENT CHOIR | **regular** | THE CHOIR | — | STANDARD | 7 | 36 | 39 | 24 | 48 | 9.4 |
| 239 | CHOIR RAPTURE | **regular** | THE CHOIR | — | STANDARD | 14 | 48 | 57 | 36 | 72 | 11.4 |
| 240 | VISE DREAM | **regular** | THE CHOIR | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 7.6 |
| 241 | VISE SAGA | **regular** | THE CHOIR | — | STANDARD | 7 | 35 | 44 | 28 | 56 | 8.6 |
| 242 | CROOKED VISE | **regular** | THE CHOIR | — | STANDARD | 11 | 47 | 50 | 31 | 62 | 9.6 |
| 243 | THE VISE | boss | THE CHOIR | vise | STANDARD | 0 | 0 | 42 | 26 | 52 | — |
| 244 | THE CLAW | intro | THE CLAW | panel | THE CLAW | 0 | 0 | 54 | 34 | 68 | 0 |
| 245 | CLAW DUET | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 39 | 24 | 48 | 0 |
| 246 | CLAW HOMECOMING | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 31 | 19 | 38 | 0 |
| 247 | CLAW THUNDER | **regular** | THE CLAW | — | THE CLAW | 0 | 0 | 35 | 22 | 44 | 0 |
| 248 | THROAT PICNIC | **regular** | THE CLAW | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.6 |
| 249 | THROAT LEGEND | **regular** | THE CLAW | — | STANDARD | 8 | 40 | 50 | 31 | 62 | 8.6 |
| 250 | THROAT PARADOX | **regular** | THE CLAW | — | STANDARD | 11 | 46 | 61 | 38 | 76 | 9.6 |
| 251 | THE THROAT | boss | THE CLAW | throat, panel | THE THROAT | 12 | 78 | 40 | 25 | 50 | — |
| 252 | THE BALLOON | intro | THE BALLOON | balloon | STANDARD | 6 | 44 | 75 | 47 | 94 | 4.5 |
| 253 | BALLOON ALLIANCE | **regular** | THE BALLOON | — | STANDARD | 8 | 40 | 58 | 36 | 72 | 7.6 |
| 254 | BALLOON LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 37 | 60 | 38 | 76 | 9.7 |
| 255 | BALLOON THUNDER | **regular** | THE BALLOON | — | STANDARD | 12 | 45 | 70 | 44 | 88 | 11.7 |
| 256 | SOFT SINEW | **regular** | THE BALLOON | — | STANDARD | 6 | 35 | 41 | 26 | 52 | 7.7 |
| 257 | SINEW LEGEND | **regular** | THE BALLOON | — | STANDARD | 7 | 35 | 40 | 25 | 50 | 8.7 |
| 258 | SINEW MIRAGE | **regular** | THE BALLOON | — | STANDARD | 11 | 44 | 61 | 38 | 76 | 9.7 |
| 259 | THE SINEW | boss | THE BALLOON | sinew | STANDARD | 0 | 0 | 44 | 28 | 56 | — |
| 260 | THE MOULT | intro | THE MOULT | moult | STANDARD | 5 | 19 | 77 | 48 | 96 | 6.3 |
| 261 | MOULT WALTZ | **regular** | THE MOULT | — | STANDARD | 8 | 38 | 67 | 42 | 84 | 7.8 |
| 262 | MOULT RELIC | **regular** | THE MOULT | — | STANDARD | 7 | 37 | 77 | 48 | 96 | 9.8 |
| 263 | MOULT ECLIPSE | **regular** | THE MOULT | — | STANDARD | 13 | 44 | 107 | 67 | 134 | 11.8 |
| 264 | CHRYSALIS PICNIC | **regular** | THE MOULT | — | STANDARD | 6 | 35 | 51 | 32 | 64 | 7.9 |
| 265 | CHRYSALIS SAGA | **regular** | THE MOULT | — | STANDARD | 7 | 37 | 61 | 38 | 76 | 8.9 |
| 266 | CHRYSALIS RIDDLE | **regular** | THE MOULT | — | STANDARD | 11 | 47 | 62 | 39 | 78 | 9.9 |
| 267 | THE CHRYSALIS | boss | THE MOULT | chrysalis | STANDARD 5 | 0 | 0 | 75 | 47 | 94 | — |
| 268 | THE DARK | intro | THE DARK | darkFault | STANDARD | 10 | 72 | 75 | 47 | 94 | 6 |
| 269 | DARK ALLIANCE | **regular** | THE DARK | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.2 |
| 270 | DARK LEGEND | **regular** | THE DARK | — | STANDARD | 7 | 39 | 42 | 26 | 52 | 11.2 |
| 271 | DARK INFERNO | **regular** | THE DARK | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 13.2 |
| 272 | SLEEPY CURTAIN | **regular** | THE DARK | — | STANDARD | 6 | 37 | 40 | 25 | 50 | 9.4 |
| 273 | CURTAIN REUNION | **regular** | THE DARK | — | STANDARD | 7 | 38 | 60 | 38 | 76 | 9.8 |
| 274 | CURTAIN RIDDLE | **regular** | THE DARK | — | STANDARD | 11 | 45 | 50 | 31 | 62 | 10.8 |
| 275 | THE CURTAIN | boss | THE DARK | curtain | STANDARD | 0 | 0 | 38 | 24 | 48 | — |
| 276 | THE COIL | intro | THE COIL | coil, shieldFault | STANDARD | 6 | 61 | 63 | 39 | 78 | 5.6 |
| 277 | COIL TANGO | **regular** | THE COIL | — | STANDARD | 8 | 35 | 87 | 54 | 108 | 7.1 |
| 278 | COIL HOMECOMING | **regular** | THE COIL | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 8 |
| 279 | COIL INFERNO | **regular** | THE COIL | — | STANDARD | 10 | 62 | 70 | 44 | 88 | 8 |
| 280 | PINBALL LULLABY | **regular** | THE COIL | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.2 |
| 281 | PINBALL REUNION | **regular** | THE COIL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 8.2 |
| 282 | PINBALL ILLUSION | **regular** | THE COIL | — | STANDARD | 11 | 44 | 54 | 34 | 68 | 9.2 |
| 283 | PINBALL | boss (special) | THE COIL | pinball, panel | PINBALL | 0 | 0 | 411 | 257 | 514 | — |
| 284 | THE JAM | intro | THE JAM | cannonFault | STANDARD | 8 | 70 | 77 | 48 | 96 | 6.2 |
| 285 | JAM DUET | **regular** | THE JAM | — | STANDARD | 7 | 38 | 42 | 26 | 52 | 9.6 |
| 286 | OLD JAM SONG | **regular** | THE JAM | — | STANDARD | 8 | 39 | 54 | 34 | 68 | 11.6 |
| 287 | JAM OVERDRIVE | **regular** | THE JAM | — | STANDARD | 12 | 46 | 54 | 34 | 68 | 13.6 |
| 288 | SCOUT HUSH | **regular** | THE JAM | — | STANDARD | 6 | 38 | 44 | 28 | 56 | 9.7 |
| 289 | SCOUT REUNION | **regular** | THE JAM | — | STANDARD | 6 | 38 | 41 | 26 | 52 | 10 |
| 290 | SCOUT MIRAGE | **regular** | THE JAM | — | STANDARD | 11 | 45 | 53 | 33 | 66 | 11 |
| 291 | THE SCOUT | boss (special) | THE JAM | scout, panel | THE SCOUT | 0 | 0 | 73 | 46 | 92 | — |
| 292 | THE CLASP | intro | THE CLASP | clasp | STANDARD | 5 | 28 | 31 | 19 | 38 | 5.7 |
| 293 | CLASP WALTZ | **regular** | THE CLASP | — | STANDARD | 8 | 37 | 52 | 33 | 66 | 7.4 |
| 294 | CLASP HOMECOMING | **regular** | THE CLASP | — | STANDARD | 7 | 38 | 41 | 26 | 52 | 9.5 |
| 295 | CLASP RAPTURE | **regular** | THE CLASP | — | STANDARD | 14 | 44 | 48 | 30 | 60 | 11.4 |
| 296 | BATON DREAM | **regular** | THE CLASP | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 7.5 |
| 297 | BATON LEGEND | **regular** | THE CLASP | — | STANDARD | 8 | 40 | 71 | 44 | 88 | 8.5 |
| 298 | CROOKED BATON | **regular** | THE CLASP | — | STANDARD | 11 | 48 | 51 | 32 | 64 | 9.5 |
| 299 | THE BATON | boss | THE CLASP | baton | STANDARD | 0 | 0 | 286 | 179 | 358 | — |
| 300 | THE LID | intro | THE LID | lid | STANDARD | 3 | 24 | 27 | 17 | 34 | 3.3 |
| 301 | LID TANGO | **regular** | THE LID | — | STANDARD | 8 | 36 | 51 | 32 | 64 | 7.5 |
| 302 | ANCIENT LID | **regular** | THE LID | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 9.4 |
| 303 | LID ECLIPSE | **regular** | THE LID | — | STANDARD | 12 | 45 | 48 | 30 | 60 | 11.4 |
| 304 | OCULUS LULLABY | **regular** | THE LID | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 7.6 |
| 305 | OCULUS SAGA | **regular** | THE LID | — | STANDARD | 8 | 39 | 44 | 28 | 56 | 8.6 |
| 306 | OCULUS MIRAGE | **regular** | THE LID | — | STANDARD | 11 | 46 | 107 | 67 | 134 | 9.6 |
| 307 | THE OCULUS | boss | THE LID | oculus | STANDARD | 17 | 86 | 25 | 16 | 32 | — |
| 308 | THE CODEX | intro | THE CODEX | codexFault | STANDARD | 8 | 36 | 40 | 25 | 50 | 8.4 |
| 309 | CODEX TANGO | **regular** | THE CODEX | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 9.6 |
| 310 | CODEX LEGEND | **regular** | THE CODEX | — | STANDARD | 7 | 36 | 46 | 29 | 58 | 11.6 |
| 311 | CODEX OVERDRIVE | **regular** | THE CODEX | — | STANDARD | 14 | 47 | 55 | 34 | 68 | 13.7 |
| 312 | HAUL HUSH | **regular** | THE CODEX | — | STANDARD | 6 | 34 | 39 | 24 | 48 | 9.7 |
| 313 | HAUL RELIC | **regular** | THE CODEX | — | STANDARD | 7 | 37 | 40 | 25 | 50 | 10 |
| 314 | HAUL TRICK | **regular** | THE CODEX | — | STANDARD | 10 | 43 | 54 | 34 | 68 | 11 |
| 315 | THE HAUL | boss (special) | THE CODEX | — | THE SCOUT | 0 | 0 | 22 | 14 | 28 | — |
| 316 | THE CRYSTAL | intro | THE CRYSTAL | crystal | STANDARD | 4 | 46 | 51 | 32 | 64 | 7.2 |
| 317 | CRYSTAL WALTZ | **regular** | THE CRYSTAL | — | STANDARD | 8 | 39 | 45 | 28 | 56 | 7.6 |
| 318 | CRYSTAL REUNION | **regular** | THE CRYSTAL | — | STANDARD | 7 | 35 | 38 | 24 | 48 | 9.4 |
| 319 | CRYSTAL ECLIPSE | **regular** | THE CRYSTAL | — | STANDARD | 15 | 48 | 53 | 33 | 66 | 11.4 |
| 320 | PULSE DREAM | **regular** | THE CRYSTAL | — | STANDARD | 6 | 35 | 50 | 31 | 62 | 7.7 |
| 321 | PULSE HOMECOMING | **regular** | THE CRYSTAL | — | STANDARD | 10 | 40 | 58 | 36 | 72 | 8.7 |
| 322 | PULSE ILLUSION | **regular** | THE CRYSTAL | — | STANDARD | 10 | 44 | 48 | 30 | 60 | 9.7 |
| 323 | THE PULSE | boss (special) | THE CRYSTAL | pulse, panel | THE PULSE | 0 | 0 | 137 | 86 | 172 | — |
| 324 | THE VOLLEY | intro | THE VOLLEY | volley | STANDARD | 2 | 26 | 57 | 36 | 72 | 3.3 |
| 325 | VOLLEY PARTY | **regular** | THE VOLLEY | — | STANDARD | 8 | 36 | 56 | 35 | 70 | 7.7 |
| 326 | VOLLEY LEGEND | **regular** | THE VOLLEY | — | STANDARD | 8 | 40 | 58 | 36 | 72 | 9.4 |
| 327 | VOLLEY APOCALYPSE | **regular** | THE VOLLEY | — | STANDARD | 11 | 48 | 77 | 48 | 96 | 11.4 |
| 328 | GORGE DREAM | **regular** | THE VOLLEY | — | STANDARD | 6 | 39 | 46 | 29 | 58 | 7.8 |
| 329 | GORGE REUNION | **regular** | THE VOLLEY | — | STANDARD | 10 | 38 | 43 | 27 | 54 | 8.8 |
| 330 | GORGE MIRAGE | **regular** | THE VOLLEY | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 9.8 |
| 331 | THE GORGE | boss | THE VOLLEY | gorge | STANDARD | 10 | 82 | 259 | 162 | 324 | — |
| 332 | THE HANDOVER | intro | THE HANDOVER | handoverFault | STANDARD | 7 | 28 | 31 | 19 | 38 | 9.4 |
| 333 | THE LEAK | intro | THE HANDOVER | — | STANDARD 5 | 16 | 35 | 38 | 24 | 48 | 10.4 |
| 334 | HANDOVER ALLIANCE | **regular** | THE HANDOVER | — | STANDARD | 8 | 37 | 55 | 34 | 68 | 11.5 |
| 335 | HANDOVER LEGEND | **regular** | THE HANDOVER | — | STANDARD | 7 | 37 | 42 | 26 | 52 | 13.5 |
| 336 | HANDOVER OVERDRIVE | **regular** | THE HANDOVER | — | STANDARD | 12 | 45 | 48 | 30 | 60 | 15.5 |
| 337 | SOFT GIMBAL | **regular** | THE HANDOVER | — | STANDARD | 7 | 40 | 43 | 27 | 54 | 9.8 |
| 338 | GIMBAL REUNION | **regular** | THE HANDOVER | — | STANDARD | 8 | 36 | 51 | 32 | 64 | 10.8 |
| 339 | GIMBAL RIDDLE | **regular** | THE HANDOVER | — | STANDARD | 12 | 44 | 48 | 30 | 60 | 11.9 |
| 340 | THE GIMBAL | boss | THE HANDOVER | gimbal | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 341 | THE CRAWLER | intro | THE CRAWLER | crawler | STANDARD | 3 | 48 | 64 | 40 | 80 | 4.5 |
| 342 | CRAWLER TANGO | **regular** | THE CRAWLER | — | STANDARD | 8 | 36 | 46 | 29 | 58 | 7.8 |
| 343 | CRAWLER LEGEND | **regular** | THE CRAWLER | — | STANDARD | 7 | 38 | 43 | 27 | 54 | 10 |
| 344 | CRAWLER INFERNO | **regular** | THE CRAWLER | — | STANDARD | 14 | 46 | 73 | 46 | 92 | 12 |
| 345 | SOFT UNDERTOW | **regular** | THE CRAWLER | — | STANDARD | 6 | 35 | 42 | 26 | 52 | 7.9 |
| 346 | UNDERTOW RELIC | **regular** | THE CRAWLER | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 8.9 |
| 347 | CROOKED UNDERTOW | **regular** | THE CRAWLER | — | STANDARD | 12 | 46 | 50 | 31 | 62 | 9.9 |
| 348 | THE UNDERTOW | boss | THE CRAWLER | undertow | STANDARD | 6 | 94 | 156 | 98 | 196 | — |
| 349 | THE FLIP | intro | THE FLIP | flipFault | STANDARD | 10 | 42 | 45 | 28 | 56 | 9.6 |
| 350 | FLIP WALTZ | **regular** | THE FLIP | — | STANDARD | 11 | 40 | 43 | 27 | 54 | 11.6 |
| 351 | OLD FLIP SONG | **regular** | THE FLIP | — | STANDARD | 10 | 38 | 45 | 28 | 56 | 13.6 |
| 352 | FLIP INFERNO | **regular** | THE FLIP | — | STANDARD | 14 | 44 | 48 | 30 | 60 | 15.6 |
| 353 | VANE DREAM | **regular** | THE FLIP | — | STANDARD | 6 | 36 | 42 | 26 | 52 | 10 |
| 354 | VANE REUNION | **regular** | THE FLIP | — | STANDARD | 8 | 38 | 53 | 33 | 66 | 11 |
| 355 | VANE PARADOX | **regular** | THE FLIP | — | STANDARD | 12 | 48 | 52 | 33 | 66 | 12 |
| 356 | THE VANE | boss | THE FLIP | vane | STANDARD 5 | 2 | 3 | 82 | 51 | 102 | — |
| 357 | THE MINE | intro | THE MINE | mine | STANDARD | 6 | 36 | 39 | 24 | 48 | 6.3 |
| 358 | MINE ALLIANCE | **regular** | THE MINE | — | STANDARD | 8 | 35 | 37 | 23 | 46 | 7.9 |
| 359 | MINE SAGA | **regular** | THE MINE | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 9.6 |
| 360 | MINE STORM | **regular** | THE MINE | — | STANDARD | 12 | 48 | 60 | 38 | 76 | 11.7 |
| 361 | MIMIC HUSH | **regular** | THE MINE | — | STANDARD | 6 | 36 | 51 | 32 | 64 | 8 |
| 362 | ANCIENT MIMIC | **regular** | THE MINE | — | STANDARD | 10 | 40 | 51 | 32 | 64 | 9 |
| 363 | MIMIC ILLUSION | **regular** | THE MINE | — | STANDARD | 12 | 46 | 72 | 45 | 90 | 10 |
| 364 | THE MIMIC | boss | THE MINE | mimic, panel | THE SCENE | 0 | 0 | 75 | 47 | 94 | — |
| 365 | THE CAROM | intro | THE CAROM | carom, chute | STANDARD | 4 | 28 | 44 | 28 | 56 | 7.2 |
| 366 | CAROM ALLIANCE | **regular** | THE CAROM | — | STANDARD | 7 | 36 | 48 | 30 | 60 | 8 |
| 367 | OLD CAROM SONG | **regular** | THE CAROM | — | STANDARD | 7 | 38 | 48 | 30 | 60 | 10 |
| 368 | CAROM INFERNO | **regular** | THE CAROM | — | STANDARD | 11 | 48 | 64 | 40 | 80 | 11.9 |
| 369 | SOFT TASTER | **regular** | THE CAROM | — | STANDARD | 6 | 35 | 53 | 33 | 66 | 8.1 |
| 370 | TASTER REUNION | **regular** | THE CAROM | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 9.1 |
| 371 | TASTER RIDDLE | **regular** | THE CAROM | — | STANDARD | 12 | 47 | 51 | 32 | 64 | 10.1 |
| 372 | THE TASTER | boss | THE CAROM | taster | STANDARD | 10 | 80 | 44 | 28 | 56 | — |
| 373 | LEDGER ALLIANCE | **regular** | LEDGER ALLIANCE | — | STANDARD | 11 | 40 | 44 | 28 | 56 | 9.5 |
| 374 | ANCIENT LEDGER | **regular** | LEDGER ALLIANCE | — | STANDARD | 8 | 37 | 41 | 26 | 52 | 11.5 |
| 375 | LEDGER OVERDRIVE | **regular** | LEDGER ALLIANCE | — | STANDARD | 14 | 45 | 56 | 35 | 70 | 13.5 |
| 376 | THE LEDGER | boss | LEDGER ALLIANCE | ledger | STANDARD | 8 | 82 | 33 | 21 | 42 | — |
| 377 | SURGE PARTY | **regular** | SURGE PARTY | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 9.6 |
| 378 | SURGE SAGA | **regular** | SURGE PARTY | — | STANDARD | 8 | 35 | 39 | 24 | 48 | 11.6 |
| 379 | SURGE ECLIPSE | **regular** | SURGE PARTY | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 13.6 |
| 380 | THE SURGE | boss | SURGE PARTY | surge | STANDARD | 8 | 76 | 45 | 28 | 56 | — |
| 381 | LEAD WALTZ | **regular** | LEAD WALTZ | — | STANDARD | 11 | 40 | 45 | 28 | 56 | 9.9 |
| 382 | ANCIENT LEAD | **regular** | LEAD WALTZ | — | STANDARD | 8 | 36 | 40 | 25 | 50 | 11.9 |
| 383 | LEAD INFERNO | **regular** | LEAD WALTZ | — | STANDARD | 14 | 45 | 48 | 30 | 60 | 13.9 |
| 384 | THE LEAD | boss | LEAD WALTZ | lead | STANDARD | 8 | 84 | 41 | 26 | 52 | — |
| 385 | SCUTTLE WALTZ | **regular** | SCUTTLE WALTZ | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 10.1 |
| 386 | SCUTTLE LEGEND | **regular** | SCUTTLE WALTZ | — | STANDARD | 10 | 39 | 64 | 40 | 80 | 12.1 |
| 387 | SCUTTLE ECLIPSE | **regular** | SCUTTLE WALTZ | — | STANDARD | 14 | 48 | 51 | 32 | 64 | 14.1 |
| 388 | THE SCUTTLE | boss | SCUTTLE WALTZ | scuttle | STANDARD | 0 | 0 | 49 | 31 | 62 | — |
| 389 | ANTIPHON WALTZ | **regular** | ANTIPHON WALTZ | — | STANDARD | 9 | 39 | 43 | 27 | 54 | 10.2 |
| 390 | ANTIPHON RELIC | **regular** | ANTIPHON WALTZ | — | STANDARD | 8 | 40 | 44 | 28 | 56 | 12.1 |
| 391 | ANTIPHON APOCALYPSE | **regular** | ANTIPHON WALTZ | — | STANDARD | 16 | 45 | 49 | 31 | 62 | 14.1 |
| 392 | THE ANTIPHON | boss | ANTIPHON WALTZ | antiphon | STANDARD | 0 | 0 | 56 | 35 | 70 | — |
| 393 | SPLICE TANGO | **regular** | SPLICE TANGO | — | STANDARD | 10 | 37 | 41 | 26 | 52 | 10.4 |
| 394 | SPLICE HOMECOMING | **regular** | SPLICE TANGO | — | STANDARD | 8 | 40 | 43 | 27 | 54 | 12.4 |
| 395 | SPLICE STORM | **regular** | SPLICE TANGO | — | STANDARD | 13 | 47 | 54 | 34 | 68 | 14.4 |
| 396 | THE SPLICE | boss (special) | SPLICE TANGO | splice, panel | THE SPLICE | 0 | 0 | 21 | 13 | 26 | — |
| 397 | CAIRN PARTY | **regular** | CAIRN PARTY | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 10.5 |
| 398 | OLD CAIRN SONG | **regular** | CAIRN PARTY | — | STANDARD | 10 | 40 | 44 | 28 | 56 | 12.4 |
| 399 | CAIRN OVERDRIVE | **regular** | CAIRN PARTY | — | STANDARD | 17 | 44 | 52 | 33 | 66 | 14.4 |
| 400 | THE CAIRN | boss | CAIRN PARTY | cairn | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 401 | WELL WALTZ | **regular** | WELL WALTZ | — | STANDARD | 10 | 35 | 97 | 61 | 122 | 10.7 |
| 402 | WELL LEGEND | **regular** | WELL WALTZ | — | STANDARD | 8 | 38 | 40 | 25 | 50 | 12.7 |
| 403 | WELL INFERNO | **regular** | WELL WALTZ | — | STANDARD | 14 | 48 | 63 | 39 | 78 | 14.7 |
| 404 | THE WELL | boss (special) | WELL WALTZ | well | STANDARD | 7 | 58 | 61 | 38 | 76 | — |
| 405 | REPRISE PARTY | **regular** | REPRISE PARTY | — | STANDARD | 9 | 33 | 37 | 23 | 46 | 10.8 |
| 406 | REPRISE LEGEND | **regular** | REPRISE PARTY | — | STANDARD | 10 | 39 | 43 | 27 | 54 | 12.7 |
| 407 | REPRISE INFERNO | **regular** | REPRISE PARTY | — | STANDARD | 14 | 48 | 51 | 32 | 64 | 14.7 |
| 408 | THE REPRISE | boss | REPRISE PARTY | reprise | STANDARD | 7 | 21 | 41 | 26 | 52 | — |
| 409 | FILAMENT PARTY | **regular** | FILAMENT PARTY | — | STANDARD | 10 | 38 | 42 | 26 | 52 | 11 |
| 410 | FILAMENT REUNION | **regular** | FILAMENT PARTY | — | STANDARD | 10 | 39 | 48 | 30 | 60 | 13 |
| 411 | FILAMENT RAPTURE | **regular** | FILAMENT PARTY | — | STANDARD | 14 | 46 | 49 | 31 | 62 | 15 |
| 412 | THE FILAMENT | boss | FILAMENT PARTY | filament | THE SCENE | 0 | 0 | 82 | 51 | 102 | — |
| 413 | SPOOL DUET | **regular** | SPOOL DUET | — | STANDARD | 10 | 37 | 40 | 25 | 50 | 11.1 |
| 414 | SPOOL RELIC | **regular** | SPOOL DUET | — | STANDARD | 10 | 36 | 43 | 27 | 54 | 13.2 |
| 415 | SPOOL OVERDRIVE | **regular** | SPOOL DUET | — | STANDARD | 18 | 48 | 55 | 34 | 68 | 15 |
| 416 | THE SPOOL | boss | SPOOL DUET | spool | STANDARD | 0 | 0 | 80 | 50 | 100 | — |
| 417 | HASP PARTY | **regular** | HASP PARTY | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 11.2 |
| 418 | HASP HOMECOMING | **regular** | HASP PARTY | — | STANDARD | 12 | 37 | 41 | 26 | 52 | 13.2 |
| 419 | HASP APOCALYPSE | **regular** | HASP PARTY | — | STANDARD | 16 | 45 | 49 | 31 | 62 | 15.2 |
| 420 | THE HASP | boss | HASP PARTY | hasp | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 421 | FLUE PARTY | **regular** | FLUE PARTY | — | STANDARD | 13 | 36 | 41 | 26 | 52 | 11.4 |
| 422 | FLUE SAGA | **regular** | FLUE PARTY | — | STANDARD | 10 | 35 | 38 | 24 | 48 | 13.7 |
| 423 | FLUE INFERNO | **regular** | FLUE PARTY | — | STANDARD | 20 | 46 | 62 | 39 | 78 | 15.6 |
| 424 | THE FLUE | boss | FLUE PARTY | flue, panel | SHOTS | 0 | 0 | 71 | 44 | 88 | — |
| 425 | RATCHET TANGO | **regular** | RATCHET TANGO | — | STANDARD | 12 | 35 | 45 | 28 | 56 | 11.5 |
| 426 | RATCHET RELIC | **regular** | RATCHET TANGO | — | STANDARD | 12 | 38 | 42 | 26 | 52 | 13.6 |
| 427 | RATCHET APOCALYPSE | **regular** | RATCHET TANGO | — | STANDARD | 19 | 48 | 51 | 32 | 64 | 15.5 |
| 428 | THE RATCHET | boss | RATCHET TANGO | ratchet | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 429 | NETTLE WALTZ | **regular** | NETTLE WALTZ | — | STANDARD | 12 | 36 | 40 | 25 | 50 | 11.6 |
| 430 | ANCIENT NETTLE | **regular** | NETTLE WALTZ | — | STANDARD | 10 | 35 | 50 | 31 | 62 | 13.4 |
| 431 | NETTLE ECLIPSE | **regular** | NETTLE WALTZ | — | STANDARD | 18 | 48 | 55 | 34 | 68 | 15.2 |
| 432 | THE NETTLE | boss | NETTLE WALTZ | nettle | STANDARD 5 | 0 | 0 | 106 | 66 | 132 | — |
| 433 | MANTLE PARTY | **regular** | MANTLE PARTY | — | STANDARD | 11 | 40 | 44 | 28 | 56 | 11.7 |
| 434 | MANTLE LEGEND | **regular** | MANTLE PARTY | — | STANDARD | 10 | 39 | 42 | 26 | 52 | 13 |
| 435 | MANTLE STORM | **regular** | MANTLE PARTY | — | STANDARD | 16 | 47 | 51 | 32 | 64 | 14.9 |
| 436 | THE MANTLE | boss | MANTLE PARTY | mantle | STANDARD | 0 | 0 | 18 | 11 | 22 | — |
| 437 | KEEL PARTY | **regular** | KEEL PARTY | — | STANDARD | 12 | 38 | 44 | 28 | 56 | 11.8 |
| 438 | KEEL SAGA | **regular** | KEEL PARTY | — | STANDARD | 10 | 37 | 52 | 33 | 66 | 13 |
| 439 | KEEL OVERDRIVE | **regular** | KEEL PARTY | — | STANDARD | 19 | 45 | 55 | 34 | 68 | 15 |
| 440 | THE KEEL | boss | KEEL PARTY | keel | STANDARD | 0 | 0 | 28 | 18 | 36 | — |
| 441 | VALVE WALTZ | **regular** | VALVE WALTZ | — | STANDARD | 10 | 40 | 48 | 30 | 60 | 11.9 |
| 442 | VALVE SAGA | **regular** | VALVE WALTZ | — | STANDARD | 9 | 36 | 51 | 32 | 64 | 13 |
| 443 | VALVE ECLIPSE | **regular** | VALVE WALTZ | — | STANDARD | 16 | 47 | 55 | 34 | 68 | 15 |
| 444 | THE VALVE | boss | VALVE WALTZ | valve | STANDARD | 0 | 0 | 16 | 10 | 20 | — |
| 445 | SEAM TANGO | **regular** | SEAM TANGO | — | STANDARD | 12 | 40 | 44 | 28 | 56 | 12 |
| 446 | OLD SEAM SONG | **regular** | SEAM TANGO | — | STANDARD | 10 | 40 | 43 | 27 | 54 | 12.9 |
| 447 | SEAM RAPTURE | **regular** | SEAM TANGO | — | STANDARD | 16 | 46 | 51 | 32 | 64 | 15 |
| 448 | THE SEAM | boss | SEAM TANGO | seam | STANDARD | 0 | 0 | 31 | 19 | 38 | — |
| 449 | SLING TANGO | **regular** | SLING TANGO | — | STANDARD | 12 | 39 | 43 | 27 | 54 | 12.1 |
| 450 | OLD SLING SONG | **regular** | SLING TANGO | — | STANDARD | 12 | 39 | 49 | 31 | 62 | 13.6 |
| 451 | SLING STORM | **regular** | SLING TANGO | — | STANDARD | 16 | 43 | 48 | 30 | 60 | 15.6 |
| 452 | THE SLING | boss | SLING TANGO | sling | STANDARD | 0 | 0 | 43 | 27 | 54 | — |
| 453 | CAPSTAN TANGO | **regular** | CAPSTAN TANGO | — | STANDARD | 13 | 39 | 50 | 31 | 62 | 12.2 |
| 454 | CAPSTAN SAGA | **regular** | CAPSTAN TANGO | — | STANDARD | 10 | 36 | 42 | 26 | 52 | 14.6 |
| 455 | CAPSTAN ECLIPSE | **regular** | CAPSTAN TANGO | — | STANDARD | 20 | 48 | 64 | 40 | 80 | 16.7 |
| 456 | THE CAPSTAN | boss | CAPSTAN TANGO | capstan | STANDARD | 0 | 0 | 21 | 13 | 26 | — |
| 457 | GALL PARTY | **regular** | GALL PARTY | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.4 |
| 458 | GALL SAGA | **regular** | GALL PARTY | — | STANDARD | 10 | 36 | 51 | 32 | 64 | 14.2 |
| 459 | GALL ECLIPSE | **regular** | GALL PARTY | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 16.3 |
| 460 | THE GALL | boss | GALL PARTY | gall | STANDARD | 0 | 0 | 23 | 14 | 28 | — |
| 461 | TRAPEZE ALLIANCE | **regular** | TRAPEZE ALLIANCE | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 12.5 |
| 462 | TRAPEZE RELIC | **regular** | TRAPEZE ALLIANCE | — | STANDARD | 12 | 37 | 47 | 29 | 58 | 13.6 |
| 463 | TRAPEZE ECLIPSE | **regular** | TRAPEZE ALLIANCE | — | STANDARD | 18 | 45 | 49 | 31 | 62 | 15.5 |
| 464 | THE TRAPEZE | boss | TRAPEZE ALLIANCE | trapeze | STANDARD | 0 | 0 | 53 | 33 | 66 | — |
| 465 | GOVERNOR DUET | **regular** | GOVERNOR DUET | — | STANDARD | 10 | 38 | 41 | 26 | 52 | 12.6 |
| 466 | ANCIENT GOVERNOR | **regular** | GOVERNOR DUET | — | STANDARD | 10 | 40 | 47 | 29 | 58 | 13 |
| 467 | GOVERNOR RAPTURE | **regular** | GOVERNOR DUET | — | STANDARD | 16 | 48 | 53 | 33 | 66 | 14.9 |
| 468 | THE GOVERNOR | boss | GOVERNOR DUET | governor | STANDARD | 0 | 0 | 25 | 16 | 32 | — |
| 469 | LATCH DUET | **regular** | LATCH DUET | — | STANDARD | 10 | 35 | 39 | 24 | 48 | 12.7 |
| 470 | ANCIENT LATCH | **regular** | LATCH DUET | — | STANDARD | 10 | 39 | 44 | 28 | 56 | 13.3 |
| 471 | LATCH OVERDRIVE | **regular** | LATCH DUET | — | STANDARD | 16 | 47 | 50 | 31 | 62 | 15.3 |
| 472 | THE LATCH | boss | LATCH DUET | latch | THE SCENE | 0 | 0 | 23 | 14 | 28 | — |
| 473 | HYDRA DUET | **regular** | HYDRA DUET | — | STANDARD | 10 | 40 | 55 | 34 | 68 | 12.5 |
| 474 | ANCIENT HYDRA | **regular** | HYDRA DUET | — | STANDARD | 10 | 40 | 46 | 29 | 58 | 13 |
| 475 | HYDRA APOCALYPSE | **regular** | HYDRA DUET | — | STANDARD | 18 | 47 | 53 | 33 | 66 | 14.9 |
| 476 | THE HYDRA | boss | HYDRA DUET | hydra | STANDARD 5 | 0 | 0 | 68 | 43 | 86 | — |

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
| 132 | THE SWINDLE | normal | 128 beats | 80 | 160 s | long |
| 140 | THE INSTAR | normal | 549 beats | 343 | 686 s | long |
| 153 | THE GEODE | normal | 52 beats | 33 | 66 s | in band |
| 161 | THE MIRROR | special | 53 beats | 33 | 66 s | short |
| 169 | THE MAZE | special | 92 beats | 58 | 116 s | in band |
| 177 | THE GAUGE | special | 62 beats | 39 | 78 s | short |
| 185 | THE FLEET | special | 14 beats | 9 | 18 s | short |
| 193 | THE PLUMB | normal | 45 beats | 28 | 56 s | short |
| 201 | THE LAMPREY | normal | 132 beats | 83 | 166 s | long |
| 209 | THE HIVE | normal | 74 beats | 46 | 92 s | in band |
| 217 | SNAKE | special | 124 beats | 78 | 156 s | in band |
| 225 | THE WARDEN | normal | 39 beats | 24 | 48 s | short |
| 235 | THE STARE | normal | 245 beats | 153 | 306 s | long |
| 243 | THE VISE | normal | 42 beats | 26 | 52 s | short |
| 251 | THE THROAT | normal | 40 beats | 25 | 50 s | short |
| 259 | THE SINEW | normal | 44 beats | 28 | 56 s | short |
| 267 | THE CHRYSALIS | normal | 75 beats | 47 | 94 s | in band |
| 275 | THE CURTAIN | normal | 38 beats | 24 | 48 s | short |
| 283 | PINBALL | special | 411 beats | 257 | 514 s | long |
| 291 | THE SCOUT | special | 73 beats | 46 | 92 s | in band |
| 299 | THE BATON | normal | 286 beats | 179 | 358 s | long |
| 307 | THE OCULUS | normal | 25 beats | 16 | 32 s | short |
| 315 | THE HAUL | special | 22 beats | 14 | 28 s | short |
| 323 | THE PULSE | special | 137 beats | 86 | 172 s | in band |
| 331 | THE GORGE | normal | 259 beats | 162 | 324 s | long |
| 340 | THE GIMBAL | normal | 23 beats | 14 | 28 s | short |
| 348 | THE UNDERTOW | normal | 156 beats | 98 | 196 s | long |
| 356 | THE VANE | normal | 82 beats | 51 | 102 s | in band |
| 364 | THE MIMIC | normal | 75 beats | 47 | 94 s | in band |
| 372 | THE TASTER | normal | 44 beats | 28 | 56 s | short |
| 376 | THE LEDGER | normal | 33 beats | 21 | 42 s | short |
| 380 | THE SURGE | normal | 45 beats | 28 | 56 s | short |
| 384 | THE LEAD | normal | 41 beats | 26 | 52 s | short |
| 388 | THE SCUTTLE | normal | 49 beats | 31 | 62 s | in band |
| 392 | THE ANTIPHON | normal | 56 beats | 35 | 70 s | in band |
| 396 | THE SPLICE | special | 21 beats | 13 | 26 s | short |
| 400 | THE CAIRN | normal | 25 beats | 16 | 32 s | short |
| 404 | THE WELL | special | 61 beats | 38 | 76 s | short |
| 408 | THE REPRISE | normal | 41 beats | 26 | 52 s | short |
| 412 | THE FILAMENT | normal | 82 beats | 51 | 102 s | in band |
| 416 | THE SPOOL | normal | 80 beats | 50 | 100 s | in band |
| 420 | THE HASP | normal | 21 beats | 13 | 26 s | short |
| 424 | THE FLUE | normal | 71 beats | 44 | 88 s | in band |
| 428 | THE RATCHET | normal | 23 beats | 14 | 28 s | short |
| 432 | THE NETTLE | normal | 106 beats | 66 | 132 s | long |
| 436 | THE MANTLE | normal | 18 beats | 11 | 22 s | short |
| 440 | THE KEEL | normal | 28 beats | 18 | 36 s | short |
| 444 | THE VALVE | normal | 16 beats | 10 | 20 s | short |
| 448 | THE SEAM | normal | 31 beats | 19 | 38 s | short |
| 452 | THE SLING | normal | 43 beats | 27 | 54 s | short |
| 456 | THE CAPSTAN | normal | 21 beats | 13 | 26 s | short |
| 460 | THE GALL | normal | 23 beats | 14 | 28 s | short |
| 464 | THE TRAPEZE | normal | 53 beats | 33 | 66 s | in band |
| 468 | THE GOVERNOR | normal | 25 beats | 16 | 32 s | short |
| 472 | THE LATCH | normal | 23 beats | 14 | 28 s | short |
| 476 | THE HYDRA | normal | 68 beats | 43 | 86 s | in band |
