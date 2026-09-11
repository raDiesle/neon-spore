# Working with Claude on this repo

## The agent needs something to check itself against

Claude stops when the work *looks* finished. Without a check it can run itself,
you are the verification loop and every mistake waits for you to notice. In a
game that is especially awkward: whether a bubble feels right is only visible
on screen.

That is why the sim/render split is not cosmetic. A headless deterministic
simulation can be tested; a canvas cannot.

What stays yours: game feel, glow, timing as an experience. That is the right
division of labour, not a limitation.

## Configuration in this repo

- **`CLAUDE.md`** — loaded into every session, therefore short and stable.
  The import rule, the commands, the conventions. Anything that changes often
  belongs in `docs/`.
- **`.claude/skills/`** — for what is needed occasionally: `new-creature`,
  `new-wave`, `delegate` and `worktree-preview` carry the full procedure, so it
  does not have to be explained.
- **`tools/hooks/`**, wired in `.claude/settings.json` — for what must happen
  without exception. The determinism test runs after every edit inside
  `packages/sim`; `after-compact.ts` restates the tree's state into the fresh
  context after every automatic compaction (`autoCompactWindow`, 200k, in the
  same settings file). A rule in
  CLAUDE.md is a hint; a hook is binding. The one that refuses a command
  outright is `tools/hooks/guard.ts` rather than a shell script, because
  deciding what a command *is* outgrew a glob over its text — a glob matched
  `--amend` against a rule about `--all`, and refused a commit message for
  quoting the form it refuses.
- **Plan mode** — read and plan first, check the plan, then build. It suits the
  way this project has been worked on so far.
- **Subagents** — for searching the codebase, so the main session does not fill
  up with file contents.

## Verification runs against the build, not the dev server

A hot-reloading dev server is the wrong thing to check an agent's work against,
for three reasons that all end the same way — a result reported as verified
that was read off something other than the code just written.

It serves a transform of the source rather than the bundle that ships. It keeps
state across edits, so what is on screen is the sum of several attempts. And it
outlives the turn: nothing in a session ends the process, so the next session
finds port 3000 occupied, quietly takes 3001, and verifies against a server
started days ago. That is not hypothetical — on 2026-08-23 a `bun --hot` from an
earlier session was still holding the port, listening on `::1` only, while
`127.0.0.1` sat free for a second server to bind beside it.

So `bun run preview` builds and serves `apps/game/dist`. The build costs about
ten milliseconds, which is the whole argument: there is no speed to trade away.

The guarantee is in the server, not in the instruction. `apps/game/preview.ts`
holds a fixed port and probes both loopback families before binding; if an older
preview answers it asks it to quit, and if a stranger answers it stops with an
error rather than killing a process it cannot identify. It exits by itself after
30 seconds without a request, so even a preview that escapes the session
cleans itself up. `.claude/launch.json` offers this and nothing else, which
leaves `bun run dev` where it belongs — with a person watching hot reload.

*Amended 2026-08-24:* that fixed port was 3000 — the same one `bun --hot` takes
by default — and the refusal to kill a stranger turned it into the failure it
was written to prevent. A session that found a person's dev server on 3000 got a
preview that would not start, and then measured the dev server anyway: a browser
check handed a URL has no way of noticing which server answered. The stranger
check worked exactly as designed and still yielded a verified result off the
wrong bundle.

Two ports now, so the collision is impossible rather than merely detected:
`dev:game` is pinned to 3000, `preview` sits on 4173. (`dev` itself now
launches the director, on its own port, 4174 — unrelated to this collision,
which is specifically about the game's hot server and its built preview.) A
preview that fails to start leaves an empty port behind, and an empty port
cannot be mistaken for a passing check.

`/__preview` answers `{"app":"neon-spore-preview"}` and settles who replied — a
dev server hands back `index.html` for every unknown path, so a 200 is not
evidence of anything. `bun run preview:once` binds an OS-assigned free port for a
throwaway check or a second worktree; several can run side by side.

**The preview exits when nothing has asked it anything for ten minutes**, and
its startup line says so. That window was thirty seconds, which is shorter than
one turn: a lane took a picture, edited a file, asked for the page again and got
`curl` exit 7 — reported by a browser as a navigation *denied*, so it reads as a
permission problem rather than as nothing listening. Three times in one sitting,
a launch and a rebuild each. Every request resets the clock, `PREVIEW_IDLE_MS`
moves it, and the point of having one at all is that a leaked server dies
without anybody remembering it.

*Amended 2026-09-06:* three rules moved down here from `CLAUDE.md`, which had
run out of room, and each of them is the same lesson as everything above.

**In a worktree, `.claude/launch.json` is the wrong tool.** Its entries carry no
`cwd`, so a preview started from it runs in the *main* checkout and serves
main's code — and nothing errors, which is the whole problem. The server is
real, the page loads, and the lane under test is not what answered. Launch by
absolute path inside your own tree, and ask `/__preview` who replied.

**Nothing on a local address installs a service worker.** A cache that answers
after the server has idled out serves a build that no longer exists, and the
stale page reads as a bug in the code that just replaced it — which is exactly
how it was found. `?pwa=1` turns one on locally for the one case that wants it,
testing the install itself, and `apps/game/test/solo-is-quiet.test.ts` holds the
rule.

**Playing alone opens no socket.** The two-device layer is built on every run
because solo is the default rather than a mode, and it is inert until a room is
joined — no ping, no fingerprint, not even a status callback. The same test
holds that, because "inert" is a claim that stays true in the reading and stops
being true the moment a timer moves above the check for a socket.

*Amended 2026-09-06:* the same question — *who answered?* — decides a failure
that looks nothing like a server. A fresh worktree on Windows had no
`tools/maze/node_modules` at all, so `bun run typecheck` stopped with *Cannot
find module `@neon-spore/sim`* pointing at `tools/maze/run.ts`, a file the lane
had not touched and whose package it had never heard of. Running `bun install`
from the agent's Bash tool did not fix it and did not complain either: MSYS
writes the workspace symlink with a POSIX target (`/c/Users/…`), which Bun
resolves happily and the Windows `tsc` cannot follow at all, so the identical
error came back and read as a fault in the code. `bun install --force` from
PowerShell wrote a real junction and the typecheck went green. The rule is the
one this section keeps arriving at from different directions: a red result is
evidence about whichever tool produced it, and a link written by one shell for
another is the same class of thing as a port answered by the wrong server.
`CLAUDE.md` says *from a native shell* beside the install it already asks for.

*Amended 2026-09-09:* and the question is now asked before `tsc` gets to answer
it wrongly. `bun run check` opens with `tools/check/run.ts`, which walks the
workspace globs and asks, for every edge of the dependency graph, whether the
consumer's own `node_modules` has a link for it — that is where Bun puts one,
not the repository root. A missing link is a line naming the package that needs
it and the name it needs, and the check stops there. What it fixes is not the
fresh worktree, which `CLAUDE.md` already covers, but the **existing** one: it
was installed correctly, `main` then gained a package or an edge, and nothing
said so until eight `Cannot find module` errors arrived in files the lane had
never opened. The command the refusal names is `bun install --force`, and the
`--force` is not caution: on 9 September 2026 a worktree in exactly this state
answered a plain `bun install` with *Checked 76 installs across 151 packages
(no changes)* and wrote nothing, because the lockfile was satisfied and Bun
does not re-check that the links it once wrote are still there. Only `--force`
put the junctions back; the plain install is the second round of the same
error, spelled as a success.

*Amended 2026-09-05:* the other half of the same trap is the **index**, and
`.gitattributes` cannot reach it. `eol=lf` governs what a checkout writes; a
blob committed with carriage returns before the attribute landed stays CRLF,
and every clone from then on writes that file out exactly as stored. One
worktree got `CLAUDE.md` and `.claude/settings.json` that way while every other
file in the same checkout arrived LF, and `bun run check` went red on the first
command of the lane — on `CLAUDE.md`'s size ceiling, which the 387 extra
carriage returns pushed over, so the failure named the wrong cause entirely.
The index is clean now and `tools/test/line-endings.test.ts` keeps it that way,
naming `git add --renormalize .` as the fix rather than leaving it to be
rediscovered. It reads the index only: the working tree's endings are the
harness's business, per the note above.

*Amended 2026-09-04:* `.claude/launch.json` is not the repository's file to
format, and biome no longer looks at it. The desktop harness rewrites it
whenever it opens a worktree, and writes CRLF; `.gitattributes` already pins
every file to LF and git therefore checks it out correctly, so what is being
fought is the harness rather than a contributor's `core.autocrlf`. The symptom
is a landing that stops with "Formatter would have printed the following
content" and thirty-three lines of identical JSON differing only in `␍` — for a
file nobody edited, in a tree `git status` calls clean. The file is the
harness's, so the repository stopped having an opinion about its line endings.

*Amended 2026-09-03:* a worktree does **not** get its own port as a matter of
course, and for a while both this file's neighbour and `CLAUDE.md` said it did.
`claimPort` tries the base port first, always — 4173 for the preview, 4174 for
the director — because a single server in a single tree should answer where
every document, launch config and `curl` line says it does. The tree's derived
port is a *fallback*, taken only when the base is already held by the same
server serving a different checkout. So a director started in an otherwise idle
worktree announces `http://localhost:4174`, which the old rule said could not
happen; a session that believed the old rule probed the derived port, got
nothing, and twice concluded its own server had failed to start before anybody
read the log. The advice that survives is the one that was always right: read
the port out of the server's own startup line, which prints the number and the
tree together. The relay is the exception that proves it — wrangler answers no
marker, so `claimPort` is no use and `relayPort` derives unconditionally.

*Amended 2026-09-09:* **a `:once` server takes neither candidate**, and
`bun run port` now says so and then says which. `bun run dev:once` and
`bun run preview:once` set their port variable to `0`, meaning *any free port* —
58200 in the session that filed this, on a tree whose listing said 4174. Both
statements were true and only one of them was about a running server, so three
`curl: (7)`s later the conclusion was that nothing had started. It is worse than
a wrong number because of where the right one is: printed once, on the
supervisor's own stdout, which a session reading it with `| head -30` never
sees. So a server on a port nothing can derive writes the number and its pid
into `.claude/tmp/` (`tools/running.ts`), removes it on the way out, and
`bun run port` reports **what is running** in place of the two candidates. The
pid is the liveness check: a server killed outright leaves its file behind, and
naming a port nothing answers on is this same failure from the other side.

*Amended 2026-09-07:* and there is a command for it now, because "read it off
the startup line" answers a session that has already started a server and not
one that has to write the number down *first*.

```
bun run port            # all three
bun run port director   # one of them
```

It prints both candidates for each server, the one that will answer, and why —
the base is probed with `holderOf`, which is `claimPort`'s own question asked
without acting on the answer, so nothing is started, retired or moved. The
numbers come from `tools/servers.ts`, which is where the base, the band, the
marker and the two paths of each server now live; both servers claim with that
table rather than with a copy of it.

What it ends is a **throwaway `.claude/launch.json` entry**, which is what a
session in a worktree kept hand-writing to look at its own director: a fifth
configuration carrying an absolute `--cwd` and a guessed port. That file is
tracked, so a forgotten revert lands a lane-specific entry on `main` — it
happened twice in one afternoon, two turns each. The launch entries are the
main checkout's and they have no `cwd`; a worktree starts its own server from
its own root instead —

```
bun run dev                       # from the worktree's root, not by name
bun run port director             # the URL to hand over
curl -s http://localhost:<port>/__director
```

— and if a launch entry really is wanted anyway, it is written, used and taken
straight back out with `git checkout .claude/launch.json` in the same turn.

*Added 2026-09-07:* **a throwaway script that needs a live world goes in
`tools/probe/`**, and `bun run probe` runs it.

"Where is this creature on beat 13 of THE COIL" is ten lines that step a world
and print the field, and it had nowhere to live. A file in a session's scratch
directory cannot resolve `@neon-spore/sim` at all — it is outside the workspace,
and a module's imports are resolved from where the module *is*, so no way of
running it helps. A file under `tools/frames/` cannot either: that package does
not declare the dependency and should not. What worked was a file dropped inside
`packages/render/`, which happens to depend on both `sim` and `content` — found
by trying three places, left behind afterwards, and every session that needed a
number off a running world paid the same three tries.

```
bun run probe                      # the worked example, and the thing to copy
bun run probe scratch/<name>       # a throwaway of your own
```

`tools/probe/` depends on all five packages — `sim`, `content`, `render`, `net`
and `audio` — so that no probe is ever the wrong shape for the place it has to
live in; `world.ts` has the three helpers a probe is written on
(`waveWorld` by **id**, `beats`, `field`);
`scratch/` is git-ignored, so a probe left behind is neither committed nor in
anybody's way. It is a rig and not a test: a question worth asking twice is a
test in the package that owns the answer.

## A hot server and a tree that moved

*Added 2026-09-03.* A hot bundler reloads the module whose file changed, which
is exactly right while a person is saving one file at a time and exactly wrong
the moment git rewrites two hundred of them. A pull, a rebase, a `land` from
another worktree or a plain `git checkout -- <paths>` takes a second or two to
write the tree; the bundler starts on the first file and finishes against a
tree that has moved underneath it. The incremental graph it caches from that
build is half of each revision, and it stays cached — the page reloads and
throws on a name its neighbour no longer exports, and every edit afterwards
rebuilds the same poisoned graph.

Measured, not guessed: after one bulk checkout the served bundle referenced
`CREATURE_DRAFTS` twice and defined it nowhere, while a server started fresh on
the identical tree bundled it correctly, twelve kilobytes larger. Only a new
process cured it, which is why "I restarted it and then it was fine" was the
only advice anybody had.

So `bun run dev`, `dev:once` and `dev:game` run their hot server as a child of
`tools/dev/supervise.ts`. It watches the checkout's own git directory — a
worktree's, not the main one's — and when `index` or one of the heads settles,
with `index.lock` gone and the tree quiet for 800 ms, it restarts the child
once. Ordinary editing never reaches it, so hot reload is untouched for the
case it is good at; the open page needs no help either, because the dev client
reconnects to the new server and reloads itself. `NO_DEV_RESTART=1` runs the
child bare.

## Parameters, not shouting

Not "make the bubble softer" but named values — stiffness, damping, elongation,
wobble, restitution — and a comparison screen where several versions run side
by side with *identical* input. The agent produces variants; you pick.

## Model choice

There is none: the owner works on Opus 5 only. Delegation to the worker model
is measured, not assumed: building the same module twice found delegating cost
6.8 times as much. See `docs/delegation-cost.md` for the figures and when
delegation still pays for itself.

## Several tasks in one session: NEXT: and STOP

The owner works one session at a time, tasks in sequence, and on 10 September
2026 asked for a way to hand a session independent tasks that queue up rather
than interrupt. Three shapes, from cheapest up.

**A numbered list in one prompt.** The tasks are independent and are worked in
the order given; each is finished, checked, committed and landed onto the
local `main` (`bun run land --keep`) with one line of report before the next
begins. The session does not stop to ask between tasks. A task that turns out
to need a decision from the owner is written into `docs/parked.md` with the
question and the next task starts — a list that stalls on its first fork is
not a queue.

**A message typed while the session works.** It is delivered at the next tool
boundary, in the middle of whatever is being done, and without a rule it reads
as a correction to that work. So it is read by its first word:

- `NEXT:` — a new task, appended to the list for after the current one. It
  changes nothing about the task in hand.
- `STOP` — applies now: stop, read the rest of the message, act on it.
- no prefix — ambiguous; the session asks whether it is a change to the
  current task or a new one, before acting on it.

**More than a handful, unattended.** That is `docs/queue.md`: the owner writes
the entries and says to drain the queue; `bun run queue next` claims, branches
and reports, and the session runs to the end without prompting him.

The reason each task lands before the next is the one `docs/token-budget.md`
gives: the session is one long conversation compacted automatically, and a
compaction that falls mid-task loses the half that was only in the chat.

## Git

Landing is one command: `bun run land`, run from inside the lane's worktree.
It rebases onto `main`, runs `bun run check` on the result, fast-forwards, and
cleans up after itself. `CLAUDE.md` has the full mechanics.

## What a session pays for, and it is not the running

A command's *runtime* costs nothing but wall clock. What costs is the output
coming back into the conversation, because everything already there is re-sent
on every turn after — a two-thousand-token failure dump read early in a long
session is paid dozens of times, not once.

So:

- **Filter at the shell, not by reading.** `bun run check 2>&1 | tail -20`,
  `bun test 2>&1 | grep -E "\(fail\)"`. A passing run is five lines; a failing
  one prints an assertion, a diff, a source excerpt and a stack per failure, and
  hunting through that unfiltered is where test tokens actually go.
- **A long run goes to a file and only its failing part is read.** Backgrounding
  it and reading the tail is half the trick; the other half is grepping the file
  for the test *names* rather than re-running to find them.
- **Pictures are the expensive read.** An image costs roughly `width × height /
  750` tokens — six hundred to sixteen hundred for a crop worth looking at — and
  it stays in context afterwards. One picture at the end beats ten during
  iteration, and `bun run frames --at x,y,w,h` crops before it costs anything.
  `bun run shapes:report` answers most shape questions in numbers instead
  (`CLAUDE.md` says to reach for it first, and this is the second reason).

## House style for changes

- Touch only what changed. Do not regenerate whole files.
- Bundle change requests rather than sending them one at a time.
