# The catalogue of marks and controls

Every drawn piece the game asks a thumb or a bolt with — on a boss, on an
enemy, on the band: the mark, whose it is, what gesture it wants, where a
shot is aimed, whether a touch was right, and how long is left. **This is
what to choose from** when building a new boss or enemy, enhancing one, or
checking two against each other. It is the owner's request of 29 September
2026: *make all those controls reusable, so changes later on are easier and
we have this catalogue documentation to know all the graphical and control
elements we can choose from to build new bosses, enhance them or be
consistent* — and, the same day, *its not just bosses, but those controls
are through the whole game*.

The shapes of bodies are `docs/asset-catalogue.md`'s. The band's buttons and
the in-screen controls, row by row with what each one does, are
`docs/spec/controls.md`'s. The owner's rules these pieces carry, dated and in
his words, are `.claude/skills/new-boss/generic.md`'s. This page is the drawing
vocabulary between them.

**How it is kept honest.** `packages/render/test/controls-catalogue.test.ts`
reads this page:

- Every file in the **Shared** column below exists, and every function or
  constant or class it exports is named on this page.
- Every renderer file outside a boss's or a creature's own prefix that
  three or more of them import is either here or on the test's list of files that are not marks
  (the palette, the layout, a spline).

So a piece that becomes shared is catalogued in the lane that shares it, or
the lane is red.

## Two sets: the standard one, and a gesture of its own

The owner, 29 September 2026, generic: *regular enemies players learn how to
approach them by standard control set and do not need repeating help guidance
on them as it doesnt introduce something new … current mechanic of pulling
enemies such as meteors to move or slow them, does not require a visual as
well, as its common across many waves and enemies — so once told in guide,
players know it — its core concept of game.*

- **The standard set** is the band's buttons, the cannon and the shield, and
  the grip — a hand on anything falling, to slow it, carry it a lane or aim
  at it. It is taught once, by the guide, and **an enemy answered by it wears
  no helper**: no arrow, no crosshair, no face, no word telling the pair what
  they already know. What the standard set does draw is *state*, not
  instruction — whose hand is on a body, and what it is doing to it.
- **The one exception is THE PUSH's arrows** (`drawCarryArrows`), the owner,
  29 September 2026: *keep visual as it is for “the push” of enemies one tile to left or right … it only appears when one of the players clicks/touches it, so this makes it exception*. They
  answer a thumb already on the rock rather than invite one, so a helper that
  is drawn only under a touch is the test for any second exception. The next
  day narrowed it rather than lifting it: the arrows now show only the beat of
  quiet after a carry, never the offer before one (the `drawCarryArrows` row).
- **A gesture of its own** — one the standard set does not have, or one that
  is crucial to defeating that one enemy or boss — wears the full set below:
  the mark, whose it is, the gesture's picture, the verdict. That is every
  boss's mark today, and any future enemy destroyed by an on-screen gesture.
  The test is the owner's: *does it introduce something new?*

## The rules that choose for you

- **Call a piece; never draw one of your own for the same idea.** A second
  drawing of a halo, a verdict or an arrow, on a boss or on an enemy, is the drift these files were cut
  to end. When nothing here fits, the new piece goes in a file with no boss
  prefix, gets a row here, and the boss or enemy that asked calls it.
- **Pieces that only THE INSTAR draws are still the reference.** The second
  boss to want one lifts it out of its `instar-` file under a plain name, the
  way `way-arrow.ts` was lifted out of `instar-glyphs.ts`, rather than
  importing a boss's file.
- **Colour.** Red is a mark asking; green (`PALETTE.good`) is a touch that was
  right; white (`PALETTE.text`) is an instruction — an arrow, a face, a clock;
  the step's own colour is `stepColour` (`step-colour.ts`). **Never an
  ammunition colour on a word or a helper** (`docs/decisions.md` #34): the
  colour is the pair's to work out.
- **Every control answers wider than it is drawn**: `hitCircle` and
  `HIT_REACH` (`hit.ts`), and `PULL_GRAB` for a handle that moves.

## Not allowed

Each is a rule of the owner's; the date is when he gave it.

| Not allowed | Instead | Since |
|---|---|---|
| A pull drawn as a circle alone — it reads as a slider's knob | the knob with its arrow, on a track (`drawPullKnob`, `drawPullTrack`) | 25 and 29 September 2026 |
| A swipe drawn as a ring to press | a track: the bar path with chevrons (`drawInstarTrack`) | 24 September 2026 |
| A shot asked for with no target | the crosshair on the part the bolt must reach (`BossCue.aim`, `drawCueHelper`) | 27 and 29 September 2026 |
| The partner's mark showing the gesture | the waiting clock (`drawMarkWait`) and the turning ring (`drawMarkTheirs`) | 24 September 2026 |
| A touch answered anywhere but on the mark it touched, or not at once | `GripVerdicts` and `drawVerdictRing` | 24 September 2026 |
| `CARRY` over a verb that is already a motion | `saysKind` (`boss-cue-shape.ts`) | 24 September 2026 |
| A line saying the order | one seat's mark first, the other's after | 24 September 2026 |
| A mark up before its window opens, or moving with the body while it asks | the window's own predicate; `slowHush` | 27 September 2026 |

## The catalogue

Paths are under `packages/render/src/`. **Who** is who calls it today; a
boss or an enemy not named has its own drawing of the idea and is on the
queue for it, or will be.

### The standard set

Taught once, by the guide; **no helper on the field** (above).

| Piece | Shared | Says | Who |
|---|---|---|---|
| `drawFireButton`, `drawActionButton`, `drawStripMark` | `controls.ts` | the band: the fire button, the action buttons wearing their faces, where the strip has the cannon | every wave |
| `drawGrips`, `drawHandAt`, `gripLabel`, `handWordY` | `grip.ts` | THE GRIP: a hand closed on a falling body, whose it is (the word a line under the ring, moved off a cue verb where one stands there), and a beam from the ship where it is a pull — the partner's hand shown, never an instruction | every body a hand can take |
| `drawCarryArrows` | `grip-arrows.ts` | THE PUSH's pause, not its offer: two arrows fading out over the beat a carried rock must stand still, a side with a wall not drawn | a hand on a rock just carried |
| `drawLockMarks`, `lockLink`, `wellLockLink` | `lock-mark.ts` | THE LOCK: the route a shot steers along to a held body | player 1's hand |

### The mark itself

| Piece | Shared | Says | Who |
|---|---|---|---|
| `drawGripRing` | `grip-rings.ts` | *put a thumb here*: breathes until a thumb lands, filled and steady once one has | THE QUEEN, THE MIRROR, THE WARDEN, THE MAZE, THE GAUGE and twelve more |
| `drawGripDial` | `grip-rings.ts` | a hold's beats running out, from the top clockwise | the same |
| `drawThrownRing` | `grip-rings.ts` | something came off: a ring running out and fading | THE QUEEN, THE MIRROR, THE FLEET |
| `drawHandleRing`, `DIAL_RADII` | `handle-draw.ts` | the older handle: a ring with a gauge round it. **A pull no longer wears it** — see the knob | the grips that are not pulls |
| `drawHandleDial` | `handle-draw.ts` | the ring's gauge on its own, round a knob: how much of a pull is in | THE SINEW, THE BALLOON, THE LEDGER |
| `drawHandleRest`, `handleSag`, `handleRadius`, `fieldPoint` | `handle-draw.ts` | where a handle rests, the rope's sag, the size the rule clamps it at, a simulation point in pixels | every handle |
| `hitCircle`, `hitReach`, `HIT_REACH`, `HIT_FLOOR_PX` | `hit.ts` | how far past its edge a mark answers: half again, never under 48 px | every mark |

### Whose it is

| Piece | Shared | Says | Who |
|---|---|---|---|
| `drawMarkHalo`, `MARK_LIGHT`, `markLightAt` | `mark-feedback.ts` | *this is yours, now*: a faint red light breathing inside this seat's open mark, never past its ring; `markLightAt`, the same breath for a mark that is not a circle — a pull's track | every boss with verdicts |
| `lightWithin` | `part-light.ts` | *act on this part*: a part lit from inside its own contour, added over its drawing, its border left its own colour — faint for a mark, brighter and beating on `heartLight` for a part the cannon must hit | the halo, THE SEAM, THE FLUE, THE GOVERNOR |
| `drawLitCore`, `lightCore` | `lit-core.ts` | *shoot this part*: the step's colour lit inside the part the cannon must hit, beating on `heartLight` and brighter with its hurt, with the countdown as a plain ring round it; `lightCore`, the light alone, for a ring of its own shape | THE FLUE, THE GOVERNOR, THE CYST, THE OCULUS, THE TRIVET, THE VISE, THE TRAPEZE, THE CAPSTAN, THE DAVIT, THE GALL, THE GRINDSTONE, THE HALTER, THE PLUMB, THE RIME, THE SLING |
| `drawMarkTheirs` | `mark-feedback.ts` | *someone else is being waited on here*: a dim dashed ring turning round the partner's | the same |
| `drawMarkWait` | `mark-feedback.ts` | *not yours — wait*: a clock face whose hand goes round, in place of the gesture | the same |
| `drawMarkHeld`, `drawMarkProgress`, `MARK_PROGRESS_R` | `mark-progress.ts` | *this is right, keep it there*: a steady green ring on a part held where it is wanted; *how far the partner has got*: a green arc from twelve o'clock, or segments over a dim track of every one the part needs | THE CAPSTAN, THE KEEL, THE CYST, THE INSTAR |
| `drawHandleHint`, `handleIsMine`, `seatIsMine`, `HandleWords`, `PILOT_HANDLE`, `HINT_LOUD`, `HINT_SOFT`, `HintStyle` | `handle-word.ts` | the word under a handle: `PULL` on the seat it is for, `P1'S` on the other, gone once a hand lands; `seatIsMine`, whether a seat's handle is this screen's | THE WARDEN, THE LID, THE MAZE, THE CURTAIN, THE BALLOON, THE FLEET |

### Was it right

| Piece | Shared | Says | Who |
|---|---|---|---|
| `GripVerdicts`, `GripVerdict`, `VERDICT_SECONDS` | `grip-verdict.ts` | one verdict per mark, keyed on the mark: `mark(key, good)`, `at`, `update`, `clear` | every boss with a mark but `mark-feedback-roll-out.test.ts`'s `TO_COME` |
| `drawVerdictRing` | `grip-verdict.ts` | green for right, red for refused, washed over the mark and widening off it | the same |
| `drawMarkHeld`, `drawMarkProgress`, `MARK_PROGRESS_R` | `mark-progress.ts` | *this is right, keep it there*: a steady green ring round a part held where it is wanted, for as long as the thumb is; *the partner has got this far*: a green arc round a mark being worked, cut into a segment a count, over a dim track of all it needs, on both screens (the owner, 7 October 2026) | THE CAPSTAN, THE INSTAR, THE DAVIT, THE LAMPREY, THE HALTER |
| `watchMarks`, `marksDrawn`, `noteMark`, `marksOnStage`, `nearestMark`, `MarkSpot` | `mark-spots.ts` | where each mark and verdict was drawn this frame, in the canvas's own pixels — noted by `drawMarkHalo`, `drawMarkTheirs`, `drawPullKnob`, `drawGripRing` and `drawVerdictRing` — for the ring round a held mark to find it again | the renderer, once a frame |
| `ThumbAuras`, `auraTouch`, `auraRadius`, `Thumb`, `AURA_ONSET_SECONDS`, `AURA_LINGER_SECONDS` | `thumb-aura.ts` | *still going*, past the thumb that hides the mark: a ring centred on the mark a press a boss's drag answered came down on — held, or refused — from just outside it, quickly and then slowly wider, beating green, red when the mark is judged wrong (2 October 2026) | every boss, drawn by the renderer — no boss calls it |
| `drawAuraRing`, `AuraLook`, `FLASH_SECONDS` | `thumb-aura-ring.ts` | the ring itself: a crisp circle with a narrow glow either side | `thumb-aura.ts` |
| `BossHurt`, `hurtShake`, `drawHurt`, `JAB_SHAKE` | `boss-hurt.ts` | a landed sequence: the body shakes and glows red for half a second | every boss with a sequence |

### What gesture it wants

| Piece | Shared | Says | Who |
|---|---|---|---|
| `drawPullKnob`, `PULL_GRAB` | `pull-knob.ts` | **a pull**: the big circle to start, with the arrow of the way inside it; answered at `PULL_GRAB` times its radius | THE WARDEN, THE LID, THE STARE, THE CURTAIN, THE MAZE, THE GIMBAL, THE HASP, THE CLAW's crank, THE SINEW, THE BALLOON, THE FLEET, THE LEDGER |
| `drawMazeLever` | `maze-lever.ts` | **a turn**: the knob on an arm bolted to the rim of what it turns, in a `closed` channel round it filling green from the rest — THE MAZE's, the one turn for every wave (the owner, 5 October 2026) | THE MAZE, THE GIMBAL (`gimbal-knob.ts`), THE HASP (`hasp-knob.ts`; its green is the wind turned, not the place), THE CLAW's crank on the band (`crank-dial.ts`) |
| `drawPullArrow` | `pull-knob.ts` | the knob's arrow without the knob, for a pull whose mark is not a ring, on its owner's screen | THE ANTIPHON, THE CAIRN, THE PLUMB, THE VALVE, THE MANTLE, THE CAPSTAN, THE THROAT's pump |
| `drawPullTrack`, `PullTrack`, `PullTrackDraw`, `pullTrackPoint`, `pullWay`, `PULL_TRACK_W` | `pull-track.ts` | the way the pull can go: a thin channel filling green behind the hand, chevrons ahead; `closed` for a turn with no end | the same |
| `straightPullTrack`, `StraightPull`, `PullWay`, `PULL_UP`, `PULL_DOWN`, `pullRoom`, `fittingWay` | `pull-line.ts` | a pull measured as a distance, as a straight track that turns to follow the hand; how much field it has room for | THE WARDEN, THE LID, THE STARE, THE CURTAIN |
| `drawWayArrow` | `way-arrow.ts` | **a direction**: THE INSTAR's arrow turned any way; `heads: 2` for a pull that may go either way | THE INSTAR's rings, every knob |
| `drawShakeArrows` | `maze-shake-arrows.ts` | a shake: eight chevrons, any way, green once this seat's thumb is on | THE MAZE's heart |
| `drawInstarGlyph` | `instar-glyphs.ts` | the gesture inside a ring: an arrow for a pull, flaring dots for a tap, chevrons for a swipe, a hooked arc for a turn either way, two thumbs for a hold, the button face for a shield or a suck | THE INSTAR, THE WARDEN's swipe |
| `drawInstarTrack`, `instarTrack`, `drawInstarSwipe`, `drawInstarTrackWindow`, `drawInstarTrackHalo`, `drawInstarTrackTheirs` | `instar-track.ts` | **a swipe**: a bar from where the thumb goes down to the length the lift counts at, filling as the carry goes, with the ring's window, halo and partner's ring in the bar's own shape | THE INSTAR |
| `drawCrankDial` | `crank-dial.ts` | a turn of the crank | the band |

### Where the shot goes, and the button to press

| Piece | Shared | Says | Who |
|---|---|---|---|
| `drawInstarCrosshair`, `CROSSHAIR_LOOK` | `instar-crosshair.ts` | **a shot**: a ring with four ticks in and nothing across the part, in the bolt's colour on THE INSTAR, violet when either takes it; red on every cue's aim (the owner, 3 October 2026) | THE INSTAR, every cue's aim |
| `cueHelper`, `CueHelper`, `cueAim`, `cueDrawnAt`, `markIsHere`, `drawCueHelper`, `AIM_LOOK`, `cueBoxed` | `cue-helper.ts` | a cue's picture: the red crosshair on `BossCue.aim` for `FIRE` and `SHOOT` (laid by `AIM_LOOK`, which VERSUS's `aim:cannon` swaps for one in the cannon's colour; `cueBoxed` leaves the scanner box off where a look draws its own frame), with the word and its scanner box moved off the cannon onto it (`cueDrawnAt`, the owner, 3 October 2026), the panel's face in the scanner box for `SHIELD` and `SUCK`, a red circle with a thumbprint and no box for `HOLD` (`hold-mark.ts`), a red line with an arrow sliding in from each side and no box for `RUB` (`rub-mark.ts`) — drawn for every boss by `boss-cue-draw.ts`, so no boss draws its own | every boss with a cue; `cue-aim.test.ts` fails a shot at the hull that aims at nothing |
| `drawHoldMark`, `drawThumbprint`, `HOLD_MARK_R` | `hold-mark.ts` | a hold's mark: a red circle breathing, a thumbprint in it, in place of the scan box (the owner, 2 October 2026) | every `HOLD` cue, through `cue-helper.ts` |
| `drawRubMark`, `rubArrows` | `rub-mark.ts` | a rub's mark: a red line as long as `BossCue.rubHalf`, and an arrow sliding in at it from the left and the right, in place of the scan box (the owner, 3 October 2026) | every `RUB` cue — THE GRINDSTONE, THE CAPSTAN, THE VALVE — through `cue-helper.ts` |
| `emblem` | `action-face.ts` | the band's button faces — the ward, the throat, the hand — at any size | the band, THE MIRROR's sequence, the cue helper, THE INSTAR, THE THROAT's mouth in SHIELD and SUCK |
| `drawPullCircle`, `drawModeFace`, `throatHue` | `throat-hue.ts` | **how far a pull reaches**: a faint ring round the thing pulling, as wide as the simulation pulls, in the colour it is set to; gone while nothing pulls | THE THROAT |
| `drawTargetLock`, `drawRadarLock` | `target-lock.ts` | *an instrument has picked this out and cannot tell you the rest*: four corner brackets, a sweep, a flicker | the cue's scan frame, the lure, the dart, the veil, THE QUEEN's marks and more |

### The words

| Piece | Shared | Says | Who |
|---|---|---|---|
| `BossCue`, `CueKind`, `cueSeen`, `saysKind` | `boss-cue-shape.ts` | one thing to do, where, for which seat, and its kind line — `PRESS`, `HOLD`, `TURN`, `STILL`, `CALL`; never `CARRY` | every boss's cue reading |
| `bossCues`, `bossCue` | `boss-cue.ts` | the cues, read off `World` | every boss with a cue |
| `cueFrame`, `CUE_FRAME`, `CUE_FRAME_WIDE`, `markAt`, `cueAimAt` | `boss-cue-frame.ts` | how far a cue's frame reaches — THE CHOIR's, or the wider one from THE GIMBAL on — and a cue at a point in it; `cueAimAt` is the crosshair's circle on something small falling, a bead, a bolt, a spark, where no halo stands | every cue reading, and THE PLUMB's marks; `copies-table.ts` holds the sizes; `cueAimAt` from THE GIMBAL, THE HASP, THE RATCHET, THE MANTLE, THE KEEL |
| `drawCueText`, `cueWordY`, `WORD_FONT` | `boss-cue-text.ts` | the verb under the mark and the kind over it, in THE CHOIR's courier, rock grey | every cue, and THE SINEW, THE SURGE, THE ANTIPHON which build their own `BossCue` |
| `drawInstarWord` | `instar-word.ts` | the scanner box beside a mark: the verb bright on the seat it wants, the owner's name dim on the other | THE INSTAR, THE FILAMENT, THE STARE |

### How long is left, and how still

| Piece | Shared | Says | Who |
|---|---|---|---|
| `drawFuse`, `drawFuseLine`, `fuseColours` | `slow-fuse.ts` | THE SLOW's window: a fuse along the top burning in to the middle, orange from half, red for the last two beats; grey on a step answered by sending nothing (`"hold"`) | every choreographed step |
| `drawInstarWindow`, `drawInstarDone`, `instarTogetherLeft`, `instarAwaited` | `instar-together.ts` | a ring closing in on a mark, and a done mark still counting for its partner | THE INSTAR |
| `slowHush`, `SlowSpan`, `NO_SPAN`, `HUSHED` | `slow-hush.ts` | a boss's own sway dies down while a mark asks | every boss with a sway under its marks |
| `phaseInto` | `phase-into.ts` | how far into its phase a boss is, in beats | every choreographed pose |

### The blow

| Piece | Shared | Says | Who |
|---|---|---|---|
| `strikeLook`, `lash`, `StrikeLook`, `StrikeFrame` | `boss-strike-look.ts` | a missed window: the boss's own blow on the hull, or the default lash | every boss that strikes |
| `stepColour` | `step-colour.ts` | a step's cannon colour, or the hull's rim for either | THE SEAM, THE OCULUS, THE VISE, THE CYST, THE SLING, THE DAVIT and more |
| `coreHurt` | `core-hurt.ts` | a core a little smaller and brighter for every hit | THE VISE, THE RIME, THE PLUMB |

## Still to be made one

The pieces some bosses call and others still draw for themselves. Each is a
`docs/queue.md` item, and a lane that finishes one updates **Who** above:

- **Thirteen bosses' verdicts** — *Every other boss with a mark answers a touch
  the way THE INSTAR does*, held by `render/test/mark-feedback-roll-out.test.ts`.
