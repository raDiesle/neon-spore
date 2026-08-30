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

A commit that leaves something unlooked-at says so:

```
The Warden gets a body: the first contour with a hole through it

...

Check: the hole still reads at 26 px on a phone
```

Prose, not a ticket. It says what to look at, and after an em dash how, when
there is a how. A backticked command that is one of this repository's own
(`bun run …`, `bun test …`) becomes a button; anything else is refused, which
is why the tail is prose the rest of the time.

**One commit, one trailer, by default.** The next section is the procedure
for finding it when a commit touched more than one thing.

**Wrap it if it runs long.** A `Check:` continues onto the next line and the
next, to the first blank line or the next trailer — indented or not. It used
to need the indent, and the failure was silent: a session wrapping at the
margin, the way it wraps every line it writes, landed a check whose second half
was simply not on the list, and the half that went missing was usually the
`bun run …` that would have settled it. What this costs is one rule: leave a
blank line between the last `Check:` and any ordinary prose after it, or the
prose is read as the rest of the sentence.

## One check per landing

The owner opens the list to answer one question about each row: *did this
landing come out right when I look at it?* A lane that writes one trailer per
thing it touched turns three decisions into nine rows, and nine rows reads as
a log of everything that landed rather than a short list of decisions still
open. The unit the list is built from is the **landing** — one commit — not
the count of things the diff changed.

**The procedure, before writing any trailer at all:** name the thing a player
would say changed, in their own words — the sentence someone who only plays
the game would say if asked what's different, not a file, not a mechanism,
not the lane's own account of what it did. Everything in the commit that
shares that same answer is one check, however many files moved to produce it.
A commit that touched three files in service of one thing a player would
notice gets one trailer. Do this before drafting a single `Check:` line, or
the habit of writing one per thing looked at wins by default.

**A second trailer on one commit is the exception, and it has to earn
itself.** Write one only when two parts of the landing could truthfully come
back with different verdicts — a wave's timing and a sound cue that plays
during it are not the same question, and either can pass while the other
fails. Say so in the commit message when you do it; a second trailer that
shows up without that sentence reads as the old habit, not a judgment call.

**Widen the subject; never weld two questions onto one line with "and".** *Does
the shadow gather and is the meteor grey* cannot be answered as one row,
because half of it can pass while the other half fails and the verdict has
nowhere to go. The fix is not to drop a half, it's to ask the question that
already contains both: *does a falling rock read as a rock getting closer to
the ship* covers the shadow and the body, and it has one answer. A combined
check is recognised by a bigger subject, not by a shared line.

Nothing about the shape of a check changes underneath this: still one
sentence, still a question with an imaginable "no", still written for
somebody who only plays the game, still no identifiers or paths. And if a
landing genuinely changed nothing a player could look at, the right number of
trailers is still zero — this rule asks for a wider question, never a softer
one.

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

**The list shows implementations, never concepts.** `docs/checks/<sha>.md`'s
`badge` field answers two different questions and only one of them belongs on
this list. `implementation` means the game or the tool now does something
differently — a small obligation somebody incurred by landing, *go and check
this*. `concept` means a proposal that nothing ships yet — a candidate beside
a shipped look, offered for a decision, *decide whether you want this at
all*. That second kind waits on the owner's appetite, not on their attention,
and mixing it into the queue is the exact failure the badge exists to
prevent: the list reads as longer than the work it represents.

So `outstanding()` in `tools/checks/checks.ts` filters a concept-badged check
out before either reader ever sees it — `bun run checks` and the director's
`⚑ TO CHECK` both call it, so neither can drift from the other. A concept is
not deleted, marked done, or dropped from `docs/checks/`: it simply never
becomes a queue entry. Where it goes instead is wherever `CLAUDE.md`'s "A
look is offered, never replaced" already sends a candidate — the VERSUS page,
or a NOT BUILT YET card — which is why this list gives it no second home of
its own.

**Absent is an implementation, not a concept.** Every restatement written
before the `badge` field existed carries none, and reading a missing badge as
`concept` would silently drop old obligations from the list without anybody
deciding they should. Only the literal word `concept` is filtered; anything
else — `implementation`, or nothing at all — is queued as usual.

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

**A removed worktree is verified, not trusted.** On Windows a `node_modules`
handle left over from `bun install` can make `git worktree remove` report
success or failure and be wrong either way while the handle is still closing —
measured on this machine, a second attempt seconds later went through every
time with nothing forced and nothing killed. So `tools/checks/worktree.ts`
asks the filesystem after every attempt rather than trusting the exit code,
retries a few times with a short wait between, and only escalates to a plain
`rm` once `git worktree remove` itself never gets through. `git worktree
prune` only ever runs after the directory is confirmed gone — pruning on a
hope is exactly how a stuck lane turns into a directory nothing can find
again. If a directory still stands after every attempt, the sweep says so by
path rather than reporting the branch as merely "spent" or silently moving
on — the same is true for `bun run checks --clean`, which also names the
worktree it could not clear.

**What is already lying on disk is swept too.** `.claude/worktrees/`
directories that `git worktree list` has never heard of are exactly the
litter the paragraph above describes, from before this fix existed —
`bun run checks` lists them and `--clean` removes the ones it can prove hold
no uncommitted work. The proof is the same `git status` a registered
worktree gets; an orphan whose `.git` link is itself gone cannot be asked at
all, and unreadable fails safe the same way a live lane's does — left alone
and named, not guessed at.

## The closing block

`bun run handoff` is the other end of the same idea. `bun run checks` is read
here, at the machine that can look; the handoff block is read there, on the
phone, at the moment a turn ends — and it answers one question, whether
anything is still owed. It derives every fact it prints from git, the trailers
and `docs/parked.md`, so a landing it claims is a landing that happened.

A `Check:` never appears in it at all. Something always wants an eye — that is
what a sandbox leaves behind every time it runs — and a row that is on every
block is read as furniture rather than as news. What the block does carry is
the postponed work from `docs/parked.md`, in its own words, because that is the
part that changes from turn to turn. `CLAUDE.md` has the block itself.

## Why it is committed

Two reasons, and neither is bookkeeping. The first is the one the arrangement
exists for: knowing what has been tested and what has not, six weeks later,
without remembering. The second is that a cloud session can read it — it has
the clone and nothing else, and `docs/verified.md` is the only way for it to
know that the branch it is about to rebase onto is one nobody has looked at
yet.
