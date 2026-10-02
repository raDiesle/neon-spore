# What the owner has said goes for every boss

The half of `owner.md` that is not about one boss — cut out of it when it
passed the size line (`packages/sim/test/limits.test.ts`). Add a line here
the same way: dated, in his words where he gave them.

**A line marked *generic* is his rule for every boss and every mechanic,
not the one he said it about** (24 September 2026: *all what i say generic
should go into some instruction … that later on we can apply our best
practices to existing bosses or create new*). A new boss is built to it from
the start; a boss that already ships and breaks one is a `docs/queue.md`
item naming the rule, never a fix made in passing.

- **A choreographed window is long and its need is not small** (22 September
  2026, generic, in his words *"double the time what players have time to do
  the action, and let it require some more clicks"*). A scene's window is
  what the pair talk in, and most of it goes on finding out whose mark is
  whose; a window they never reach the end of taught them nothing. So a step
  is authored with a window around twenty beats rather than ten — and the
  need raised with it, because a long window with a small need is a step that
  lands itself and the drama goes out of it. Both halves, never one.
  THE INSTAR's own script is the worked example (`content/instar-script.ts`).
  Every other boss's figure, doubled or left alone and why:
  `docs/spec/choreographed-windows.md`.
- **A step's window is exactly THE SLOW** (22 September 2026, generic, in
  his words *"slow effect must take place in the moment any action on the
  game screen is required and when succeeded or failed the action step, it
  immediately stops the slow effect"*). So a scene calls `openSlow(world,
  step.windowBeats)` on the tick the marks come up and `closeSlow(world)` on
  the tick the step is answered or missed — never on the landing, which is a
  beat already won. The slow is *time to talk in*, and the only moment the
  pair need it is while they are working out whose mark is whose. A death or
  a fall, which asks for nothing, keeps its own plain window
  (`decisions.md` #33, `sim/slow.ts`). **No bar under the boss** — the
  owner took it out on 24 September 2026 (*it was a stupid idea*) — but on
  the 25th he asked for *some progress indicator* back, *remaining time left
  to take damage when not succeeding*: a **fuse along the top of the screen**
  burns in to the middle, orange from half the window and red for the last
  two beats (`render/slow-fuse.ts`); he kept it over three VERSUS answers the
  same day, and asked for it bigger and clear of the top edge. **A step
  answered by sending nothing opens its window as a `"hold"`** and its fuse
  burns grey, never orange or red (1 October 2026, on THE SEAM's false point:
  *the timing indicator runs. why? what i have to do?*). **The slow's light runs from the top of the screen**,
  never from an edge the player cannot see (24 September).
- **No `CARRY` on the glass**, generic, 24 September 2026: *why we need the
  keyword of "Carry"? … "Pull up" its clear he has to take action.* A verb
  that is a motion — `PULL UP`, `SWIPE`, `MOVE` — draws alone; the kind line
  stays only where it adds something (`PRESS`, `HOLD`, `STILL`). One rule,
  `saysKind` in `render/src/boss-cue-shape.ts`, and both hands call it.
- **A landed sequence shows the blow**, generic, 24 September 2026: *when
  player succeeded a sequence, it should have some visual that enemy took
  damage e.g. its shaking for a moment and body glows red for a moment.* A
  boss's fx holds one `BossHurt` (`render/src/boss-hurt.ts`), hits it on the
  event that means a sequence landed — never on one mark alone — shifts the
  body by `shakeX` and lays `drawHurt` over its plates. Half a second.
- **The order is said by the marks, never by a line**, generic, 24
  September 2026 — he took *either order* off the glass over the cannon.
  Two marks up at once are the pose saying *either order*; an order that
  matters shows one seat's mark first and the other's after it is answered.
  No sentence for the step as a whole (`render/test/pair-order.test.ts`).
- **Every control answers wider than it is drawn**, generic, 24 September
  2026: *the area should be bigger than visible so players can touch it*.
  Half again the radius drawn, never under a 48px target; one number for the
  game, `HIT_REACH` in `render/src/hit.ts`, and every ring, lobe, handle and
  mark is found through `hitCircle`. Where two reaches overlap, the nearest
  centre wins.
- **Feedback on every touch, generic, 24 September 2026**, in his words
  *"there should be always in general some visual if player did correct or
  not, immediately, e.g. green or red colour of the circle he touched with
  animation."* Four parts, for every boss and every mechanic with a mark:
  1. **The action wanted right now is the brightest thing on the screen**
     — more glow, more highlighting, on the mark itself.
  2. **The other seat's turn shows too, and where**: this seat can see that
     the partner is the one being waited on, and at which mark. **The
     partner's mark never shows the gesture** (the same day, a second
     time: *not clear enough that other player has not to touch it*): a
     gesture on a mark reads as *your next move*, so the partner's wears a
     waiting clock whose hand goes round, and its box names whose it is —
     `drawMarkWait` in `render/src/mark-feedback.ts`.
  3. **A touch is judged on the mark it touched, at once**: green for right,
     red for wrong, animated, and never a sound or a burst somewhere else.
  4. **A gesture started the right way says so while it is still going** —
     a drag begun in the right direction shows it is on its way to done,
     before it lands. A swipe fills its ring continuously as the thumb
     travels toward the length that counts (the same day, a second time:
     *direct feedback while swiping down correctly*), and the fill is the
     simulation's word (`instarSwipeAlong`), never the drawer's guess.
     **A swipe is drawn as a track, not a ring** (the same message): the bar
     path of a slider without its knob, from where the thumb goes to the
     length the lift counts at, so the end of the bar is the end of the swipe
     (`render/src/instar-track.ts`).
     **A handle you pull is drawn as the path it can be pulled**, generic,
     25 September 2026 — *change the circle to look like the path it can be
     pulled*, THE MAZE's and THE WARDEN's alike, and green: a channel the
     whole of the travel that fills green behind the hand, never a ring
     with a dial round it (`render/src/pull-track.ts`). A pull that turns
     something follows the thing it turns — THE MAZE's runs round the
     drum's rim, from a lever clamped to it, so the wheel turning is the
     plain consequence of the hand.
     **Refined the same morning, generic** — *make the pull direction helper
     more decent, smaller, but the circle to start must stay bigger, so it is
     clear to start there*, and *the area of starting the pull must be much
     bigger than the visual … as it's also moving*. So every pull handle is
     three things, and all three are shared, never redrawn per boss:
     1. **a thin, quiet channel** — `drawPullTrack`, half-width
        `PULL_TRACK_W` of the knob's radius (`render/src/pull-track.ts`);
     2. **a big, loud circle to start** at the handle's full radius,
        breathing until taken, lit while held — `drawPullKnob`
        (`render/src/pull-knob.ts`), drawn last, over channel and rope;
     3. **a press answered far outside it** — the knob's radius times
        `PULL_GRAB`, then `hitCircle`'s own half again: about three times the
        circle drawn. A handle that moves gets this, never the bare
        `HIT_REACH`.
     **A turn with no end has a channel with no end**: THE MAZE's wheel turns
     a full circle and more, so its channel is the whole ring round the drum
     (`closed: true`), hard against the rim with no gap, and the green wraps
     lap after lap. Never an arc of it.
     **A gesture's direction is the picture's**: what the thumb does, the
     part does — a swipe down takes an egg off THE INSTAR's clutch and it
     falls straight down to the hull (`render/src/instar-eggs.ts`), one egg
     per swipe the mark needs.
  THE INSTAR is the worked example he asked for before the rest
  (`render/grip-verdict.ts`); the roll-out is `docs/queue.md`'s.
- ***Generic*: a timeout hit is the boss's own blow**, 26 September 2026:
  *whenever a boss damages the ship because time is over, there should be a
  graphics animation related to boss damaging it, not just a dumb meteor
  falling down.* A boss that runs a window out calls `bossStrikesHull` and
  draws the blow as the threat carried out; a rock that was never in the
  picture is never the hit (`bosses.md`, *A timeout hit is the boss's own
  blow*).
- **The same touch feedback on every boss**, 27 September 2026: *ultimately i
  want the consistent visual across all waves … make sure that extending boss
  waves or adding new will follow the same conventions.* THE INSTAR's four
  parts — halo on this seat's mark, turning ring on the partner's, green or
  red flash, progress arc — are reusable pieces (`grip-verdict.ts`,
  `mark-feedback.ts`), and a boss with a mark or handle uses them rather
  than drawing its own. How: `new-boss` §5; what goes red without them:
  `render/test/mark-feedback-roll-out.test.ts`.
- **A thumb on a mark wears a ring past it**, generic, 2 October 2026: *you
  cannot see the progress circle with its colour because your thumb is below
  … some feedback, maybe around the circle like a green blur beat … if
  interrupted or wrong gesture done on the circle to be red … it grows bigger
  and bigger first quick and then very slow.* The renderer draws it round
  this phone's own finger for every press a boss's drag answers — held or
  refused — and borrows the mark's own verdict for red and green
  (`render/thumb-aura.ts`). **No boss calls it**: a mark is found by its
  `drag` and its verdict by `drawVerdictRing`, so a boss that already uses
  both has the ring, and a new one gets it for nothing.
- **Every mark shows its gesture: a pull its way, a shot its target, a
  shield or a suck its button**, 29 September 2026, for all bosses: *we use
  always the visualization we have of the direction, not just rounded red
  circle (e.g. in "the warden") which looks like a slider … shooting with
  cannon should have clear aim target (check "the instar") … and also good to
  have a specific helper symbol scanner box for shield and suck.* A pull mark
  that is only a circle is not allowed. The pieces: `way-arrow.ts` inside
  `pull-knob.ts`, and `cue-helper.ts` under every `BossCue`.
- **The standard set wears no helper; a gesture of its own wears them all**,
  generic, 29 September 2026: *regular enemies players learn how to approach
  them by standard control set and do not need repeating help guidance on
  them as it doesnt introduce something new … pulling enemies such as meteors
  to move or slow them, does not require a visual as well, as its common
  across many waves and enemies — so once told in guide, players know it.* A
  helper — arrow, crosshair, face, word — is for a gesture that is new, or
  crucial to defeating that one enemy or boss. Which is which, and every
  piece to choose from: `docs/controls-catalogue.md`. **The one exception is
  THE PUSH's arrows**, the same day: *keep visual as it is for “the push” of enemies one tile to left or right … it only appears when one of the players clicks/touches it, so this makes it exception*.
- **No boss touches the top of the screen**, generic, 29 September 2026, on
  THE STARE: *any boss should not touch top of game screen*. The phone's bar
  and the seat switcher stand there, and a body under them is half read.
  Hang it inside the field or clear of the switcher; THE STARE's eye sits
  `EYE_DROP` tiles under row 0's top (`stare-shape.ts`). A new boss is held
  to it by `packages/render/test/boss-top.test.ts`, which lists the three
  exemptions and why.
- **A part the cannon must hit is lit, open to it, and stops the bolt**,
  generic, 1 October 2026, on THE SEAM *but also all other bosses*. Three
  things, all of them. **Lit:** the part is drawn in the colour that hits it,
  and it *beats like vulnerable hearth*. That means `lubDub` in
  `render/heartbeat.ts`, never a cosine of its own. **Lit from inside, and
  nowhere else** — generic, 2 October 2026: *only let the part of body shape
  glow red, but not so heavy and no glowing outside. and the borders should
  not be red … only when player needs to shoot a specific part of body it can
  glow and pulse some more. the graphics around red light or below should
  still be good visible.* The light is `lightWithin` (`render/part-light.ts`):
  a fill of the part's own contour, added over its drawing, no halo, no glow
  passes, no swell past its edge, and its border stroked in the colour it has
  unlit. An asked mark is faint (`MARK_LIGHT`, `drawMarkHalo`); a part the
  cannon must hit is brighter and beats (`heartLight`); a core lit for its
  step, with its countdown ring, is one call to `drawLitCore`
  (`render/lit-core.ts`). **Open:** a clear path
  from the cannon to it, with no other boss graphics in between *in non colour
  to shoot*. **Stopped:** the bolt is drawn no further than the first thing it
  meets. On the right part it bursts and is gone. On a wrong part, or the
  shell, it scuffs with grey grit and does nothing to the boss. The boss's
  drawer passes a `Stopper` to `effects.bolts.aim` each frame. It reads the
  simulation's own verdict (`seamVerdict`) and never re-derives it. THE SEAM
  is the worked example (`render/seam-stop.ts`). **A core over the middle
  column is the short case:** the shot asks `coreVerdict`
  (`sim/core-verdict.ts`), the stopper is `coreStopper` with the core's near
  rim and the body's `Foot` (`render/core-stop.ts`), and the lit face is
  `lightWithin` at `heartLight`. THE FLUE and THE GOVERNOR are the examples, and
  `render/test/core-stop.test.ts` takes one row a boss.
- **What a mistake costs is decided boss by boss**, not here. The owner, 2
  October 2026, made a miss fail THE GAUGE's wave — *a miss makes the boss
  wave fail and requires retry* — and, shown that 48 other bosses answer some
  mistake otherwise: *i will do every boss separately and individual*. So a
  boss's mistakes are its own spec's, and what each costs today is in
  `docs/miss-rule-audit.md`; no lane changes one unasked.
