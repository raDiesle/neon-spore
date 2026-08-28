---
name: fill-queue
description: Propose work for docs/queue.md — read the spec for what the design has agreed to and the game has not got, and write it up as ordered lanes. Runs ONLY when the owner explicitly asks for candidates or for the queue to be filled. It writes the queue and stops; it never spawns a lane and never lands anything.
---

# Filling the queue

This is the half of the unattended run that **decides what is worth doing**.
`.claude/skills/autonomous` is the other half, which does it. They are separate
skills because they answer to different people: the queue belongs to the owner,
and the run belongs to the queue.

**Never invoke this on your own initiative.** Not because the queue is empty,
not because a lane noticed something adjacent, not because a spec file is
obviously ahead of the code. The owner fills the queue as a matter of course;
this skill exists for the times they explicitly hand that job over — *find me
candidates*, *fill the queue*, *what else is worth doing*. Absent those words,
an empty queue is a reason to stop and say so.

**Turning something the owner said into an entry is not this skill.** When they
report a bug or ask for a feature mid-session, writing it up as a lane is
transcription, and the working skill does it as a matter of course. The
difference is whose idea it was, and it is recorded on every entry: *Asked for
by the owner* against *Proposed by the run*.

## 1. Read the board first

```bash
bun run burn
bun run burn --candidates
```

`--candidates` parses `docs/spec/` for everything the design has agreed to and
the game has not got — creatures, mechanics, controls, bosses, interludes — plus
`docs/parked.md`. That is the raw material. It is not the answer: a candidate
list is every gap, and most gaps are not worth a session.

`docs/parked.md` is labelled `Kind · Stage` on every entry, so it can be read by
category rather than end to end. An entry marked *Idea* is a lane that starts
with a design pass; one marked *Implemented* is a lane that starts with a
measurement.

## 2. Write entries, in the shape the queue already uses

```markdown
## THE BRIEFING BEFORE A WAVE
_claude/burn-briefings-a1 · packages/sim/src/briefing.ts packages/content/src/briefings.ts_
**Proposed by the run.**

What it is, in two or three sentences. What finished looks like, concretely
enough that a session which has read only this and the spec can tell. Which
spec file to read first.

Finished when `bun run check` is green, … and the commit carries
`Check: <one question, with a yes and a no>`

Model `sonnet`, effort `think hard`. <What the thinking is for.>
```

Every field earns its place:

- **The heading is a sentence about what is wrong**, not a feature name. It is
  what a person reads in the board's one-line list, and *THE FRINGE GOT ELEVEN
  TIMES FASTER AND THE PAGE GOT WORSE* says more than *CILIA performance*.
- **The branch** is `claude/burn-<subject>-<id>`, unique.
- **The paths** are what the lane exclusively owns. Two lanes may not own the
  same path and `bun run burn` refuses to be quiet about it.
- **The author label** is one of exactly two strings and goes under the branch.
  Anything this skill writes is *Proposed by the run.* — a gap found by reading
  a spec file is a proposal however obvious it looks.
- **The `Check:` trailer** is written here, not left to the lane, because a lane
  that invents its own check writes one it can pass.
- **The model and effort** are chosen by the table in the working skill.

## 3. Order, and it is not by interest

**Owner asks come first, always.** Then, among the rest: bugs before features,
things that block other lanes before things that do not, and small before large
where nothing else separates them. The queue header states the rule; do not
argue with it in the file.

**Six to ten entries is a queue; thirty is a wish.** A long queue is not a plan,
it is a debt with a table of contents — and it is read less the longer it gets.
If the file is already deep, the right output of this skill may be *nothing*,
said out loud.

## 4. Ownership is most of the safety, and not all of it

Two lanes may not own the same path. But disjoint ownership was never the same
claim as disjoint work: three lanes with separate files, all inside
`packages/sim`, all add a line to `config.ts`, `types.ts` and `hashWorld`. That
is a rebase apiece and the third lane pays for the two before it.
`bun run burn` warns about it as *crowded*.

Prefer a batch that spans packages. Files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts`, `index.ts` anywhere — are
owned by nobody: a lane adds to one in a single contiguous region and replays
over somebody else's addition. A lane that would *restructure* one runs alone.

**A clash the board reports may be an ordering rather than a conflict.** A lane
built on another legitimately edits what the first reshapes. Trim the later
lane's ownership to what it exclusively owns and say in its brief which lane it
sits behind — the queue's order alone does not say it, because the order is
also just the order.

**Name the symptom, not the file, when the cause is unknown.** A bug lane's
ownership is a guess about where the fault is, and today that guess was wrong
twice: one lane found the break in a file it happened to own and another could
not reach the file the fault was in. Give a diagnosis lane the files the
symptom touches, and tell it explicitly to stop and report if the cause is
somewhere else rather than reaching for it.

## 5. Commit it, and stop

One commit, `docs/queue.md` only, saying what was added and why those and not
others. Then **stop**. Do not spawn a lane. Do not land anything. Hand back to
the owner, who decides whether the run starts.
