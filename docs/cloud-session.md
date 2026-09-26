# Working in a cloud session

A session started from the phone runs on a machine that clones `origin` and
never sees the desk's checkout. `CLAUDE.md` carries the four rules that follow
from that; this is the reasoning behind them, and the details a cloud session
needs once it is actually running.

**A cloud session should read this file first.** It is written for a machine
that has nothing but the clone.


A session started from the phone runs on a machine that clones `origin` and
never sees this checkout. Several things follow, and each one cuts against a
rule above.

**It reads the remote, not the tree.** Anything unpushed is invisible to it, so
the hand-off from here to there is a push, not a save. That is also how unpushed
work turns into a trap: a `main` sitting five commits ahead of `origin` gives
the cloud a task briefed on code that is not there.

**It must push its own branch.** "Do not push unless asked" is a
rule about this machine, where not pushing costs nothing because the work is
already where the human is. In the cloud the opposite holds — work that is not
pushed is work nobody can reach. So a cloud session pushes the branch it was
given, when it is done, without being asked. Never a pull request; `main` under
the next paragraph, which it does on its own.

**It lands `main` itself, every turn, without being asked.** The rule used to
be that it never could, and then that it could when asked; both were about
verification — a change the sandbox cannot fully check should not become the
trunk that the next cloud session clones. That worry survives, and the ordering
it implied does not. One person works on this repo, so a `main` that turns out
to need another pass costs that person one commit and nobody else anything —
while a branch parked until they get to a desk costs a day, and two parked
branches cost a rebase each. Asking first only moved the day-long wait to a
different question.

So: a cloud session finishes a turn by landing its branch on `main`. Two
conditions, and no third. The branch is **already rebased onto the current
`origin/main`**, so the landing is a fast-forward and the history stays linear —
never a merge commit, never a force-push to `main`. And `bun run check` is green
on that rebased branch. If either fails, the branch is pushed and the closing
block says so; the turn does not end quietly on unlanded work.

Mid-task is the one exception, and it is the same exception as everywhere else
in this file: work that is not finished is not committed, and what is not
committed cannot land. A turn that ends on a question ends with the question,
not with a landing.

What the sandbox could not check does not block the landing, but it does not
evaporate either: it moves *after* it, onto the machine that can look. The
report names it — the wave whose timing was never watched, the shape whose
motion was never seen, the relay never run — as a list of what to open, not as
a caveat. Landing without saying that is the one way this arrangement fails,
because it turns "not looked at" into "looked fine". If it turns out wrong,
`main` takes the fix as its own commit; the history is linear and stays that
way.

**It does not measure a frame.** `bun run perf` is the one command in
`CLAUDE.md` a cloud session is told to skip outright, and the owner said so on
8 September 2026 after a lane spent twenty minutes finding out why: a narrow
run that takes about 25 seconds on the owner's machine was killed twice on a
cloud runner, at 400 and at 580 seconds, having printed nothing either time.
The box is slow rather than broken — it runs the whole test suite in 260 s —
but a measurement taken there would be a number about the runner, not about
the game, and waiting for one costs a turn. So a lane that adds a shape or an
animation in a cloud session lands it unmeasured and names `bun run perf` in
its unverified list, for the machine that can take the number properly.

A lane that adds a **wave** needs no extra step. `baseline.test.ts` wanted a
row per wave until 14 September 2026 and would have sent such a lane to the run
it has just been told to skip; the owner took that rule out instead, so a wave
with no baseline row passes the check and the next sweep weighs it. Say in the
report that the wave went in unweighed.

A lane that **changes** an existing wave's arrivals has one step, and it is not
a perf run. Its row is stale rather than missing — it says what the wave sent
*before* — and the check still fails that, rightly, because a stale row says
something untrue where an absent one says nothing. `bun run baseline:blank`
blanks it. **That command is allowed here**: it opens no browser, measures
nothing, and can only blank a row whose figures already describe a wave that
does not exist. It was `perf --unmeasured` until 14 September 2026, which is
why it reads as forbidden in anything written before then.
`docs/performance.md` has the whole of it.

**The relay runs here, and that is new.** This section said *the sandbox has no
wrangler* from the day it was written until 15 September 2026, when a session
tried it rather than believing it: `bun run relay:check:all` starts
`apps/server/dev.ts`, waits for `/net/health` and came back with all four green
— in step, the split caught at tick 300, the third device told the room is
full, and a dropped seat back in step. Wrangler cannot reach the `Request.cf`
it asks for on a sandboxed machine and falls back after a timeout of its own,
which makes the first start slow and is the whole of what it costs.

So **two devices in one room are a thing a cloud session can prove**, and a
queue entry reserved for a machine with a wrangler is not reserved any more.
What this does *not* say is that the sandbox has a network: the relay is local,
both devices are `createLink` in this process, and nothing goes out.

**It still cannot verify everything, and has to say which parts — in the
report.** There is no `bun run delegate` and no network access it did not
arrange. It does have a headless Chromium, so a page can be opened, driven and
screenshotted — what it cannot do is *look*, and those are different things: a
green screenshot check says the DOM is there, not that the motion reads. `bun
test`, the typecheck and now the relay are the parts that hold unaided.
Anything that would have needed `bun run perf`, a human eye on a shape sheet,
or a wave watched at tempo is *unverified*, and the report says so in that word
rather than offering a green check that covered less than usual. A wave whose
timing was never watched is not finished, it is written — landed, now, but
still written.

*Amended 2026-09-21:* "it does have a headless Chromium" was true and did not
hold. `chromium.launch()` died there with *Target page, context or browser has
been closed* — a sentence about nothing that was wrong — because Playwright
talks to the browser it launches over `--remote-debugging-pipe`, which is
fixed inside `playwright-core`, and that pipe is what Chrome running as root
dies on. The same crash is reachable on the owner's own machines by a profile
path a few characters too long for `AF_UNIX`, which any worktree with a long
enough name gives it. `tools/frames/browser.ts` now retries by spawning the
browser itself with `--remote-debugging-port` and connecting with
`connectOverCDP`, so the sandbox takes frames again and the two causes did not
have to be told apart first. It is a fallback: where the ordinary launch
works, nothing changed.

**Say it once, in the report, queue it, and then let it go.** The report is
the sentence; the queue is what survives the session. A lane that could not
watch a wave at tempo, could not see a shape move, or could not take a frame
cost lands with `bun run land --unverified "<what>"` — repeatable, one per
thing — and the landing writes a single `## Unverified at <sha>:` entry into
`docs/queue.md` beside the technical findings. A session at a machine that can
look claims it with `bun run queue next`, opens it, and removes it with
`bun run queue done`. **The flag has an afterwards**, for a session that
lands and only then remembers what it never watched: `bun run unverified
<sha> --unverified "<what>"` writes the same entry from an already-landed
commit, without needing the lane `land` claimed it from.

That is a reversal of what the rest of this section argues, made by the owner on
9 September 2026, and it is a narrow one. The objection below is to a list the
*owner* owes answers to, and it stands: `docs/release-notes.md` is still
read-only, there is still no verdict to type back in, and no count of anything
outstanding. What changed is the observation that a cloud session's report has
two halves treated differently for no reason a reader could see — a technical
finding got a list that drains, an unverified look got a sentence in a
transcript — and both are the same thing, which is work nobody has started. An
`Unverified` entry is cleared by another session, not by an answer.

There used to be a second half to this: a `Check:` trailer on the commit, an outstanding list derived
from those trailers, a ledger recording who had looked at what, and a sheet in
the director with a verdict button on every row. It was accurate and it asked
the owner for something on every visit, which is what finished it — a list you
owe answers to stops being read at about the length that one reached, and a
list nobody reads is worse than none, because it looks like coverage.

What replaced it asks for nothing. `bun run land` writes an entry into
`docs/release-notes.md` at the moment the trunk moves, derived from the commit's
own subject and first paragraph, and that file is read-only: nothing in it is
ticked, answered or deleted. The director shows the same thing under
`≡ RELEASE NOTES`, with no buttons and no count — a count is a way of saying
something is waiting, and nothing there is. Reading it is optional, which is the
only reason it will be read.

So do not write a `Check:` trailer, do not open a file under `docs/checks/`, and
do not ask the owner to confirm that something was tested. Write the commit
message well instead: it is the release note, and it is the only part of this
that anybody sees twice.

**A claim is made the same way here.** `bun run queue take` and `next` write
their `Taken:` line onto `main` and push it, and a clone with nothing on
`main` is no exception: the commit goes onto the ref directly, without a
checkout, and the lane this session is standing on is not touched. Until
10 September 2026 it printed `⚑ left alone — nothing has main checked out`
and reported the item ongoing anyway, which was a claim only this clone could
see. The lane's `queue done` then removes an entry the trunk has since marked,
and the landing's rebase resolves that on its own (`tools/land/queue-merge.ts`).

**And a finished item is on `origin/main` before the next is claimed.** The
owner, 26 September 2026: *"land on every queue item taken (update queue taken
state) and when finished with item. this is generic for cloud sessions."* A
claim that only this clone can see is no claim, and neither is a finished
item held back for the end of a turn: another session reading `bun run queue`
meanwhile sees the entry still open, or still taken by a lane that has in fact
landed, and either starts it again or passes it over. So each item is two
pushes. The first is the claim — `take` and `next` push their `Taken:` line
themselves, and a refused push is brought up with `bun run push` and the
claim made again before any work starts. The second is the item: `bun run
land`, then `bun run push`, then `git rev-parse main origin/main` to see the
two agree, and only then the next `take`. A push that reports a real
disagreement is resolved on `main` (`git rebase origin/main`, `bunx tsc
--noEmit`, `bun run check`) and pushed again before the next claim.

**And the queue knows this is a cloud session.** `CLAUDE_CODE_REMOTE` is set
on the web image, and `bun run queue` reads it: an entry the owner marked
`- **Where:** local` — a wave to watch at tempo, a frame to measure — is
listed `LOCAL ONLY`, passed over by `next`, and refused by name to `take`
(`tools/queue/where.ts`). `- **Where:** phone` is the narrower one beside it —
work needing hardware rather than a screen, which no session of either kind
can finish — and it reads the same way here: `PHONE ONLY`, passed over, refused
by name. On the owner's own machine the two part company, and that is the only
place they do: he can `take` a `phone` entry by title, because he is the one
holding the phone.

**That is the only reservation, and it only ever points one way.** There was a
`Where: cloud` beside it from 18 September 2026, when the list was dealt the
day the owner left to work it from a phone, and forty-odd entries were kept for
a session like this one. He took that half out on 21 September 2026 — *"please
remove cloud only. all cloud only also local can and should take"* — so what
`next` hands out here is now everything except what needs an eye: the
simulation half of every boss, the words a field says, the refactors, the
tooling and the tests, and anything else nobody marked. What is kept back is
still what a sandbox cannot prove — a picture that should look like something
real, a cue placed on a frame, a pose in the director's gallery — and the
handful unmarked ones that `ASKS THE OWNER`, which no machine unblocks.

**A technical finding goes in `docs/queue.md`, not in the report.** A refactor
the session stepped around, a slow path, a missing test, a document that no
longer describes the code: one `##` section, in the same commit, and then it is
in the clone forever instead of four sessions up a transcript. Half-done work
goes in `docs/parked.md` the same way. An *idea for the game* goes in neither —
that is a decision, it belongs in `docs/spec/`, and the owner picks it up by
hand. The queue is deliberately not the release notes: a note records something
that already happened and is closed, a queue item is work nobody has started
and is open. Picking one up later is a fresh session — `bun run queue next`
prints the prompt — which removes the entry in the commit that finishes it.
`docs/queue.md` says the rest.

**Its Bun is pinned for it, and it no longer has to know why.** A cloud
session's image carries whatever Bun it was built with — 1.3.11 on 4 September
2026, against a `bun.lock` written by a newer one — and three things then fail
in ways that name something else: `bun install` silently rewrites
`lockfileVersion` from 2 to 1, so a lane staging `bun.lock` commits a downgrade
nobody asked for; `bun install --frozen-lockfile` fails with *lockfile had
changes, but lockfile is frozen*, which is the first thing `bun run land` does
after the rebase, so the landing stops before the check has run; and
`apps/server`'s suite times out on every websocket case, because that Bun's `ws`
shim has no `upgrade` event for miniflare to use. Twenty-five red tests that are
green on the owner's machine, and a `bun run check` no lane can turn green.

**None of that happens any more.** `tools/hooks/session-start.ts` runs before
the session does. On the web image, and only there, it compares the image's Bun
against `.bun-version`; if it is older it fetches that Bun from the npm registry
as `@oven/bun-linux-x64` — the one host the sandbox's proxy allows for packages,
and the reason nothing is downloaded from `bun.sh` — caches it under
`~/.cache/neon-spore-bun` and puts it first on `PATH` for the rest of the
session through `$CLAUDE_ENV_FILE`. The image's own Bun is left in place.

It says so in one line on stderr, and there are only two:

```
session-start: bun 1.3.11 is below 1.4.2; pinned /root/.cache/neon-spore-bun/bun ahead of it
session-start: could not pin bun 1.4.2; leaving the image's 1.3.11
```

**The pin is on `PATH`, and a shell that did not inherit it is back on 1.3.11
without saying so.** `$CLAUDE_ENV_FILE` puts it in front for the session, and a
command run some other way — a tool call that builds its own environment, a
background job, anything started from a shell the file never reached — gets the
image's Bun and the twenty-five red websocket cases above, which then read as
*thirty-four tests my change broke* rather than as the known trap. On 19
September 2026 a lane spent twenty minutes on that: it stashed its whole branch
to prove the reds were there without it, which they were, and only the
`bun test v1.3.11` in the header of its own output said why. So read that line
before believing a red suite in `apps/server`, and when it is the image's
number, prefix the command:

```
PATH=/root/.cache/neon-spore-bun:$PATH bun run check:fast
```

The first is the ordinary case and needs nothing. **The second is the only time
the manual route is the right one** — the registry was unreachable, or the
binary would not run — and it is:

```
npm install bun@latest --prefix /tmp/bun
PATH=/tmp/bun/node_modules/.bin:$PATH bun run land
```

Reach for that when the second line appeared, and not otherwise. A session that
installs a second Bun over a working pin is spending a minute to arrive where it
already was.

**On the owner's own machine the hook fetches nothing and only speaks.** A
local checkout brought its own Bun and nothing here replaces it — but a local
Bun below the pin walks into the same trap with a longer fuse: `bun install`
ignores a lockfile it cannot read and rewrites it, `bun run check:fast` is
green on every test, and `bun run land` dies in the frozen install after the
rebase, naming neither `.bun-version` nor the number. On 14 September 2026 a
lane on a 1.3.8 lost its landing minutes to exactly that. So the comparison
and the advice live in `tools/hooks/bun-pin.ts`, read by both: the hook says
one line at the start of any session whose Bun is below the pin, on stdout so
the session reads it, and `bun run land` refuses on the same comparison
before anything moves, with the two commands through:

```
npm install bun@1.4.2 --prefix ~/.cache/neon-spore-bun
PATH=~/.cache/neon-spore-bun/node_modules/.bin:$PATH bun run land
```

**One version, and it is `.bun-version`.** That file is what the repository is
tested against; `package.json` names it as its package manager, CI installs from
it, the hook pins to it, and `tools/test/bun-version.test.ts` holds all four in
step. The hook used to carry a number of its own — `1.4.2`, against a file
saying `1.4.0`, with no way for either to notice the other. The owner settled it
on 9 September 2026 at **1.4.2**, and the file was raised to meet the hook
rather than the hook lowered to meet the file: a pin says which toolchain this
repository is developed on, not the oldest one that still passes. There is no
second number to raise now.

Nothing refuses to run on a mismatch, so a session on a different Bun is not
stopped — but its green check is a result about a different runtime, and after
the three failures above that is worth a line in the report rather than a shrug.
`bun --version` against the file is the whole check.

**Its servers need a host, and the error if you forget says the wrong thing.**
`preview.ts` and the director both bind `::`, which is right on a machine with
IPv6 and impossible on this one — and what Bun reports is `EADDRINUSE`, so the
first guess is always a stale server holding the port. It is not; nothing is
listening at all. Both already take the way out, so this costs one variable:

```
PREVIEW_HOST=127.0.0.1 bun run preview
DIRECTOR_HOST=127.0.0.1 bun run dev
```

**Its clone is shallow, and `bun run land` deals with that itself now.** A
depth-limited clone is not a shorter history, it is a *different* one: a
`git fetch origin main` brings a second shallow segment down rather than
joining the first, `git merge-base` then answers nothing at all, and
`git rev-list --count` reports `main` and `origin/main` as each ahead of the
other by the depth of the graft — fifty and fifty, in the session that found
this, on a branch whose own base *was* `origin/main`. The trunk guard read that
as fifty commits of real work and refused, and its own advice could not fix it,
because there is no fast-forward to take between two histories that do not
meet. `land` now runs `git fetch --unshallow origin` before it counts anything,
says `deepened` when it did, and says so plainly if it could not.

**Nothing has `main` checked out here, and `bun run reconcile` no longer minds.**
A cloud clone is one checkout standing on its lane branch; the trunk is a ref
beside it. `reconcile` used to ask which worktree held `main`, find none, and
refuse with *check main out somewhere and run this again* — a worktree added by
hand before the command written to save the hand-work would run at all, which
is what a session on 20 September 2026 paid to bring up a trunk that had been
unreconcilable since the 19th. It now does what `note-commit.ts` already did
for its own half of the same problem: where there is no second checkout, the
session's own is the trunk's content. The trunk is checked out detached here,
replayed onto `origin/main`, the ref forced onto what came out, and the lane
put back — on a refusal too, so the session ends standing where it started.
The settled files are then in the trunk's commit, not on disk, because the
working tree is the lane's again. The one refusal left is a **dirty** checkout:
a rebase walks over a tree, and here the files at risk are the session's own.

**Its landed branch stays on `origin`, and that is not a failure.** The git
proxy a cloud session runs behind answers 403 to a branch *deletion*
specifically — an ordinary push of the same branch goes through minutes
earlier. `land` asks once and then says `⚑ <branch> stays on origin`; nothing
is broken by it, because the commits are on `main` and a landed branch is never
revived. Take it out in GitHub when the list gets long. Do not retry the delete:
three attempts produce three copies of the same refusal, ending in git's
`Everything up-to-date`, which is the other half of the command and reads like
success after a landing that already worked.

With one of those up, a headless Chromium reaches further than "the DOM is
there". It can drive the real loop — `window.neonSpore.advance` and `paint`
past a gesture that unlocks audio — and a frame that throws is a frame that
never draws, so a run of a few thousand ticks with no page error is a real
result about the wiring. Still not about how any of it *reads*.

**Several at once is allowed, and is not the shape to reach for first.** Each
cloud session is its own VM with its own clone, so none of this needs a
worktree — the isolation already sits a level above the filesystem, and two
branches in flight are no problem in themselves. What does not parallelise is
the landing. Every branch still has to arrive on a **linear** `main`, one after
another, so three branches are three rebases onto a `main` that moved under all
of them — and the conflict surfaces where the work is expensive rather than
where it was cheap. A session landing its own branch does not change that; it
only moves who does the rebase.

**The ceiling was two, and the owner lifted it on 19 September 2026**: *"So
parallelize. If it's my rule of max 2 cloud sessions, change it. I allow you to
parallelize as many are reasonable on cloud or local."* So: as many as are
reasonable, on
different packages, each naming its branch in the prompt so no two sessions
reach for the same one. What decides *reasonable* is the paragraph above and
the one below rather than a number — the rebases queue, so the cost of one more
session is the conflict surface it adds on `main`, and a lane whose files
nobody else is in costs almost nothing while three lanes in `render/` cost each
other. The queue's own claim is what keeps two sessions off one item
(`bun run queue take`), and it is the mechanism to lean on now that the count
is not capped. Prefer the work the sandbox can actually finish:
`sim`, `content` and `net` are covered by `bun test`, while a wave's timing or
anything in `render` comes back needing an eye here regardless, and running
four of those in parallel only builds a queue in front of the one machine that
can look.

Coming back the other way, `claude --teleport` carries the branch and the
conversation with it. Going out again carries neither: a new cloud session
starts cold, knowing only what `origin` and the commit messages tell it. One
more reason the commit messages here are sentences.

