# Every command, one line each

`CLAUDE.md` keeps the commands a lane runs every day; this is the rest, and
the everyday ones again so the list is complete. `package.json` is the source
of truth — a script named here that it has not got is a defect, and a script
it has that is not here is one line missing below.

## Servers

```
bun run dev            # the wave editor (the director) at 4174, hot reload — for a human
bun run dev:once       # the same on a free port, beside one that is running
bun run dev:here       # the same, in the tree `bun run here` last named — the
                       # `director-here` launch entry, for a worktree's director
                       # from a session the harness opened in the main checkout
bun run here           # name this tree for `dev:here` and `preview:here` (tools/dev/here.ts)
bun run dev:game       # the game at localhost:3000, hot reload — for a human
                       # all of them restart themselves after a git operation, so
                       # a half-written bundle is never served (tools/dev/)
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # the same on a free port nobody else can be holding
bun run preview:here   # the same, in the tree `bun run here` last named — the
                       # `game-here` launch entry, `director-here`'s twin
bun run port           # which port this tree's servers answer on, before one is started
bun run --cwd apps/server dev   # the relay under wrangler; it prints the port
```

## Checks

```
bun test               # everything, in one process — or one file, a few files
                       # named directly. NEVER a whole package directory this
                       # way: packages/render's own tests hold a frame's whole
                       # call history live per test (canvas-stub.ts), and one
                       # process walking all 226 of that package's files never
                       # gets the memory back between them. It prints its own
                       # banner and nothing else, for minutes, then the OOM
                       # killer takes it — confirmed on this image: 250-330 s,
                       # ~14 GB RSS, `dmesg`'s own "Memory cgroup out of
                       # memory" naming the `bun` process, `--smol` tried and
                       # still killed. `bun run test`/`check:fast` below run
                       # the same files a process at a time instead and never
                       # see it.
bun run test           # the same, dealt into bins, cores-less-two at a time (tools/check/shard.ts)
bun run test:determinism
bun run test:profile   # which test files carry the minutes — docs/performance.md
bun run typecheck      # tsc, then the server's own
bun run lint           # biome, warnings are errors
bun run format         # biome, writing — the safe fixes only, never --unsafe, and
                       # never the import sort: a sort is a move, and the doc
                       # comment written above an import does not move with it
bun run imports        # drop the names a file split stranded in an import list:
                       # biome offers only an unsafe fix for those, which deletes
                       # a statement together with the doc comment above it, so
                       # this does the narrow half — a specifier comes out of a
                       # list, a whole statement goes when no comment is directly
                       # above it, and one under a comment is printed for
                       # somebody to read (tools/imports/, and a path or two
                       # narrows it from the whole repository)
bun run imports:sort   # the sort, as a step of its own — the assist `lint` asks
                       # for when it says "Sort these imports". Read what it
                       # writes before committing it: a doc comment stays where
                       # it was while the statement under it moves away, so one
                       # can be left over a blank line or over somebody else's
                       # import
bun run check:fast     # typecheck + lint + the tests a lane's diff can reach — before a commit
bun run check          # the same with every test; what `land` runs, minutes long
bun run scope          # which test directories a diff can have moved (tools/hooks/scope.ts)
bun run relay:check    # two headless devices against a running relay — .claude/skills/net-change
bun run relay:check:all # the four of them, starting the wrangler and stopping it again
bun run room-shot      # two phones through the four-step room screen, and a PNG of each; `--via partners` walks in by the other's row, `--then-wave 3` holds both READY and carries them into a wave
bun run perf           # what a frame costs, wave by wave, at phone speed — a baseline sweep
bun run perf --wave X  # the waves the new thing appears in, and nothing else
bun run perf --save    # keep this run as the baseline the next one is read against
bun run baseline:blank     # a row for every unweighed wave, a blank for every row its wave changed under; opens no browser, measures nothing, and any session may run it
bun run orphans        # what is built and reached by nothing — a creature no wave spawns
bun run words          # every line a player reads, measured against `.claude/skills/game-words`: guides, wave sentences, the DEMOS buttons
bun run words "THE SHELL"  # one wave or mechanic, every line, the passing ones too
bun run words --clean  # the CLEAN list and the CEILING that `tools/words/clean.ts` should now hold
```

## Landing and the queue

```
bun run land           # rebase, check, fast-forward, note it, sweep
bun run land --keep    # the same without the sweep or the push
bun run land --unverified "<what>"   # queue what this landing could not look at
bun run unverified <sha> --unverified "<what>"   # the same, once landing already happened
bun run sweep          # the cleanup a --keep landing deferred, on its own
bun run push           # send main to origin — reconciles the trunk first if origin moved
bun run reconcile      # bring main up to origin's copy by itself, without sending anything back
bun run queue          # technical work waiting, who is already on what, and which entries are stale
bun run queue status   # DONE, IDLE or BUSY — is anything still being worked on
bun run queue next     # hand out the first free item: branch + Taken: on main
bun run queue show <n> # print the prompt `next` would, claiming nothing
bun run queue take <n> # the same claim, without opening a lane for it
bun run queue release <n>  # give back an item that was handed out, not started
bun run queue done "<title>"  # take an entry out once it has landed — never <n>
bun run delegate       # hand a spec to the worker: <spec> <files it may edit>
bun run index          # regenerate the file map in docs/INDEX.md
```

## Pictures

```
bun run frames <sha>   # PNG frames of the game at a sha — tools/frames/
                       #   --wave N|"NAME" is required; `.` in place of a sha is this
                       #   tree, once, with no pair. The recipes are `run.ts`'s header;
                       #   each flag's argument is in the file that acts on it, and that
                       #   header's table says which (tools/frames/run.ts)
bun run shot <#sel> <out.png>          # one element of the running director
                       #   --serve starts one of its own and stops it; --port uses one that is up
                       #   --wave "THE REPRISE" opens it on that wave (a name, an id or a number)
bun run menu-shot <out.png>            # a page of the game's menu — starts its own preview
                       #   --page "SETTINGS > CONTROLS" is the words a thumb would press
                       #   photographs as a phone; --desk for the rows only a mouse is offered
                       #   --first-visit arrives with no name, on the screen that asks for one
                       #   --intro photographs the opening scene; --wait is how far into it
                       #   --type "#helloName=DAVID" fills a field first; repeatable, in order
                       #   --partners "Ada,David:7" arrives having played with them, to that wave
                       #   --back is the phone's back gesture; the card it opens takes two
                       #   --screen "#backAsk.on" is what to wait for once the walking is done
bun run versus:shot <slot> <name>      # one PNG of one VERSUS candidate
bun run png <in.svg> <out.png>         # rasterise a sheet
bun run crop           # a rectangle of a PNG already taken, magnified — tools/frames/picture.ts
                       #   <in.png> <out.png> --at x,y,w,h --zoom 4 — versus:shot's spelling; positional still works
bun run pair <before.png> <after.png> <out.png>  # a before/after as one PNG — tools/frames/pair.ts
                       #   before left or on top; stacks crops, sets frames side by side; --stack|--beside, --gutter 8
bun run sheet <prefix> <out.png>       # a strip of frames as one picture, so motion can be seen
                       #   `<prefix>-00.png`, `-01.png`… ; --cols 8 --cell 240 --every 800
                       #   --band 0.35,0.72 windows a slice of each frame instead of shrinking it
bun run probe          # run a scratch script against a live world — tools/probe/
```

## Sheets and looks

```
bun run versus         # what VERSUS slots are open; new / adopt / drop / index — docs/versus.md
bun run shapes         # regenerate the shape sheets an eye needs
bun run shapes:report  # the geometry as numbers — reach for this first
bun run shapes:cues    # the motion half of shapes:report, as numbers not a picture
bun run shapes:parts   # every secondary form on one sheet — docs/parts.md
bun run shapes:swim    # one pulse cycle of every body that swims, as a strip
bun run shapes:page    # the director's GRAPHICS page (was SHAPES), built
bun run shapes:still   # the same, as stills
bun run maze           # the sheets THE MAZE is played on, drawn
bun run style-guide    # the specimen sheet for docs/style-guide.md, drawn from the palette
bun run breaks         # every tuning of the fracture engine, across time, on one sheet
                       # — the bench for a damage look (.claude/skills/destruction)
```

## Assets and deploys

```
bun run icons          # regenerate the home-screen PNGs from apps/game/icon.svg
bun run raster         # regenerate the baked assets under assets/raster/
bun run raster:pack <dir>   # shrink hand-painted frames into one strip the game can draw
bun run raster:verify  # open them in a real browser and check every frame decodes
bun run solid [out.png]  # the rig turned side to front, in a real browser — the look loop for solid-*.ts; --zdog draws it beside Zdog
bun run build          # the game and the director
bun run build:game     # apps/game alone
bun run build:director # tools/director alone
bun run deploy         # build the director, then push it to Cloudflare
bun run deploy:dry     # the same, --dry-run
bun run deploy:game    # build the game, then push the worker to Cloudflare
bun run deploy:game:dry
```
