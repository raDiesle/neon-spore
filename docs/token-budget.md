# Why this repo looks the way it does

Every structural decision here has a second reason beside the usual one: it
keeps the amount of text a session has to read small. That is not thrift for
its own sake — a session that reads less is also a session that is less likely
to change the wrong thing.

## How the work is actually done

One session at a time, on Opus 5, tasks one after another in it, with the
conversation compacted automatically at about 300k tokens. There is no model
choice to make and no parallel lane to schedule. So the bill has two parts
and only two levers:

- **Within a stretch of conversation, cost is turns × length.** Every request
  re-reads the whole conversation; a cache hit bills that at a tenth of the
  price, and a one-hour cache means consecutive turns nearly always hit. The
  lever is the number of turns, not the number of words typed in one.
- **At a compaction, the conversation is replaced by a summary.** The next
  turn is cheap again — and everything that lived only in the chat is gone or
  blurred. The lever is what has been written into the repository by then.
  The threshold is `autoCompactWindow` in `.claude/settings.json`, 300k rather
  than the model's own ~967k, because every turn re-reads everything below it;
  the `# Compact instructions` at the end of `CLAUDE.md` say what the summary
  keeps, and `tools/hooks/after-compact.ts` restates the tree's state — branch,
  queue, parked — into the fresh context so the session re-orients from files.

## The four levers, and why compaction makes them matter more

**1. Small files with one job.** Nothing over roughly 250 lines. A change to
the glow effect opens `glow.ts`, not a 900-line renderer — and after a
compaction the session re-opens the two files it needs rather than the twenty
it once had in context.

**2. Content as data.** Waves, creatures and acts are data files. Authoring
wave 43 means writing a small object — no logic is read at all. This is the
single biggest saving, because content is most of the remaining work.

**3. The context map.** `docs/INDEX.md` describes every file in one line. A
session reads that and opens two files, instead of grepping through twenty.
It is the first thing a session reads after a compaction, which is why its
rows are checked for drift.

**4. A stable CLAUDE.md.** It is loaded into every request, before and after a
compaction, so it stays short and stays *unchanged*: an edit invalidates the
cache for every session. `tools/test/claude-md.test.ts` holds its size; a rule
for one kind of work goes in that work's skill, a fact that changes goes in
`docs/`, and every script beyond the everyday ones is in `docs/commands.md`.

## Practical habits

- **Land each green piece.** A task that is committed and on `main` survives a
  compaction whole; a task half-written in the chat does not. The point of
  landing piece by piece is as much that a compaction falls *between* tasks as
  that a rebase stays small.
- **What the next task needs goes in a file, never in the chat.** A finding in
  `docs/queue.md`, half-done work in `docs/parked.md`, a decision in
  `tools/versus/DECIDED.md`, the minutes in `docs/time-log.md`. The summary a
  compaction writes is not a place to keep anything.
- **Do the thinking and the typing in the same session, in as few turns as the
  work allows.** Handing the typing to a worker model adds turns rather than
  removing them — `delegation-cost.md` measured it at 6.8 times the cost, and
  the extra was the round trips, not the worker.
- **Keep tool output out of the context.** `tail` a check, `grep` a log, ask a
  subagent to search — its reading never enters the main session, so it neither
  costs a re-read nor brings the compaction nearer. A window filled with test
  output compacts sooner and its summary keeps less.
- **Ask the open questions before the code, in one batch.** Each question is a
  turn on a long conversation; a decision written into the queue entry before
  the lane opens costs nothing.
- **Take pictures by script, not by browser.** `bun run versus:shot`,
  `bun run frames`, `bun run shot`: a still costs seconds and one image; a
  browser pane session costs screenshots, waits and retries, all of them in
  context.
- **Prefer `bun run check` over describing what you changed and hoping.**
- When a doc grows past a screenful, split it and add a line to `INDEX.md`.
