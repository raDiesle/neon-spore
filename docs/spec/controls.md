# Controls

> **Status: both kinds are built. This page is the first time either has been
> written down in one place.** The panel below the field has had a name, a
> data table (`packages/content/src/controls.ts`) and a director page since
> `CONTROL_SETS` was written. Everything touched **on the field itself** had
> none of that — no name, no list, no page — until this section, asked for by
> the owner in the same message that settled THE WARDEN's pull:
>
> > behalte die aktuelle alte Mechanik nur halten in "not done yet" irgendwo
> > fest. vielleicht ein neuer Tab in control panels (wir benennen in in
> > "controls" um. dann können wir auch alternative in screen controls hier
> > dokumentieren und ggf testen.
> >
> > wichtig, dass alle in screen controllen (nicht control panels unten im
> > screen) auch in der game mechanics Seite dokumentiert werden
>
> *Keep the current old mechanic — hold only — recorded somewhere in "not done
> yet". Perhaps a new tab in control panels, which we rename to "controls".
> Then we can document alternative in-screen controls there too, and test
> them if need be. Important: every in-screen control (not the control panels
> at the bottom of the screen) must also be documented on the game mechanics
> page.*

## Two kinds of control

**Panel controls** are the strip and lobes below the field — SHIELD, SUCK,
the two colours. The colours are the only ones that do two things: tapped they
fire, held they fill the cannon lobe and a lance goes at the top of the fill
([couplings](couplings.md) 2). A wave names exactly one `ControlSet`
(`packages/content/src/control-sets.ts`) and that set decides the whole
panel, never a combination of two. Every control on it is a `ControlDef`
(`packages/content/src/controls.ts`): a label, whose half of the band it
sits in, and one line saying what it does. The director's CONTROLS tab
(`▣ GAME MECHANICS → CONTROLS → PANELS`, built by
`tools/director/src/controlsets-page.ts`) reads that table and the wave list
it drives — a hand does not retype a set here, it draws the real band and
lists the real controls.

**The standard panel arrives a button at a time.** Handing a pair all six on
the first wave is what the game used to do, and it taught nothing: STANDARD 1
through 4 are the same panel with buttons held back — red alone, then cyan,
then the trigger, then the plate that trigger fires — and the fifth rung is
STANDARD itself, with the maw. They are whole named sets like any other and a
wave still names exactly one; what a rung adds is `ControlSet.reduces`, which
says which panel it is a *picture of*. That is not composition and it is not
an addition to `Wave`: it is what makes the buttons a rung does carry stand on
the pixel they will keep for the rest of the game, because `bandLobes` lays
the slots out against the reduced panel and simply leaves the held-back ones
empty. A pair must never learn an arrangement that moves under them when a
button arrives.

**The first wave played on a panel has to introduce it.** A guide teaches the
first wave to carry a creature, a pod, a boss or a mechanic; a panel is as new
as any of them the first time it is held, and on the ladder what arrives is a
button nothing on the field announces. `firstOnPanel` is the question,
`packages/content/test/waves.test.ts` is what makes it a failure rather than
an intention, and the director's rail marks such a wave with `⎈` beside the
`✎` its guide earns it.

**In-screen controls** are everything touched *on the field itself*: grabbed,
held or pressed directly against a creature, a rope, or the whole screen.
None of them is a `ControlDef` — a wave does not pick a grip or a tether the
way it picks a panel, so `packages/content` has no vocabulary for them and
should not grow one. They follow from what a wave *contains* (something
falling, a maze, a warden), not from a panel it names. Before this entry
there was no list of them anywhere; the only way to find out what existed was
to read `packages/render/src/touch.ts` start to finish, which is exactly what
this page and `tools/director/src/field-controls-page.ts` now do the reading
for.

## Where the in-screen list comes from, and where it does not

`packages/render/src/touch.ts` is the truth for every control below but the
last — it is a decision procedure (`touchDown`, `touchMove`, `touchUp`, and
`handleUnder` in `handles.ts` and `shipUnder` in `touch-ship.ts` next door),
not a data table like
`CONTROL_SETS`, so nothing can iterate it the way `controlsets-page.ts`
iterates panels. What the director's `field-controls-page.ts` does instead:
each entry names the exact function in `touch.ts` that answers it, and
`tools/director/test/on-field-controls.test.ts` carries an exhaustive switch
over `Hold["kind"]` and `DragTarget` — the two union types those functions
return. Adding a new kind to either union without teaching that switch about
it fails to **compile**, which `bun run check`'s typecheck catches before the
page can go stale silently. That is as close to derived as a decision
procedure allows; it is not the same guarantee `CONTROL_SETS` gets, and this
page says so rather than implying otherwise.

**The last one is not in `touch.ts` at all, on purpose.** The guide's
whole-screen hold — the same press that fills the ready gate's two circles —
is answered by `apps/game/src/briefing.ts`'s `bindBriefing`, a second
listener on the same canvas. Its own comment says why: *"the press underneath
is not a control press, and the simulation refuses everything but this while
the wave is held, so whatever `bindControls` makes of the same touch is
dropped before it reaches the ship."* No `Hold` variant exists for it, so the
exhaustiveness guard above cannot see it — this entry is honest, not
mechanical, and stays right only because someone read `briefing.ts` and wrote
it down. If that file changes shape, this paragraph is the one a reviewer has
to notice by hand.

## The in-screen controls, as of this entry

| Control | Where | Seat | Gesture | Does |
|---|---|---|---|---|
| GRIP | on the field, over anything currently falling | either seat | hold | Slows the fall for as long as the finger stays down; letting it through costs the hull (`sim/grip.ts`). |
| THE PUSH | the same hold, carried sideways | either seat | grab and drag | Carry the finger a tile across and the held body steps one column that way, then stands still for `gripPushPauseBeats` before it may be carried again. Two hands pulling opposite ways cancel and the body holds ([assists](assists.md#65-the-push--the-same-hand-carried-sideways-built)). |
| THE LOCK | the same hold, on player 1's screen | player 1 only | hold | The same gesture read a second way: while the hand is on a body every shot steers into it, from whatever column the cannon is in — up its own column, then level and across. Not over a rock or a ghost, and it says nothing about the colour ([assists](assists.md#66-the-lock--the-same-hand-read-a-second-way-built)). |
| THE CANNON | on the cannon swelling itself, wherever it is standing | player 1 only | grab and drag | Slides the cannon along the hull, the same absolute column the strip sends. |
| THE MAW TAP | on the same cannon swelling, on player 1's screen | player 1 only | press | Let go without having carried the cannon anywhere and the maw opens, the same window the SUCK lobe opens; carry it a column and the lift says nothing. Only on a panel that has a maw. |
| THE SHIELD PLATE | on the shield swelling itself, wherever it is standing | player 2 only | grab and drag | Slides the shield along the hull, the same absolute column the strip sends. |
| THE SHIELD TRIGGER | on the same shield swelling, on player 1's screen | player 1 only | press | Opens the guard window where the plate is standing, and does not move it. |
| THE MUZZLE SWIPE | on the cannon swelling, on player 2's screen | player 2 only | grab and drag | Carry the muzzle left for red or right for cyan and let go; a hand that comes back to the middle fires nothing. |
| THE MAZE'S STRING | the drum's resting circle, only while the wheel is being read | player 1 only | grab and drag | Turns the wheel by how far the hand has come from where it grabbed. |
| THE WARDEN'S TETHER | the tether's resting circle, while one hangs from the rim | player 1 only | grab and drag | Pulls the line taut; held taut long enough it opens a hatch. |
| THE LID'S CORD | the cord's resting circle, under every armoured eye on the field | player 1 only | grab and drag | Parts the plates over the lens in proportion to the pull, and only while they stand fully apart does a shot land; letting go shuts them. The one drag target that is a creature, so the command names which body by id. |
| THE CHOIR'S LEFT ARROW | against the left wall of the field, while a membrane is up | player 1 only | grab and drag | Carried outward it opens a two-beat window and the whole screen starts shaking; carried inward it is wrong, and the thing sings — the hull pays for the chord. Drawn always rather than behind a check, because no browser can be asked reliably whether a shake is available. |
| THE CHOIR'S RIGHT ARROW | against the right wall of the field, while a membrane is up | player 1 only | grab and drag | The same control at the other wall, and the second half of one gesture: carried outward inside the window the first one opened, the dots draw together into a slick or a bulb. Two pulls on the same side is one gesture done twice and opens nothing. |
| THE BALLOON'S LEFT HANDLE | hanging off the left of every balloon on the field, on both screens | player 1 only | grab and drag | Carried leftward past `balloonTautMilli` — two tiles — it holds this side of the skin taut and the body visibly gives on it. On its own that is all it does: the skin only lets go once **both** handles have been taut on the same body together for `balloonHoldBeats`, and a hand that slackens inside the hold gives it back. Carried inward it counts as nothing. |
| THE BALLOON'S RIGHT HANDLE | hanging off the right of every balloon on the field, on both screens | player 2 only | grab and drag | The same control at the other side and the other half of one gesture. The first time the skin gives the balloon splits into two smaller ones that part — one climbs on, one sinks and bursts on the ship for the top's price; the second pops them for nothing. Both handles are drawn on both screens so each seat can see the other's hand arrive, but only your own answers your thumb. |
| THE GUIDE'S HOLD | anywhere on screen, while a guide or the ready gate is up | both, independently | hold | Fills this seat's ready circle; the wave starts once both are full. Letting go before it is full empties it. |

The director's `▣ GAME MECHANICS → CONTROLS → ON THE FIELD` tab draws the same
rows from `tools/director/src/field-controls-page.ts`'s `FIELD_CONTROLS`
array — this table is that array in prose, kept beside it rather than typed
from memory a second time.

## The ship as a control

The five ship rows above are the newest of these and the only ones that reach
a control the band *already has*, so they are worth being explicit about.

**Nothing was replaced.** Both strips and every lobe stay exactly where they
were, and every wave is still playable with the band alone. This is a second
way to reach two controls, for a hand that is already up on the field.

**The split is untouched.** Player 1 carries the cannon and the trigger,
player 2 carries the shield and both colours — the same halves the band deals
out. Pressing the plate as player 1 fires it and does not move it; taking hold
of it as player 2 moves it and does not fire it.

**The muzzle swipe is the one new gesture**, and it is the answer to the
question the owner asked with the request: the navigator has no cannon to
slide, so what should the muzzle do under their thumb? It loads. They already
hold both colours and the shot always leaves up whichever column player 1 is
standing in, so the muzzle is the one thing on the ship that is theirs to act
on. Left is red and right is cyan because that is the order the two lobes
stand in on their own band. The press says nothing; the **lift** fires, and
only past a threshold of six tenths of a tile — which is what lets a hand
change its mind on the way back to the middle.

**The cannon is two gestures on one swelling**, and the lift is what tells
them apart: carry it and it slides, let go without having carried it anywhere
and the maw opens. That is the owner's own answer to the maw having no way onto
the field — the press sends the same `cannonCol` either way, so the gesture
costs the slide nothing. It is offered only on a panel that carries a maw at
all: a wave on a panel without one hands back a hold with no origin on it, so
no lift of it can open an opening that is not there.

**Nothing in the game teaches any of this**, and that is a decision rather than
a gap. SHIELD, THEN CANNON carried a five-page rehearsal of these gestures
until 5 September 2026, on a wave that introduced nothing of its own and only
held the film because the standard ladder happened to end there. The owner's
call was that a pair finds a thumb already up on the field without being told,
and that teaching a discoverable thing is padding — so the film went, the maw
moved to SALVAGE where the pod asks for it, and this section is now the only
place the five gestures are written down. Anything added to `touch-ship.ts`
belongs in the table above, because there is no longer a screen in the game
that would show it.

**Only the ship's own controls get the ring.** A hand on either swelling grows
a bracket round it — brighter once the finger is down, and on the muzzle a red
mark to its left and a cyan one to its right, the one a lift would fire going
bright. A thumb on a strip gets none of it, because a strip is already sitting
under the thing it is moving. `render/ship-hand.ts` draws it; a mouse gets the
same bracket on hover, which is the desktop's half of knowing what a press
would take hold of before pressing.

**The `test` view is player 1's.** One screen showing both bands still signs a
finger on the field as player 1 (`apps/game/src/main.ts`), so the two gestures
that are player 2's are reached there by switching the view, or by the band,
which has all of them.

## Tried and set aside

`▣ GAME MECHANICS → CONTROLS → TRIED AND SET ASIDE` names in-screen controls
the game was played with and moved away from, kept because the owner asked
for it rather than deleted. The full write-up for each stays with the boss
or wave it belongs to, so this page and that section cannot drift apart by
each saying a different thing about the same idea — the director tab and
this section both name it and stop.

- **HOLD-TO-TEAR** — [bosses.md 11.4](bosses.md), *"Hold-to-tear — a window
  closed by succeeding rather than by giving up."* THE WARDEN's tether
  before the pull replaced it: hold, and only hold, accumulating ticks toward
  a tear rather than answering a drag. Implemented and working, not merely
  designed. The owner asked for it kept and *possibly tested* — "ggf
  testen" — on another wave or boss.

**On testing it**: this entry was asked not to build a testing mechanism, so
none exists yet. `tools/versus/` (`docs/versus.md`) already plays two live
renderers against one stepped world and lets the owner vote between them on
two phones — the machinery that would be needed to *play* hold-to-tear
against the shipped pull is close to what versus already does, but versus
compares two **drawings** of the same input, not two different **input
handlers** wired to the same boss. Reaching that would mean teaching versus a
second control scheme per candidate, which is new machinery versus does not
have today — worth a look if this is ever picked up, not something this entry
built.

## Where this shows in the director, and why it is one page

CONTROL SETS is already a tab of the shell
titled GAME MECHANICS rather than a sheet of its own. The owner's *"wichtig,
dass alle in screen controllen ... auch in der game mechanics Seite
dokumentiert werden"* was written before that fold; now that the tab lives
inside the very shell named GAME MECHANICS, building the in-screen list once,
in this tab, is what satisfies it — a second copy on the sibling STATES tab
would be the drift this whole entry exists to prevent, not a second reader.
Renamed CONTROL SETS → CONTROLS, and it now holds three inner tabs: PANELS
(unchanged), ON THE FIELD, and TRIED AND SET ASIDE.

## THE CLAW — the gun replaced by a hand

> The one where the gun is a hand, and the hand cannot see what it is reaching
> for.

A **control set**, not a boss and not a round: the field under it is the
ordinary field, with the same grid, the same hull and the same rocks coming
down it. Everything that is different is on the panel and in what one of the
two screens is allowed to draw.

**Player 1's swelling is an arm.** It slides on the same strip and stands in
the same `world.cannonCol` the cannon always did — that is why the strip needs
no new control and why "column four" means what it has always meant. `REACH`
sends it up the column it is standing in, and it closes on the first thing it
meets. Nothing recalls it: the press is committed, and at `reachTilesPerBeat`
the climb alone is about a second and a half, so the sentence that sends it has
to be finished before it leaves (`packages/sim/src/reach.ts`).

**And it does not come back on its own — it is wound back.** `WIND` is the
fourth button on the panel and the one control in the game that is *turned*: a
finger going round and round inside it brings the rope in, `windTilesPerTurn`
of it a turn, and the arm hangs exactly where it stopped for as long as nobody
does (`packages/sim/src/crank.ts`). So a press costs work rather than a wait,
and the strip is dead the whole time it is out — player 1 is winding while
player 2 reads the field to him.

What a hand on the crank says is its **bearing**, in thousandths of a turn
clockwise from the top, and the simulation turns the step between two bearings
into rope. It is absolute the way a column is: the next one supersedes the
last, so a message lost on a bad line costs nothing. A rig with no finger (the
desk keyboard, a rehearsal, a frame test) turns it at `windPerTickMilli`, which
is the speed the arm used to come home at by itself; at a desk the crank's key
alone winds in and shift with it turns the other way.

**And it turns both ways.** Clockwise winds the rope in; anticlockwise pays it
out and the arm goes back **up**, at whatever rate the thumb turns, closing on
whatever it meets exactly as the press's own climb does. So the arm can be
walked off the hull by hand with no press at all — slower than a press by
three, and stoppable — and a pod that crossed the column while it hung there is
reachable by turning the other way. Two limits: an arm carrying a pod may only
be wound *in*, so a catch is as committed as a press, and a finger on the crank
does nothing at all while the arm is still climbing under its own power.

**The mouth moves to player 2.** `SUCK` is on her half instead of his, so a
power-up the arm brings down to the hull is caught only if she is open when it
lands. That is the same `resolveIntake` every pod in this game has always gone
through — the catch is two hands here for exactly the reason it is two hands in
SALVAGE, and none of the machinery is new.

**A rock is answered by reaching into it.** There is no trigger and no dome on
this panel, so the arm is the only answer to a body, and it is a real one: what
it closes on is dropped, and comes down at the torch's speed to cost the hull
whatever the body itself costs. That is why `groupsCoveredBy` counts `reach` as
covering the `guard` group — the group asks *can this panel answer a rock at
all*, and this one can, worse than a dome and on purpose.

**The power-ups cross the field.** `PodEntry.cross` sends one along its row
instead of leaving it hanging, at `speed` tiles a beat, entering at the column
it is painted in and leaving at the far side. So a power-up is a *window*
rather than a place, and it is at a different column by the time the arm gets
up there — which is why the pair has to talk about where it will be rather
than where it is.

**Both seats see everything here.** A per-pod "which seat is shown this" field
was built and then cut, on the owner's word: he had asked for it, looked at it,
and did not want it. The split on this panel is in the *hands* rather than in
the eyes — he can bring a thing down and cannot take it in, she can take it in
and cannot reach for anything — and that is enough coupling for one wave.
