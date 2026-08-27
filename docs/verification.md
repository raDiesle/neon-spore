# What still needs an eye

A cloud session runs `bun test` and the typecheck and nothing else. It has no
wrangler, no relay, no `bun run delegate`, and no way to *look* at anything —
a headless Chromium can prove a frame did not throw, which is not the same as
whether the motion reads. `CLAUDE.md` already says so, and asks the session to
name the parts it could not check.

Naming them in a report was not enough. A report is read once, on a phone, and
then scrolled past; by the time there is a machine that can open a shape sheet,
the list of what to open is four sessions up the transcript. So the naming
moves into the commit, where it survives a clone, a teleport and a cold start —
the same reason the commit messages here are sentences.

## The trailer

A commit that leaves something unlooked-at says so, once per thing:

```
The Warden gets a body: the first contour with a hole through it

...

Check: the hole still reads at 26 px on a phone
Check: the flank torches do not clip the hull — `bun run shapes`
```

Prose, not a ticket. It says what to look at, and after an em dash how, when
there is a how. A backticked command that is one of this repository's own
(`bun run …`, `bun test …`) becomes a button; anything else is refused, which
is why the tail is prose the rest of the time.

**Wrap it if it runs long.** A `Check:` continues onto the next line and the
next, to the first blank line or the next trailer — indented or not. It used
to need the indent, and the failure was silent: a session wrapping at the
margin, the way it wraps every line it writes, landed a check whose second half
was simply not on the list, and the half that went missing was usually the
`bun run …` that would have settled it. What this costs is one rule: leave a
blank line between the last `Check:` and any ordinary prose after it, or the
prose is read as the rest of the sentence.

Write one for anything the sandbox could not settle: a wave's timing, a
silhouette, a sound, a colour, motion of any kind, the relay, anything that
needed a browser someone was watching. Do not write one for what `bun run
check` already proved — a check that a green tree covers is noise on a list
whose only value is that everything on it is real.

Do not write one for an idea, either. A check is an obligation somebody incurred
by landing something unlooked-at; a suggestion nobody has decided to act on is
the opposite, and it goes in `docs/parked.md`. Mixing them costs the outstanding
list the one property it has.

## The list

Derived, never kept:

```
bun run checks           what is outstanding on main, and which branches are spent
bun run checks --run     run every outstanding check that names a command
bun run checks --clean   delete the branches with nothing left on them
```

The director carries the same thing with buttons on it: `⚑ TO CHECK` in the
header, gold with a count when something is waiting. Each row is one check,
with `▶ RUN` when it names a command, `✓ TESTED` when a person has looked, and
`✗ FAILED`, which asks what was wrong. `▶ NEXT` steps down the list one at a
time, which is what going through them actually looks like.

The list comes off `main`, because that is where the testing happens. Testing
a branch means testing something nobody will ever run again.

## The half that cannot be derived

Whether somebody looked. That is `docs/verified.md`, one appended line per
decision, and it is committed — it is the record of what was tested and what
was not, and a later cloud session with nothing but the clone can read it and
know whether a branch is spent.

A **PASS** closes the check. A green command records its own pass; a red one
records nothing, because what a failing command asks for is a fix, and writing
it off as failed would take away the chance for the same check to go green once
the fix lands.

A **FAIL** also closes it, and asks for a note. It is closed because what it
wants now is a commit, not a second look — and that commit carries its own
`Check:`, so the thing gets looked at again on its own terms rather than as an
unticked box from last week.

## The loop

1. A cloud session works on the branch it was given, lands it on `main` when
   asked, and writes a `Check:` for each thing it could not settle.
2. Back at the machine that can look: `bun run checks`, or open the director
   and see `⚑ 3 TO CHECK` in the header.
3. `--run` settles the ones that are only a command. The rest are opened and
   looked at, one at a time, and ticked.
4. When nothing on a branch is undecided, the branch is spent: the director
   offers `🗑 DELETE`, and `bun run checks --clean` does the same from a
   terminal. The worktree goes first if one holds it, then the local branch,
   then origin's copy. Nothing is forced — `git worktree remove` and `git
   branch -d` both refuse to lose work, and neither is talked out of it.

The same loop covers a worktree here. A worktree's branch is on the same list,
under the same rule, and gets removed the same way once main has its work and
the checks are decided.

## The closing block

`bun run handoff` is the other end of the same idea. `bun run checks` is read
here, at the machine that can look; the handoff block is read there, on the
phone, at the moment a turn ends — and it answers one question, whether
anything is still owed. It derives every fact it prints from git, the trailers
and `docs/parked.md`, so a landing it claims is a landing that happened.

A `Check:` never appears in it as a block. It is printed under `optional`,
because a check is work for a machine that can look and there is no obligation
to look today. `CLAUDE.md` has the block itself.

## Why it is committed

Two reasons, and neither is bookkeeping. The first is the one the arrangement
exists for: knowing what has been tested and what has not, six weeks later,
without remembering. The second is that a cloud session can read it — it has
the clone and nothing else, and `docs/verified.md` is the only way for it to
know that the branch it is about to rebase onto is one nobody has looked at
yet.
