# Where a session's time goes

Rough statistics, kept over days, so the bottlenecks in ordinary work become
visible. The owner asked for this on 10 September 2026: *"tasks take a lot of
time, I like to know the bottlenecks."*

**One `##` entry per lane**, written in the commit that lands it, with the
minutes read off commit timestamps, file modification times and the tools'
own durations — never instrumented, and rounded to five. The point is the
shape of the distribution across sessions, not precision. The rows are the
same every time so they can be compared:

- **reading** — finding the seam: the queue entry, the files it names, the
  pattern the last lane used, the docs.
- **writing** — code, tests, comments, candidates.
- **looking** — seeing the result: `versus:shot`, `bun run frames`, the
  browser pane, and the correcting that follows a picture.
- **friction** — commands that failed, hung or answered the wrong thing and
  had to be worked around or fixed before the work could go on.
- **landing** — `check:fast`, the commit, `bun run land`, and every rebase
  conflict or red full check between the first attempt and the trunk moving.

End each entry with the one bottleneck, in a sentence.

## 2026-09-11 · hit-looks — THE CRYSTAL

THE CRYSTAL built off the bestiary's Crystal: a red slick and a cyan bulb joined at a thin middle under one shell, crossing on the carom's diagonal, opened only by the shield under the middle and the guard armed on the beat the shot of the join's colour lands; a wave, a guide film, three sounds, the director's rows. About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the carom and clasp files end to end, the scene format, the audio binding tables, the file-limit list, the director's brush and ship tables |
| writing | 30 | config-crystal, crystal.ts in sim and render, events, the joined creatures file, the wave, the scene, the bindings, thirteen sim tests and a frame test, the bestiary |
| looking | 10 | six bun run frames pictures — the shell's waist too shallow at first, then the link drawn under the gliding body instead of in the shield's lane |
| friction | 5 | a heredoc turned an escaped newline into a real one and broke the edit script; two files landed on 251 lines and each lost a comment line |
| landing | 10 | two check:fast rounds fixing the twelve tests that name every kind, the commit, land --keep |

Bottleneck: writing — a creature touches forty files across four packages and the director before it can be drawn once, and every one of them is a row in a table a test reads

## 2026-09-11 · hit-looks — THE TELL removed

The boss round THE TELL and everything that hung off it — sim ladder and ring, render body and scenes, the reduced panel, the guide scene, wave 60, the director's rows, the perf baseline row — taken out; the design stays on the BOSSES page as a removed idea.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 20 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Finding every dependency of a round when 'tell' is also an ordinary English word and the Bulb Queen's own field name.

## 2026-09-11 · hit-looks — creature:rind kept, three sheds to the LIBRARY

The owner kept the shipped shed and asked for the VERSUS alternatives on the GRAPHICS page: FLAKES, POD and SLOUGH moved into packages/render beside their record, the slot dropped by hand, and a rind card built that replays the shed on the game's own burr.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Catching a half-second event on a card with a fixed-wait shot took five shots; the page clock does not start at the click.

## 2026-09-11 · hit-looks — creature:recoil — GLOBE into the game, three cages kept

Copied MOONS, FOAM and CALYX into render for the LIBRARY, adopted GLOBE with the tool, built a recoil card that spends its ribs, let two creatures share a label on the LIBRARY.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Two slots had spelled a look FOAM, and the LIBRARY test wanted labels unique across the whole page; a label is now unique under its creature.

## 2026-09-11 · hit-looks — creature:queen — SCUTES into the game, CARAPACE and FACET kept

Copied CARAPACE and FACET into render for the LIBRARY, adopted SCUTES with the tool, built a queen card that hands her contour straight to a look, remeasured the BULB QUEEN's op-count rows.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 10 | friction |
| landing | 5 | landing |

Bottleneck: A Bash heredoc holding three files failed to parse and had to be redone through the Write tool; then the op-count budget wanted the seven plates measured.

## 2026-09-11 · hit-looks — creature:mount — TAPROOT into the game, RASP kept

Moved the rooted rim into content so a package could draw it, took TAPROOT and RASP by hand, broke the record–look import cycle with mount-bearing.ts, built a mount card with a hub to face, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Both candidates imported tools/shape-sheet, which a package cannot; the rim had to move into content first and the adopt tool could not do the slot.

## 2026-09-11 · hit-looks — creature:magnet — ORE into the game, the rest gone

Adopted ORE with the tool, cut COIL's dead arch out of magnet-coil.ts and retitled it as the slab and poles ORE draws over, photographed THE MAGNET.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Cutting the dead horseshoe: the slab shares the bevel with the arch, and the first cut took it too.

## 2026-09-11 · hit-looks — creature:lid — IRIS into the game, BEVEL kept, SHAPES renamed GRAPHICS

Adopted IRIS with the tool after copying BEVEL and the old plates into render for the LIBRARY, built the lid stage that pulls the cord on a card, renamed the tab with SHAPES kept as a synonym for the shot tool, remeasured THE LID's op-count row.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: The op-count budget: six leaves cost more fills and gradients than two plates, and the row had to be remeasured in MEASURE mode and moved before check:fast went green.

## 2026-09-11 · hit-looks — creature:veer — the rider's collar stays on the rock

Read the rider's geometry, found the 'hands' are the ruff beads sinking with the crouch, pinned them to the rock's crown, photographed the brace before and after, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 5 | writing |
| looking | 15 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Catching the brace on a frame: the first two photographs were of a rock in a row that does not brace, and a probe had to say which tick to shoot.

## 2026-09-11 · hit-looks — creature:veil — ANVIL kept and thinned over the body, three clouds kept

Moved FOAM, STRATA and VORTEX into packages/render, thinned the see-through cloud until the slick reads, built a veil stage and four cards, photographed the field and the LIBRARY, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 0 | friction |
| landing | 10 | landing |

Bottleneck: Finding how much cloud to leave on player 1's screen took three frames: the near heaps are dark on dark and hardly show at game size, so the visible change is mostly the base fill going.

## 2026-09-11 · hit-looks — creature:volley — EMBER into the game, PITTED and the painted seams kept

Moved EMBER's seams into the record and PITTED beside it, built a volley stage that walks the plate count down on a card, photographed the LIBRARY and the field, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Dropping a decided slot also drops its versus-pose row, and one test reached the pose through that row — it now names the pose directly.

## 2026-09-11 · hit-looks — creature:warden — SURFACE stays, three kept on the LIBRARY

Read the three candidates and the warden record, moved their paints into packages/render beside the record, built a warden stage for the LIBRARY from the game's own body and state, photographed the cards, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Photographing the LIBRARY: the browser pane cannot save a PNG and `bun run shot` needed the right flags (`--tab` opens the sheet itself; `--click` takes a CSS selector, not a Playwright one) — found by three failed runs.

## 2026-09-11 · hit-looks — the wisp wears ARMS, and SHAPES gets a LIBRARY

The owner took ARMS into the game and asked for the threads it replaced, COMB and SKIRT, to be kept on the SHAPES page because he wants more jellyfish-like bodies. The page had no place for a whole canvas-drawn look, so it got one: a fourth view, LIBRARY, whose cards are the game's own drawing code run on the game's own wisp (`tools/director/src/library`). ARMS was inline in its candidate and went in by hand; THE WISP's op-count rows moved.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the candidate, `wisp-look.ts`, the SHAPES views, the holders panel's loop |
| writing | 25 | `wisp-arms.ts`, the library's types, stage, four assets, panel, VIEW button, test |
| looking | 10 | the LIBRARY in the director twice, one frame of THE WISP |
| friction | 5 | a canvas that is 300 wide by default hid a missing height; one heredoc too long for the shell |
| landing | 5 | check:fast, budget rows, commit, land |

Bottleneck: There was no place on the SHAPES page for a canvas-drawn look, and building one was most of the piece.

## 2026-09-11 · hit-looks — the back decided: the sea stays, one light in the corner, the beat's sweep off

The owner kept the shipped back and dropped `field:backdrop`; what he kept of NEBULA is one soft rounded light of the act's tint in the sky's bottom-right corner (`corner-light.ts`, additive like the shafts), and the beat's travelling band across the field is off for the moment, its function kept and exported with a note on how to put it back. Every op-count budget moved by the one `drawImage` a frame the light costs.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three candidates, `backdrop-look.ts`, `field.ts`'s sweep, the budget files |
| writing | 10 | `corner-light.ts`, the record's new order, the sweep's note |
| looking | 10 | three frames of THE RIND — the first two too faint to see over the violet ground |
| friction | 5 | twenty-two budget rows and the baked count moved by one |
| landing | 5 | check:fast, commit, land |

Bottleneck: A light of an act's tint laid over the ground is invisible until it is added instead, which took two pictures to see.

## 2026-09-11 · hit-looks — the rind decided: BURR

The owner picked BURR for `rind:body`. `bun run versus adopt` moved the candidate into render, but it imported the shape sheet's `studded` form by a relative path, which a package may not do; the arithmetic moved into `packages/content/src/studded.ts` and the sheet's form became a wrapper round it, the move `metaball.ts` and `body-path.ts` made before.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the adopt tool's output and the candidate's imports |
| writing | 10 | `content/studded.ts`, the sheet's wrapper, the render import |
| looking | 5 | one frame of THE RIND, cropped |
| friction | 5 | the moved file's relative import broke the typecheck; the crop tool's argument shape |
| landing | 5 | check:fast, commit, land |

Bottleneck: The adopt tool moves a file without rewriting a relative import into a tool, which cost a typecheck round.

## 2026-09-11 · hit-looks — the crater decided

The owner keeps the crater as shipped; the slot closed with nothing taken. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | nothing — the decision came in chat |
| writing | 0 | nothing |
| looking | 0 | nothing |
| friction | 0 | none |
| landing | 5 | `versus drop`, `check:fast`, the commit, `land --keep` |

Bottleneck: **landing** — there was nothing else.

## 2026-09-11 · hit-looks — the ship's body, three cards from the brief

The owner named what he wanted from three of the six ships rather than one of
them; those three went and three new cards stand in their place, built on a
wet grain-free skin, buttons grown as organs, and PLASM's bubbles and strings.
About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the three cards he judged, `join.ts`, `sheen.ts`, the band's draw order, the record types, the versus tests that hold a slot to one shape |
| writing | 35 | `wet.ts`, `organ.ts`, `cord.ts`, `fluid.ts`, three candidates, the DECIDED entry |
| looking | 10 | five `versus:shot` pictures: ribs beading at the rim, veins as a sea urchin twice before they read as vessels |
| friction | 5 | two long heredocs died in bash and were written through a script file; `organ.ts` over 250 lines, the cords moved to `cord.ts` |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a brief that takes one thing from each of three
cards is three shared modules before any card can be drawn.

## 2026-09-11 · hit-looks — DOCUMENTATION → WORDINGS

A new tab: two whole phones, the pilot's and the navigator's, each a real
frame with a line from every word to the thing it names, and the words with
no place to point at under them. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the sheet's tab wiring, `pose-art.ts`, `layout.ts`, the band, lobe, siren, HUD and radar files for what each thing is called and where it stands |
| writing | 30 | the world, the callouts, the page with its label stacking, the glossary, the CSS, the test, three render exports |
| looking | 15 | two `bun run shot` rounds: labels piling up at the top of one margin, both lobe leaders on one line, the blip under the torch's alarm |
| friction | 5 | a `cat` left waiting on stdin; `bun run dev` is refused to an agent, so the director was launched by absolute path on its own port |
| landing | 5 | `main.ts` over 250 lines after one more binding — the five room bindings moved to `documentation-rooms.ts` |

Bottleneck: **writing** — laying labels beside a picture without them
piling up took a measured two-pass stack rather than a guessed one.

## 2026-09-11 · hit-looks — the torch decided

The owner keeps the torch as shipped: both torch slots dropped, the stale
queue claim closed, the branch that only ever existed as a local ref deleted.
About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | where the claimed branch lived (a local ref in the main checkout, tip already on `main`, no worktree), the two torch slots |
| writing | 0 | — |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | `versus drop` twice, `queue done`, the tests, the commit, `land --keep` |

Bottleneck: **reading** — a `Taken:` line names a branch, not where the
branch lives, so the owner could not tell a finished claim from a lost one.

## 2026-09-11 · hit-looks — the queue: the pose map's stale rows

Nineteen rows for closed slots out of `versus-pose.ts`; `adopt` and `drop`
take a slot's row with it, and the director's test refuses a row whose slot
has no candidate. On the way, two room tests that raced under a full check.
About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `versus-pose.ts`, its test, `decide.ts`; then `room.test.ts`, `settle`, `occupiedSeats` and `pressStart` for the flakes |
| writing | 15 | `pose-row.ts` and its test, the row test, the cannon tests moved onto the pose by name, `docs/versus.md`; the two room tests |
| looking | 0 | — |
| friction | 5 | the Bash tool collapses a doubled backslash inside quoted heredocs and `node -e`, so a script that matched source text never matched — the edits went through the editor tool |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **friction** — two red `land` runs on room tests unrelated to
the lane, each a full `check` to find out.

## 2026-09-11 · hit-looks — the queue: a claim on the lane's own entry

`bun run queue take` marks an entry the trunk has not got in the working
copy instead of throwing, and a claim that fails to mark deletes the branch
it made; `repo.ts` split along its git seam into `git.ts`. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `claim.ts`, `repo.ts`, `run.ts`, `edit.ts`, the two existing tests |
| writing | 15 | `trunkHas`, the working-copy branch of `claim`, the rollback, `hasEntry`, a test repository shaped like the lane, the preamble paragraph |
| looking | 0 | — |
| friction | 0 | one assertion compared against an untrimmed `git status` line |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — the fix is ten lines and the test that proves it
in a real repository is a hundred.


## 2026-09-11 · hit-looks — the queue: shipped-looks caught up

Four sections written into `docs/shipped-looks.md` — the chute, the coil, the
dart and the echo — from the four `*-look.ts` records, the adopted paint and
`DECIDED.md`, in the file's own table form. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the file's 400 lines for its form, eight render files and four DECIDED entries for the numbers |
| writing | 10 | four tables and the paragraph under each |
| looking | 0 | nothing visible moved |
| friction | 0 | a long heredoc died in bash again — the sections were written with the tool and spliced in with awk |
| landing | 5 | `queue done`, the commit, `land --keep` |

Bottleneck: **reading** — every number in a table is in a different file
from the one that says why it is there.


## 2026-09-11 · hit-looks — the gyre slot answered

ORBIT into the game; the granules it replaced, HELIX and VORTEX all
re-authored as fillings on the SHAPES page, ORBIT beside them as the
control. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three gyre candidates and `gyre-core.ts` |
| writing | 15 | the adoption, the core stripped to its shared parts, four fillings and two helpers in `fillings/parts.ts` |
| looking | 5 | `versus:shot` before; one card each after, the helix opened up on the second look |
| friction | 0 | — |
| landing | 5 | the gyre budget rows remeasured, `check:fast` |

Bottleneck: none worth the name — the ghost lane an hour earlier had already
built the path, and this one walked it.

## 2026-09-11 · hit-looks — the ghost slot answered

SWARM into the game, the eyes made to read at the field's size, HOLLOW and
LANTERN re-authored as fillings on the SHAPES page. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three ghost candidates, `ghost-eyes.ts`, `ghost.ts`, the fillings axis and its helpers |
| writing | 10 | the adoption, the eye numbers, two fillings, the record clean-up |
| looking | 10 | `versus:shot` before, `frames . --wave` after at 8x; two rounds on each filling card |
| friction | 5 | `land` refused yesterday's lane over two parked titles a few characters past eighty |
| landing | 5 | the ghost budget rows remeasured, `check:fast` |

Bottleneck: once a slot is closed nothing shows the shipped look on its own —
`versus:shot` needs a candidate — so the eyes were checked by cropping a
wave frame, which is fine for the ghost and blind for a body that moves.

## 2026-09-10 · hit-looks — five creature slots answered

Five VERSUS slots taken into the game from one chat message, the looks he
wanted kept re-authored on the SHAPES page (three tails, two skins, one hit),
two op-count budgets remeasured. About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/versus.md`, the five slots' candidates, the tails/skins/hits registries |
| writing | 15 | four adoptions by tool and one by hand, six SHAPES entries, the record clean-ups |
| looking | 10 | `shapes:still` grew `tail:`, `tails`, `hit:` so the six could be seen; three rounds each |
| friction | 5 | `queue take` cannot claim an entry only in the lane's tree; a heredoc that swallowed three files |
| landing | 10 | two budget tables moved, `check:fast`, `land` |

Bottleneck: the SHAPES page had no terminal path to a tail or a hit, so half
the looking time went into building one before anything could be looked at.

## 2026-09-10 · claude/band-slot-after-ship-body

One question put to the owner and his answer written into the band's queue
entry, which now waits on `ship:body` instead of asking. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | the entry, re-filed as a task |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 0 | folded into the next landing's check |

Bottleneck: none worth naming.

## 2026-09-10 · claude/compaction-window-and-hook

The auto-compaction window set to 300k in `.claude/settings.json`, compact
instructions at the end of `CLAUDE.md`, and a `SessionStart(compact)` hook
that restates branch, queue and parked into the fresh context. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the Claude Code docs for the setting's real name, the existing hooks and their wiring test, the queue parser |
| writing | 10 | the hook, its test, the settings, the instructions, two docs |
| looking | 0 | nothing visible moved |
| friction | 5 | one combined command hung for two minutes and was re-run as separate steps |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — a setting's name has to come from the docs, not
from memory, before it can be written into a file every session reads.

## 2026-09-10 · claude/next-and-stop-in-chat

The convention for handing a session several independent tasks — a numbered
list worked in order, `NEXT:` to queue a task mid-turn, `STOP` to interrupt —
written into `CLAUDE.md` and `docs/working-with-claude.md`. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | one bullet, one section |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475 (second landing)

`docs/choosing-a-model.md` removed with its three pointers, and
`docs/token-budget.md` rewritten for the way the work is actually done: one
session on Opus 5, tasks in sequence, compaction at about 300k. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three files that pointed at the doc, the sessions memory |
| writing | 5 | the doc, three pointers, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** to speak of — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475

`CLAUDE.md` cut from 21.3 KB to 13.3 KB, a paragraph's headroom from its
ceiling, after the owner asked how to spend fewer tokens: the justifications
went back to the docs that already held them, the rarely-run scripts to a new
`docs/commands.md`, and the ceiling came down to 16 KB. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `CLAUDE.md` whole, `claude-md.test.ts`, the time log, `token-budget.md`, and each receiving doc to be sure it held what was being cut |
| writing | 10 | the file rewritten, `docs/commands.md`, two tests, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — checking that every sentence removed already lived
somewhere else, which is the only thing that makes removing it safe.

## 2026-09-10 · claude/queue-what-a-hit-on-a-slick-or-a-bulb-looks-like-is-sh

A hit record per kind, the transient that draws it, two poses, and six
candidates — three strikes for the slick and three for the bulb. About
50 min from the claim to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `body-interior.ts`, `debris.ts`, `effects-break.ts`, `effects-spark.ts`, the recoil lane's candidate shape, the break pose |
| writing | 15 | `body-hit.ts`, `body-strike.ts`, the debris and sparks routed through it, a test, `poses-struck.ts`, six paints and six cards |
| looking | 20 | twenty `versus:shot` runs at eight seconds each, and what each picture asked for — petals too small, a drip drawn as a disc, spores lost in the wedges, a wave four columns wide |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking**, again — but a shot is eight seconds now rather than
two minutes, so the cost was the number of corrections rather than the wait
for each, which is the right cost to be paying.

## 2026-09-10 · claude/queue-the-players-ship-has-had-one-hull-since-the-game

Two queue entries checked against what `main` already carries: the hull
entry was answered by `ship:body`, and the band entry cannot open while that
slot holds its fields. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue, `docs/versus.md`, `DECIDED.md`, `bun run versus`'s field lists, the five `ship:body` commit messages |
| writing | 5 | one entry removed, one re-filed with an `Asks:` line |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entries were written before `ship:body`
existed, so most of the lane was establishing that it is the answer to one
of them and the block on the other.

## 2026-09-10 · claude/queue-the-rind-and-the-lid-have-one-look-each-and-no-r

Three sheds and three bodies for THE RIND, three armours for THE LID, a hand
on the pose, and a pair that dropped half its events. About 2 h 35 min from
the first command to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue, `docs/versus.md`, the throb/crawler lane's shape, `rind-shed.ts`, `lid.ts`, the pose kit |
| writing | 50 | two look records and their shipped paint, `Pose.hand` and two poses, six candidates, then the `rind:body` seam and three more at the owner's asking |
| looking | 55 | fourteen `versus:shot` runs at two to three minutes each, reading each picture, and the tuning it asked for — POD's swing, IRIS's seam, FLAKES' colour, FACET's depth |
| friction | 20 | `--at` came back as prose (a wrong rectangle, read as a bug); the browser pane's screenshots timed out on the pair; no way to magnify a PNG already taken, so a throwaway script |
| landing | 15 | `check:fast` red on a file one line over; first `land` refused on four conflicts with thirteen commits landed meanwhile; second red on `docs/INDEX.md` rows; third landed |

Bottleneck: **looking**. A picture of one candidate costs two to three minutes
of director start-up and browser, and a candidate needs two or three pictures
before it is right — more than a third of the lane was waiting for
screenshots. The pair's own frame rate is not the cost; the start-up is.

## 2026-09-10 · claude/queue-bun-run-check-is-red-on-main-a-claim-the-shapes

A test that was green on Windows and red on Linux by the last digit of a
float, settled by saying what the sheet actually does. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `candidates.test.ts`, `drawn-size.ts`, `shape-fit.ts`, `drawn-size.test.ts`'s premise, the git log around dce50590 |
| writing | 5 | the two cases in `candidates.test.ts` and a paragraph in `drawn-size.ts` |
| looking | 0 | nothing visible moved |
| friction | 5 | the failure would not reproduce here — a scratch script at the root could not import `@neon-spore/content` and had to move inside the package |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entry named a red test that is green on this
machine, so most of the lane went into proving the diagnosis before the
three-line fix could be trusted.

## 2026-09-10 · claude/queue-bun-run-queue-take-cannot-write-its-taken-line-i

A claim written onto `main` in a clone that has nothing checked out on it.
About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `claim.ts`, `repo.ts`, `run.ts`, how `land` writes a note in a clone (`note-commit.ts`) and how it merges `docs/queue.md` (`queue-merge.ts`) |
| writing | 15 | `commitOnRef` through git plumbing, its clone-shaped test, two paragraphs of docs |
| looking | 0 | nothing visible moved |
| friction | 5 | a regex written through `sed` lost its backslashes twice; the third time it went through Python |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — deciding between the entry's two options took
finding that the landing already resolves the conflict the first one would
cause, which was in a file the entry did not name.

## 2026-09-10 · claude/queue-versus-pose-ts-is-at-the-line-ceiling-and-every

`SLOT_POSE` cut down to rows, each slot's reason moved onto the pose it names,
and a test that keeps the paragraphs from growing back. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `versus-pose.ts`, every `poses-*.ts` docstring the map pointed at, `limits.test.ts`, the scaffold's step four |
| writing | 10 | the rows-only map, one sentence on each of twenty poses, the test, the scaffold's wording |
| looking | 0 | nothing visible moved |
| friction | 5 | a heredoc that would not close on a quote inside the prose, moved to a script file; two escaped newlines the test file lost on the way in |
| landing | 5 | the director and versus tests, `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — twenty pose docstrings had to be read to know which
already argued for their slot and which did not, before a sentence could be
put on the ones that did not.

## 2026-09-10 · claude/queue-the-volley-and-the-veer-have-one-look-each-and-n

A look record each for THE VOLLEY's shell and THE VEER's rider, a pose each,
and three candidates apiece. About 1 h 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `volley.ts` and its seams and cracks, `veer-clown.ts` and the clown figure, `throb-look.ts` for the record shape, the depth skill, `versus/README.md`, the pose kit's hand |
| writing | 45 | two records and the shipped paint moved behind them, `VolleyShell.kept`, two poses and the volley's hand, six candidates, the ward test |
| looking | 15 | eight `versus:shot` runs at twelve seconds each; the pits made larger and more, the jester's horns widened into a V, the ember's scorch clipped to stone |
| friction | 10 | a heredoc that would not close, three times, on prose with quotes in it — moved to script files and to the Write tool; a `rm -rf` of the wrong glob that took six freshly written files with it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — six paints is six small programs, and each was
written against a picture of the shipped body taken first rather than blind,
which is what kept the looking short.
## 2026-09-10 · claude/queue-the-coil-and-the-tether-have-one-look-each-and-n

Two look records cut, three candidates each for THE COIL's chain and THE
WARDEN's rope, and a pose file for both. About 95 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `coil.ts`, `coil-jump.ts`, `tether.ts`, `clasp.ts`, `handle-draw.ts`, the sim's coil and rope rules, `carom-look.ts` as the pattern, the pose kit and three pose files, the depth skill |
| writing | 40 | `coil-look.ts`, `tether-look.ts`, the two call sites, six candidates with their paints, `poses-link.ts`, the rows |
| looking | 25 | nine `versus:shot` pictures with crops; the first coil pose collapsed its chain, the first bead answer put a dark blob on the rock and was replaced, the prongs read as Vs, the sinew's sheath filled as a chord |
| friction | 5 | no Python on this machine for a multi-file edit; a probe script at the root could not import `@neon-spore/sim` and moved inside the director |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — none of the four defects the pictures caught was
visible to `bun run check`, and each cost a shot, a crop and a re-shot; the
pose's chain in particular could only be timed by watching the beats print.

## 2026-09-10 · hit-looks

Every hit look on the VERSUS page put into the game, one body each, and both
slots closed. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the six candidates, `body-hit.ts`, `body-strike.ts`, which kills carry which kind (`wornKind`), the adopt tool |
| writing | 10 | the five moves, the seven records and `hitFor`, `of` on the kill event, the test, DECIDED |
| looking | 5 | four `bun run frames` strips to find the tick a bolt meets a bulb on wave 2; two perf runs |
| friction | 0 | no Python on this machine for the sim edit — sed did it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — photographing a kill means guessing the tick the
bolt lands on, and it took three strips of the wrong tick before one of the
right one.

## 2026-09-10 · hit-looks (second piece: the carom capsule)

FACET taken on as a space rescue capsule: three offered on its faces, one
picked in chat and shipped, the slot closed. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four carom candidates, `carom-look.ts`, `carom.ts`, the window, the adopt and by-hand tools |
| writing | 20 | `carom-facet.ts` and `carom-marks.ts`, three paints and their indexes, the by-hand take, DECIDED, INDEX |
| looking | 10 | three `versus:shot` pictures twice over with a strip tool written in the scratchpad, one game frame, one perf run |
| friction | 5 | a heredoc with a long file died in bash and was written with the tool instead; `adopt` refuses a slot whose travel is the shipped wedge, and `drop` needs the directories still there — the DECIDED entry was written by hand |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — three candidates that all wear four markings is
one base and two helper files before any of the three can be drawn.
