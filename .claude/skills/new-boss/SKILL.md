---
name: new-boss
description: Build a boss for Neon Spore — which of the three kinds it is, the claim on the table, the simulation lane then the look lane, every file a boss is a name in, and what the owner has said he likes and does not. Use when designing, building, changing or reviewing a boss, a round or a choreographed scene.
---

# Building a boss

Adding a phase or a gesture to a boss that **already ships**:
`.claude/skills/new-boss-state`.

A boss is the one thing in a run the pair remembers, and it is built in two
lanes that land separately: **the simulation, then the look** (`CLAUDE.md`,
`docs/lane-speed.md`). Work through this in order. Stop at step 1 if the boss
is not one of the three kinds below, or if it asks a question a shipped boss
already asks (`docs/spec/bosses-choreographed.md`, filter 8).

## 1. Which of the three kinds it is

Say it in the first line of the design, because the three are built out of
different machinery and the owner judges them by different standards.

| Kind | What it is | The field | Controls | Shipped examples |
|---|---|---|---|---|
| **A round** | a minigame with rules of its own, over in ninety seconds, never met again | **gone** — not paused, not re-skinned | its own, drawn in the default set's style, with the ship and its panel still in the frame | THE GAUGE, SNAKE, PINBALL, THE PULSE, THE TELL, THE WELL, THE MAZE — `docs/spec/interludes.md` |
| **A field boss** | the ordinary field with a body or a fixture standing over it, answered with the cannon, the shield and the two colours — and possibly one handle on the field as well | the ordinary field, falling | the default set, plus at most one `DragTarget` or `Hold` on the screen (a tether, a ring, a grip) | THE WARDEN, THE CAIRN, THE ORRERY, THE DIASTOLE, THE THROAT, THE CANDLE, THE GORGE — `docs/spec/bosses.md` §11 |
| **A choreographed scene** | an authored beat list the scene will not advance past until the beat is performed — pull the hand off, push the weapon back, open the vault — with the boss's own picture answering every gesture, the way A Way Out does it | usually gone or still; the boss *is* the picture | several gestures in sequence — press, drag, swipe, hold, turn — each a `Command`, each with an animation of its own | none shipped whole yet. The fifteen on `docs/spec/bosses-choreographed.md` were designed as this kind; the ones built so far lean on the field |

The third kind is the one the owner asked for by name (17 September 2026) and
the one with the least machinery under it. What it needs, and where the design
page already puts it: a beat list authored in `packages/content` and read by
`sim/` by index (filter 10, `BossSequenceStep`); every gesture a member of
`DragTarget` or `Hold["kind"]` (filter 9, `sim/drag-targets.ts`,
`render/touch-hold.ts`); THE SLOW for the dramatic beat (`docs/decisions.md`
#33 — it slows `tickMs`, never `ticksPerBeat`); and the hull's reaction in
place of a camera move (`hull-shock.ts`, `breach-strike.ts`, THE CHOIR's
shake). A scene that only fires the cannon at a picture is a field boss with
a costume on, and a field boss that stops the field is a round.

## 2. What every kind must pass

- **Every boss splits something**, the eyes or the hands. Both seats may see
  the same field; then they must be given different jobs in it, at the same
  time or one after the other. A boss both seats could play alone is a wave.
- **No health bar, ever.** Its health is its silhouette: petals, plates, lobes,
  beads. Say what part of the outline goes away and how many there are.
- **A step is a `Command` or it does not exist.** A gesture not in
  `DragTarget` or `Hold["kind"]` is a wish. Add the member, in `sim`.
- **Nothing is written for the pair to read aloud.** The words are theirs —
  a *script* is forbidden, a *verb* is not. Since `docs/decisions.md` #34 the
  field may say one word beside the mark where the action is wanted, with the
  kind of action over it, on the seat that can act: `render/src/boss-cue.ts`
  is the reading and a new boss adds its own arm to it. It never says a
  column, a colour or a count — that is the sentence the pair has to say.
- **A player works it out without being taught, in short words.** The owner,
  19 September 2026: *I expect they are easy to understand and follow by
  players. No complex logic which players cannot understand. Also players may
  be in another language, so easy and short words are crucial* — and, the same
  day, *better to skip hard to understand mechanics of bosses.* So a boss whose
  rule takes more than a sentence to state is cut down until it does not, and
  every word the field says is one a pair with fifty words of English between
  them can act on: `SHUT`, `LIFT`, `APART`, `BURN`. Rules that follow from it:
  a cue is one word and never two; a state nobody can name is a state nobody
  can call for; **a gesture the pair cannot discover by trying it is a gesture
  that needs cutting, not explaining**. `tools/director/test/boss-states.test.ts`
  holds the written half of this at 120 characters a card.
- **A round is never repeated.** Eleven rounds, eleven acts, each thrown away.
- **Presentation is the hull's reaction, not the frame's.** No split screen,
  no zoom, no camera.
- **It asks a question no shipped boss asks.** Read §11 before designing.

## 3. Claim it on the table, in the lane

`docs/spec/bosses-choreographed.md` § *Who is building what* is the ledger two
sessions share. Before a line is written, read the **trunk's** copy rather than
this tree's — another session may have taken it, and a lane branched an hour
ago cannot see that:

```bash
git show main:docs/spec/bosses-choreographed.md | grep -n "THE <NAME>"
```

Then edit the row to **taken** with both lanes named, **in the lane**, and let
it ride in the lane's own first commit. Mark it **built** the same way when the
second lane lands, with the shas, the §11 number and the wave number, and what
of the design is *not* built — the owner's eye.

**The race is settled by the queue's claim, not by this row.** A boss waiting
to be built is a `docs/queue.md` entry, and `bun run queue next` or `bun run
queue take "<title>"` writes a `Taken:` line **on `main` and pushes it** before
the lane starts — visible to every other session on the machine and to every
clone. That is a stronger gate than the ledger ever was, because it is the same
command in every kind of session, and it holds the branch as well as the line.

This step used to say the row itself was committed in the main checkout with
`git -C <main> commit --only docs/spec/bosses-choreographed.md`. **No session
could run that.** From a worktree it is refused before it starts, as touching a
shared resource — THE GIMBAL's lane and THE BELLOWS's both hit it and both
carried the row in their own commit instead — and a cloud session has one clone
with no second checkout at all, so there was never a `<main>` for it to point
at (`docs/cloud-session.md`). A step nobody can run is a step that teaches the
next lane to work around the skill.

## 4. Lane one: the simulation, and the receipts

Every file a field boss is a name in — the kind, the union, the hash, the
sounds, the silent lists, the wire, the director's sheet and the write-up —
is one table: `.claude/skills/new-boss/registrations.md`. Do every row of it
before the first check.

The purity test's table of rules that must be **called, not re-derived** is
what catches `livingKindForColor` written as a ternary; the hash-coverage test
catches a `null` the fixture never changed; `content/test/guides.test.ts`
catches a guide half over 220. Run `bun run check:fast`, commit by path, `bun run land --keep`.

## 5. Lane two: the look

A new boss's look is **a look with no shipped alternative** — say so in the
commit. The shape of it, from THE DIASTOLE, THE CANDLE and THE GORGE:

- `render/src/<boss>-draw.ts` reads the boss off `world` every frame and keeps
  nothing; split a `<boss>-lobe.ts` or `<boss>-shape.ts` off before 250.
- One `showsX(role)` predicate per fact one seat is shown, in
  `view-role-clocks.ts` (a choreographed boss) or `view-role.ts` (one with a
  body on the field), with the reason it is that seat's — the split is the
  encounter.
- Anything that outlives a frame is a field of `BossTransients`
  (`effects-boss.ts`, reached as `effects.boss.<name>`), walked by its four
  verbs there; `restart.test.ts` proves the reset. A family of events is read above the loop (`<boss>-fx.ts`, the way
  THE MIRROR's and THE GORGE's are) rather than as rows in a spark table at
  its limit.
- The branch in `boss-draw.ts` is short; the file is near 250.
- Take the events out of the two silent lists' *reason*, if not the lists.
- **One seat judged against when the other acted** (a pry the beam must land
  inside) is said by the marks: the waiting seat is shown its mark only once
  its time has come, and no line over the cannon names a turn
  (`render/test/pair-order.test.ts`).
- `render/test/<boss>-frame.test.ts`: every state of the picture on all three
  screens, set rather than waited for, and the split proved both ways.
- `docs/spec/bosses.md` §11.n gets *The look* and loses *What is not built*.
**What the picture is measured against: THE INSTAR** (`docs/spec/bosses.md`
§11.32), which is the owner's reference since 18 September 2026 — *detailed and
nice graphics like the bulb queen or the warden, and the enemy transforms and
moves and changes perspective and appearance during the animations*. Five
things, and a boss's look lane is read against all five:

1. **A body, not a fixture.** A grown contour with lobes, drawn at the size of
   the field, with parts a mark can sit on — a hand, a clutch, a tongue, a tail.
2. **A pose per state, and a morph between them is a blend.** The states are
   figures and the body between two is the eased lerp, never a cut
   (`instar-poses.ts`). A boss with one silhouette and a colour change has one
   pose.
3. **The perspective changes.** At least one state turns the body so a face
   the pair has been reading goes away and another comes (INSTAR's *turned*).
4. **The picture is deformed by how far the answer is along** — the part at the
   depth the thumb has it, one egg fewer per swipe, the tongue winding with the
   turn. Progress is read off the body, never off a bar.
5. **The mark says which gesture**: a breathing ring, a glyph inside it, the
   window closing as a ring, and the cue's word beside it (`boss-cue.ts`).

- **Send one PNG** — `bun run frames . --wave "THE X" --seat p1 --press …` —
  and never a description. Then `bun run land --keep`, and tell the owner the
  boss is ready to test; his eye is the check nothing here runs.

## 7. What the owner has said he likes, and does not

On record, with where and in his words where he gave them: THE TELL and why
it went, the field that stays the field, the beat list that waits, one meter
that is *ours*, the rules he set, the long choreographed window and THE SLOW
on a step — `.claude/skills/new-boss/owner.md`. **Read it before designing,
and add a line there every time feedback on a boss says one**, dated.

**Enhancing a boss that already shipped** — the three standing briefs,
§6.1–6.3, kept under those numbers because `docs/queue.md` names them one by
one: `.claude/skills/new-boss-more`.
