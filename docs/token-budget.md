# Why this repo looks the way it does

Every structural decision here has a second reason beside the usual one: it
keeps the amount of text a session has to read small. That is not thrift for
its own sake — a session that reads less is also a session that is less likely
to change the wrong thing.

## The four levers

**1. Small files with one job.** Nothing over roughly 250 lines. A change to
the glow effect opens `glow.ts`, not a 900-line renderer.

**2. Content as data.** Waves, creatures and acts are data files. Authoring
wave 43 means writing a small object — no logic is read at all. This is the
single biggest saving, because content is most of the remaining work.

**3. The context map.** `docs/INDEX.md` describes every file in one line. A
session reads that and opens two files, instead of grepping through twenty.

**4. A stable CLAUDE.md.** It is loaded into every session in this project, so
it stays short. It also stays *unchanged* where possible: prompt caching bills
a cache hit at a tenth of the input price, and editing CLAUDE.md invalidates
that cache for every session. Put anything that changes often in `docs/`.

## Practical habits

- Do the thinking and the typing in the same session, in as few turns as the
  work allows. The expensive part is the **round trip**, not the typing: every
  request re-reads the whole conversation, so cost tracks turns multiplied by
  how long the conversation has got. Handing the typing to a fast model adds
  turns rather than removing them — see `delegation-cost.md`, where it was
  measured at 6.8 times the cost.
- Let subagents do code searches. Their reading does not stay in the main
  session's context.
- Prefer `bun run check` over describing what you changed and hoping.
- When a doc grows past a screenful, split it and add a line to `INDEX.md`.
