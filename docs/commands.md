# Every command, one line each

`CLAUDE.md` keeps the commands a lane runs every day; this is the rest, and
the everyday ones again so the list is complete. `package.json` is the source
of truth — a script named here that it has not got is a defect, and a script
it has that is not here is one line missing below.

## Servers

```
bun run dev            # the wave editor (the director) at 4174, hot reload — for a human
bun run dev:once       # the same on a free port, beside one that is running
bun run dev:game       # the game at localhost:3000, hot reload — for a human
                       # all three restart themselves after a git operation, so
                       # a half-written bundle is never served (tools/dev/)
bun run preview        # build, then serve dist/ on 4173 — how an agent verifies
bun run preview:once   # the same on a free port nobody else can be holding
bun run port           # which port this tree's servers answer on, before one is started
bun run --cwd apps/server dev   # the relay under wrangler; it prints the port
```

## Checks

```
bun test               # everything, in one process — or one file, one package
bun run test           # the same, dealt across eight — what `check` runs (tools/check/shard.ts)
bun run test:determinism
bun run test:profile   # which test files carry the minutes — docs/performance.md
bun run typecheck      # tsc, then the server's own
bun run lint           # biome, warnings are errors
bun run format         # biome, writing
bun run check:fast     # typecheck + lint + the tests a lane's diff can reach — before a commit
bun run check          # the same with every test; what `land` runs, minutes long
bun run scope          # which test directories a diff can have moved (tools/hooks/scope.ts)
bun run relay:check    # two headless devices against a running relay — .claude/skills/net-change
bun run perf           # what a frame costs, wave by wave, at phone speed — a baseline sweep
bun run perf --wave X  # the waves the new thing appears in, and nothing else
bun run perf --save    # keep this run as the baseline the next one is read against
bun run orphans        # what is built and reached by nothing — a creature no wave spawns
```

## Landing and the queue

```
bun run land           # rebase, check, fast-forward, note it, sweep
bun run land --keep    # the same without the sweep or the push
bun run land --unverified "<what>"   # queue what this landing could not look at
bun run sweep          # the cleanup a --keep landing deferred, on its own
bun run push           # send main to origin, on purpose rather than on landing
bun run queue          # technical work waiting, who is already on what, and which entries are stale
bun run queue status   # DONE, IDLE or BUSY — is anything still being worked on
bun run queue next     # hand out the first free item: branch + Taken: on main
bun run queue take <n> # the same claim, without opening a lane for it
bun run queue release <n>  # give back an item that was handed out, not started
bun run queue done <n> # take an entry out once it has landed
bun run delegate       # hand a spec to the worker: <spec> <files it may edit>
bun run index          # regenerate the file map in docs/INDEX.md
```

## Pictures

```
bun run frames <sha>   # PNG frames of the game at a sha — tools/frames/
bun run shot <#sel> <out.png>          # one element of the running director
bun run versus:shot <slot> <name>      # one PNG of one VERSUS candidate
bun run png <in.svg> <out.png>         # rasterise a sheet
bun run crop           # a rectangle of a PNG already taken, magnified — tools/frames/picture.ts
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
bun run build          # the game and the director
bun run build:game     # apps/game alone
bun run build:director # tools/director alone
bun run deploy         # build the director, then push it to Cloudflare
bun run deploy:dry     # the same, --dry-run
bun run deploy:game    # build the game, then push the worker to Cloudflare
bun run deploy:game:dry
```
