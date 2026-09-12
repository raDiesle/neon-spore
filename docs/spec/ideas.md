# Idea store

> **Status: none of it built.** Accepted in principle. Most of it is now worked
> out far enough that a session could start on one without having to decide the
> design first — none of it is a commitment. An idea leaves this page by being
> designed into [bestiary](bestiary.md), [systems](systems.md) or
> [wave-design](wave-design.md), or by being rejected in
> [open questions](open-questions.md).

## Accepted, not yet worked out

**What an entry is.** A one-line idea is a mood, and a mood cannot be picked up
by somebody who was not in the room when it was had. So an entry says three
things: what the thing is, where it attaches to the controls that actually
exist — the cannon's column, the shield's two halves, the maw, the beat, the
radar split — and what is still **unworked out**, written as questions rather
than left as a silence. The third part is the one that earns the page. An entry
with no open questions left is either finished, in which case it belongs in
another file, or it is lying.

Most of what follows has a **shape drawn at it** — a silhouette and an
own-motion, offered to the idea and not yet accepted by it. They are on the
director's SHAPES tab beside the contours the game already draws; see
[the asset catalogue](../asset-catalogue.md). A shape is not a name and a
suggestion is not a decision: an idea is free to refuse the one drawn for it.

An idea's sub-heading says **what it would become**, not how far along it is —
nothing on this page is built. A creature is a thing that falls down the field
and gets a silhouette; a mechanic is a rule the field plays by; a control is a
change to what a player's own hands do; a boss is a whole encounter waiting for
one of the slots in [bosses](bosses.md). The director's backlog page groups by
these four, so an idea that is filed wrongly is one edit here away from being
filed rightly, and there is no second list to change.

### Creatures

- **Herald** — the one creature the two players do not see at the same moment: it
  is drawn on the pilot's field one beat ahead of where it is, and on the
  navigator's at its true row. The pilot, who cannot fire, is the one who sees
  it first, so the only thing that kills it on time is a sentence — the
  [announcing](couplings.md) coupling with nothing invented for it. One beat
  rather than the original's one second, because the beat is the shared clock
  and 625 ms is a quantity both players can count ([latency](latency.md)). The
  lead is a **render** offset and never a second position in the simulation:
  `World` holds one creature at one row and each device draws its own role's
  view of it, or two devices disagree about where something is. Unworked out:
  whether the navigator sees the lead copy at all, faintly (which makes the
  pair's disagreement legible) or not (which makes it real); whether a shot
  fired into the ghost's row hits anything; whether the lead stays one beat all
  the way down or grows as it falls
- **Mine** — THE WISP standing still, and answered by a thumb rather than a
  shot. It appears on a tile and never moves; player 2 alone sees it, and
  player 1 — looking at an empty field — has to **tap the exact tile**. So it
  is the wisp's split (`sim/wisp.ts`: neither half is worth anything alone)
  with the aim taken out of it: not a column, a square, said in two words and
  landed by a finger rather than a bolt. Decided with the owner on
  12 September 2026: the navigator sees it and the pilot taps blind; **a tap
  on one of the four neighbouring tiles** — left, right, above, below — **is a
  hull hit** in its colour, drawn on the ship the way every hit is (the
  minesweeper rule, which is where the working name comes from); a tap
  anywhere farther away does no damage but **takes a beat off its fuse**, so
  feeling around is never free; the **fuse** — six beats, room for one wrong
  tap — is shown on **both** screens, and the lettered grid comes on for both
  as it does for a wisp, so both know *when* and only one knows *where*. When
  the fuse runs out it goes off: a hull hit and the body gone, on both
  screens. It carries no trigger colour, like the wisp — nothing about it is
  ammunition — but it has a skin colour, because damage to the ship is drawn
  in the colour of what did it. The tap is the pilot's field thumb, the one
  THE BEATBOX already gives the navigator, on the pilot's seat and on an
  empty-looking tile — no new control. Communication test: it creates
  information one seat has and the other needs, demands two words and a
  time, and a wrong word costs the hull. Timing at the default config: six
  beats is seven and a half seconds, enough to say "E nine", tap, be told
  "no — F nine", and tap again. Placement: rows two to twelve, never the hull
  row, never beside another mine. Three shapes are drawn at it on the SHAPES
  page (CALTROP, REACHER and SINKER, `tools/shape-sheet/src/drafts/creatures.ts`)
  — each says a different half of the rule: the four tiles that hurt, the
  neighbours being alive, and a body fixed to the field. Unworked out: whether
  the exact tap kills it outright or it takes two taps on the beat; whether
  the navigator's screen marks the four neighbours or only the seeing eye
  infers them; whether a second mine on the field shares the fuse or runs its
  own; and whether the pilot's tap on the tile should also be a real tap for
  THE BEATBOX's box when both are on one wave (they should never be)
- **Reverb** — one body that arrives twice: it takes a hit without dying and
  dies one beat later, and a second shot fired inside that beat is spent on
  something that is already gone. A different thing from the Herald, which is
  about *seeing* twice, and from THE ECHO, which is about becoming four; see
  the name clash in
  [bestiary](bestiary.md#103-examined-and-rejected). The delay is in the motion
  as well — travel, stop, wait, travel — so the pair can read the rhythm before
  they have to shoot against it. Unworked out: whether a pending death still
  costs the hull if the beat runs out at row 14, and it should, or the last beat
  of a wave is free; how the pending state is drawn, since the draft has no
  marker for it and a hit that visibly does nothing reads as a miss; whether the
  wasted second shot costs anything beyond the time it took
- **Moulting** — it changes which control answers it, halfway down. It falls
  armoured and faceted and shots only crater it, exactly as the meteor already
  does (`holes`, [systems](systems.md) 5.6); on a fixed beat the shell comes off
  and the soft body inside is killable for a bounded window, in a colour nobody
  knew until the moult. The shed shell keeps falling as a rock, so one arrival
  needs the cannon and then the shield, in that order. Control visibility needs
  no new rule for it: a wave holding one shows both groups from the start, and
  the pair sees the second half coming before they know why
  ([systems](systems.md) 5.1). Unworked out: whether the shell is a real second
  body spawned mid-field, which nothing in `entries.ts` does today, or debris
  that only looks like one; whether the moult is on a beat count or is provoked
  by damage; the colour has to be drawn from the seeded rng at spawn, or the two
  devices disagree the instant it is revealed
- **Symbiosis** — two bodies in one membrane, vulnerable only while they are
  apart, and they part on a period rather than on a timer, so the window is a
  shape both players watch arrive instead of a number one of them holds. The
  talking comes from the columns: the two bodies sit in different ones, the
  cannon is in one column at a time, and both have to be hit inside the same
  opening — the pilot slides while the navigator fires twice against a half-beat
  cooldown. Unworked out: whether hitting one alone re-merges and heals the
  pair, which is what would make the order matter; how far apart is far enough
  to read at 26 px, now that the cluster form genuinely parts and nobody has
  watched one at creature size ([the asset catalogue](../asset-catalogue.md));
  whether it is one
  creature spanning columns, as the torch's `colSpan` already does, or two that
  share a fate
- **Camouflage** — goes out when you take aim, so you have to aim beside it.
  Written for an aim beam that no longer exists; in the raster the aim is a
  column, so the re-grounding is that it dims on the **pilot's** field while the
  cannon stands in its column, and stays bright on the navigator's. The player
  who can see it cannot move the cannon, and the player holding the column has
  to be talked into staying on a piece of field that looks empty. Dims rather
  than disappears: every creature's position is present for both, disturbed or
  incomplete but never absent ([systems](systems.md) 5.2), and that ground rule
  is what stops this being a hit nobody could have taken. Unworked out: whether
  the radar blip goes out with it; whether it re-lights the moment the cannon
  leaves, which makes hunting it a wobble, or after a delay, which makes it a
  decision; whether the navigator can lose it too once a shot is in the air
- **The Colony** — it spreads while it falls, and it is the first creature that
  adds work rather than presenting it. Five small bodies in one skin with a root
  hanging under them; on the accented beat it hatches a dart into a neighbouring
  column. Ignoring it is a decision the pair has to make out loud, because
  everything else on the field is a fixed amount of work and this one is not.
  Unworked out: a mid-field spawn breaks the radar's promise, since the strip is
  a warning and a hatched dart arrives without one — either the brood shows on
  the strip as a second row, or the strip stops meaning what it means; the
  hatching needs a cap and a stop condition, or a wave runs away from a pair
  that is already losing; whether cutting the root is what ends it, which is the
  version where the tendril in the catalogue is a target and not a decoration
- **Prism** (working name only — "Mirror" is taken by [THE MIRROR](bosses.md),
  and the name **The Mirror** was already examined and rejected as a creature
  for an unrelated reason, [bestiary](bestiary.md#103-examined-and-rejected))
  — falls like a creature but is never destroyed by a hit: a shot that lands
  on it re-launches sideways, left or right, depending on which way the object
  is angled at that moment. Aim becomes two steps — where the shot goes in is
  not where it does damage — and it could be the answer for a creature sitting
  in a column with no clean line. Unworked out: what sets the angle (fixed at
  spawn, or does it flip on a timer or by column — the beat is right there);
  whether the redirected bolt keeps the shooter's colour; whether it can be
  wounded at all or is a pure router
- **Wave gate** — a creature that, unlike every other one, is not removed by
  reaching the hull: reaching it does no damage and does not count toward
  clearing the wave, and it holds there or loops back to the top for another
  pass. Only a hit removes it. It is the pod turned inside out — the pod is
  named as never blocking a wave's end ([systems](systems.md) 5.7); this one
  would exist for no other reason than to block it, forcing a queue to be
  beaten rather than merely outlasted. Unworked out: whether an arrival that
  loops back reads as different enough from an ordinary miss that the pair
  learns "that one comes back" rather than assuming the game glitched
  (`resolveHull` treats every arrival alike today); whether it loops forever
  or a bounded number of times, so a bad wave cannot soft-lock a run
- **Notch** — it steers for the damage already done, and it is the first
  creature on the field that changes lane at all. Hull scars are permanent and
  visible to **both** players ([systems](systems.md) 5.8); today they are
  history, and this is the one thing that would turn them into a target list.
  Red and answered by the cannon, exactly like a slick — everything new about
  it lives in one integer, the column it is heading for.

  **The rule, in whole columns.** It glides one tile per beat and holds its
  column between accents. On every accented beat — every fourth, the one the
  pair already hears — it re-picks: it counts the scars standing in each
  column, takes the deepest, and moves **one** column toward it, by the sign of
  the difference and never by a fraction. Ties go to the column nearest its
  own, and after that to the lower index, so the whole choice is a total order
  and two devices cannot round it apart. Fourteen beats from the top is three
  accents, so a Notch reaches at most three columns from where it spawned;
  that is the number a wave author has to hold in their head, and it is small
  enough to author against. The accent itself is `beat % 4` in
  `packages/audio/src/bind.ts` and nowhere else — a sim that spells the same
  arithmetic out a second time is precisely the drift `purity.test.ts` keeps a
  table against, so the accent moves into `sim` and the mixer reads it there.

  **The scars it reads are the recent ones.** `world.scars` is a list of
  events capped at `maxScars` (30) with the oldest shifted off, not a depth per
  column — so "deepest" is a count over a rolling window, and a column stops
  being the target once its damage has aged out behind thirty newer ones. That
  is not an implementation detail to be tidied away later: it is what keeps a
  long run recoverable, because a hull that has been hit everywhere would
  otherwise doom every later Notch to the same corner.

  **An unscarred hull leaves it going straight.** With nothing to steer for it
  holds its spawn column and reads as a slick wearing the wrong outline. The
  first one a pair ever meets is harmless and every one after it is worse,
  which is the teaching order for free — and it is honest, because the pair can
  *see* that it went straight rather than being told it was going to.

  **The sentence is what changes.** A column named across a 0.5–2 s voice delay
  ([latency](latency.md)) can be stale by the time it is heard, so "it's in six"
  is a worse sentence than "it's in six, going to four". Position splits the
  usual way — an `aim` kind, radar `p2`, so the navigator sees it coming and the
  pilot holds the cannon (`docs/decisions.md` #15) — but the *destination* does
  not split at all: the scars are on the hull and both players are looking at
  them. It is the first creature whose target is public while its position is
  private, and that asymmetry is what lets the pair compute the prediction
  together instead of one of them reading it out.

  **The tell has to arrive a beat early.** On the beat before an accent the body
  leans toward the column it is about to take. The lean is a render offset fed
  by the sim's target column and never a second position (CLAUDE.md rule 1), and
  it never leaves the lane (5.8): the shape carries the direction, the tile
  carries the placement. That is also why the drafts drawn at it — NOTCH 1 and
  NOTCH 2, in [the asset catalogue](../asset-catalogue.md) — are the only
  contours in that catalogue with a facing at all. There are two because there
  are two ways to say "that way" with an outline and nobody knows which one
  survives a phone: NOTCH 1 puts the direction in a barb, which is unmistakable
  and is exactly the size of thing that vanishes at 26 px, and NOTCH 2 puts it
  in the whole mass, which cannot vanish and may read as one more wobble. They
  commit on the same beats, so the page is asking one question and not two.

  **What it would cost.** One integer on `Creature`, a re-pick in `beat.ts` on
  the accent, the accent itself moved into `sim`, and a lean in
  `packages/render/src/creatures.ts` reading the target. One further edit, worth
  naming now rather than discovering mid-build: `livingKindForColor` maps a
  colour to exactly one living kind, so a *third* kind carrying red means a wave
  entry has to be able to name its kind and let the colour follow, instead of
  the other way round. Nothing else in the bestiary has needed that yet.

  Unworked out: whether a lean reads as a lean at 26 px, where the bulb already
  sways and the slick already tilts and a small body has only so many ways to
  move — an eye's question, and the two NOTCH drafts are the two candidate
  answers to it rather than one proposal and a caveat; and whether a wave
  holding one has to be authored so that a scar already exists, or whether the
  inert first one is the better teaching after all
- **Husk** — a pod that should be refused, and the cheapest new object in the
  store: a fourth `PodKind` beside `mend`, `purge` and `ward`. No new list, no
  new category, no new control, no new gesture. It hangs amber at a fixed column
  and row and does nothing; it is never cleared and never blocks the end of a
  wave; it is a pod in every respect ([systems](systems.md) 5.7) except what it
  gives.

  **It is freed the same way and costs the same to free.** The pilot holds the
  column, the navigator fires, either colour. That price is paid *before*
  anybody knows what they bought — a shot and half a beat of cooldown, which on
  a wave carrying rocks is a rock left unanswered. A husk that could be read
  while it still hung would be free to ignore, and free to ignore is not a
  decision.

  **Taking it in inverts the receipt.** A pod gives and a husk takes the same
  thing away — it was `podRepair` hull points against `mend` while the hull
  had points; with two pod kinds left it would have to spend the ward or
  purge the *ship's* shots instead; there is no flash, and the ship darkens
  from inside instead of lighting. Player 1 learns the answer the way they learn
  every other one, from the ship rather than from a number.

  **Refusing costs no hull and a great deal of everything else.** A husk that
  arrives with the maw shut breaks on the skin exactly as a missed pod does: no
  damage, no scar. So a pair who simply never open the maw are safe from it —
  and give up `purge`, which sweeps the field, and `ward`, which holds the
  shield armed without a trigger. Those are the two pods that answer a wave, so
  a standing refusal is not a safe strategy, it is a wave surrendered. The husk
  invents no punishment; it only has to make an existing gift into a question.

  **The tell is the core, not the strip.** The idea store first said radar, and
  the radar does not carry pods at all: the strips are owned per creature kind
  (`docs/decisions.md` #15) and a pod is not a creature. Putting pods on a strip
  to hold one bit is a large change for a small purpose. What is already drawn
  is better. Every pod's core carries a **glyph** — `mend` a heart, `purge` a
  bomb, `ward` a shield — because a pair chasing one down the field has to name
  it before deciding whether it is worth chasing
  (`packages/render/src/pods.ts`). A husk wears the heart. It is a `mend` that
  has died, and the heart is what makes it a lie. What it does not do is
  **beat**: a hanging pod's core pulses and its whole body bobs, and a husk's
  core sits at one dead brightness and its body hangs still.

  **So the split is workload, not information.** Both players can see the core.
  Only one of them has the attention to watch it for a beat: the pilot in the
  last stretch is holding a column and an 800 ms window at once, while the
  navigator, having fired it loose, has nothing to do until the catch resolves.
  Nothing is hidden from anybody, which keeps 5.2 intact — every position is
  present for both, disturbed or incomplete but never absent — and it is the
  first time the game separates the pair by how busy they are rather than by
  what they are shown.

  **And the body sags.** A pod is taut; a husk is the same capsule with its mass
  gone to the bottom. That is a second and slower tell, for a pair who have met
  one before, and it is the one thing here drawn *at the edge of legibility on
  purpose* — a husk that announces itself while it still hangs is free to
  ignore. So [the asset catalogue](../asset-catalogue.md) carries two, and they
  are the same question at two strengths. HUSK 1 is the pod's own skin with the
  mass moved down and no landmark touched, which may leave an eye nothing to
  point at. HUSK 2 adds one fallen shoulder — a dent about a quarter of the
  radius deep across a quarter of the outline, off-centre so it reads as damage
  rather than as something the thing was built with. Somewhere between those two
  is the line, and the page is where it gets found. Below it the dead core
  carries the whole tell alone; above it the husk stops being a gamble.

  Unworked out: whether the first husk of a run is taught
  ([briefings](briefings.md)) — the world explains itself everywhere else, which
  argues for teaching it and letting the trap be per-pod rather than per-run;
  and whether a husk may share a wave with a `mend`, since two identical amber
  hearts falling together is either the whole idea or one coin-flip too many

### Bosses

Four encounters, each naming the slot in [bosses](bosses.md) it would fit.
Cut to what each asks of the pair on 12 September 2026, at the owner's ask;
what a hand does is the point of every one, and the pictures drawn at them
are on the director's SHAPES tab, not here. THE VANE left this list because it
is built ([bosses](bosses.md) 11.5).

- **THE WEIGHT** — *a creature of this name is built* (12 September 2026): a sac
  that sinks a lane a beat and gives to a hand from each seat held together, with
  each thumb drawn on its own screen and nowhere else. What is below is still the
  **boss**, and none of it shipped — see [transfers-bosses](transfers-bosses.md).
  The boss you hold up with your thumbs. It sinks steadily
  instead of holding a row; a thumb pressed on it stops it, two thumbs lift
  it, and it has no weak point until it has been dragged below a line. But two
  thumbs on the boss is nobody on the cannon, and it sheds rocks while held —
  so the fight is the pair negotiating out loud who lets go, when, to shoot.
  *Screen: a heavy sac on a stalk over the field, its skin going taut and
  bright toward whichever thumb holds it.* Slot: The Heart (60). Unworked out:
  whether the pair *lets* it fall past the line or *drags* it there — a drag
  is a gesture the game does not have yet
- **THE CODEX** — it swaps what red and cyan do for one seat without saying
  so, and the current key is written on its own skin, legible only to the
  *other* seat. So the one who fires cannot read what a colour means and the
  one who can read it cannot fire. Slot: The Codex (80). Unworked out: how
  long a swap holds and whether it is announced by anything but a partner
- **THE TITHE** — it always takes something and the pair chooses what. Each
  cycle: two rocks in two columns on one beat, one shield, and one plate lit
  in a third column wanting the cannon on that same beat. Two hands, three
  demands, so every cycle is one sentence about what to give up, and the first
  boss where taking a scar on purpose is the right play. *Screen: a slab
  across seven columns with a row of plates under it; the live plate reaches
  down.* Slot: The Kernel (100). Unworked out: the choice must be legible a
  cycle ahead, or it is merely mean
- **THE CAIRN** — a pile of the field's own rocks that cannot be shot: you
  take it apart by hand. A thumb dragged across one unit pulls it out of the
  pile, and once loose it falls as an ordinary rock to be warded like any
  other. The fight is rate — pull two and you have two rocks and one shield —
  so it asks how much your partner can absorb right now. *Screen: seven rocks
  in one outline; drag one clear and there are two outlines.* Slot: The Heart
  (60), the same slot as THE WEIGHT; build one of them. Unworked out: what
  stops a pair pulling nothing and waiting

### Mechanics

- **The point score** — one shared figure (`World.score`, in `hashWorld`),
  paid at fifty-one places in the simulation from `score*` fields: the
  ordinary body's `scoreDestroy` 100 and `scoreDeflect` 150, `scoreWave` 300
  for a wave cleared, `scorePod` 250 for a pod taken in, and a price per
  creature part — a throb hit, a shell piece, an opened clasp, a veil, a
  wisp, an echo body, a rind layer, a lid, a coil break — argued against each
  other in `config-creature-scores.ts`. The HUD's corner showed it, the
  balance sheet closed on it, the room kept the higher of the two seats'
  figures field by field beside the furthest wave, the menu said *Last score
  12300*, and the director's ship editor had a SCORE group. Taken out on 12
  September 2026, the day after the hull's points, by the same rule: once a
  hit costs the wave and a run is *the time played and the retries*, a
  second currency counted nothing the clock did not, and a number that only
  went up told the pair less than one that could be beaten. What stands
  where it stood: the clock and the retries lead the sheet and the corner,
  the intro says `TRY n` on a retry, the room and the menu remember *wave ·
  time · retries* (`RunMark`, `PROTOCOL_VERSION` 2). To restore: the fields
  and their defaults from `config.ts` and `config-creature-scores.ts` at
  `60978e54`, `score` back on `World` and in `hashWorld`, the `world.score +=`
  lines the same commit's diff removed, and a `score` on `BalanceSheet`,
  `RunMark` and `Progress`. It belongs, if anywhere, with a mode where a hit
  does *not* fail the wave, beside the hull points below
- **Hull points, the bar, regeneration and the mend pod** — the ship had a
  hull figure (`World.hullMilli`, 0–100 in thousandths), every body that
  reached it took a number off (`damageCreature` 12, `damageMeteor` 20 and a
  field per kind, `config-*.ts`), the figure crept back at
  `hullRegenPerSecond`, a bar top left of the HUD showed it (`hullBarBox`,
  `drawHeart`, the rim glow fading with it), the run ended at zero
  (`hull.dead`), and the plain pod — the one a wave got by naming no kind —
  gave `podRepair` points back with a `+HULL` banner and `hull.mend`. Taken
  out on 12 September 2026 by the owner's rule that *a hit fails the wave*:
  once every hit costs the wave, a figure that drains by twelves is a second
  price nobody reads, and a pod that pays it back mends nothing. What
  survives: the scars, the craters, the crack across the cockpit, and a
  **weight** on every breach (`BreachWeight`, `impact.ts`) that picks the
  heavy or light sound; `hull.mend` and `hull.alarm`'s old use are `spare`
  in the catalogue. To restore: `hullMilli` back on `World` and in
  `hashWorld`, a `damage` per kind beside the weight in `breachHull`
  (`hull-damage.ts`), `regenerateHull` in `step`, `"mend"` back in
  `POD_KINDS` (append, never insert — the index is the wire value) with
  `mend()` in `pod-effects.ts`, and the bar from `hud.ts`'s history at
  `6f902f6e`. It belongs, if anywhere, with a mode where a hit does *not*
  fail the wave, since that is the only game in which a second price means
  anything
- **THE CHOKE's body and its tap-off** — for a day THE CHOKE was a creature:
  TENDRIL's sac in bile yellow falling one lane at a slick's pace, unshootable
  and unwardable, that landed, crawled along the plating to the cannon and
  took it — the strip dead, the cannon walking a column a beat wall to wall —
  until player 1 had tapped the dead strip `chokeTaps` times, a lift between
  each, the loops round the swelling unwinding one per share and the same
  loops on the strip's node, with a beckoning ring on the node between taps.
  Taken out on 12 September 2026 at the owner's word — *should be the same
  kind of control set modifier, no brush* — so THE CHOKE is the third fault
  now, on for the whole wave with nothing to get it off
  ([bestiary](bestiary.md#the-malfunction)). What is parked here is the
  **body and the tap**: a fault that *arrives* partway through a wave on a
  thing the pair can see coming, and a broken control that a gesture can win
  back — the one fault with a brake, which is exactly what the owner took off
  the other two on 6 September. To restore: the tree at `6b193880` holds all
  of it — the sim's choke module and its events, `chokeTaps` in
  `packages/sim/src/config-choke.ts`, the `"choke"` kind and drag target,
  the render's choke, strand and crawl modules and content's choke
  silhouette. It belongs, if
  anywhere, on a *later* fault wave, where a pair that has learnt to live
  with a fault is offered one they can fight
- **The crystal's dive** — a wrong shot at THE CRYSTAL (wave 43) costs the
  pair a row: the body dives `crystalDiveRows` toward the ship, so fourteen
  beats becomes thirteen with every guess. Built and shipped on 11 September
  2026 and taken out the next day at the owner's word — *when hit wrong, it
  shouldn't fall faster, just nothing* — because the dive made the first
  crystal a body the pair lost to before they had read it. What survives is
  the catch: the shell throws the shot off with a spark and its own sound
  (`crystalCatch`) and the body goes on as it was. The dive is one line to
  restore in `crystalStruck` (`packages/sim/src/crystal.ts`) — `hit.fromRow =
  hit.row; hit.row += cfg.crystalDiveRows` beside the catch event, with the
  field back in `config-crystal.ts` — and it belongs, if anywhere, on a
  *later* crystal wave, where a pair that already knows the answer is being
  asked to stop guessing at it
- **Reverse wave** — a wave from below, and the reason nothing was drawn at it
  is that a direction is not a shape. The breach is what would give it one:
  something comes up out of a hole in the hull, and since the hull is the bottom
  row, a reverse wave is not an arrival from off-screen at all — it is the
  ship's own damage turning into enemies. Unworked out, and this is the crux:
  the cannon fires straight up from the hull, so a thing **below** the hull line
  cannot be shot at all. Either it climbs first and the fight starts when it is
  level with the field like everything else, or the pair has an arrival with no
  answer, which is a different game. The radar is the top edge only
  ([systems](systems.md) 5.8), so the warning has to appear somewhere it never
  has; and [the 4-second rule](latency.md) is measured from the top, so
  something that starts at the hull has no budget at all until it has climbed
- **The breach** — a column scarred past a threshold stops being cosmetic and
  opens. Scars are already permanent, already at a column and already drawn
  (`Scar`, `maxScars`); this is the single rule that would make them structural
  instead of a record. What an open column *does* is deliberately not settled
  here: it could let the next arrival through for nothing, it could be where a
  reverse wave comes from, it could be the thing a repair pod is finally for.
  Unworked out: whether anything closes one, now that the hull no longer
  regenerates (see the Mechanics note above), which decides whether a run can
  recover or only decay; how many
  arrivals in one column is the threshold, and whether the pair can watch it
  approach, since a hull that gives way without warning reads as the game
  cheating; whether a breach is per column or per neighbouring pair, because
  eleven independent columns is eleven small collapses and not one crisis;
  and **The Patch** below is the same scar from the other side, so whichever
  is built first decides what the other one means
- **Light traces** — a line that lags whatever drew it, so it says where
  something **was**. This is a rule broken on purpose: there are no path
  indicators in the field, not even for meteors, and the only line is your own
  cannon's column ([systems](systems.md) 5.8). A trace has to earn that, and it
  earns it by being past tense and by belonging to one player — history for the
  one who cannot act, the present for the one who can, the mirror image of the
  Thread and its future. Unworked out: whether a trace belongs to a creature, a
  wave or a pod; whether the trace of a thing that glides one tile per beat says
  anything at all, since a straight lane makes a straight trace and a straight
  trace is a repetition rather than information — which may mean this idea has
  to wait for the first creature that changes lane, and the Notch above is it
- **The Needle** — a geometric corridor, and the first thing on the field that
  is not in a lane. Drawn rather than grown, crossing columns, and it does not
  so much occupy a column as close it: a shot has to pass a gap that only lines
  up with the cannon on some beats. Position from player 1, moment from the
  beat — warding's shape pointed at firing instead of defence. Unworked out:
  whether it stops bullets, creatures or both; how it is stored, because the
  simulation holds integers and a diagonal has to be a per-column table of open
  and closed rather than a line equation, and choosing the wrong one of those is
  a rounding disagreement between two devices; whether it moves at all, or is
  fixed wave furniture the pair works around
- **The Patch** — a scar you can hold shut. Damage is a number today; here a
  fresh scar leaves its column open — the cannon cannot fire through it, or a
  hit there costs double — until somebody holds a hand on it for a few beats.
  It is [THE GRIP](assists.md#64-the-grip--keep-watch-built) pointed inward at
  your own hull, so it needs no new gesture, and it is one answer to
  [open question 17](open-questions.md#from-the-raster-round), which asks
  whether the hull stays mute. Taken from the breaches in Lovers in a Dangerous
  Spacetime; see [transfers](transfers.md). **The breach** above is the same
  scar left alone rather than held shut. Unworked out: whether the open
  column blocks your own shots or only doubles the damage, and how long a patch
  holds
- **The Flip** — the field's column order reverses for one player, so column
  four on one device is column eight on the other, and every announcement has
  to be turned around out loud. Spaceteam's wormhole. This is the shape that
  was rejected as The Mirror and The Translator
  ([bestiary](bestiary.md#103-examined-and-rejected)), and it comes back on one
  condition: the world explains it. A field that visibly rolls over, for a
  bounded number of beats, with both devices told which of them turned, is a
  mechanic; a silent disagreement between two screens is a bug the pair will
  report. Unworked out: how long it lasts, and what triggers it. [THE VANE](bosses.md#115-the-vane--the-arm-that-decides-where-you-are-hit)
  proposed this exact roll and built something else instead — folding where
  things land in the simulation rather than rolling the render — because a
  flip the simulation never hears about has nothing to hash, nothing to
  replay and nothing the director can show. The roll is still unbuilt and
  still worth having; the lesson from the boss that almost was it is to prove
  it at wave scale first, in `layout.ts` and `touch.ts`, where a bad answer
  costs one wave, and let a boss claim it afterwards only if it survives
- **The Fork** — the run stops between waves and continues only when both
  thumbs are down, and the pair chooses which of two routes to take with half
  the knowledge each: the pilot the rock traffic, the navigator the colour mix.
  The only announcement in the game with no falling object over it, and the
  only moment that belongs to the pair rather than to the clock. From
  Spaceteam's warp jump and the forking levels of Lovers in a Dangerous
  Spacetime. Unworked out: what a fork does to wave numbering and the save
  points ([structure](structure.md), open question 11)
- **Cracks in the cockpit** — a downward spiral, moved here from "Deliberately
  deferred" rather than deleted: nothing about it was ever argued down, it was
  only ungrounded, written for a version of this game with an aim beam and a
  cockpit view to crack. What survives the name is a picture rather than a
  score — the field's own read on things going wrong deepening visibly as they
  do, the way a windscreen spreads a new crack with every impact rather than
  reporting one more hit as a number. The hull already has exactly this
  machinery, `Scar`, drawn as the ship's own damage ([systems](systems.md)
  5.7). Unworked out, and this is most of it: whether
  "cockpit" means anything once the field is drawn from outside the ship
  rather than from within one, or whether the idea is really about the hull's
  own picture and the name is the free-flight assumption that has to go;
  what would spiral rather than accumulate, since the existing scars are a
  flat record and a spiral wants the *rate* to worsen with the damage; and
  whether it is a second decay track or the same `Scar`s read differently at
  higher counts
- **THE CALL — a gate a wave opens through** — the tutorial design scored
  on 27 August 2026 and never built: a wave that does not start until the
  pair has *done* its new thing together, the field frozen under a live
  two-hand puzzle, one half on each phone. What shipped instead is the
  guide the pair *reads* — three lines split across the two screens, no gate,
  no freeze ([briefings](briefings.md)) — and the owner's direction is to
  keep improving that with animation and fewer words, not to build the gate.
  The whole design, argued out with its pages, its beat tables and the
  scores of its alternatives, is `docs/teaching.md` under *THE CALL*; it read
  on the director's DESIGNS tab until 12 September 2026, when that tab went
- **The living field — what `docs/alive.md` still asks** — the 27 August
  2026 plan for a field that reads as living rather than drawn. Most of it is
  landed or overtaken: the bulb's depth went to 0.24 rather than the 0.13 it
  argued, the throb was rebuilt on 5 September and the runt retired, VERSUS
  exists, and the pose clock runs on beats. Three things in it are still
  open and are not decided by argument. *The landing in unison*: every body
  squashing on the same downbeat is either the shared clock made visible or
  a field of metronomes, and only a phone at tempo can tell — a VERSUS slot
  with the gains at full against every gain halved. *The shock recoil*:
  whether a neighbour's flinch reads as sympathy or as damage is a question
  about what a player then does, which is a playtest with two people, not a
  picture. *An interior gradient at 26 px*: the flat swatch against a value
  gradient under the skin, a straight disagreement with
  [graphics](graphics.md)'s own sentence that detail does not survive there.
  The argument for each is in the file; its numbers are not current

### Controls

- **Interference** — one player's colours are swapped and they do not know it.
  The navigator chooses the colour and fires, so the swap lives on their
  swatches: they say red and cyan comes out. Nobody is told; the pair finds out
  through the contradiction between what one of them says and what the other
  sees, which makes it the only mechanic here that is *discovered* rather than
  announced. It is a fact in the simulation and a mapping in the renderer — the
  sim knows which colour was fired, each device draws its own role's labels, and
  the one-way flow stays intact. Unworked out: how it ends, where the
  interesting answer is that the pilot ends it, being the one who can see it and
  the one with a spare hand on the trigger; how long it may run before it stops
  being a joke and becomes a lost wave; how a briefing ([briefings](briefings.md))
  teaches a thing whose whole point is not being told
- **Bearing waves** — a coordinate grid, which is a change to the sentence
  rather than to the controls. Columns are counted today, so an announcement is
  a number both players derive the same way and neither can get wrong. A ring
  with a mark on it gives a zero that can be named without counting, two right
  of the mark, and the mark turns on the beat, so the same column has a
  different name a moment later. Unworked out: whether both players see the
  ring, because if they do it is a rename and nothing else, and if only one does
  then the other cannot check the sentence they were handed; whether eleven
  columns can be named off a ring at a glance on a phone; whether the turn is on
  the beat, which makes it countable, or continuous, which makes it a race
- **Codebook table** — the key is on the ship, and only the other player can
  read it. A plate on the hull carries a mapping from something said to
  something done: a word to a column, a mark to a colour. It is the Glyph
  creature's other half ([bestiary](bestiary.md) 10.1) and the ground THE CODEX
  stands on. Unworked out: how many rows stay legible on a phone beside
  everything else on the screen, which is probably a very small number; whether
  the lookup costs time, because a key readable at a glance is free and a free
  key changes nothing; whether it is fixed for a run, redrawn per wave or
  rewritten mid-wave, which is the difference between learning a table and
  reading one
- **Inverted instructions** — the Spaceteam principle: a control that does the
  opposite of what it says, for a bounded time. The Choke
  ([bestiary](bestiary.md) 10.1) already shuts a control down; this is the
  milder and more talkative version, and the ship says so by drawing a span of
  its own membrane reversed. Not every control can take it — the trigger is a
  moment, and an inverted moment is only a miss, so the honest candidates are
  the cannon strip, where left is right, and the shield's queued move. Unworked
  out: whether the inversion is shown to the player it happens to, making it a
  puzzle, or only to the other one, making it a conversation; whether it
  survives control visibility, since a wave that hides a control group cannot
  invert it ([systems](systems.md) 5.1); how it is undone
- **Call signs** — the eleven columns get names instead of numbers, chosen the
  way Spaceteam chooses its words: to be unmistakable when shouted across a
  laggy channel. Naming rule 3 ([bestiary](bestiary.md#naming)) applies to
  creatures and was never applied to the field, where "seven" and "eleven"
  share a vowel and an ending. The trade cuts both ways — numbers carry order
  for free and names have to be learnt — so the likely answer is partial: fix
  the collisions, or name the few columns that matter and count from them
- **The Other Hand** — your hull shows that your partner's thumb is down, never
  what it is doing. A lobe brightens while they hold something and goes out
  when they let go. It is what survives of the single shared screen in Lovers
  in a Dangerous Spacetime, deliberately narrowed: knowing their column would
  replace a sentence, knowing only that their hands are full changes which
  sentence you say. If it gives away too much it belongs in
  [assists](assists.md) with a price on it, like sharing sight
- **Handover** — the two control sets trade owners in the middle of a wave.
  Roles are picked before a run and kept, with a separate best run per split as
  the incentive to swap ([roles](roles.md)); this makes the swap something that
  happens *inside* a wave, announced by the ship rather than agreed beforehand.
  Everything each player has learned about their own half becomes something they
  have to say out loud to somebody who is now holding it. Unworked out: whether
  radar ownership travels with the controls, and it almost certainly must, since
  the whole point of the split is that the one who knows is not the one who acts
  ([systems](systems.md) 5.2); whether a shield move already queued survives the
  handover; whether it reads as exciting rather than as simply losing the wave,
  which is a question a prototype answers and a paragraph does not

### Weapons

A power-up changes what the cannon fires, never how it is aimed: the cannon
still slides one column at a time and a press still stands it in the column an
announcement named; only the shape of what leaves it differs, for a bounded
time, picked up the way the game's other power-ups already are.

- **Spread shot** — a shot that lands across more than one column at once,
  under a power-up rather than as the standard weapon. Refused once as a plain
  replacement: the standard shot (`docs/spec/systems.md` 5.5) is a single
  bubble in a single column, and aiming's whole discipline is standing the
  cannon in the *one* column an announcement names — "it slides along the hull
  and never aims sideways… standing in the column is the whole of aiming"
  (`docs/spec/briefings.md`, step 3). A shot that lands across several columns
  removes the reason the standard one is exact, because the pair no longer has
  to agree on a single column, only on being near it. A power-up scopes that
  cost to a bounded pickup instead of to the whole game: the controls stay
  identical, only the shot leaving them changes, for as long as it lasts.
  Unworked out: how wide the spread is, and whether it is announced as "the
  wide gun" rather than by column at all while it runs, since a spread shot
  still answering to a single-column announcement half-defeats the point of
  carrying one; what kind of pod grants it, since nothing today changes what
  the cannon fires; how long it lasts, and what a spread shot already in
  flight does when it expires
- **The drill** — the lance as a thing that *travels*, which is what it was for
  a day. It was built on 7 September 2026 and taken out again the same day: a
  full lobe fired a slow bolt at half the cannon's speed that passed through
  every body of its own colour on its way up the column, drawn as a ribbon
  three and a half tiles long whose two edges wavered in opposite phases so it
  swelled and pinched along its length, with three nodules riding inside it and
  a white filament down the middle. The owner watched the fill and decided the
  *beam* is the weapon instead — so the column burns on the tick the lobe fills
  and nothing leaves the ship, which is also the field's own rule
  (CLAUDE.md: nothing the players control travels).
  What the travelling version had that the beam does not: **a shot in the air
  is a thing that can still be answered**. Two beats of flight is two beats in
  which a body steps out of the column, a fence closes over it, or a wall of
  rocks lands in front of it — none of which the beam can ever be too late for,
  because it is never early. Unworked out: whether that belongs to a *different*
  weapon rather than to the lance, since a pair that has held a colour for three
  beats has earned certainty and a shot that can be dodged out of takes it back;
  what would grant it, since the lance is not a pickup; and whether the ribbon
  reads at all against the beam standing in the same column, which is the one
  thing that cannot be argued and has to be seen — `git show de17df5c`, the
  commit that removed it, for the drawing.

### Rounds

Short rounds that are not the field: their own rules, their own controls,
their own picture, over in about ninety seconds. What a round is allowed to
be is [interludes](interludes.md). **A built round stops being an idea and
its entry is cut** — THE GAUGE and SNAKE are written up in
[interludes](interludes.md); THE CLAW turned into a control set and is in
[controls](controls.md); THE TELL is [bosses](bosses.md) 11.9. The list was
cut to seven on 12 September 2026, at the owner's ask, keeping the rounds
built on a gesture or an information split and dropping the ones that were
counted on the beat or were reflex games (THE DUET, THE CRANK, THE DIVIDE,
THE FLOOR, THE BELT), a mechanism without a round (THE REPRISE, THE EDGE),
or a second *you read, I hold* (THE THROTTLE); their arguments stay in
[party games](../party-games.md) and
[transfers-hazelight](transfers-hazelight.md). None of these needs the
no-travel rule relaxed.

- **THE LATHE** — one seat describes a shape, the other builds it blind. The
  navigator sees a target contour and no controls; the pilot sees four knobs
  — lobes, radius, bump depth, bump position, the numbers the game's own blobs
  are made of — and a contour that is not the target. The only channel is
  "three lobes, fatter at the top", which is where the pair finds out whether
  the game's vocabulary works. Unworked out: how close is close enough, as an
  integer both devices compute the same
- **THE VAULT** — pairs across two phones, with the faces on the wrong one.
  A grid of slabs face down on both; each seat can read the faces of the
  cells only the *other* can turn. Every turn is dictated, and a pair that
  stops narrating loses the board. Unworked out: whether a wrong pair costs a
  turn; the grid size, which is the whole difficulty on a phone
- **THE ACCORD** — two dials, no picture in common. Each seat has a dial
  showing a number neither chose; the round ends when both read the same, and
  neither can see the other's. No right answer, only an agreed one, invented
  and executed before the count runs out. Unworked out: whether the dials
  wrap, which is probably the best thing in it
- **THE SPLICE** — a tangle of cable, and the colour on the wrong phone. The
  navigator sees where each strand enters, the pilot where each leaves; the
  tangle between is drawn on both and legible on neither. Cutting the right
  one takes a call from one seat and a press from the other; cutting the wrong
  one re-tangles the rest. Unworked out: whether strands may cross at all,
  since a truly unreadable tangle is decided by eyesight
- **THE WELL** — the field turned inside out: the hull at the centre, bodies
  falling inward from a rim, eleven columns become a clock face. Nothing in
  the simulation changes, only the projection — and the sentence: "column
  four" becomes "four o'clock". It fails the first test of a round (the field
  is not gone, it is redrawn), so its real home may be the modifier waves 8–9
  of an act. Unworked out: which of the two it is; whether both phones flip
  or only one
- **THE FUSE** — five valves on one bomb, and the evidence is on the wrong
  phone. Only the pilot can hold a valve down; only the navigator can read the
  needle that answers while it is held. Held through one beat and released,
  a valve is dead; held into the next, it goes off. Luck taken out of a party
  game and deduction put in: the pair narrows five to one, out loud.
  *Screen, pilot: five valves to press and hold. Navigator: one needle and no
  valves.* Unworked out: whether the tell is a number (sayable at once) or a
  needle (the pair invents a vocabulary in ninety seconds); whether a wrong
  valve costs the hull or the round
- **THE SLING** — one seat winds it and the other says when. A launcher on the
  hull: the pilot holds a slab and the charge climbs one step per beat, and
  that is all that seat sees. The navigator alone sees the target and how far
  off it is, and has no slab. Release on the called beat and it lands — a
  cannon, a charge and a call, the smallest round that is recognisably this
  game. Unworked out: whether overwinding fails or overshoots (overshooting is
  the better round); what unit a distance is called in when there are no
  columns

## Deliberately deferred

- **THE CONDUCTOR, bending the tempo** — a boss drawn as a pendulum arm
  sweeping the top of the field, an open contour rather than a body, whose arm
  position *is* the tempo: it speeds the beat up and slows it down, and the grid
  pulse, the shield's queued move and the fire cooldown all follow. Deferred
  rather than rejected, and deferred for one reason — the shared beat is what
  makes an announcement survive a 0.5–2 s voice delay
  ([latency](latency.md), `docs/decisions.md` #2), so a boss that bends it is
  attacking the load-bearing wall. The slot keeps the name; the pendulum shape
  is already spent, though — THE VANE ([bosses](bosses.md#115-the-vane--the-arm-that-decides-where-you-are-hit))
  drew it first, for a boss that bends the field instead of the beat. Anything
  built at this slot from here needs a picture of its own

## Note

Several of these were written for free flight and assume an aim beam or
evasion. Three of them have been re-grounded above: **Camouflage** is now
about the cannon's column rather than a beam, **Bearing waves** is about the
sentence rather than a heading to steer on, and **Cracks in the cockpit** has
moved up to Mechanics still mostly ungrounded, on the reasoning that an idea
nobody has argued with belongs with the others waiting to be worked out
rather than in a list for the ones that were turned down. The rule holds for
anything else that moves off this page — the communication idea inside an old
entry usually survives the control model and the gesture does not, so it has
to be re-grounded in the cannon, the shield and the beat before it is designed
in.
