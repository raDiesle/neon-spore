# Decisions

Each entry: what was decided, why, and what would have to change for it to be
reconsidered. Append, do not rewrite — a decision that was reversed is more
useful with its history attached.

## 1. Name: Neon Spore

*August 2026.* Organic and science fiction in two words, without the sea or
flower imagery of the earlier candidates. Working title "Signal Bloom" is
retired; the German spec still uses it throughout and is renamed as it is
translated.

**Reconsider if:** a trademark or app-store search turns up a conflict. That
search has not been done yet.

## 2. The raster control model, not free flight

*August 2026.* Two playable prototypes existed with two different control
models. Raster wins.

The deciding argument is section 4 of the spec: speech runs over Discord or
WhatsApp with 0.5–2 s delay, and a full announcement takes 2.1–3.6 s. Free
flight asks both players to trigger the same action inside 250 ms — the word
"now" is already wrong by the time it arrives. The raster hangs everything on a
shared 96 BPM pulse, so the announcement becomes "column four, I trigger on the
three", which stays valid however long it takes to arrive.

Second argument: in the raster the two players have *different* jobs in the
same defence — one places in space, the other hits in time. That produces more
to talk about, and it is visible afterwards who missed their half.

Third argument, the practical one: the raster state is integers. Determinism,
replay tests and lockstep nearly fall out of it.

**Cost accepted:** the bestiary, the ten acts and the assist mechanics were
designed for free flight. "Keeping watch" (slowing a creature) does not
translate to a beat-based game and needs rethinking rather than porting.

**Reconsider if:** playing both with two people shows the raster feels like a
puzzle rather than a game. The free-flight prototype is kept in `legacy/`.

## 3. Monorepo with workspaces

*August 2026.* `packages/sim`, `packages/render`, `packages/content`,
`apps/game`, `apps/server`. Package boundaries make the import rule structural
instead of advisory: sim cannot reach render because it does not depend on it.

## 4. Bun for everything, no Vite

*August 2026.* Bun is the package manager, the runtime, the test runner and the
bundler. One binary, TypeScript without a build step, and `bun test` runs the
whole suite in milliseconds.

**Cost accepted:** Bun's install is flatter than pnpm's, so an undeclared
dependency is not caught at install time. And `wrangler` (phase 2, Cloudflare)
is Node-oriented; if it misbehaves under Bun, run it through `npx`.

**Reconsider if:** the tuning loop — change a value, see it immediately —
turns out to be worse under Bun's dev server than it was under Vite.

*Amended August 2026:* `bun --hot` watches only files under the directory it
was **started from**. Started in `apps/game`, it bundled all three workspace
packages but watched none of them — every file in `sim`, `render` and `content`
drew "is not in the project directory and will not be watched", and editing a
renderer meant restarting the server. So `dev` runs from the repository root
(`bun --hot apps/game/index.html`) and `apps/game` no longer carries a `dev`
script of its own, because running one there would silently reintroduce it.

The cwd is the whole mechanism — not the workspace symlinks, which are what
made it look like a resolution problem. `build` and `preview` are unaffected:
neither watches.

*Amended 2026-08-24:* `dev` now launches the director instead of the game —
that is the one being edited and reloaded on every cycle, so it is the one
that must not need a manual restart. The same cwd-from-the-repository-root
rule applies to it for the same reason: started inside `tools/director`,
`--hot` would bundle `sim`, `render` and `content` without watching them,
exactly as it once did for `apps/game`. The game's own hot dev server moved
to `dev:game`, otherwise unchanged.

## 5. Canvas 2D for the field, DOM for everything else

*August 2026.* Three layers rather than one technology:

- **Field:** Canvas 2D. Glow comes from layered strokes and one pre-rendered
  additive halo sprite, never from `shadowBlur` — that is the actual frame-rate
  cost on mobile GPUs.
- **HUD, menus, Director Mode:** DOM and CSS. A HUD change then never touches
  renderer code, which is both cheaper to edit and easier to get right.
- **SVG:** authoring format, not a drawing path. The contour maths from the
  style guide lives in `content/` as pure functions and feeds both the canvas
  and an SVG test sheet.

`render/` sits behind a narrow interface, so PixiJS later is a second
implementation rather than a rewrite.

**Reconsider (per spec 12.4) if:** Canvas 2D drops below a stable 60 fps on the
target devices despite pre-rendered sprites; many more than ~52 simultaneous
objects are needed; additive blending gets awkward; or runtime deformation
replaces pre-rendered stages.

## 6. English throughout

*August 2026.* Identifiers, comments, docs and commits. The German spec is
translated topic by topic into `docs/spec/`; the original stays in `legacy/` as
the source of truth until each part has moved.

*Amended August 2026:* every part has moved. `docs/spec/` is the specification;
the German original was deleted and lives in the git history — see decision 12.

## 7. Public repository

*August 2026.* Public from the start. No open-source licence is granted yet —
see `LICENSE`. Decide the licence before accepting outside contributions.

## 8. First milestone: port the raster prototype

*August 2026.* Port `legacy/raster-prototype.html` to TypeScript split into
sim/render/content, with the game rules unchanged. Only then the network layer
(clock sync, delayed lockstep, Durable Object), and only then more content.

Network before content, because content built on a timing model that does not
hold is built twice.

## 9. The port keeps the prototype's rules, the style guide's shapes

*August 2026.* Milestone 1 draws from two sources, and they do not overlap:
`legacy/raster-prototype.html` supplies the rules, the layout, the radar, the
HUD and the effects; `legacy/style-guide.html` supplies the ship, the creatures
and the shield. Pixel-identical parity with the prototype was never the goal —
the style guide is the newer art direction and supersedes the prototype's
hard-coded silhouettes.

Four places where the sources disagreed, and how it was settled:

- **Guard window: 600 ms.** The prototype runs 600 (`CFG.guardWindow`, commented
  "at least doubled"). The scaffold's `SimConfig` said 260, which came from
  spec 15.3 #18 — a number that was guessed and never in any running code. The
  spec has been corrected. It still wants measuring with two people; it decides
  whether the shared defence feels precise or mean.
- **The hull is row `rows - 1`, not `rows`.** The prototype's `shipRow` is
  `ROWS-1`, and spec 5.8 measures 8.8 s of approach, which is 14 beats at
  96 BPM. The scaffold was off by one.
- **`guard.tries` counts every meteor that reaches the hull**, not only those
  with the shield in the column. That is the denominator the prototype's
  `Abwehr 7/9` shows.
- **`rows` is fixed in `SimConfig`.** The prototype derived it from the tile
  size. Two devices that disagree about the height of the field disagree about
  when a creature reaches the hull, so the tile shrinks to fit instead.

**Also decided here:**

- **The shield is the armour-plate variant.** The style guide offers four; the
  brief says the shield is a lobe of the hull contour, which is `PLATTE`. The
  rim-brightening (`RAND`) is drawn on the same segment when armed, so armed and
  passive differ in silhouette *and* in light — spec 5.8 insists a deflection be
  unmissable, or the pair never learns the timing.
- **Visual variation comes from ids, not from the rng.** Creature motion phase,
  meteor spin, crater placement and scar jitter are derived from `creature.id`
  and `(scar.col, scar.beat)`. Both devices agree without the simulation storing
  a jitter, and the seeded rng stays reserved for things that affect play.
- **The control band is drawn on the canvas**, not in the DOM. Every element of
  it is per-column and has to line up with the grid exactly. This narrows
  decision 5: the *field surface* is canvas, and the band is part of it. Menus,
  the tuning panel and the wave-skip controls remain DOM.
- **Wave progression crosses the boundary by request.** The sim emits
  `needWave` and the app answers with `buildQueue`, because waves live in
  `content/` and nothing may point back into the sim.

**Reconsider if:** playing it with two people shows the style guide's silhouettes
read worse in motion at tile size than the prototype's did. The prototype's
`shapePath` is still in `legacy/` for comparison.

## 10. Proposals, not yet done

*August 2026.* Recorded rather than acted on, per the milestone-1 brief.

- **Split render-only tunables out of `SimConfig`.** `radarLead`,
  `bulletGlideMs`, `bandPct` and `radarHeightPx` sit there today because the
  convention says every tunable is a named field of `SimConfig`. They change no
  rule and enter no hash. A `RenderConfig` would be honest, at the cost of two
  config objects to thread through.
- **A second config preset at 260 ms**, so the guard window can be compared
  side by side without editing code.

## 11. The setting is space

*August 2026.* Neon Spore takes place in space, not underwater. The nearest
comparable game is Spaceteam: two people, two devices, and the order arrives at
the person who cannot carry it out.

This was implicit in the name from decision #1 — chosen for organic plus
science fiction, "without the sea or flower imagery of the earlier
candidates" — but the German spec was written for an ocean and nobody had said
out loud that the fiction had moved with the name.

**What is unaffected:** the three couplings, the beat, the raster, the ten
pillars and the wave design. None of them depends on what the backdrop is.

**What is affected and not yet resolved:** the marine fiction was carrying real
argumentative weight. Colour is bioluminescence, matching ammunition shatters
the light organ by resonance, the rock is indestructible because it does not
live, and "you are a bubble in an ocean full of animals — not the warriors, but
the fragile thing." Each of those needs a reason that fits a void. The bestiary
is sea life, and `manta` and `jelly` are `CreatureKind` values in the
simulation, so that question is a code change whichever way it goes.
`packages/render/src/field.ts` still calls its background "deep-water".

These are written up as S1–S5 in `docs/spec/open-questions.md` rather than
answered here. An alien ecosystem drifting through a void is a coherent answer
that costs nothing and renames nothing; it is the leading candidate, not a
decision.

**Reconsider if:** the fiction pass finds that the creature vocabulary cannot
be justified in space at all. Then the bestiary is redrawn, which is a bigger
change than the setting was.

## 12. The spec is design intent, marked with build status

*August 2026.* The German original has been translated and split into
`docs/spec/`. It says what the game is *for*, not what it currently does, and
every file carries a status marker: built, partly built, not built, superseded.

The alternative — keeping the spec in permanent sync with the running game —
was rejected. It would turn every gameplay commit into a docs commit, and it
would delete the part of the spec that is most valuable: ninety unbuilt waves,
seventeen unbuilt creatures and eleven bosses that the prototype says nothing
about. Splitting into `built/` and `planned/` trees was rejected too: sections
like "systems" are half of each, and entries would migrate between files as
they land, which is churn without a reader.

**The order of authority when sources disagree:** `docs/decisions.md` decides;
the code is the truth for numbers; the spec says what the thing is for. A
section that is merely unbuilt is fine and says so. A section that is *wrong* —
contradicted by a decision or by the code — gets fixed in the same commit,
with the reasoning recorded here.

Where the original assumed free flight, the translation keeps the passage and
marks what no longer applies, rather than quietly rewriting it. The
communication idea inside a mechanic usually survives the change of control
model even when the gesture does not, and that is worth being able to see.

**Cost accepted:** the status markers go stale unless they are touched when
something ships. They are one line per file, and `docs/spec/README.md` collects
them in a table, so the staleness is at least visible in one place.

**Reconsider if:** the markers are found to be wrong more than once. At that
point they are worse than nothing and the sync-always option gets a second
hearing.

## 13. The bestiary is blob and slime, not sea life

*August 2026.* This answers the open item left by decision 11. (That entry
names the creatures `manta` and `jelly`; those are the old names, renamed
here.)

In the code: `manta` → **`slick`**, `jelly` → **`bulb`**. `meteor` is
unchanged — it is already space-native, and its job is to be the one thing that
is *not* a blob: angular, `crystalPath` rather than `blobPath`, indestructible
because it does not live. That contrast is what teaches the rule visually, so
the non-living family (meteor, crystal) deliberately keeps its own register.

`slick` is `lobes: 2`, `rx 68 × ry 34` — wide and flat, tilts and ripples.
`bulb` is `lobes: 9`, round, pumps and sways. The names describe the shapes
that were already there.

**Three naming rules, in priority order** — written up in
`docs/spec/bestiary.md`:

1. Blob and slime, not sea life.
2. The name says the behaviour or the shape.
3. **Distinct when spoken over a laggy voice channel** — this one overrides the
   other two.

Rule 3 is the one that does real work, and it is a consequence of the core
sentence rather than a style preference: names are said out loud across a
0.5–2 s delay, so two creatures must not share an onset, a vowel and a syllable
count. `/slɪk/`, `/bʌlb/` and `/ˈmiːtiər/` share none of the three.

Rule 3 is also why the flat one is not called a *glider*, which was the obvious
name: "glide" is already the fixed term for how every creature moves, one tile
per beat, and overloading it is exactly the synonym drift `CLAUDE.md` forbids.

**Scope:** only the three names above are committed, because only they are
`CreatureKind` values. The other seventeen creatures and the eleven bosses were
renamed in `docs/spec/` in the same pass so the page is not half marine, but
those are labels on unbuilt designs — proposals, one edit each. Rule 3 is
likely to bind before rule 1 does: twenty names that stay distinct over a voice
channel is the harder constraint, and it should be checked against the whole
set before the bestiary grows.

**Reconsider if:** saying a name out loud in play turns out to be rare — if
pairs point at columns instead ("column four") and never name the creature,
rule 3 is over-weighted and rule 2 should lead.

## 14. The window is not the stage

*August 2026.* The game is portrait mobile web, and a browser window on a
desktop is nothing like a phone. Drawing into the whole window made the hull as
wide as the desk: a shape nobody will ever be shown, judged on a screen nobody
will ever play on.

So the window is not the stage. `computeStage` in `packages/render/src/layout.ts`
returns a portrait rectangle, at most 0.56 as wide as it is tall, centred; the
renderer clips and translates into it and everything a player sees lives inside
it. Input subtracts the same offset, so a control is never drawn in one place
and answered in another — the reason the layout was shared in the first place.
Only the test chrome, which no player gets, is allowed outside.

**The view switch** follows from the same worry. The finished game is one role
per device, so a screen showing both halves of the control band is not the
game's layout: it has controls the real screen does not carry, and the field is
correspondingly smaller. `P1` and `P2` show one role's half and hide the rig;
`TEST` shows everything. The band's share of the height is a named field either
way — `bandPct` and `bandSoloPct` — never a literal.

Two smaller things came with it. The layout is now derived per frame rather
than cached, because a tuning slider moves `bandPct` between two frames and a
cached layout would ignore it until the next resize. And `hullInvulnerable` is
a `SimConfig` field rather than an app flag: it belongs to the run, and a
replay has to record that the run was played with the hull holding.

**Reconsider if:** a landscape or tablet layout is ever wanted. The stage is
one aspect ratio by choice; making it a range is a change to `computeStage` and
nothing else.

## 15. The radar splits by control, not by information type

*August 2026.* `docs/spec/roles.md` and `systems.md` 5.2 had proposed a radar
split along "which creature is coming" (pilot) versus "where it is coming
from" (navigator). Building it that way would have let the pilot both read the
rocks' arrival and, alone, do nothing about it — the shield is player 2's to
move. The information and the action would have sat on the same screen, which
needs no voice channel at all.

The rule that shipped instead crosses the controls: **the one who sees a kind
coming is never the one who acts on it.** Rocks and the torch (`guard` kinds)
show on player 1's strip; player 1 has no shield to move, so player 1 has to
tell player 2. Slick, bulb and the queen (`aim` kinds) show on player 2's
strip; player 2 has no cannon, so player 2 has to tell player 1.

`CreatureDef.radar` (`packages/content/src/creatures.ts`) is data, not derived
from `controls` — a creature with both groups or neither still needs an
explicit answer. `radarOwner(kind)` reads it; `showsRadar(role, kind)` is what
`packages/render/src/field.ts` calls. `purity.test.ts` guards against
re-deriving ownership from `controls` by hand.

**Reconsider if:** a creature ever needs a radar owner that is not simply "the
side that doesn't act" — `RadarOwner` already has a `"none"` case reserved for
that (see *The Silent*, `docs/spec/bestiary.md` 10.2).

## 16. The radar lead is a 3-second floor, not a 4-beat habit

*August 2026.* `radarLead` was 4 beats — 2.5 s at 96 BPM. `docs/spec/latency.md`
sets 3 seconds as the minimum warning a creature needs so it can be called out,
found and acted on across a voice delay with room to spare; 2.5 s undercut that
floor before the torch ever needed the room. `radarLead` is now 6 beats, 3.75 s
at the default tempo.

It is one field, not one per creature kind: the strip is a single time axis,
and a per-kind lead would make two simultaneous arrivals draw at two
unrelated heights for no reason a player could read.

**Reconsider if:** the tempo (`bpm`) is ever tuned independently of
`radarLead` — the two are coupled only through the 3-second floor, and a much
faster tempo would need more beats to keep the same real time.

## 17. Joining a room stops the world until beat zero

*August 2026.* A device that has joined a room does not simulate anything until
the room's beat zero arrives, and beat zero puts `tick`, `beat`, `nextId` and
the rng back to zero (`resetClock`) before the lockstep scheduler is built.

Delayed lockstep numbers every command by the tick it takes effect on. Two
worlds that begin on different tick counts are not one game played twice; they
are two games. A device that keeps playing solo while it waits for the other
phone arrives at beat zero on a tick count of its own, and the obvious repair —
reset the clock at the start — is not enough on its own: a scheduler built
before the reset spends the wait promising the peer that nothing is coming
before tick 47, and then keeps that promise across the reset. The first
forty-seven ticks of the real run carry no commands at all while both devices
insist they are in step. That is not a hypothetical; it is what the first run of
`bun run relay:check` found.

So the order is fixed: hold still, put the clock back, *then* build the
scheduler.

**Reconsider if:** the game ever wants a lobby you can play in — a warm-up
field while waiting for the second phone. It would need its own world, thrown
away at beat zero, rather than the one the run uses.

## 18. A briefing is derived from the wave, and lives in the world

*August 2026.* `docs/spec/briefings.md` said two things that did not survive
being built, and both are now reversed there.

**Placed became derived.** The spec had each wave naming what it teaches. That
is a second copy of the wave's contents, kept by hand, in the file that gets
edited most — a creature swapped into a wave keeps the old card, and nothing
says so. So the subjects are computed from what `startWave` was actually
handed: the spawn queue, the pods, the boss. The subject list is closed and the
catalogue is a `Record` over it, which makes a creature that ships without a
card a type error rather than a silence.

**`localStorage` became world state.** The card stops the wave, so whether it
is up is a fact the simulation acts on, and a fact the simulation acts on
cannot live on one device. `World.brief` is a bitmask, it is in `hashWorld`,
and dismissing is a command like any other — two devices disagreeing about
whether a card is up is a desync however it is spelled.

The clock deliberately keeps counting while the field is frozen. A press is
scheduled `inputDelayTicks` into the future, so a world that stopped its tick
counter would wait forever for a dismissal it had arranged never to arrive.

**Reconsider if:** something has to be taught that no wave contains. The grip
and the lance are already in that position — they are controls, not contents,
so the derivation cannot see them. That wants a third mechanism, not a
`briefings:` list grown back onto `Wave`.

## 19. Replay tests compare two runs, and never pin a number

*August 2026.* The wording in `.claude/skills/new-creature` said a replay test
"pins the fingerprint", and no test in the repository has ever done that: every
one of them calls `runReplay` twice in the same process and compares the two
hashes. The code was right and the sentence was wrong, so the sentence changed.

Pinning would cost more than it catches. `hashWorld` gains a field whenever
anything gains state — three lanes added one on a single afternoon — and every
such change moves every pinned constant at once. The only workable response to
a wall of moved numbers is to re-pin them because the change was intended,
which is precisely the motion by which a real regression gets blessed. A
constant that is updated whenever it fails is not a test.

What the comparison does prove is the property lockstep actually needs: two
devices on the *same build* stepping the same inputs reach the same world. It
is not a guard against a behaviour change between commits, and nothing in the
suite is. That gap is real and is filled by the replay's own assertions —
what died, what scored, what the hull took — which is where a behaviour change
belongs anyway, because a moved hash says only that something is different.

**Reconsider if:** two devices ever have to interoperate across versions. Then
cross-build stability becomes a correctness requirement rather than a nicety,
and a pinned corpus earns its maintenance.

## 20. A round that is not the field is a boss wave, not a category

*August 2026, revised.* THE GAUGE was built as an **interlude**: a fourth kind
of thing beside the wave, the boss and the pod, reached from a table of gaps
keyed by the wave each sat in front of, behind a `cfg.interludes` switch, and
forbidden by rule from ever ending a run. Eleven more were designed behind it.
The owner retired the category before the second one was built:

> ich schlage vor, dass wir alles zu "the gauge" in eine boss wave umwandeln.
> keine konfiguration für einzelne waves. das passt viel besser. […] so remove
> completely the interlude principle and implementation pattern

**What was wrong with it was the second door, not the round.** Every part of a
category is a part the rest of the game has to learn about. `needWave` grew a
second meaning and the host had to ask, before building a wave, whether the gap
in front of it carried something else. `world.interludeDone` existed only to
stop that question looping. `Reach` grew a third value, `gap`, so the mechanic
registry could say where a thing was played from. The director grew a tab, an
API route and a serializer for one `Record<number, InterludeEntry>`. None of
that was about a needle, two marks and two people who cannot see the same
screen — and all of it would have been paid eleven more times.

A wave already reaches a boss, and a boss already *is* the wave it stands in.
`boss: { kind: "gauge" }` is the whole of the reaching mechanism now, and the
eleven rounds still to come cost one wave entry, one `config-<round>.ts` block
and one control set each.

**What survives, because it was never about how the round was reached.**

**A mode of one world, not a world of its own.** The round is still a field on
`World` — `world.boss` — and still an early return in `step`, not a second
`World` with its own loop. Two worlds need a supervisor holding the switch
between them, and that supervisor is the one piece of state no fingerprint
covers: two devices could agree about everything inside a round while
disagreeing about *which* round they are in, which is the worst desync
available, because every per-round hash would say the two were fine. One
`World` keeps one `step`, one `hashWorld`, one replay format and one command
stream. The price is that "round" means two things, and it is paid where it is
cheapest: `step` returns before it reaches any rule of the field, so
`bullets.ts`, `beat.ts` and `hull.ts` never learn this round exists.

**The field is gone during a round, not dimmed.** That is free because a gauge
wave carries no queue and no pods, so there is never a rock in the air to
answer for. The metronome keeps running — the ear would notice ninety seconds
of silence, and drift is counted in beats — while `world.waveBeat` stands
still.

**Lead, play, verdict.** The three phases belong to the round now rather than
to a shell, which is where they should have been: they were never shared with
anything, because nothing else was ever built.

**Its own controls, different per seat.** Neither band is reused. What changed
is that they are a **control set** — `gauge` in `control-sets.ts` — instead of
geometry invented inside render/. A set's `panelForm` is derived from what is
in it: a set of slabs is a panel that replaces the band, a set of strips and
lobes is a band, and a set that mixed them is not a panel and throws. The
field's own sets learned nothing. One layout function answers the draw, the
game's hit test and the director's, so a control is never drawn where it is not
answered.

**And one rule was retired by name: the pair can lose the run in here.** The
old sentence was "a run ends on the field, on a hull that reached zero, in the
coordinate system the pair has been naming out loud all evening". It was a good
sentence about a category that no longer exists. A boss that costs nothing is
not a boss, it is a screen you wait out — and a round nobody can fail is a round
nobody plays twice. So: **the round does not draw a hull and the hull is still
at stake.** The field's picture is absent, `world.hullMilli` persists
underneath, and running out of time breaks it by `cfg.damageGauge` in the
middle column, leaving a scar that is still there when the field comes back.
A run can therefore end in a round.

**Reconsider if:** a round ever has to run *over* a live field, or has to hand
something back to the wave that follows it. Either would reopen the seam, and
the second is the likelier — a round that gives the pair a pod for the act
ahead is the obvious next ask, and `startWave` replaces `podQueue` wholesale.

## 21. The no-travel rule is about the field, not about the game

*August 2026.* `CLAUDE.md` said "nothing the players control travels the
field", and every reader took the sentence to bind the whole game — including
the twelve rounds designed in `docs/spec/interludes.md`, three of which could
not be built until this was settled. The owner settled it: the rule is scoped
to the field, and it was incorrect as a rule about the game.

What it is actually for is keeping the field a place where two people talk
about **columns**. A cannon that slides, a shield that covers, a creature that
falls: everything on the field has a column, and the whole control scheme
exists so that "column four, on the three" is a complete instruction. Free
movement would replace that with a shared reflex, which is the argument
`docs/decisions.md` #2 already made when the raster model beat free flight.

**None of that reasoning reaches a round that draws its own screen**, and that
is the part worth keeping now that the *category* the entry was written about
is gone. This entry used to say "none of it reaches an interlude". The word has
changed and the argument has not, because the argument was never about how the
round was reached — it was about there being no columns in it. A boss wave with
no grid, no hull drawn and its own picture is exactly as free of the column
vocabulary as an interlude was. A claw on a rail, a belt that carries things
sideways or a well the creatures fall into is not a violation of anything: THE
CLAW, THE BELT and THE WELL are three of the eleven rounds still to build, and
all three were blocked on this sentence rather than on any rule of their own.

The reading has to be stated rather than assumed precisely because the rounds
are bosses now. A boss wave looks, from `waves.ts`, like every other wave — so
a reader who found one moving a claw along a rail and reached for `CLAUDE.md`
would find a sentence that appears to forbid it. What decides is not what the
thing is called in the wave list; it is whether the pair are naming columns.

**Reconsider if:** a round's movement starts leaking back into how the field is
described — if a round teaches a gesture the field then has to refuse, the two
halves have stopped being different rounds and are competing.

## 22. A branch is swept as soon as its work is on main, and main is pushed

*August 2026.* Two rules in `CLAUDE.md` were written for a repository that had
never run more than one branch at a time, and one day of parallel lanes showed
both to be wrong.

**Branches outlived their landing until every `Check:` had been decided.** The
stated reason was that a branch is the only handle on which landing a look
belongs to — which was not true when it was written and is not true now. A
check is derived from the commit carrying the trailer, and `bun run checks`
prints it under that commit's sha and subject; the branch rows are a
convenience built on top. What keeping them actually bought was twenty-seven
standing worktrees in a day, and a list nobody reads.

**`main` was not pushed unless asked.** The reason given was that not pushing
costs nothing on this machine, because the work is already where the person
is. That ignored the other reader: a session started from a phone clones
`origin`, so an unpushed `main` briefs it on code that does not exist. The
same file already called this a trap in its cloud section and then instructed
the opposite here.

Both are reversed. A landed lane is swept without being asked, and `main` is
pushed when it has landed something.

**Reconsider if:** more than one person works on this repository. Both new
rules assume the pusher is also the only reviewer, and a sweep that deletes a
branch someone else is reading is a different thing entirely.


## 23. Everything in the world is in the fingerprint, and the exceptions are named

*August 2026.* `hashWorld` had grown by addition: a field went in when
somebody noticed it could desync, which meant the set of fields outside it was
whatever nobody had thought about yet. A lane sent to add four found that one
of the four was already there and that six others were not — among them
`waveBeat`, which an interlude holds still while `beat` keeps counting, and
which a warden's clamp, a vane's opening and a queen's tell are all read off.
Two devices agreeing about `beat` and disagreeing about `waveBeat` play
different bosses and nothing above would have caught it.

So the rule is inverted. **Every field of `World` is hashed unless it is one
of the named exceptions**, and the exceptions live in a comment at the top of
`hash.ts` with the reason each one is out:

- `cfg` is agreed before beat zero and never mutated mid-run — hashing it
  every tick restates the handshake.
- `queue` and `podQueue` are the wave's script, handed in from `content/`,
  read by index and never rewritten; `spawned` and `podSpawned` carry how far
  that reading has got, and they *are* hashed.
- `events` is cleared every tick and derived from the step that just ran, so
  it is a consequence of the state rather than part of it.

Three inputs and one output. Anything else that is added to `World` and left
out of `hashWorld` is a bug, and the burden is on leaving it out.

This is only affordable because #19 holds: replay tests compare two runs and
never pin a number, so reordering the pushes or adding to them costs nothing.
Had a single fingerprint value been written down in a test, this entry would
have been a migration instead of a comment.

**Reconsider if:** `World` grows a field that is genuinely large and genuinely
derived — a cache, a spatial index, a memo. The rule as written would hash it
every tick for nothing. The answer then is a named exception with its reason
beside the other four, not a quiet omission.

## 24. A variant stays until it is decided, and every variant is comparable at once

*August 2026.* The owner's rule, and it reverses one that was written before
anybody had used the arrangement for a day.

`docs/versus.md` was designed around a vote that happens inside the session
that opens it: two looks side by side, a decision, a prompt, and a slot that
is `git rm`'d if nothing is decided by the end — on the reasoning that nobody
incurred an obligation by opening a slot, so nothing should force the
decision. That is coherent and it is wrong about who decides. One person owns
this repository, they look at the work on their own machine and on their own
schedule, and a session ending is not an event in their day. A slot deleted
for being undecided is a look thrown away for the sole reason that a machine
stopped running.

So, two rules.

**Nothing is deleted for being undecided.** A variant persists — as a
candidate directory, as a skin beside its original, as a motion beside the one
it answers — until the owner says what happens to it. The outcomes are adopt,
keep the current one, use it somewhere else, or delete; all four are theirs,
and none of them has a deadline.

**Every alternative is comparable in the director, at the same time, without
leaving the application.** No branch switching, no rebuild, no reading two
screenshots against each other. If two things are alternatives, the director
can show them together on one clock — which is what the DRAFTS pair and the
VERSUS pair already do and what the skin switcher, being exclusive, does not.
An arrangement where comparing means flipping is one where nothing gets
compared: it was measured at seven to twelve seconds a flip, and a comparison
that costs that is a comparison nobody makes.

The cost of persistence is clutter, and the honest answer to clutter is
grouping rather than deletion. **Reconsider if:** the number of undecided
variants makes a switcher unreadable — at which point the fix is that the
director learns to organise them, not that the repository starts throwing them
away on a timer.

## 25. Baked pictures are allowed, and only one of the three ways may touch the field

*August 2026.* The game had no raster asset of any kind — every pixel it drew,
it computed. That was never a decision anybody made; it was where the code
started, and it held because nothing had asked for a picture that code is bad
at. The ask arrived as a question about APNG and animated WebP, and the answer
turned out to have a hard edge in it that is worth writing down once.

**Yes to baking.** A frame-by-frame effect whose information is in its pixels —
irregular edges, off-axis bloom, grain, silhouettes that differ deliberately
frame to frame — is cheaper to draw as an atlas than to compute, and better.
One `drawImage` per effect, whatever was painted into it. `docs/raster.md` has
the test for which effects those are, and it is deliberately a short list.

**And only as an atlas, on the field.** An APNG or an animated WebP in an
`<img>` is played by the browser against the wall clock. Nothing in this game
that two devices can both see is allowed to be paced by a clock the frame loop
cannot see, and a hit that is halfway through on one phone and finished on the
other is exactly the split screen the lockstep exists to prevent. An atlas
hands the frame number back: `floor(age / frameMs)`, off the same `dt` every
other effect is stepped by. `WebCodecs`' `ImageDecoder` would give the same
control over an animated file, and is not everywhere, and needs a secure
context — so it is a capability the pages may use and the field may not
depend on.

The two animated formats keep a real job: the director's sheets, a briefing, a
menu, anything in the DOM where "the browser plays it" is the feature. They
are generated from the same frames as the atlas by `tools/raster`, which added
no dependency — both formats are container arithmetic over stills a browser
already encoded.

**Reconsider if:** `ImageDecoder` becomes universal *and* something wants an
animated file's own timing on the field, which is the one combination that
would make the boundary above arbitrary rather than physical.

## 26. A landing writes a note, not an obligation, and sweeps after itself

*September 2026.* Three arrangements went at once, and they went for the same
reason. `docs/queue.md` was driven by `bun run burn`, which read it as a board
of parallel lanes and joined it to git. `Check:` trailers produced an
outstanding list in `bun run checks` and a sheet in the director with a verdict
button on every row, backed by a ledger in `docs/verified.md` and hand-written
restatements under `docs/checks/`. `bun run handoff` derived a four-line closing
block for a phone. All three were accurate, and all three asked the owner for
something.

**The asking is what killed them.** The owner's words: *it was too error prone
and seems to waste my tokens.* An obligation list is read while it is short and
abandoned once it is not, and an abandoned one is worse than none because it
looks like coverage — twenty rows stood outstanding at the end. The queue board
answered a question nobody asks any more: it existed so an unattended run could
tell which of six lanes was in flight, and the work is now picked up one
session at a time, by hand.

**What replaced it takes nothing.** `bun run land` appends to
`docs/release-notes.md` at the moment `main` moves, from the landing commit's
own subject and first paragraph. Read-only: nothing in it is ticked, answered
or deleted, there is no count, and the director shows it under
`≡ RELEASE NOTES` with no buttons. It records rather than requests, which is
the whole of the difference and the only reason it will be read.

**The cleanup moved into the landing too**, which is the other half of the
owner's ask — *cleanup of worktree branches […] should be done automatically in
the moment its merged to main*. `bun run land` deletes the branch as it
fast-forwards, since a tip that is an ancestor of `main` cannot lose anything,
and sweeps spent worktrees. The branch and the worktree do not go together: a
worktree is a workspace, and deleting the one a session is standing in destroys
that session's working directory, which costs whole context windows in failed
tool calls before anybody works out why. So the tree the landing ran in is kept
and moved onto `main`'s tip; every other merged tree goes once nothing has
happened in it for five days. Idle rather than old, so a tree worked in
yesterday is never taken, and `LAND_KEEP_DAYS` moves the window.

This supersedes the first half of **22**, which had branches outliving their
landing until every `Check:` was decided — that reasoning was already retired
there, and this removes the checks it was arguing about. The second half of 22,
pushing `main`, stands.

**And `docs/queue.md` itself followed, days later.** Keeping it as a
hand-worked list was the first cut, and it did not survive contact: the entries
emptied within the day, each one picked up in a session of its own, and a file
that is empty whenever it is read is a file nobody opens. What it was for —
knowing which of six lanes was in flight — stopped being a question the moment
the work went one session at a time. Its NOT BUILT YET tab went with it; the
PARKED tab beside it already holds the ideas nobody has started.

**Reconsider if:** several sessions run unattended and in parallel again, which
is the only condition under which a board joined to git earns its cost. Not if
the release notes go unread — that would mean they should be shorter or better
written, not that they should ask for something back.
