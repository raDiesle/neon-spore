# What a mistake costs, boss by boss

The owner, 2 October 2026, of THE GAUGE: *a miss makes the boss wave fail
and requires retry. this is generic rules for bosses*. This is the audit of
every shipped boss against that sentence, made the same day, read
off `packages/sim/src` — what each mistake the pair can make costs today.
Failing the wave is reaching `failWave` (`wave-fail.ts`): a hull strike, a
wasted shot on HARD, or a pod not taken.

**Eight already keep the rule**: SPLICE, STARE, FILAMENT, CAIRN, REPRISE,
THE MAZE, THE MIRROR and THE WELL (the last two of those with nothing in them
a mistake could be — CAIRN's pile and THE WELL's face cost nothing to leave).
THE GAUGE was made to keep it the same day. **Forty-eight do not.** What they
break it with falls into a few kinds, and most bosses carry more than one.

**Answered the same day: boss by boss.** Shown this, the owner: *i will do
every boss separately and individual. so only change for this boss for now*.
So THE GAUGE is the only boss the rule has changed, and this page is what a
lane reads when the owner names the next one — never a list to work down
unasked (`.claude/skills/new-boss/generic.md`).

## The kinds

1. **A wrong-colour shot at a lit target** costs `missedColor`, a number on
   the balance sheet, and the step stays lit (`core-verdict.ts:48`,
   `balance.ts:182`). Every sky boss that judges a core, and most others.
2. **A shot into armour or a shut core** is *met*, and costs nothing on any
   difficulty (`core-verdict.ts:39`, `shot-out.ts:62-73`) — the owner's
   wording of 27 September.
3. **A shot at nothing** fails only on HARD (`wastedShotFails`,
   `difficulty.ts:53`).
4. **A step whose window runs out is asked again**: the boss rests and
   relights the same step (`rest(world, s, false)`), sometimes dimming or
   re-covering the core.
5. **A hold that slips resets its count**: a pad lifted, a ring off true, a
   pinch let go, a pull out of its zone.
6. **A press in a closing phase adds a beat** to the fade, cool, bleed or
   refreeze.
7. **The boss heals or the work goes back**: frost regrows, grit grows back,
   a blade thickens, a flat regrits, the fleet's hull is plugged, the
   organs sink back healed.
8. **A margin or a meter**: THE PULSE's meter, THE RATCHET's two free teeth,
   THE MIMIC's three reaches, THE LAMPREY's bite eight beats deep.
9. **A jam or a penalty timer**: PINBALL's tilt, THE HASP's burnt hand.
10. **A wrong-seat press on a control drawn on both screens** answers with a
    refusal event and nothing else.
11. **No boss mistake reaches the hull at all**: THE TASTER, THE VANE, THE
    WARDEN, THE BATON, THE GORGE, THE HIVE, THE LEAD, THE BULB QUEEN, THE
    THROAT — only their litter can strike it, through the field's own rule.

## Boss by boss

The kinds each breaks it with, and where. Paths are under `packages/sim/src`.

| Boss | Kinds | Where |
|---|---|---|
| ANTIPHON | 1, 7 | `antiphon-step.ts` (a decoy carried home or a lapse strikes the hull, since 5 October 2026) |
| BATON | 1, 4, 7, 10, 11 | `baton-press.ts`, `baton-step.ts`, `baton-cross.ts`, `baton-hand.ts` |
| BURGEE | 1, 4 | `burgee-step.ts`, `burgee-hand.ts` (off-mark tap, bad draw: event only) |
| CAPSTAN | 1, 4 | `capstan-step.ts`, `capstan-hand.ts` |
| CURTAIN | 1, 4 | `curtain-shot.ts`, `curtain-step.ts` (jam lapse back to hung) |
| CYST | 1, 4, 5 | `cyst-step.ts`, `cyst-hand.ts` |
| DAVIT | 1, 4, 5 | `davit-step.ts`, `davit-hand.ts` |
| FLEET | 3, 7 | `fleet.ts` (salvo into water), `fleet-flood.ts` (lapse plugs the hull) |
| FLUE | 1, 4, 5 | `flue-step.ts`, `flue-hand.ts` |
| GALL | 1, 4, 5 | `gall-step.ts`, `gall-hand.ts` |
| GIMBAL | 5 | `gimbal-step.ts` (the turn has no clock at all) |
| GORGE | 1, 11 | `gorge-step.ts` (wrong colour spills a bead), `gorge-ring.ts` |
| GOVERNOR | 1, 4 | `governor-step.ts`, `governor-hand.ts` (off-mark tap: event only) |
| GRINDSTONE | 1, 4, 5, 6, 7 | `grindstone-step.ts`, `grindstone-hand.ts`, `grindstone-fade.ts` |
| HALTER | 1, 4, 5 | `halter-step.ts`, `halter-hand.ts` |
| HASP | 5, 9 | `hasp-step.ts` (burn), `hasp-story.ts`, `hasp-hand.ts` |
| HIVE | 1, 2, 11 | `hive-shot.ts`, `hive-step.ts` (spills come sooner) |
| INSTAR | 1, 5, 10 | `instar-step.ts`, `instar-hand.ts`, `scene-panel.ts` |
| KEEL | 1, 4, 5, 6, 10 | `keel-step.ts`, `keel-story.ts`, `keel-hand.ts` |
| LAMPREY | 1, 4, 8 | `lamprey-step.ts`, `lamprey-hand.ts` (wrong tooth snaps one back) |
| LEAD | 3, 4, 11 | `lead-step.ts` (last movement repeats without end) |
| LEDGER | 1, 2, 4, 5 | `ledger-step.ts`, `ledger-shot.ts`, `ledger-hand.ts` |
| MANTLE | 4, 5, 10 | `mantle-step.ts`, `mantle-story.ts`, `mantle-hand.ts` |
| MIMIC | 1, 4, 8 | `mimic-step.ts` (hull only on the third reach) |
| NETTLE | 1, 5, 10 | the INSTAR engine: `instar-step.ts`, `instar-hand.ts` |
| OCULUS | 1, 2, 4, 5 | `oculus-step.ts`, `oculus-hand.ts`, `oculus-shot.ts` |
| PINBALL | 9, 10 | `pinball-hand.ts` (tilt kills the table for the flight) |
| PLUMB | 1, 4, 5, 6 | `plumb-step.ts`, `plumb-hand.ts`, `plumb-bleed.ts` |
| PULSE | 8 | `pulse-round.ts`, `pulse-controls.ts` (a miss or a stray takes meter) |
| QUEEN | 1, 4, 10, 11 | `queen-mark.ts` (*there is no punishment here*), `queen-hand.ts` |
| RATCHET | 5, 8 | `ratchet-step.ts`, `ratchet-story.ts` |
| RIME | 1, 4, 6, 7 | `rime-step.ts`, `rime-refreeze.ts`, `rime-guard.ts` |
| SCOUT | 10, and a shut mouth or a wall costs time | `scout-arena.ts`, `scout-fly.ts`, `scout-hand.ts` |
| SCUTTLE | 1, 2 | `scuttle-shot.ts` (early beam touches nothing) |
| SEAM | 1, 6 | `seam-step.ts` (a bolt into the dark step shuts it a beat longer), `seam-shot.ts` |
| SINEW | 5, 10 | `sinew-step.ts` (a snap sheds rocks), `sinew-hand.ts` |
| SLING | 1, 4, 5, 6 | `sling-step.ts`, `sling-hand.ts`, `sling-cool.ts` |
| SNAKE | spit that hits nothing costs nothing | `snake-shot.ts:31` |
| SPOOL | 4 | `spool-step.ts` (a slip sends the movement back to its start) |
| SURGE | 4, 7 | `surge-seam.ts` (a short lift or a burst loses the charge) |
| TASTER | 1, 4, 7, 11 | `taster-shot.ts`, `taster-step.ts` |
| THROAT | 11 | `throat-suck.ts` (wrong-colour mouth refuses, nothing) |
| TRIVET | 1, 4, 5 | `trivet-step.ts`, `trivet-hand.ts`, `trivet-shot.ts` |
| UNDERTOW | 4 | `undertow-step.ts`, `undertow-press.ts` (a tall lobe tapped back is a free second try) |
| VALVE | 4, 5 | `valve-step.ts` (kick), `valve-hand.ts` (slip) |
| VANE | 1, 2, 11 | `vane.ts`, `vane-hand.ts` |
| VISE | 1, 4, 5 | `vise-step.ts`, `vise-hand.ts`, `vise-shot.ts` |
| WARDEN | 1, 2, 4, 11 | `bullet-hit-boss.ts`, `warden-rope.ts`, `warden-hand.ts` |

Two things the audit found besides: `snake.ts:111` still says a meteor
*starts the attempt over* where the code crashes the round, and THE
FILAMENT's navigator skipping a tile is ignored where the pilot's skip
strikes the hull.
