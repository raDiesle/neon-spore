# Controls

> **Status: both kinds are built. This page is the first time either has been
> written down in one place.** The panel below the field has had a name, a
> data table (`packages/content/src/controls.ts`) and a director page since
> `CONTROL_SETS` was written. Everything touched **on the field itself** had
> none of that — no name, no list, no page — until this entry
> (`docs/queue.md`'s `claude/burn-controls-page`), asked for by the owner in
> the same message that settled THE WARDEN's pull:
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
the lance, the guard, the two colours. A wave names exactly one `ControlSet`
(`packages/content/src/control-sets.ts`) and that set decides the whole
panel, never a combination of two. Every control on it is a `ControlDef`
(`packages/content/src/controls.ts`): a label, whose half of the band it
sits in, and one line saying what it does. The director's CONTROLS tab
(`▣ GAME MECHANICS → CONTROLS → PANELS`, built by
`tools/director/src/controlsets-page.ts`) reads that table and the wave list
it drives — a hand does not retype a set here, it draws the real band and
lists the real controls.

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

`packages/render/src/touch.ts` is the truth for **three** of the four
controls below — it is a decision procedure (`touchDown`, `touchMove`,
`touchUp`, and `handleUnder` in `handles.ts` next door), not a data table like
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

**The fourth is not in `touch.ts` at all, on purpose.** The guide's
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
| THE MAZE'S STRING | the drum's resting circle, only while the wheel is being read | player 1 only | grab and drag | Turns the wheel by how far the hand has come from where it grabbed. |
| THE WARDEN'S TETHER | the tether's resting circle, while one hangs from the rim | player 1 only | grab and drag | Pulls the line taut; held taut long enough it opens a hatch. |
| THE GUIDE'S HOLD | anywhere on screen, while a guide or the ready gate is up | both, independently | hold | Fills this seat's ready circle; the wave starts once both are full. Letting go before it is full empties it. |

The director's `▣ GAME MECHANICS → CONTROLS → ON THE FIELD` tab draws the same
four rows from `tools/director/src/field-controls-page.ts`'s `FIELD_CONTROLS`
array — this table is that array in prose, kept beside it rather than typed
from memory a second time.

## Tried and set aside

`▣ GAME MECHANICS → CONTROLS → TRIED AND SET ASIDE` names in-screen controls
the game was played with and moved away from, kept because the owner asked
for it rather than deleted. The full write-up for each stays in
`docs/parked.md`, so this page and that file cannot drift apart by each
saying a different thing about the same idea — the director tab and this
section both name the heading and stop.

- **HOLD-TO-TEAR** — `docs/parked.md`, *"Hold something long enough and it
  tears — a window somebody closes by succeeding."* THE WARDEN's tether
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

Post-`claude/burn-topbar-fold`, CONTROL SETS is already a tab of the shell
titled GAME MECHANICS rather than a sheet of its own. The owner's *"wichtig,
dass alle in screen controllen ... auch in der game mechanics Seite
dokumentiert werden"* was written before that fold; now that the tab lives
inside the very shell named GAME MECHANICS, building the in-screen list once,
in this tab, is what satisfies it — a second copy on the sibling STATES tab
would be the drift this whole entry exists to prevent, not a second reader.
Renamed CONTROL SETS → CONTROLS, and it now holds three inner tabs: PANELS
(unchanged), ON THE FIELD, and TRIED AND SET ASIDE.
