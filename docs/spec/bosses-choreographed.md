# Choreographed bosses — A Way Out, read against this engine

> **Status: all fifteen are in the game, a sixteenth is half in — its
> simulation landed, its look not started — and a seventeenth is written and
> unstarted.** The fifteen were written on 16
> September 2026 from the owner's brief for encounters that read as
> *interactive action scenes* rather than arcade fights, with Hazelight's A Way
> Out named as the reference, and every one of them was built inside two days —
> the ledger below names the lane, the wave and the §11 write-up for each.
> The last of them, §12 THE ANTIPHON, finished on 17 September 2026. The
> sixteenth, [§16 THE INSTAR](#16-the-instar--whether-two-different-hands-can-finish-one-beat),
> is the owner's own ask of that day and the first boss with no panel at all,
> and it is the one that built the step machinery every scene on this page
> was waiting for. What else is unbuilt here is the *Not built* clause at the
> end of a built concept's row, and the primitive library two thirds down.
>
> **Five more were written 20 September 2026**
> ([§18](#18-the-gimbal--whether-the-same-turn-means-the-same-thing-to-both-of-you)
> through
> [§22](#22-the-ratchet--whether-a-step-can-be-taken-back)), from the owner's
> own ask for more of exactly this kind — heavy on choreography, light on the
> panel, more than ten states apiece that ask an action of the pair on nearly
> every one. Nothing of any of the five is built; each is queued as two
> `docs/queue.md` items, the picture `LOCAL ONLY` and waiting on the
> simulation, which anybody may take.
>
> It is the second boss-idea page rather than the third: the one that read the
> same two reference games at boss scale was deleted on 17 September 2026 as
> boss ideas older than the owner keeps.
> [bosses](bosses.md) holds the worked and built designs, and this one mines a
> game that has **no enemies at all**.
>
> The brief arrived with a twelve-card sheet drawn by another model. Four of
> its premises need correcting against this engine and are corrected below by
> name rather than quietly worked around — though **the slow motion it asks for
> is allowed**, on the owner's ruling of 16 September 2026
> (`docs/decisions.md` #33), which reversed this page's own first answer; six of its twelve cards are re-skins of
> bosses already shipped and are [refused by name](#refused-by-name). What
> survives is worth the page.

## Contents

The seventeen, by what is left to do rather than by the number each was
written at. **The `§n` numbers are not in sequence down the page, on**
**purpose:** `tools/director/src/ship-notes-choreo.ts` and half of
[bosses](bosses.md)'s own write-ups cite a concept by its number, and
reordering the page without keeping them would break every one of them.

**Not built — written and nobody has started it**

- **[THE FILAMENT](#17-the-filament--whether-you-can-follow-a-line-that-is-still-being-drawn)** · §17 — whether you can follow a line that is still being drawn. Written 17 September 2026 out of [the second brief](#a-second-brief-and-the-four-things-in-it-this-page-did-not-have)'s one absent category, and it wants `TraceDrag`, which is the only gesture on either brief with no ancestor anywhere in this game
- **[THE GIMBAL](#18-the-gimbal--whether-the-same-turn-means-the-same-thing-to-both-of-you)** · §18 — whether the same turn means the same thing to both of you. One of [five more](#five-more-asked-for-by-name) written 20 September 2026; queued in two lanes, cloud and local
- **[THE BELLOWS](#19-the-bellows--whether-you-can-push-when-she-is-pulling)** · §19 — whether you can push when she is pulling. One of [five more](#five-more-asked-for-by-name); built 22 September 2026 and taken out on 24 September 2026 — [bosses](bosses.md) §11.35, under *Retired*, has the owner's reason
- **[THE HASP](#20-the-hasp--whether-a-grip-nobody-can-see-is-the-one-holding-the-door)** · §20 — whether a grip nobody can see is the one holding the door. One of [five more](#five-more-asked-for-by-name); **lane one landed 22 September 2026** as [bosses](bosses.md) §11.37, wave 101; the look and the hands landed 23 September 2026 — lane two done
- **[THE SPOOL](#21-the-spool--whether-letting-it-run-is-the-point)** · §21 — whether letting it run is the point. One of [five more](#five-more-asked-for-by-name); **lane one landed 22 September 2026** as [bosses](bosses.md) §11.36, wave 100, and **the look's body 23 September** — the hands are open
- **[THE RATCHET](#22-the-ratchet--whether-a-step-can-be-taken-back)** · §22 — whether a step can be taken back. One of [five more](#five-more-asked-for-by-name); **lane one landed 23 September 2026** as [bosses](bosses.md) §11.38, wave 102; the picture and the hands landed the same day
- **[THE MANTLE](#23-the-mantle--whether-a-shared-number-still-needs-two-hands)** · §23 — whether a shared number still needs two hands. One of [five more, both screens reading the same picture](#five-more-both-screens-reading-the-same-picture); **lane one landed 26 September 2026** as [bosses](bosses.md) §11.40, wave 102; the look's first half, the body, landed the same day — its second half, the hands, is queued
- **[THE KEEL](#24-the-keel--whose-thumb-the-spine-calls-on-next)** · §24 — whose thumb the spine calls on next. One of [five more, both screens reading the same picture](#five-more-both-screens-reading-the-same-picture); **lane one landed 26 September 2026** as [bosses](bosses.md) §11.41, wave 103; lane two, the look, landed the same day in two halves, the body and the hands
- **[THE VALVE](#25-the-valve--freezing-what-the-other-hand-is-already-moving)** · §25 — freezing what the other hand is already moving. One of [five more, both screens reading the same picture](#five-more-both-screens-reading-the-same-picture); **lane one landed 26 September 2026** as [bosses](bosses.md) §11.42, wave 104 — the look is not written
- **[THE SEAM](#26-the-seam--a-crack-the-cannon-answers-in-order-with-the-shield-in-between)** · §26 — a crack the cannon answers, in order, with the shield in between. One of [five more, both screens reading the same picture](#five-more-both-screens-reading-the-same-picture); **lane one landed 26 September 2026** as [bosses](bosses.md) §11.43, wave 105 — the look is not written
- **[THE OCULUS](#27-the-oculus--shutting-an-eye-together-then-answering-what-was-behind-it)** · §27 — shutting an eye together, then answering what was behind it. One of [five more, both screens reading the same picture](#five-more-both-screens-reading-the-same-picture); **lane one landed 26 September 2026** as [bosses](bosses.md) §11.44, wave 106 — the look is not written
- **[THE VISE](#28-the-vise--a-gap-two-thumbs-close-from-opposite-sides)** · §28 — a gap two thumbs close from opposite sides. One of [more, spent from the unclaimed gesture list](#more-spent-from-the-unclaimed-gesture-list), written 26 September 2026; **lane one landed 26 September 2026** as [bosses](bosses.md) §11.45, wave 107 — the look is not written
- **[THE RIME](#29-the-rime--a-level-nobody-has-to-hold-only-keep-re-reaching)** · §29 — a level nobody has to hold, only keep re-reaching. One of [more, spent from the unclaimed gesture list](#more-spent-from-the-unclaimed-gesture-list), written 26 September 2026; **lane one landed 26 September 2026** as [bosses](bosses.md) §11.46, wave 108 — the look is not written
- **[THE TRIVET](#30-the-trivet--three-feet-each-planted-only-while-a-chord-holds)** · §30 — three feet, each planted only while a chord holds. One of [more, spent from the unclaimed gesture list](#more-spent-from-the-unclaimed-gesture-list), written 26 September 2026; **lane one landed 26 September 2026** as [bosses](bosses.md) §11.47, wave 109 — the look is not written
- **[THE PLUMB](#31-the-plumb--a-lean-held-long-enough-to-bring-it-level)** · §31 — a lean held long enough to bring it level. One of [more, spent from the unclaimed gesture list](#more-spent-from-the-unclaimed-gesture-list), written 26 September 2026; **lane one landed 26 September 2026** as [bosses](bosses.md) §11.48, wave 110, and its lean reader the same day — the look is not written

**Still in hand — the simulation landed, the look is not written**

- **[THE INSTAR](#16-the-instar--whether-two-different-hands-can-finish-one-beat)** · §16 — whether two different hands can finish one beat. Built whole 17 September 2026, both lanes: the engine and the simulation, then the body that morphs, moves and changes perspective between its poses
- **[THE MANTLE](#23-the-mantle--whether-a-shared-number-still-needs-two-hands)** · §23 — whether a shared number still needs two hands. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.40, wave 102; half one of the look, the body, landed the same day, and half two, the hands, is queued
- **[THE KEEL](#24-the-keel--whose-thumb-the-spine-calls-on-next)** · §24 — whose thumb the spine calls on next. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.41, wave 103; both halves of the look, the body and the hands, landed the same day
- **[THE VALVE](#25-the-valve--freezing-what-the-other-hand-is-already-moving)** · §25 — freezing what the other hand is already moving. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.42, wave 104; the look is queued, not yet claimed
- **[THE SEAM](#26-the-seam--a-crack-the-cannon-answers-in-order-with-the-shield-in-between)** · §26 — a crack the cannon answers, in order, with the shield in between. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.43, wave 105; the look is queued, not yet claimed
- **[THE OCULUS](#27-the-oculus--shutting-an-eye-together-then-answering-what-was-behind-it)** · §27 — shutting an eye together, then answering what was behind it. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.44, wave 106; the look is queued, not yet claimed
- **[THE VISE](#28-the-vise--a-gap-two-thumbs-close-from-opposite-sides)** · §28 — a gap two thumbs close from opposite sides. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.45, wave 107; the look is queued, not yet claimed
- **[THE RIME](#29-the-rime--a-level-nobody-has-to-hold-only-keep-re-reaching)** · §29 — a level nobody has to hold, only keep re-reaching. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.46, wave 108; the look is queued, not yet claimed
- **[THE TRIVET](#30-the-trivet--three-feet-each-planted-only-while-a-chord-holds)** · §30 — three feet, each planted only while a chord holds. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.47, wave 109; the look is queued, not yet claimed
- **[THE PLUMB](#31-the-plumb--a-lean-held-long-enough-to-bring-it-level)** · §31 — a lean held long enough to bring it level. Lane one landed 26 September 2026 as [bosses](bosses.md) §11.48, wave 110, and the lean reader after it; the look is queued, not yet claimed

**Built — and what is left on each is in its row of the ledger below**

- **[THE THROAT](#1-the-throat--what-you-feed-it)** · §1 — what you feed it
- **[THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when)** · §2 — whether you can agree on when
- **[THE GORGE](#3-the-gorge--what-not-to-do)** · §3 — what not to do
- **[THE TASTER](#4-the-taster--what-you-have-already-spent)** · §4 — what you have already spent
- **[THE LEDGER](#5-the-ledger--whose-body-takes-it)** · §5 — whose body takes it
- **[THE CURTAIN](#6-the-curtain--what-it-is-standing-in-front-of)** · §6 — what it is standing in front of
- **[THE DIASTOLE](#7-the-diastole--two-clocks-at-once)** · §7 — two clocks at once
- **[THE SINEW](#8-the-sinew--how-hard-not-when)** · §8 — how hard, not when
- **[THE SURGE](#9-the-surge--whether-you-can-stop)** · §9 — whether you can stop
- **[THE BATON](#10-the-baton--whose-turn-is-it)** · §10 — whose turn is it
- **[THE LEAD](#11-the-lead--where-it-will-be)** · §11 — where it will be
- **[THE ANTIPHON](#12-the-antiphon--describing-a-thing-that-has-no-name)** · §12 — describing a thing that has no name
- **[THE UNDERTOW](#13-the-undertow--where-you-are-being-hit-from)** · §13 — where you are being hit from
- **[THE CANDLE](#14-the-candle--whether-you-can-act-in-the-dark)** · §14 — whether you can act in the dark
- **[THE SCUTTLE](#15-the-scuttle--a-boss-racing-you-to-its-own-death)** · §15 — a boss racing you to its own death

**Neither** — [what the engine says back to the brief](#the-four-things-the-engine-says-back-to-the-brief),
[the filter these had to pass](#the-filter-these-fifteen-had-to-pass),
[refused by name](#refused-by-name),
[a second brief, and the four things in it this page did not have](#a-second-brief-and-the-four-things-in-it-this-page-did-not-have),
[five more, both screens reading the same picture](#five-more-both-screens-reading-the-same-picture),
[more, spent from the unclaimed gesture list](#more-spent-from-the-unclaimed-gesture-list),
[the reusable boss mechanic library](#the-reusable-boss-mechanic-library).

## Who is building what, so two sessions do not collide

**Read this before starting any concept on this page.** The owner works several
of these at once, in parallel sessions and separate worktrees, and the page is
the only place that knows which one is already under a hand. A session that
takes a concept writes its row here **before it writes any code**, and the row
goes away when the lane lands — the same discipline `docs/queue.md` uses, kept
here because a boss concept is not a technical finding and does not belong on
that list (`CLAUDE.md`, *an idea for the game is not collected*).

**The row rides with the lane, and the queue is what stops the collision.**
It is written in the lane's working tree and lands in the lane's own first
commit — not committed separately in the main checkout, which is what
`.claude/skills/new-boss` §3 asked for until 22 September 2026 and which no
session could do: from a worktree the command is refused as touching a shared
resource, and a cloud session has one clone and no second checkout to point at.
So read the trunk's copy before writing a row (`git show
main:docs/spec/bosses-choreographed.md`) rather than this tree's, and take the
`docs/queue.md` entry for the boss first: `bun run queue next` writes its
`Taken:` line on `main` and pushes it, which is the claim two sessions actually
see.

**A row names a file its lane has not written yet without backticks.** A
backticked path is a claim this tree holds the file, and
`tools/test/doc-drift.test.ts` fails on one that does not — which is how the
take commit `e2c4b2c7` turned `main` red, by naming the scene file its own lane
was about to write. `docs/queue.md`'s preamble says the same thing about an
entry; a ledger row is the other place a session writes down work it has not
done.

| Concept | State | Lane |
|---|---|---|
| THE NETTLE (the owner's brief of 26 September 2026, not a design on this page) | **taken, 26 September 2026** — lane one, the simulation, in this commit; lane two, the body, and lane three, the strikes and the death, next in the same session | THE INSTAR's engine with a jellyfish for a body and the panel given back on STANDARD 5: ten steps, thumbs on the body and SHOOT, SHIELD and SUCK marks answered by the press in the mark's column (`sim/scene-panel.ts`). Written up as [bosses](bosses.md) §11.39, wave 101 THE NETTLE. Nothing of it is drawn yet |
| [§31 THE PLUMB](#31-the-plumb--a-lean-held-long-enough-to-bring-it-level) | **lane one and the lean reader landed, 26 September 2026** — lane two open | The simulation is in as wave 110 THE PLUMB and `docs/spec/bosses.md` §11.48: `plumbLevelLeft` and `plumbLevelRight`, one per seat by geometry, THE MANTLE's rule, each drag one reading whose `fromMilli` is the phone's lean — `LevelTilt`, spending `TILT, AS A LEVEL` for the first time — with `on: false` a phone not read; a script authored on the wave of two settles a weight, the second inside a narrower range, then fire and `both` in turn; a level counted on the beat and started again by the lean leaving the range; the fourth settle lighting the core; a fire step the ordinary shot into the middle column in its colour. Four settles and three hits as the health. **Nine departures are argued by name** in §11.48: a fire step run out is the wave, a level is given grace, the lean is recorded whenever the bob is present, `LevelTilt` rides the drag's `fromMilli`, the range is the step's, a level run out relights the same step, there is no break step, the settles and the hits are the health together, and row 7's lost fire beats are the `both` step asked again. The twelve sounds are bound. The phone's gamma goes out as the seat's own drag, one per half degree moved and only while a bob is on the field (`apps/game/src/lean.ts`), with iOS asked from the lift off THE PLUMB's READY; no desk key leans yet, nothing of it is drawn, and there is no autopilot hand |
| [§30 THE TRIVET](#30-the-trivet--three-feet-each-planted-only-while-a-chord-holds) | **lane one landed, 26 September 2026** — lane two open | The simulation is in as wave 109 THE TRIVET and `docs/spec/bosses.md` §11.47: `trivetPadFront` and `trivetPadRear`, one per seat by geometry, THE MANTLE's rule, each drag one pad by its `id` — `ChordHold`, spending `CHORD` for the first time — kept as a mask of the pads each seat holds; a script authored on the wave of two plants a foot, the second on three pads, then fire and `both` in turn; a chord counted on the beat and started again by any lit pad lifting; the fourth plant lighting the hub; a fire step the ordinary shot into the middle column in its colour. Four plants and three hits as the health. **Eight departures are argued by name** in §11.47: a fire step run out is the wave, a chord is given grace, the pads are recorded whenever the stand is present, `ChordHold` rides the drag's `id` as two masks, a chord run out relights the same step, there is no break step, the plants and the hits are the health together, and row 7's lost fire beats are the `both` step asked again. The twelve sounds are bound; nothing of it is drawn yet and there is no autopilot hand |
| [§29 THE RIME](#29-the-rime--a-level-nobody-has-to-hold-only-keep-re-reaching) | **lane one landed, 26 September 2026** — lane two open | The simulation is in as wave 108 THE RIME and `docs/spec/bosses.md` §11.46: `rimeHalfLeft` and `rimeHalfRight`, one per seat by geometry, THE MANTLE's rule, each carrying `RubCount` — spent for the first time — as the drag's `id`; a script authored on the wave of two wipes a half, then fire and shield in turn; every fresh reversal on the lit half shaving `rimeShaveMilli` and a beat nobody rubbed it growing `rimeRegrowMilli` back; the fourth wipe baring the core; a fire step the ordinary shot into the middle column in its colour; a shield step SEAM's guard under the lens. Four wipes and three hits as the health. **Ten departures are argued by name** in §11.46: a fire step run out is the wave, a wipe run out retries from that half's first wipe, a surge run out asks the shield again rather than the wipes, the surge is SEAM's guard, frost regrows only on the lit half, the count rides the drag's `id` and the frosts are one pair, a wipe is answered on the tick, the film is config, the wipes and the hits are the health together, and there is no grace on a wipe. The twelve sounds are bound; nothing of it is drawn yet and there is no autopilot hand |
| [§28 THE VISE](#28-the-vise--a-gap-two-thumbs-close-from-opposite-sides) | **lane one landed, 26 September 2026** — lane two open | The simulation is in as wave 107 THE VISE and `docs/spec/bosses.md` §11.45: `viseLobeLeft` and `viseLobeRight`, one per seat by geometry, THE MANTLE's rule, each carrying `SqueezeGap` — spent for the first time — as the drag's `fromMilli`; a script authored on the wave of two seams a lobe, then fire and both in turn; a pinch step counting the beats its gap stays at or under `viseShutMilli` and a gap widened back starting it again; the fourth seam baring the kernel; a fire step the ordinary shot into the middle column in its colour. Four seams and three hits as the health. **Eight departures are argued by name** in §11.45: a fire step run out is the wave, a pinch run out is tried again, row 7's hold open is both lobes pinched shut, there is no break step, a gap is recorded whenever the case is present, a pinch is given grace past its count, the seams and the hits are the health together, and the gap rides the drag rather than two fields of its own. The twelve sounds are bound; nothing of it is drawn yet and there is no autopilot hand |
| [§27 THE OCULUS](#27-the-oculus--shutting-an-eye-together-then-answering-what-was-behind-it) | **lane one landed, 26 September 2026** — lane two open | The simulation is in as wave 106 THE OCULUS and `docs/spec/bosses.md` §11.44: `oculusLeafLeft` and `oculusLeafRight`, one per seat by geometry, THE MANTLE's rule; a script authored on the wave of three shuts, the break, and fire and reseal in turn; a hold step counting the beats both leaves are down and a thumb lifted starting it again; a fire step the ordinary shot into the middle column in its colour. Six leaves and three hits as the health. **Six departures are argued by name** in §11.44: a fire step run out is the wave, a hold step run out is tried again, the break is a timed reveal with no THE SLOW, a leaf is recorded whenever the lens is present, a hold is given grace past its count, and the leaves and the hits are the health together. The twelve sounds are bound; nothing of it is drawn yet and there is no autopilot hand |
| [§26 THE SEAM](#26-the-seam--a-crack-the-cannon-answers-in-order-with-the-shield-in-between) | **lane one landed, 26 September 2026** — lane two open | The simulation is in as wave 105 THE SEAM and `docs/spec/bosses.md` §11.43: a script authored on the wave, each step a point shot in its colour, grit taken on the shield under the ridge, a rock shot in its column, or grit and a rock at once — every answer a standard control, and each heard only inside its own step under THE SLOW. Three sealing points as the health. **Seven departures are argued by name** in §11.43: one sealing point per movement, row 5's pair as two steps, a miss is the wave, row 9's rock takes either colour, a guard must come after the step lit, the script is on the entry, and the shield is read every tick. The nine sounds are bound; nothing of it is drawn yet and there is no autopilot hand |
| [§25 THE VALVE](#25-the-valve--freezing-what-the-other-hand-is-already-moving) | **lane one landed, 26 September 2026** — lane two open | The simulation is in as wave 104 THE VALVE and `docs/spec/bosses.md` §11.42: `valveWheel`, THE HASP's bearing wheel turned by Player 1 alone onto a mark the wave authors, and `valvePin`, whose press by Player 2 on its edge is `FreezeTap` — spent for the first time — and whose draw by either seat, once frozen, pulls a pin. Three pins as the health, the freeze and pull windows shorter after the first, a spark leaked by the first pin, and a third movement whose mark counts only after a full lap. **Seven departures are argued by name** in §11.42: the turn carries no window, the lap is signed travel rather than a direction, the spark takes either colour and a miss is the wave, the spark falls through the list, the freeze is a press on a `DragTarget` rather than a new `Hold` kind, a lapse or thaw kicks the wheel off its mark, and a window opened mid-beat counts from the beat after. The thirteen sounds are bound; nothing of it is drawn yet and there is no autopilot hand |
| [§24 THE KEEL](#24-the-keel--whose-thumb-the-spine-calls-on-next) | **both lanes landed, 26 September 2026** | The simulation is in as wave 103 THE KEEL and `docs/spec/bosses.md` §11.41: one tap target, `keelJoint`, walking a six-segment spine, and whose tap it wants read off which half of the screen the lit segment sits on (`geometrySeat`, the spec's `GeometrySeat`, spent for the first time and held by the COPIES table). Six segments as the health, a socket at the midpoint answered by the cannon in the wave's colour, a fast third movement in the wave's own order (`reprise`) with no SLOW, and a rock from the tail. **Five departures are argued by name** in §11.41: a missed joint before the fast run costs only the beat, the third movement's order is authored rather than drawn, a missed socket is a hit on the hull, the rock takes either colour while the socket keeps its own, and the tail is the rightmost segment. The sixteen sounds are bound. Lane two, the look, is split in halves. **Half one, the body, landed 26 September 2026**: THE CANOPY's faceted arc laid with THE BRISTLE's squared-off lozenges, one per segment over its own column, ribs underneath; loose segments dull, sagging and swaying on their own count, locked ones lit and seamed white; the arch tightening as it locks; the lit joint's white ring and closing window; the midpoint's end-faces and the socket in the wave's colour; the tempo run's dim and re-light; the rigid hold, the whip, the rock and the snap straight (render/keel-shape.ts, keel-pose.ts, keel-draw.ts, keel-marks.ts, test/keel-frame.test.ts). **Half two, the hands, landed the same day**: the grip on `keelJoint`, the fx and the events off the silent lists, hurt, the cue's words and the autopilot hand (render/keel-grip.ts, keel-fx.ts, boss-cue-read-zd.ts, hands/boss-hands-keel.ts) |
| [§23 THE MANTLE](#23-the-mantle--whether-a-shared-number-still-needs-two-hands) | **lane one landed, 26 September 2026**; lane two's half one landed the same day — half two open | The simulation is in as wave 102 THE MANTLE and `docs/spec/bosses.md` §11.40: `mantleLeft` and `mantleRight` as two ordinary depth drags, geometry rather than a seat number saying whose is whose, a floor-checked summed depth (`PulledMagnitude`/`ChargeSum`, spent for the first time) rather than a split gauge, shown identically on both screens. Four plate-pairs as the health (`MANTLE_SCRIPT`), a spark leaking between the second and third shears, and an alternating single-tap finish on the bared core. **Three departures are argued by name** in §11.40: no pull movement carries a window or a timeout, the spark takes either colour rather than the shooter's own, and the finish needs no same-beat forgiveness since a wrong-seat tap is already the ordinary silent refusal. Lane two, the look, is split in halves. **Half one, the body, landed 26 September 2026**: THE CASE's wing-case valve laid with THE SLATER's lapped plates, four to a valve and shed a pair at a time tail first, the core's red showing through the gap each pair leaves; both flanks bowing on the one summed pull and each tail dragged by its own handle; both handles, their grooves and notches (the floor, and half the threshold) and the one cord that lights inward from each knob by that handle's counted share, grey below the floor, drawn identically on both screens; the spark running down the middle column; the split on the hinge, the beating core and the finish's two half-rings (render/mantle-shape.ts, mantle-pose.ts, mantle-draw.ts, mantle-handle.ts, test/mantle-frame.test.ts). **Half two, the hands, is queued**: the grip on each knob, the verb, `effects.boss.mantle` and the ten events off the silent lists, the cue's word and the autopilot hand |
| [§22 THE RATCHET](#22-the-ratchet--whether-a-step-can-be-taken-back) | **lane one landed, 23 September 2026**; the picture and the hands the same day | The simulation is in as wave 102 THE RATCHET and `docs/spec/bosses.md` §11.38: `ratchetCatch` a depth drag read as a **level**, THE HASP's latch again, and `ratchetPawl` a press read on its edge, with the judgement between them one `ratchetHeld` in the boss's own hand file. Seven teeth as the health, five clean to open, a burn on every press with the catch unset, a spent catch after every clean tooth, one loose bolt on the second clean tooth, and a jam into the hull on the third burn. Nine departures are argued by name in §11.38: the burn is a dull thud rather than a silence, the windows are counted in beats rather than 900/700/600 ms, a window nobody answers burns a tooth, the catch is spent by a clean tooth and has to be lifted, the rack jams on the burn that makes five unreachable rather than playing out its dead teeth, the bolt takes either colour, there is no longer hold on rows 9–10, `SequentialAction` is not used because the press is judged rather than refused, and THE SLOW spans each window. Lane two's first half, the picture, is `render/ratchet-draw.ts`: THE CRAWLER stood upright as the rack, spent plates slack above the pawl, the lock's pins counting the clean teeth, the catch and its glow on the navigator's screen alone, a click, jolt and hull shudder on every clean tooth and nothing on a burn, and the strut folding away. The second half, the hands, is `render/ratchet-grip.ts` and `render/boss-cue-read-zb.ts`: her catch carried down its rail with HOLD and LIFT on it, his pad pressed with ON SET on it, and FIRE over a loose bolt. The guide is prose |
| [§20 THE HASP](#20-the-hasp--whether-a-grip-nobody-can-see-is-the-one-holding-the-door) | **lane one landed, 22 September 2026**; lane two landed 23 September | The simulation is in as wave 101 THE HASP and `docs/spec/bosses.md` §11.37: `haspLatch` as a depth drag read as a **level** — where THE BELLOWS's handle next door is an edge — and `haspWheel` as a bearing drag wound by travel the way `crank.ts` reads one, with the gate between them a single per-tick `haspHeld` in the boss's own hand file and nothing in the engine, which is §20's *Reusable* finding proved. Three clasps as the health, the heat as the pilot's whole readout with a shorter fuse on the last, the seize and the free said once each so neither screen ever carries the other's reason, one loose bolt on the second opening, and THE SLOW on a burn that takes a wind already begun. **Five departures are argued by name** in §11.37: nothing in the fight carries a window, a late call gives nothing back, THE SLOW opens on one regrip call rather than three, row 7's bolt takes either colour, and the wheel is wound by travel rather than turned to a mark. Lane two's first half, the look, is drawn (`render/hasp-draw.ts`): the row, the latch's cool-to-hot drift on the pilot's screen alone, the wheel and its creep on the navigator's alone, the dim on a seize and the row swinging clear, with the receipts split by seat in `hasp-fx.ts`. The hands are in too (`render/hasp-grip.ts`): his press on the bar carried a tile down a one-tile rail, hers anywhere on the working wheel read as a bearing about its hub, `HOLD` while the latch is up and `TURN` only while the wheel is free, and no desk keys |
| [§21 THE SPOOL](#21-the-spool--whether-letting-it-run-is-the-point) | **lane one landed, 22 September 2026; lane two's body 23 September** — the hands open | The simulation is in as wave 100 THE SPOOL and `docs/spec/bosses.md` §11.36: `spoolBrake` as one depth-drag on the pilot's seat alone, read as a **level** and never an edge, with letting go the fast end rather than a neutral one; four ribs as the health, easing rather than cracking; the zone narrowing 360, 280, 200, 120 thousandths a rib and the movement running one leg, then two, then three; the target rate rolled off `world.rng` per leg, with `spoolBrakeForRateMilli` as the receipt that every roll is reachable (a `copies-table.ts` row — called, never re-derived); and THE SLOW on the drift, which is §21's calm finish. **Two departures are argued by name** in §11.36: leaving the zone resets the movement rather than costing a hull hit — the beat list against the prose, and a hull hit fails the whole wave on the one boss whose gesture is learnt by holding it wrong — and the hazard rock is thrown on every slip from movement 2 on rather than once, because a rule with an exception is what the skill forbids. The navigator's `EASE` and `HOLD` are speech, not `Command`s, so her half has no window and nothing is written for the pair to read aloud. Lane two's first half, the body, is drawn (`render/spool-draw.ts`): the casing and its four ribs, the winding and the line whose speed is the only rate the picture says, the pilot's brake on his screen alone and the navigator's gauge on hers, and the flange turning to face the ship in the slack. The hands are open: the rail's hit test, the cue word on the knob, the film and the controls rows |
| [§19 THE BELLOWS](#19-the-bellows--whether-you-can-push-when-she-is-pulling) | **built 22 September 2026, taken out 24 September 2026** | Deleted whole after the owner played it (`bosses.md` §11.35, *Retired*). The simulation was in as wave 99 THE BELLOWS and `docs/spec/bosses.md` §11.35: `bellowsPull` and `bellowsPush` as two ordinary depth-drags read the way `sinew-hand.ts` reads its two, `Alternation` spent refusing whoever did *not* just act (`bellowsTurn`), four seams as the health, one window on the third exchange alone, and `SimultaneousAction` for the finale — two hands off inside a beat of each other, under THE SLOW. **Four departures are argued by name** in §11.35: row 8's spark takes either colour, row 10's breath is answered with the navigator's shield, row 7's third exchange is not built, and nothing but the third exchange closes a window. Lane two, the look, is split in halves: **half one, the body, landed 22 September 2026** — the ribbed housings at the fill each seat's beat has left them, the waist and its four gaps as the health, each seat's own handle at the depth their thumb has it, the spark out of a parted gap and the halves turning on their caps in the vent (render/bellows-draw.ts, bellows-pose.ts, bellows-fx.ts, test/bellows-frame.test.ts). **Half two, the hands, landed the same day** on `claude/queue-the-bellowss-picture-has-never-been-drawn`, after half one's `f15ead27`: the hit test on each seat's own bar, carried with the fill of the chamber it hangs off and taking the wrong seat's grab on purpose, since that grab is the jam (render/bellows-grip.ts); the verb on the bar itself — `PULL`, `PUSH`, and `HOLD`/`LIFT` on the last seam — with four silences and no number (render/bellows-word.ts); the caption's answer for where a bar is standing (`handle-place.ts`); two `FIELD_CONTROLS` rows, two gallery poses and the two rows of `docs/spec/controls.md`. **No desk keys, and that is not a gap**: a carry down a rail is a drag, and THE GIMBAL's T and Y exist because a turn has nowhere else to go |
| [§18 THE GIMBAL](#18-the-gimbal--whether-the-same-turn-means-the-same-thing-to-both-of-you) | **lane one landed, 22 September 2026** — lane two open | The simulation is in as wave 98 THE GIMBAL and `docs/spec/bosses.md` §11.34: `gimbalOuter` and `gimbalInner` as two `BearingDrag` members read the way `crank.ts` and `orrery-hand.ts` read theirs, the mirror said once in `gimbalShownMilli`, three alignments authored in `content/src/gimbal-script.ts`, six latch-teeth derived from the cursor, the leaking seam of row 9 answered in either colour. **Row 12 is not built and the departure is argued by name** in §11.34: a mirror reverses a turn, it does not halve it. Lane two, the look — the drum, the two rims and their gaps, each seat's own mark, the shearing tooth, the loose spin and the hatch — is its own `LOCAL ONLY` item on `docs/queue.md` and nothing of it is drawn |
| [§17 THE FILAMENT](#17-the-filament--whether-you-can-follow-a-line-that-is-still-being-drawn) | **built, 18 September 2026** | `claude/boss-implementation-e3cfff` — the simulation (`1d4ee041`), then the look (`f5ea37af`). Worked and written up as [bosses](bosses.md) §11.33 (wave 97): `TraceDrag` as a `drag` at a `filament` target; the seven filaments, the draw a tile a beat, the follow within `filamentGapTiles`, the snap, the recoil and the pull under THE SLOW; the bundle over the field a strand narrower every pull, the path ahead on the pilot's screen and the lit part on the navigator's. **The owner's, 25 September 2026, on the look:** both thumbs on both screens, each ring green when its move is open and red with *WAIT* when not, arrows, the window as pips and a bar, the line's clock round the ring it waits on, and a green *PULLED* with the body hurt (`filament-turn-draw.ts`). **No guide**, the owner's word of 25 September 2026: the rings and pips teach it. **The owner's, 25 September 2026:** every fault strikes the hull and so does a line standing past its clock (`filament-turn.ts`), which is the wave. `claude/boss-hints-mechanics-5b5a9f` wrote it out of the second brief and did not take it |
| [§7 THE DIASTOLE](#7-the-diastole--two-clocks-at-once) | **built, 16 September 2026** — **taken out, 25 September 2026** | Deleted whole at the owner's word (`bosses.md` §11.17, *Retired*). What follows is the record as it stood: `claude/neon-spore-boss-design-26ee5e` — the simulation and THE SLOW, then the look. Worked and written up as [bosses](bosses.md) §11.17 |
| [§10 THE BATON](#10-the-baton--whose-turn-is-it) | **built, 16 September 2026** — **built again, 17 September 2026** | `claude/boss-implementation-e3cfff` — the simulation, then the look. Worked and written up as [bosses](bosses.md) §11.18 (wave 68). **Step 7 and the beam landed** (`8be1c9fe`): a shot at anything is her turn spent from the tick it leaves, and the lance beam meets the bead the way a bolt does; no look, the grey panel already draws it. **The second bead landed** (`b97a312a`, step 9): it lights after three dark sockets, the trigger sends the longest sitter, a bolt takes the lowest bead, the lead waits in the last socket and the two merge. **The second bead's look landed** (`62a350aa`): the twin is the one with the eye, the merged bead a third larger and brighter. **The crossing landed** (`194b4c8a`, step 13): the merged bead's flight out of the last socket is eleven beats long and owes an act a beat in turn, a miss sends it back to the top of a relit arm, and the drop opens both locks for the catch. **The thread landed** (`cae4a8b9`, step 12): the sim remembers the beat the arm came down to one segment, and the look thins everything above the last socket to a thread with dead husks on it. **Every step of the design is built.** What is not: the fold at step 14 fades the picture rather than parting eleven segments, and no sound marks the moment the arm comes down to one — for the owner's eye and ear. |
| [interludes.md THE SCOUT](interludes.md#the-scout-the-round-that-flies) | **built, 17 September 2026** — **built again for the rehearsal, 18 September 2026** | `claude/boss-implementation-e3cfff` — the simulation (`ce8a2324`), then the look (`3a3306cf`): the four presses as lobes in THE CLAW's sockets on the band, the arena on the field's own columns with the real hull's intake as the mother ship's mouth, a pod for a mote and a burning rock for a hazard, the split in `showsScoutArena` and `showsScoutNose`. Worked and written up in [interludes](interludes.md) §THE SCOUT (wave `theScout`, act 7c). **Not built:** nobody has watched it at tempo; whether a nose on a button reads as *point it at two o'clock* is the owner's eye. **The rehearsal** (`1b52d7f4`, 18 September 2026): `content/src/scenes/the-scout.ts`, seven pages over 1,700 ticks, seed 1 — the first arena flown whole and the second's first trip, every leg searched for by re-running the film rather than authored; the fourth mote of the second arena, on the hazard's own row, found unreachable and appended to the queue item that owns that arena |
| [§1 THE THROAT](#1-the-throat--what-you-feed-it) | **built, 17 September 2026** | `claude/neon-spore-boss-design-26ee5e` then `claude/throat-look`, `claude/throat-lock` — the simulation, the gullet, then the navigator's readout and the eversion. Worked and written up as [bosses](bosses.md) §11.19 (wave 69) |
| [§13 THE UNDERTOW](#13-the-undertow--where-you-are-being-hit-from) | **built, 17 September 2026** — **built again, 17 September 2026** | `claude/boss-implementation-e3cfff` — the simulation, then the look: the plate bowing on player 1's screen alone, the lobe up through the plating, the body taken in. Worked and written up as [bosses](bosses.md) §11.20 (wave 69, THE UNDERTOW). **The plate taken landed** (`feb3b703`, steps 9 and 10): a tall lobe withdrawing takes its column's plating and the neighbour's, marked on the scar and hashed, the hull two columns shorter for the run. **The plate's hole and step 11 landed** (`bb01b142`): the plate gone is a hole in the hull's outline — rim cut out, walls and floor in the rim colour — and a cannon slid off in time closes the plate with nothing through, the bow running down on the pilot's screen and the rim flaring as it seats. **Every step of the design is built.** What is not: step 8's *worth two*, on purpose — a body through a breach costs the wave like any other under the owner's rule — and no sound of its own for the plate torn away; for the owner's eye. |
| [§2 THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when) | **built, 17 September 2026** — **built again for the rehearsal, 18 September 2026** — **taken out, 25 September 2026** | Deleted whole at the owner's word (`bosses.md` §11.21, *Retired*). What follows is the record as it stood: `claude/boss-orrery` — the rings landed (wave 70 THE ORRERY, [bosses](bosses.md) §11.21: three orbits anchored so the first alignment is placed rather than hoped for, the shaft, the shot that takes the outermost ring and changes the core's colour, the organs it sheds, the core's own fire and where it may not aim it, THE SLOW over the alignment, the lance that finishes it). Four departures from §2 are argued in §11.21 by name: **the column is never in question** — rings concentric about a core admit exactly one, so the design's *call the column the gap will stand over* is dropped as a second QUEEN — **the orbits are not coprime**, because coprime is the right tool for two cadences and the wrong one for three, **it fills its own wave**, which is the exception THE DIASTOLE's lane allowed for, and **a broken ring sheds three organs rather than eight**. **The hand on the ring landed** on `claude/orrery-hand`: a bearing drag that clicks the outermost unbroken ring one organ per turn and a half of the thumb, writing the ring's *anchor* so every gap stays a function of the beat, with two more departures argued in §11.21 — **the hand moves inward** as rings come off rather than dying with the outer one, and **there is no flywheel**, because a gap moving with nobody's hand on it is what this boss's central rule forbids. **The look landed** on `claude/orrery-look`: three orbits drawn flattened to `ORRERY_FLATTEN` 0.3, because `orreryReach` spans the field's width while the space above row 0 is one tile deep, so a circle could not be drawn and a squashed one would put a ring's near side within a few pixels of its far side; organs arriving in a *rhythm* rather than at a speed, so three cadences can be heard in your own counting; the near arc drawn after the core and the far arc before it; a broken ring left as a dashed line, because the pair have been counting against it; the shaft of light, which is `light-shafts.ts`'s job done with the wrong tool and so has its own file; and the per-seat split as `showsOrreryRing` in `render/view-role.ts` — **the outer ring true on both screens**, which is the calibration the other two are worth saying out loud against. **The handle landed** on `claude/orrery-handle`, and the boss is finished: the ring is hit-tested where it is drawn — an ellipse the width of the field rather than a circle on a body, so the hit test and the knurl that says it turns live in one file (render/orrery-grab.ts) — the ellipse is unsquashed before the angle is read, so what a thumb reports is the **slot** under it rather than the pixel angle, and this is the one gesture in the game the fold reaches, because the finger is chasing a body rather than pointing at a column. `FIELD_CONTROLS`, [controls](controls.md) and a gallery pose all carry it. **The three hands that are not hands landed** on `claude/orrery-hands-not-hands`: the desk key (**O**, shift for the other way, a letter of its own for THE CHOIR's shake's reason), `--press T:1:orreryRing=N` in **organs rather than turns**, and a film's ghost thumb authored as the handle it is — all three turning at `orreryTurnPerTickMilli`, one organ a beat, which is the ring's own drift and is derived from the gearing and the tempo rather than chosen. The lane also fixed the defect that made it urgent: `scene-drag.ts`'s `pullsDown` answered *true* for `orreryRing`, so a film would have sent downward pixels at a control reading thousandths of a turn. What is left of THE ORRERY is queued rather than a lane: **the sound**, and it has never been watched at tempo. **The rehearsal** (`7dfc0932`): content/src/scenes/the-orrery.ts, thirteen pages over 3,000 ticks, seed 1 — the three alignments counted (twelve with every ring, twenty-four with the outer off, every four with the inner alone), a shot in the core's colour on each, the colour flipping at every break, the ten rocks the rings shed warded one a beat, and the naked core taken with the beam held red. Writing it found the wave **could not be won as built**: a ring off shed its three organs on one beat into three columns, the shield is one column wide and every hull damage fails the wave — so the organs now come off one a beat, each from the column its orbit slot stands over, and the core holds its own fire while a ring is shedding (sim/orrery-step.ts, §11.21). **The crack landed** on 19 September 2026: a shot no longer takes a ring, it jams its gap `orreryCrackOrgans` 2 short of the bottom and the pilot's thumb has to wind it home before the shaft opens again ([bosses](bosses.md) §11.21, sim/orrery-step.ts, sim/orrery-hand.ts). That makes the hand the second half of every ring rather than an optimisation a pair could skip, gives THE CUE the one moment it could honestly ask for a turn — `OPEN`, on the grip, on the pilot's seat alone — and carries no new state, so the fingerprint and the wire are untouched. The rehearsal now winds all three rings, the last of them in two pieces around a rock. The outer ring sits under the corner plate in every page (`docs/queue.md`, *A rehearsal's frame hides what stands over row 0*) |
| [§14 THE CANDLE](#14-the-candle--whether-you-can-act-in-the-dark) | **built, 17 September 2026** — **built again, 17 September 2026** — **built again for the rehearsal, 17 September 2026** — **taken out, 25 September 2026** | Deleted whole at the owner's word (`bosses.md` §11.22, *Retired*). What follows is the record as it stood: `claude/boss-implementation-e3cfff` — the glow, then the dark: the field black under a glow of five steps, a shot's flash on player 2's screen and the guard and beam on player 1's, a breach lighting its neighbourhood on both, the after-image as a per-column light rather than a kept frame, the two black beats and the light coming back. Worked and written up as [bosses](bosses.md) §11.22 (wave 72). **Built again for step 1's choreography** (`f3cfb7f7`), the look alone: *the field goes black over four beats, corner light first* — the dark a front from the corner light's side across the field column by column over the four beats, the boss's glow what is left. **Not built**: THE SLOW over the flash beat, put to the owner in `docs/queue.md` as a question — every flash beat, the first alone, or tempo. **Built again for the rehearsal** (`7e379daa`): the wave's film, twelve pages over one loop, packages/content/src/scenes/the-candle.ts; the guide is prose no longer |
| [§3 THE GORGE](#3-the-gorge--what-not-to-do) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** | `claude/boss-implementation-e3cfff` — the sack (`fb63f2ab`), then the skin (`41f50952`): seven intakes each holding a count of beads of one colour, a shot that meets no creature swallowed into its column's intake, the wrong colour taking a bead back out, an intake full at four and pierced by the fifth or venting a torch after four beats, the sack sinking a row for every four beads, the spat bead as a body only the opposite colour breaks, the mouth after the fourth rupture fed by its own spit and ended by the beam alone; the translucent sack breathing above row 0, the beads stacked in the lobes on both screens, the pilot's violet tally under each and the navigator's ring around the nearest full in its colour, the rupture as two flaps hanging open, THE SLOW as the beads rising over three beats, up to eighty beads leaving at once. Worked and written up as [bosses](bosses.md) §11.23 (wave 73), with five departures argued there. The curtain of step 11 is a sag rather than a shape, and the rupture is not `body-hit-rupture.ts`: the owner's eye. **Built again for the rehearsal** (`7c545544`): the wave's film, thirteen pages ending two ruptures short of the mouth, `packages/content/src/scenes/the-gorge.ts`; the guide is prose no longer |
| [§6 THE CURTAIN](#6-the-curtain--what-it-is-standing-in-front-of) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** | `claude/boss-implementation-e3cfff` — the membrane and the core (`bfe1bbcb`), then the fabric (`2a78763c`): a boss body seven columns wide at row 1 that both hands carry a column a beat, off the wall as far as its keep, and that rolls back over the core when nobody holds it; seven lobes along the hem as the health, two soft a cycle and taken off by a bolt, a light sheet carried two; the core a column and a colour with no body, a shadow through the fabric, shot only where the fabric is not, each hit in its own colour dropping the nearest lobe and drifting it to a new column and colour, the other colour a rock down the column; a bare hem torn off by the next shove and the naked core firing faster until the third hit; the translucent violet membrane with folds and a scalloped hem, the hem trailing the rail through a shove, the soft lobes lit on the pilot's screen alone and the core's shadow on the navigator's alone, the hand ring over the sheet, the torn sheet falling and crumpling over four beats. Worked and written up as [bosses](bosses.md) §11.24 (wave 74), with six departures argued there. Not built: the sag under a hand rather than a slide, the decoy on the pilot's screen, the hole a shot leaves in the fabric, THE SLOW on the shove, and a real z-order — the core is dimmed by being drawn under the sheet: the owner's eye. **Built again for the rehearsal** (`bead2b62`): the wave's film, ten pages ending on the drift before the torch, every act the pilot's hand on the sheet, `packages/content/src/scenes/the-curtain.ts`; the guide is prose no longer. **Built again for the second gesture, 19 September 2026**: the fight is four named states rather than two stamps — a core hit that does not end it jams the rail for `curtainPinBeats`, the shove is refused whole and the tear with it, and the way back to the core is the **hem**, which the pilot alone carries up past `curtainLiftMilli` and holds, baring the core while it is held; a third cue word, `LIFT`, and one gesture per state (`packages/sim/src/curtain-hand.ts`, `packages/sim/src/curtain-shove.ts`). **Built again for the look, 19 September 2026** (`claude/task-queue-work-ym2eim`, the second half of the same lane and a look with no shipped alternative): a bar along the sheet's own rail in the rock's grey, fading as the jam's count runs out, so its brightness is the clock the pair are working against; the hem's ring on the fabric's bottom edge, resting in the middle of the on-field sheet rather than over the core — which is the navigator's to find — and carried up by a remap rather than one-to-one, so the full lift leaves a sliver of cloth gathered under the rail; the sheet drawn with that lift and the folds travelling with it, the gap over the core opening for nothing because the core is already drawn under the fabric; the ring on both screens, the pilot filling the gauge and the navigator reading when her shot is through. With it the ON THE FIELD row (`tools/director/src/field-controls-curtain.ts`), the standing-handle answer a caption needs (`handleCircle`), and the rehearsal's eleventh page — the hem carried up and held under the jam, `STUCK · HOLD THE HEM UP` on the pilot's screen. `packages/render/src/curtain-grip.ts`, `curtain-sheet.ts`, `curtain-draw.ts`, `handles.ts`, `handle-place.ts`, `packages/content/src/scenes/the-curtain.ts`. Not drawn still: the sag under a hand, the decoy, the hole a shot leaves, THE SLOW on the shove |
| [§4 THE TASTER](#4-the-taster--what-you-have-already-spent) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** | `claude/boss-taster` — the simulation (`64335006`) — and `claude/taster-look` — the look (`5987da4b`), landed separately. The `SpendLedger` on `World` is a rolling per-colour count of the pair's own shots, hashed and read as a pure function of `world.beat`, which is the reusable the page says THE MOTHER has been waiting for. A crest as wide as the field grows eleven blades, each edged in the colour the pair has been leaning on over the last `SPEND_BEATS` beats and shorn off **only by the colour it is not** — the game's one inverted colour rule, which the wave's guide says out loud rather than leaving discoverable — with the soft crest, the fan noticing a lean and re-edging, the interlock, and THE SLOW on the beat a blade's colour crystallises. **The look is the fan itself**: metal blades, `rockDark` filled and `rock` stroked, the only colour on one being its lit edge, because a blade filled in its colour would say *shoot me with this*; a notch per blade struck off, sheening with the crest's own count; a lit seam once the crest is cut through; and the first split in this game that is **arithmetic rather than occlusion** — both screens see every blade, the navigator is given the ledger's two counts on the ridge and the pilot the column the crest opens next, and neither is ever shown the colour the beam has to be. Written up as [bosses](bosses.md) §11.25 (wave 75, THE TASTER). **What is not built**: the design's step 7 rock throw, dropped on purpose, because a taster that sent its own bodies would be a boss feeding the ledger it then reads; THE SLOW's beat has no picture of its own beyond the glint the edge throws as it sets; the notch is one sheen for all the gaps rather than a depth each; **the fight has never been watched at tempo** — one still frame of it has been looked at, and the wave went into `tools/perf/baseline.json` unweighed. **Built again for the rehearsal** (`0f71b620`): the wave's film, ten pages ending on three blades growing at once, its arithmetic authored so every edge sets red and the seed decides nothing, the second blade reached by `atBoss`, `packages/content/src/scenes/the-taster.ts`; the guide is prose no longer — though the film's frame hides the crest under the corner plate, queued in `docs/queue.md` as a look for the owner |
| [§8 THE SINEW](#8-the-sinew--how-hard-not-when) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** — **built again for the second gesture, 19 September 2026** | `claude/boss-implementation-e3cfff` — the tendon and the sum (`c6b0a3b4`), then the fibres (`fb6242dc`), landed separately. The first scalar the pair has ever had to say to each other: a tendon from the top edge down to a lobed mass with a handle either side, one per seat, each pulled down; the two pulls add into one sum on a strain band, the pilot shown the zone on the band and the navigator the sum, and neither the other's; the sum held inside the zone for `sinewHoldBeats` parts a fibre and the mass hangs a row lower, the zone re-rolled narrower each time; past the zone's top the tendon snaps back, both hands thrown off and a rock shed; from the third fibre the tendon goes slack under a hand so the pair has to re-grip; the last fibre drops the mass, and both hands pulling sideways the same way for `sinewFallBeats` walk it clear of the ship or on to it. The look: a fan of fibres that strains in colour, a collar of band round the tendon split down the middle by seat, two handles on the shipped SINEW tether, the snap's whip and flash and the shock down the plating, the fall and the two landings. Written up as [bosses](bosses.md) §11.26 (wave 76, THE SINEW), with the departures argued there. **What is not built**: the design's step 8 lobes on the mass, step 11's halved ward window, the timed calls and their 900 ms windows, the band as a white bar rather than a collar, a swing with no lag or overshoot, and THE SLOW's beat has no mark of its own in the look; and **the fight has never been watched at tempo** — one still frame with both hands on the pull has been looked at. **Built again for the rehearsal** (`e6f7f808`): the wave's film, ten pages ending on the snap and the plate under the rock it sheds, two holds authored as sums against the seed's zone, every pull carried to a written number rather than to taut, `packages/content/src/scenes/the-sinew.ts`; the guide is prose no longer — though its pages about the number point at the hull for want of an anchor on the collar, queued in `docs/queue.md`. **Built again for the second gesture, 19 September 2026** (`claude/task-queue-work-ym2eim`): the snap-back was the fight's one dead state — both hands thrown off, `sinewSnapBeats` in which the simulation refused every press and the field, rightly, said nothing at all. It has an answer now. A hand may take hold of a whipping handle but its pull is pinned to nought; the sway is what is read there, and both hands carried **apart** past `sinewCatchMilli` catch the tendon — the swing ends on that beat, the slack goes with it, and the pair is pulling again beats early. Missed, the swing runs exactly the beats it always did, so the gesture buys time and never costs any, which is what lets it be asked for in the state where neither seat has anything else to do. Sideways now means two things on this handle and never in the same beat: **apart** catches a swing, **the same way** walks the falling mass — the swing is over before the last fibre parts. A third cue word, `APART`, to both seats alike, held or not; a sixth state, `caught`, with a pose of its own. `packages/sim/src/sinew.ts`, `sinew-hand.ts`, `sinew-step.ts`, `config-sinew.ts`, `packages/render/src/sinew-word.ts`. **The picture is the unverified half** and lands as its own lane: a swinging handle does not yet look catchable, and nothing on the tendon draws the spread the catch wants |
| [§5 THE LEDGER](#5-the-ledger--whose-body-takes-it) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** | `claude/boss-ledger` — the cord and the returns (`72fa7811`) — then `claude/ledger-look` — the cord itself (`6b819d7d`) — and `claude/ledger-lock` (`dd33e924`), landed separately. The first boss whose damage travels **the other way**: a shot the pair lands comes back down a violet cord into their own hull, at a column that moves along the hull with every return, and the guard window they have used on the field all game is pointed at something they caused. Written up as [bosses](bosses.md) §11.27 (wave 77, THE LEDGER), with eight departures from §5 argued there by name. The three that matter: **there is no scar and no fight carried on over one** — *every hull damage fails the wave* (the owner, 12 September 2026, `sim/wave-fail.ts`), so a missed ward is the lost wave it is everywhere else; **the cadence shortens per hit rather than per miss**, so it is the pair's own progress that speeds the bills up; and **the fifth return is the one they are told to let through** — warding it is refused and it comes back a cadence later, so the fight holds open until both of them take their hands off it, and it tears the cord out of the ship instead of scarring it. The look is the first split in this codebase that cuts **one drawn object** in half: the cord's last stretch above the plating fades out on the pilot's screen, so he reads the bead and the beats left of it and she reads the grommet, her white lock and the chevron for the column the root walks to next — *his clock, her column* — with the last return on both screens. **What is not built**: the design's step 3 timed 900 ms call (the game never evaluates speech), step 10's halves firing down their own columns (an unwardable hull hit is an instant loss), step 11's beads travelling in both directions, `ship-nerves.ts` lit along the cord's line, and THE SLOW's beat has no mark of its own beyond the strain running up the cord; and **the fight has never been watched at tempo** — two still frames of it have been looked at, one per seat, and the second of those is what found the navigator's lock buried under the plating and the body drawn half the width of its own rules. **Built again for the rehearsal** (`2b4b7614`): `content/src/scenes/the-ledger.ts`, ten pages over 1860 ticks — the seed's cyan and then red up the seam, both returns warded in the socket, the socket walked and the plate carried to it by `atBoss` (the ledger line in `sim/boss-answer.ts`, the first answered with the plate), the second ward whipping the seam; the bill and the fifth return are prose. `scene-ledger.test.ts` holds the sequence |
| [§9 THE SURGE](#9-the-surge--whether-you-can-stop) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** | `claude/boss-implementation-e3cfff` — the bulb and the lift (`73fd1b5a`), then the seam (`4939a0c7`), landed separately. THE SINEW's split at the other verb, which the design says must follow it or not be built: a ribbed bulb hung over the middle three columns that a thumb from either seat charges a step a beat, that leaks with no hand on it until its second notch and holds from then; five notches along its seam, each a band on the gauge, and the only gesture that counts is both thumbs coming off the glass inside one beat of each other with the pressure in the band — inside vents a notch and hangs the bulb a row lower, over bursts it (three gums down its own columns, both hands thrown off, from the third notch a notch closed again), under or one hand alone loses the charge; from the second notch it eats what the wave sends into it, from the third a hand charges it at double, and the last notch everts it. The pilot is shown the notches and the navigator the pressure, and neither the other's. The look: the bulb ribbed and swelling with a number the seat is shown, the seam split by seat, one grip mark a side with HOLD, one hit circle both seats share, the vent's sink, the burst's jolt and jet, the eversion as a fold of the outline. Written up as [bosses](bosses.md) §11.28 (wave 78, THE SURGE), with the departures argued there. **What is not built**: the design's inner body, the spray across the ship (three gums and a jolt instead), the 900 ms call windows, slits that gape with the pressure, and an eversion that turns the inside out rather than folding the outline; and **the fight has never been watched at tempo** — one still frame of it has been looked at **Built again for the rehearsal** (`e958bfc1`): `content/src/scenes/the-surge.ts`, eleven pages over 2040 ticks — three holds on the bulb, the first and third vented with both thumbs off together, the second lost to the pilot's thumb off alone; the first film whose acts say whose hand each is (`SceneAct.hand`), because the bulb is one `DragTarget` for either seat; the burst, its gums and the eversion are the prose. **Built again for the ward, 19 September 2026** (`claude/task-queue-work-ym2eim`): step 7, and with it the fight's third gesture and its third pair of words — from its first notch the bulb spits a rock down its own columns every `surgeRockBeats` beats it has both thumbs on it, which only the shield answers — and the shield is on the panel while the bulb is out on the field, so the pilot wards with his other thumb, neither hand comes off the glass and the charge climbs through the fall, as it already does under the four ordinary rocks wave 78 sends while the pair is holding; `SHIELD` to the pilot alone, over the charge and never over the lift; the state `warding` on the director's page. `packages/sim/src/surge-rock.ts`, `packages/render/src/surge-word.ts`. The rehearsal film gained the rocks the seam spits under its own holds, each warded a beat off the hull without a hand leaving the bulb, and the one page in it that points at the panel (`packages/content/src/scenes/the-surge.ts`). **Not verified**: the picture of a rock coming out of the bulb's underside — the fall is drawn as every rock's is, and nothing of the bulb answers it yet |
| [§11 THE LEAD](#11-the-lead--where-it-will-be) | **built, 17 September 2026** — **built again for the rehearsal, 17 September 2026** | `claude/boss-implementation-e3cfff` — the pace and the flight (`6205a665`), then the lean (`633dee0e`), landed separately. The one concept on the page whose split is arithmetic across two seats: a body pacing the top of the field one column a beat, turning at the walls, with a stalk of five segments standing out of it that leans the way it goes next; a bolt out of the top hangs a beat in the air and is judged against the column the body is in *then* — a segment off if it is there, a miss if not, and on a beat every shot missed it doubles back. The navigator is shown the column and never the lean, the pilot the lean and never the column, and the lead is a number they say. From the fourth segment it runs at two columns a beat dropping a torch behind and a rock ahead on a cadence, from the second the lean forecasts the wall turn a beat early, on the last it stops dead for four beats and then passes at three a beat toward the farther wall, ended only by the beam standing in a column the pass goes through; a pass that reaches the wall is another still and a pass back. THE SLOW opens on every judged beat. The look: a long rock ridge above row 0, the stalk a bead a segment with a pale tip, at its column on a mound with the target lock on the navigator's screen and in the middle of the pilot's on a sill leaning on a spring with a whip on the turn-round, white bolts over each flight's column on both, grey and upright on the still, lying over on the pass, gone and fading when the beam has it. Written up as [bosses](bosses.md) §11.29 (wave 79, THE LEAD), with the departures argued there. **What is not built**: the design's arrow with a length to it (the lean is a tilt of the stalk), the 900 ms call windows, a wall shown on the ridge, a torch and a rock that fall out of the body rather than arrive as the field's own; the pass goes to the farther wall and a wall is another still rather than the fight lost, and a bolt does nothing from the last segment on; and **the fight has never been watched at tempo** — one still frame of the pilot's screen has been looked at **Built again for the rehearsal** (`b54c15b6`): `content/src/scenes/the-lead.ts`, eight pages over 1500 ticks — a shot at where the body is, missed and turned round, then four at where it will be by `atBoss`, which `sim/boss-answer.ts` answers with `leadLead`, the column two beats on; the run's torches warded, its rocks laid around, the beam held early and standing in the pass; the film takes no hit |
| [§15 THE SCUTTLE](#15-the-scuttle--a-boss-racing-you-to-its-own-death) | **built, 17 September 2026** — **built again for the rehearsal, 18 September 2026** | `claude/boss-implementation-e3cfff` — the parts and the cadence (`63f9e730`), then the look (`d89bd615`), landed separately. A frame of twenty-one sockets over the top of the field — rocks, bodies in the two colours and pods, sown by the seed — that throws itself at the pair a part at a time: a part comes loose on a cadence and hangs three beats before it is thrown down its column as the arrival it is, and while it hangs a bolt in its column and colour strikes it off and buys a beat; the rocks are meteors, the pods pods, and a pod taken slackens every cadence after. Twins come loose once the frame is thin, the cadence tightens from seven parts and the live part crosses the field; the last part winds up under THE SLOW for the lance's fill and only the beam standing in its column ends it, after which the frame collapses; thrown, it goes through the hull and the wave. The pilot is shown the count and never which part is live, the navigator the live part in its colour and the column of the next throw and never the count, and the sentence between them is *nine left — four, red, now*. The look: a lobed grey slab plated with a rock plate per part, an open violet socket with the part on a thread under it, the wind-up's shiver, the throw's jolt, the strike's tumbling plate, the lock on the navigator's, the fade. Written up as [bosses](bosses.md) §11.30 (wave 80, THE SCUTTLE), with the departures argued there. **What is not built**: the 900 ms call windows and a part that stays in the frame's *body* rather than a socket list; the pod falls through as the wave lost rather than a scored miss; and **the fight has never been watched at tempo** — one frame of each seat has been looked at. **Built again for the rehearsal** (`1be073ce`): `content/src/scenes/the-scuttle.ts`, thirteen pages over 2,900 ticks, seed 17 — the first part let go and its rock warded, so the count is seen to cost before a strike lands; nineteen struck where they hang by `atBoss`, which `sim/boss-answer.ts` answers with `scuttleNextCol`, one in the wrong colour for the rebuff; the twins thrown regardless and shot at the top, the pods struck where they hang, the last part held cyan under the beam and the frame let go three beats on; the guide's halves swapped to what each seat alone sees; the film takes no hit. **A hand for the pilot, 19 September 2026** — the fight had been two presses of hers over one slide of his and nothing else, so he may now carry one hanging part a column along the frame, once a cycle and never on the wind-up, and it is thrown and struck down the column he put it in rather than its socket's: a **place** bought with the thumb that would otherwise be on the cannon, two new states (`held`, `swung`), a ring on every hanging part on his screen alone so the live one cannot be subtracted, and `MOVE` on a part one column off his cannon. The look of it — the thread's strain, the ring's polish, the carry's spark — is a second lane and has not been watched at tempo |
| [§12 THE ANTIPHON](#12-the-antiphon--describing-a-thing-that-has-no-name) | **built, 17 September 2026** — **built again for the rehearsal, 18 September 2026** | `claude/boss-implementation-e3cfff` — the organs and the rail (`8aeaa941`), then the look (`71da1875`), then the turn (`daf5029e`), landed separately. The one boss on the page whose split is a *description*: a body along the top of the field grows an organ a cycle from a table of sixteen contours in four families, shown to the pilot alone; the navigator alone is shown a rail of three candidates one of which it is, and neither is ever told which. The right shape's colour fired into its column pits the organ, a wrong candidate hardens the rail by one, an organ described in time sinks back healed and one not described fires down its column, the killed shape returns to the rail and a twin cycle grows two at once; the ship's own outline is the last candidate, with decoys wearing the hull's lobes miscounted, and the last pit erupts the body. The look: four draft creatures — REVERB, SMOKE, PRISM, MOULT — taken as the four family heads, the body with a slow-waved underside, the organ under the pilot's screen, the rail at its columns on the navigator's, the window as a thread shrinking from both ends, the pits on the flank, the still, the eruption one contour per pit. Written up as [bosses](bosses.md) §11.31 (wave 82, THE ANTIPHON), with the departures argued there. **The turn under a hand landed** as a third lane (`daf5029e`): the design's one concept that wants no time effect — `antiphonOrgan` is a `DragTarget` heard from either seat, a thumb resting on the organ turns it slowly in place, a whole turn in `antiphonTurnBeats`, and it stops the moment the thumb lifts; the angle is hashed, the contour is drawn turned on the organ and never on the rail, and the handle — the organ's own circle, a grip mark, the word TURN — is the first in the game on one screen only, since the navigator is shown the rail and nothing to hold. **What is not built**: the 900 ms call windows; the design's step 8, the organ turning on its own; and **the fight has never been watched at tempo** — one frame of each seat has been looked at. **Built again for the rehearsal** (`d333aa57`): `content/src/scenes/the-antiphon.ts`, twenty pages over 3,720 ticks, seed 1 — the wrong candidate first, the rail one wider for it; six organs taken where they stand by `atBoss`, which `sim/boss-answer.ts` answers with the first organ's column from the beat it grows; what the rail rejected taken by `atBody` as it falls, the twins one and then the other, the ship found among ships; the film found the first twin taken falling as a rejected body, fixed in `antiphonPit`; the guide's halves swapped to what each seat alone does; the film takes no hit |
| [bosses.md §11.15 THE REPRISE](bosses.md#1115-the-reprise--the-wave-you-have-just-beaten-sent-again-unseen) | **built, 17 September 2026** — **built again for the rehearsal, 18 September 2026** | the simulation and the look are shipped (wave `theReprise`, act 10, `render/src/reprise-draw.ts`). The rehearsal landed at `f6e02ba2` (`content/src/scenes/the-reprise.ts`): one stretch seen and taken, its echo answered blind from the column that was said and the gap that was counted, the unsaid third on the hull as the last page; `content/test/scene-reprise.test.ts` holds that the blind kills are of bodies nothing drew. The same landing taught the rehearsal's seat view to leave an unseen body undrawn (`guide-seat.ts`) |
| THE FLIP (`packages/sim/src/flip.ts`, a fault rather than a boss) | **built, 17 September 2026** — **built again for the rehearsal, 18 September 2026** | the fault and the mirrored field are shipped (wave `theFlip`, act 10, `render/src/field-flip.ts`); `claude/boss-implementation-e3cfff` — the rehearsal (`7d1343e9`, `content/src/scenes/the-flip.ts`, `scene-flip.test.ts`): a screen that turns, shown by turning and then by being believed, and the fix under it — no film had ever folded the turned seat (`render/guide-film.ts` `seatLayout`, `guide-flip.test.ts`). Not built: nothing of the design is missing; the film is not watched at tempo |
| THE HUSK (`packages/sim/src/pod-types.ts` `husk`, a pod rather than a boss) | **built** — **built again for the rehearsal, 18 September 2026** | the hollow pod, its deflation and its mark are shipped (wave `theHusk`, act 10, `render/src/husk-mark.ts`, `husk-deflate.ts`). Its film landed as `c319928d` (`content/src/scenes/the-husk.ts`, `scene-husk.test.ts`): the frame on the navigator's page and absent from the pilot's, the real one taken at an open maw, the framed one refused at a shut one, the unnamed one swallowed last. Not built: nothing of the design is missing; the film is not watched at tempo |
| [bosses.md §11.14 THE HIVE](bosses.md#1114-the-hive) | **built, 17 September 2026** — **built again for the rehearsal, 21 September 2026** | `claude/shared-list-bosses-f7ff91` — every row on this page being taken or built, the next unbuilt design on the referenced page. The simulation (`58e1e0b9`), then the look (`c7902d99`), landed separately. A waxen mass the width of the field over row 0 with nine sites along its underside that open on a clock in the seed's order, each with a colour; an open breach spills a rock down its column every three beats, a bolt of its colour into its column seals it for good, a bolt of the wrong colour provokes every open breach into spilling sooner, and from the fifth opening two open at once; beaten when every site has opened and been sealed, under THE SLOW. The look: the mass with a lobe a site, a site swelling through the three beats before it opens on the navigator's screen alone, a breach in its colour on the pilot's alone and wax-grey on hers, a scar stitched over a seal, the clench of a wrong colour, the jolt of a seal, the fade. Written up as [bosses](bosses.md) §11.14 (wave 82, THE HIVE), with the four departures argued there — the insect is a rock and never shot, the colour is the pilot's read, the clock is fixed and sealing does not slow it, it has no health of its own. **What is not built**: the insect as a body of its own — a rock stands in for it; and **the fight has never been watched at tempo** — one frame of the pilot's seat has been looked at. **The rehearsal waits on the owner** (`75f9479e`): `claude/boss-implementation-e3cfff` took the film on 18 September 2026 and found the wave cannot be won — a bolt craters the rock its own breach spilled, a rock is thirteen beats in the column against a spill every three, the second and fifth sites spill on the beat they open, and two breaches spilling on one beat beat a one-column shield. The three fixes and what each costs are a queue item that asks (`docs/queue.md`, *THE HIVE cannot be won*); the owner picked the insect and the sim was fixed 20 September 2026. **Built again for the rehearsal** (`content/src/scenes/the-hive.ts`): thirteen pages over 3,060 ticks, seed 6 — the swell hers and the colour his, a site sealed before its first spill, two sealed by a bolt already in flight when the breach opened, one answered in the wrong colour and hurried a beat for it, and the twins last with one sealed and the other left spilling, since a bolt cannot pass the body a breach has just dropped. Its split pages are the first captions pointed at a breach and at the swell (`render/caption-anchor-boss.ts`); the film takes no hit |
| [bosses.md §11.16 THE STARE](bosses.md#1116-the-stare--the-thing-that-looks-and-the-hands-that-must-not-move) | **built, 18 September 2026** — **built again for the rehearsal, 18 September 2026** | the simulation landed with wave `theStare` (act 7c) and the look at `2a1ea1c5`: the cowled eye over the middle column, its turn the seven-beat warning, pips counting the tell on both screens, the watched seat's name on the other seat's screen and the gaze on the watched one's, a catch as a flare, a burst and a red wash over the caught panel (§11.16, *The look*). Not built of the design: the flash is on the panel and not on the button pressed, because the event names a command kind and the band names a control (`docs/queue.md`). The rehearsal landed at `6956041d` (`content/src/scenes/the-stare.ts`): two mirrored looks, each the *other* seat's page — the navigator fires up a parked column while the pilot is watched, the pilot guards a rock while the navigator is — and the catch as the last page, because a caught press stops the world; the seed that picks the seats is held by `content/test/scene-stare.test.ts` |
| [§16 THE INSTAR](#16-the-instar--whether-two-different-hands-can-finish-one-beat) | **built, 17 September 2026** | `claude/tutorial-boss-onscreen-actions-07cc80` — the engine and the simulation (`954a65ed`), then the look (`b4fda399`), landed separately. The owner's ask of 17 September 2026: a boss with no control set, only marks on its own body, answered one seat at a time or both at once. `BossSequenceStep` is built and is this boss: a pose, up to two marks, three clocks, read by index off `content/instar-script.ts` with the cursor hashed; six gestures off one `instarMark` drag — tap, pull down, pull up, swipe down, turn, hold — with the seat refused by the mark's own geometry; a step's marks done inside `instarTogetherBeats` of each other or the finished one slips; a window closing on an undone mark is one strike on the hull, the wave. Written up as [bosses](bosses.md) §11.32 (wave 83, THE INSTAR, act 7e, control set `scene`), with the departures argued there. The look: since 25 September 2026 a dragon of a living ship — in from far and small, face-on with a fireball turning in its open jaws, then flown out and back side-on with two rumbling silk nests on its back, then crossed over and swinging its forked tail — three poses blended over each morph, the parts deformed by how far each mark has got, and a strike picture per part: fire over the whole screen, a swarm of hatchlings on the hull, the tail's slam; every mark a red ring with the gesture's glyph in it, a word in a scanner box over it — bright and the gesture's on its own seat, dim and the other seat's name across — and a second ring closing on it over the window; every window THE SLOW, opened when the marks come up and shut the tick the step is answered or missed (22 September 2026); the thumb's hit test, the director row and the controls row; the guide cut to the rule and whose mark is bright. **Nothing of the design is left unbuilt; the fight has never been watched at tempo** — the owner's eye is the check |

**THE SLOW is shipped, and the next boss does not have to build it.** It was
THE DIASTOLE's lane that needed it first, so it was built there rather than
as a primitive of its own, but nothing about it is that boss's: it is
`packages/sim/src/slow.ts` (`openSlow`, `slowing`, `slowRateMilli`, two hashed
`World` fields) and one line of `apps/game/src/loop.ts`, which now asks for
the length of a tick once a frame instead of computing it once at the start.
Any concept on this page that says *slow motion* calls `openSlow(world, beats)`
from its own step and is finished — see [THE SLOW and THE DRAG are two
different tools](#the-slow-and-the-drag-are-two-different-tools) for which of
the two a given beat wants, and `docs/decisions.md` #33 for the ruling.

Three things the DIASTOLE lane decided against this page's own text, which a
later concept should not read as still open:

- **A boss on this page is fed by its wave, not by itself.** §7's design had
  the boss spawning its own rocks in a late phase; it ships with
  `bossFillsWave === false` (THE VANE's family), so `act-7d.ts` writes the
  arrivals and the boss only ever answers shots. A concept that truly needs to
  spawn should say so and say why the wave author cannot.
- **Coprime means coprime all the way down.** §7 wanted the left chamber to
  shift from every 3 beats to every 4 at its second phase; 4 against 5
  coincides every 20 beats, which contradicts the design's own headline of a
  window every 15. The shift was dropped rather than the headline.
- **The input delay is still counted in ticks, not in slowed ticks.** A window
  two or four beats wide does not care. A concept whose window is a *moment* —
  one beat or less — inside a slow span has to re-derive it first; that is
  queued, not solved.

And two the THROAT lane decided, which are about **where a moving part lives**
rather than about one boss:

- **A place a boss moves to is an anchor and a function of the beat, never a
  stored position stepped once a beat.** `throatMouthCol(cfg, b, beat)` is the
  shipped shape and `sim/throat.ts` argues it: a stored column has to be
  stepped by *something*, and whatever steps it sits on one side of `onBeat`
  while the bodies that read it sit on the other. Worse, every one of these
  concepts hands one seat a readout of *where the thing will be*, and a stepper
  cannot answer a question about a beat that has not happened. `crossField` is
  still the right call for a body walking its own row; it is the wrong call for
  a part of a boss both screens are reading against.
- **A gesture already means one thing, and a concept may not quietly give it a
  second.** §1's step 12 asks for a hand held on a gum to *brake* it, "THE
  GRIP, unchanged" — but a hand on a gum is already the fling
  (`handMeans` calls it a pull), so that would have changed THE GUM rather than
  left it unchanged. The phase inhales every beat instead. A concept that wants
  a shipped control to mean something new has to say so plainly and price it.

A Way Out is the odd reference on the shelf. Spaceteam and Lovers both hand
two people a machine and let them fail at it; A Way Out hands two people a
**scene** and asks them to perform it. There is no health, no aiming and
almost no failure. What it has instead is the thing the owner asked for: every
ten seconds the picture changes, and the change is something the two of you
did on purpose, in an order somebody wrote down.

That is a real gap in this game. Every boss built here is a **loop** — a
cadence the pair learns and then executes until the body runs out. The Queen
blooms every so many beats forever; THE WARDEN cycles; THE MIRROR asks round
after round of the same question. None of them has a **second act**. A pair
who has beaten the Queen once has seen everything she will ever do, and the
remaining four minutes are execution. Nothing on this page is about making a
boss harder; all of it is about making a boss *go somewhere*.

## The four things the engine says back to the brief

**1. There is no shared screen, but sight may be shared per wave.** The brief
says "the game is played on ONE shared game screen" and the sheet draws both
players' hulls side by side in one frame. That is a different game: two
devices, two views, and talking as the control scheme
([roles](roles.md), `CLAUDE.md`). The owner settled the useful half of this
the same day the brief arrived:

> so in this case, its ok that for some waves or enemies, both can see the
> same, but players might require different actions or do the same action
> together at the same time, or one after another.

So a concept here may show both seats the same field. That is not a new
permission — it is what THE CLAW already does, and [controls](controls.md)
says why in as many words: *"Both seats see everything here. A per-pod 'which
seat is shown this' field was built and then cut, on the owner's word… The
split on this panel is in the hands rather than in the eyes."* The rule this
page works to is therefore: **every boss splits something, and it may split
the hands instead of the eyes.** What is still forbidden is a single frame
containing both hulls, and a gesture that needs to see the other thumb land.

**2. A boss has no health bar, ever.** Every card on the sheet carries a
`BOSS HP` meter across its top. [bosses](bosses.md#the-three-filters-a-boss-has-to-pass)
already forbids it: *"Its health is its silhouette. Petals, plates, a pupil
that ends up permanently wide. No bar, ever."* Each concept below therefore
says what part of its outline goes away, and how many there are.

**3. Slow motion is allowed, it slows the beat, and it is a change to one line
of the loop.** This page first said it could not exist, on
[transfers](transfers.md#the-filter)'s old filter line. The owner overruled
that on 16 September 2026 and supplied the condition that makes the refusal
wrong — *"it doesn't matter if it is in sync or not. Just what matters that
both animations in slow mode start and end at the same time for both players
when visible to both"* — and the ruling, with the mechanism and its two costs,
is `docs/decisions.md` #33. The short version, because the rest of this page
depends on it:

- **What was actually forbidden was a tempo *bend*, not a slow.** The wall this
  game has is not the tempo, it is the tempo being **shared**. A symmetric slow
  is still shared: the pair counts beats, both of them count the same ones, and
  a beat three times longer in wall clock means the 0.5–2 s voice delay covers
  *fewer* beats than usual. **Talking gets easier inside a slow window.** That
  is the opposite of what The Conductor (30) was deferred for.
- **It changes `tickMs` and never `ticksPerBeat`.** `apps/game/src/loop.ts`
  holds the only wall clock in the stack — *"Wall-clock time exists here and
  nowhere below: the simulation only ever hears 'one tick has passed'"* — and
  `startLoop`'s one-off `const tickMs = 1000 / tickHz` becomes a lookup against
  the window's rate. Ticks per beat is simulation and is untouched, so a
  creature still falls exactly as far per beat as it always did.
- **Desync is impossible by construction.** The same integer steps run on the
  same tick numbers, so `hashWorld` cannot tell a slow window from an ordinary
  one. The owner's *start and end together* is satisfied by the window's
  **boundaries** being a hashed field of `World`; only the wall-clock rate
  inside it is local, and two phones 200 ms apart stay 200 ms apart.
- **The metronome slows with it, for free**, because `packages/audio` binds
  cues to simulation events rather than to a wall-clock schedule — and a
  slowing click is the loudest possible signal that a window has opened.
- **Two costs, named in #33**: judder, because at a third of the rate frames
  start outnumbering ticks, which is exactly what the already-written
  `interpolatedBeatPhase` fixes; and the input delay, which is counted in ticks
  and would triple in felt milliseconds at the very moment the drama peaks
  unless it is re-derived against the rate.

### THE SLOW and THE DRAG are two different tools

The ruling leaves the game with **two** ways to make something take longer, and
a concept that reaches for the wrong one gets either drama it did not want or a
mechanic it did not earn. They are not substitutes and every entry below says
which it is using.

**THE SLOW** — the beat's wall-clock rate, for a named span of beats, both
devices. It is **presentation**: the same ticks, the same integers, the same
fingerprint, played back slower. It buys **wall-clock time**, which is why it
is what makes a called one-beat window playable — a 900 ms call inside a
third-rate window has 2.7 s to arrive. It changes no mechanic and costs the
simulation nothing.

**THE DRAG** — a body moving at a fraction of its rate, in beats. It is
**mechanics**: `sim/grip.ts` scaling `grippedFallTiles`, and `slowStep` in
`slow-fall.ts` as the per-kind version. It buys **beats**, which is a different
currency — a body that takes three beats to cross a row is a body the pair has
three beats to answer, and the fingerprint records every one of them.

| Concept | Uses | For what |
|---|---|---|
| 1 THE THROAT | **both** | DRAG on the inhale — three beats a row is three beats for a braking hand. SLOW on a flung gum's last row |
| 2 THE ORRERY | SLOW | a one-beat alignment across a voice delay. The rings keep their integer cadences, which is why this is the better tool |
| 3 THE GORGE | SLOW | the beads rising as an intake goes full — the only warning before a one-beat pierce |
| 4 THE TASTER | SLOW | a blade's colour crystallising: the beat the last conversation is judged |
| 5 THE LEDGER | SLOW | the bead's last beat down the cord |
| 6 THE CURTAIN | SLOW | the shove, and the fabric thinning under two hands |
| 7 THE DIASTOLE | SLOW | the coincidence beat, both chambers open, the beam standing |
| 8 THE SINEW | **both** | SLOW on the fibres parting. DRAG on the final fall — four beats a row is what makes walking it sideways possible |
| 9 THE SURGE | SLOW | the last beat before a notch, which is what makes a one-beat mutual lift fair |
| 10 THE BATON | **DRAG** | the bead genuinely takes three beats between sockets. A permanent SLOW here would be the brief's own refusal — *"do NOT turn the entire game into permanent slow motion"* |
| 11 THE LEAD | SLOW | the bolt's last row: the brief's suspended projectile, literally |
| 12 THE ANTIPHON | neither | the organ turning under a hand is a rotation, not a time effect |
| 13 THE UNDERTOW | SLOW | the hull plate bowing and parting |
| 14 THE CANDLE | SLOW + `AfterImage` | the decaying lit frame is a render buffer; SLOW lengthens the look at it |
| 15 THE SCUTTLE | **DRAG** | three beats of a part hanging by a thread is the window it is shot in |

**Where each earns its keep.** Four of the fifteen want DRAG and eleven want
SLOW, and the four are the ones where the extra time is the *mechanic* — a hand
to arrive, a body to walk sideways, a turn to take, a part to hit while it is
still attached. Everywhere else the pair does not need more beats, it needs
more seconds inside the beat it already has, and that is free.

**4. Red and cyan are ammunition and cannot mean anything else.** The brief
proposes `PURPLE = P1 interaction, BLUE/CYAN = P2 interaction`. Cyan already
means *shoot me with cyan* and red means *shoot me with red*
(`colour-armour.ts`), violet is the ship's own body, and rock grey is armour.
A cyan ring meaning "player 2's thumb goes here" would collide with the one
colour statement the whole game is built on. The language every concept below
uses instead:

| | Means |
|---|---|
| red / cyan | ammunition colour — the only colours that say *shoot this* |
| rock grey | armour: a shot does nothing |
| violet | the ship, and anything of the ship's |
| white | neutral, and the only colour a target lock is drawn in |
| **geometry, not colour** | which seat a handle belongs to |

That last row is the working rule, and it is shipped: THE BALLOON's two
handles are the pilot's and the navigator's, and what says so is that one
hangs off the **left** and one off the **right** — not a colour. THE CHOIR's
two arrows are the same trick against the two walls. **A seat is a side.**

**And one more, smaller.** The brief asks for windows of "1.2 seconds" and
"1.5s". A window for an action the acting player can **see for themselves** may
be that tight. A window for an action that has to be **called across the voice
delay** may not: `guardWindowMs` is 900 ms and
[roles](roles.md#the-raster-model) says exactly why — *"hearing the column,
finding it and pressing is three actions across a voice delay, and 600 ms only
ever fitted two of them."* Every table below marks a window **seen** or
**called**, and no called window is under 900 ms.

## What A Way Out actually does, and what of it survives the trip

| Mechanism | Here already as | Verdict |
|---|---|---|
| An authored beat list; the scene will not advance until the beat is performed | nothing — every boss is a loop | **the whole of this page.** `BossSequenceStep` |
| The two players are given different jobs in the same beat | all three [couplings](couplings.md) | built, and better here |
| A prompt with a shrinking ring | the ready gate's two circles, `queen-drop.ts`'s filling bar | built, reusable as-is |
| Time dilation on the dramatic action | `loop.ts`'s `tickMs`; THE GRIP and `slowStep` for the other kind | **arrives as THE SLOW**, per correction 3 and `decisions.md` #33 |
| A split screen that reframes, zooms and re-composes per beat | nothing; the window is [not the stage](../decisions.md) (#14) | **refused.** Two portrait phones have no second pane to give |
| Alternating turns — one acts, the other watches | nothing does this on purpose | **THE BATON**, below |
| Simultaneous button press on a shared count | [couplings](couplings.md) 1, and SYNC in `balance.ts` | built; worth spending at boss scale |
| Failure rewinds to the last beat, and the scene continues | `wave-fail.ts` — a hit loses the whole wave | **THE STEP BACK**, below, and it is new machinery |
| No enemies, no health, no aiming | the opposite of this game | refused, obviously |
| Cutscene dialogue carrying the plot between beats | the pair's own voices, and nothing else | refused — nothing may be written for them to read aloud |

The fifth row is worth dwelling on because it is the reference game's signature
and it is simply unavailable. A Way Out's camera is the co-op device: it splits,
un-splits, follows one brother and abandons the other. This game's two frames
are two phones in two hands, and `decisions.md` #14 already settled that the
window is not the stage. What replaces a camera move here is what
`render/` already has — the whole-screen shake THE CHOIR's arrow starts, the
tip-over THE MIRROR does on a wrong step, `hull-shock.ts`, `breach-strike.ts`.
**Presentation is the hull's reaction, not the frame's.** Every `Presentation`
line below obeys that.

## The filter these fifteen had to pass

[transfers](transfers.md#the-filter)'s five, then
[bosses](bosses.md#the-three-filters-a-boss-has-to-pass)'s three — a fourth
boss asks a fourth question, a boss holds a row or is a fixture, its health
is its silhouette — and then two this page adds, both of which killed drafts:

9. **A step is a `Command` or it does not exist.** A gesture that is not in
   `DragTarget` or `Hold["kind"]` is not a control, it is a wish
   (`sim/drag-targets.ts`, `render/touch-hold.ts`). Every concept below names
   the union member it needs, and any state it keeps is a field of `World` and
   therefore in `hashWorld` (`decisions.md` #23).
10. **The sequence is authored, and the author is `content/`.** The brief's
    central rule — *the player should not decide "maybe I should pull this
    now"* — lands here as a data shape, not a behaviour: a boss's beat list is
    written in `packages/content` next to the waves, the way `scene-script.ts`
    already writes a guide's steps, and `sim/` reads it by index. That is the
    same discipline `queue` and `podQueue` get under `decisions.md` #23: the
    script is an input, `spawned` is the cursor, and the cursor is hashed.

One thing the brief asks for is refused outright by an existing design, and it
is worth saying so rather than pretending the conflict away. *"Authored
sequence, not player choice"* is the brief's loudest rule, and
THE TITHE — a boss whose entire content was a choice made under a clock,
three demands and two hands — was the worked design that argued with it. It
was deleted with its page on 17 September 2026 and the tension is worth
keeping anyway, because the next boss that wants a choice will meet it: a choreographed boss is a scene, a tithe is a
sentence about what you are willing to lose. This page builds the first kind.

## The fifteen

Each is a **question no shipped boss asks**, because that is filter 8 and it
is the one that killed the most drafts. Template throughout: the question, the
silhouette and what part of it is the health, the mechanic, the two seats, the
beat list, where THE SLOW or THE DRAG falls, what the hull does instead of a
camera, the
colour statement, the payoff, the cost, and what of it is reusable.

In every beat list, a **seen** window is one the acting seat can judge from
their own frame; a **called** window is one that has to cross the voice delay,
and none of those is under 900 ms (`guardWindowMs`, and the reason is in
[roles](roles.md#the-raster-model)).

---

### Built

### 1. THE THROAT — what you feed it

> **Simulation built, 16 September 2026**, on
> `claude/neon-spore-boss-design-26ee5e`, and written up as
> [bosses.md](bosses.md) §11.19 — which is the record of what shipped and
> where it departs from the text below. **The gullet is not drawn yet**: the
> boss plays and is invisible, and the look is the same lane's next piece. Do
> not start either half in a second session — see [who is building
> what](#who-is-building-what-so-two-sessions-do-not-collide).
>
> **Built whole** as of 17 September 2026, in three pieces: the simulation, the
> gullet, and then NEXT INHALE with the eversion. §11.19 is the record.
>
> Two things below are not built, and §11.19 says why for each: a hand cannot
> **brake a gum** out of the pull, because a hand on a gum is already the fling;
> and the **inhale is the climb** — one clock rather than a six-beat clock plus a
> three-beat drag, so player 2's *beats until the next inhale* is the deadline
> the pull is measured in.

> The one where its mouth and your maw are the same organ, facing each other.

**Question.** *What you put in on purpose.* Every boss in this game is
answered by taking something away from it. This one is answered by giving it
something, and the pair's own habit — clear the field, shoot the hazard — is
what feeds it.

**Silhouette.** A gullet hanging from the top of the field down a third of it:
five ring muscles stacked and narrowing, each one a closed contour with the
next drawn inside it, ending in a lipped mouth exactly one column wide. No
eyes, no limbs, no face — the whole body is a tube, and the only part of it
that moves laterally is the mouth, which slides along its own row. **Health is
the five rings:** a choked ring goes slack, loses its tension and hangs limp
inside the tube for the rest of the fight, and a tube of five slack rings
cannot swallow.

**Mechanic.** Two clocks and one gesture. *Its* clock: every six beats the
throat inhales its own column, and anything standing there climbs a row a
beat until the mouth takes it. A creature swallowed re-tightens one slack ring
— so the throat repairs itself out of the wave's own arrivals, and a pair who
lets the field run is fighting a boss that heals. *Their* gesture: **THE GUM,
flung**. A gum falls straight down a lane, cannot be shot, is not stopped by
the shield, and carried `gumSwipeMilli` sideways it leaves its lane and flies
level along its row at `gumFlingCols` a beat (`sim/gum.ts`). Flung along the
mouth's row, into the mouth, it chokes a ring. Nothing else on the body can be
hurt at all.

The whole fight is therefore an arithmetic sentence said out loud: a gum falls
a row a beat, the mouth steps a column a beat, and a fling crosses
`gumFlingCols` a beat. *Which beat do I let go?*

**Player 1 — pilot.** Sees the gums coming (a hazard is his radar) and owns the
fling, because the row the gum is on when the thumb lifts is the line it flies
along. He also owns the maw, and the maw is the only thing that answers a pod
the throat would otherwise take.

**Player 2 — navigator.** Sees the mouth: a target lock with a filling bar under
it, `queen-drop.ts`'s exact picture, saying which column the mouth will be in
and how many beats until the next inhale. She sees no gums at all. She holds
both colours, which is the only answer to the creatures the throat is trying to
eat.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the mouth stands still** ||||||
| 1 | The tube descends into frame, rings contracting in sequence top to bottom; the mouth opens over the middle column | — | — | — | — | — |
| 2 | One gum enters at the top, one lane off the mouth's column | P1 | swipe the gum toward the mouth | 3 beats, seen | the gum leaves its lane level | it reaches the hull and splashes across the ship |
| 3 | The gum crosses the field level; the mouth's lip flares | — | — | — | ring 1 chokes and goes slack | the gum leaves at the wall |
| 4 | The throat inhales its own empty column, and the sound of it is the tell for the whole fight | — | — | — | nothing there to take | — |
| **P2 — the mouth slides, and the field fills** ||||||
| 5 | The mouth begins stepping a column a beat, turning at the walls; two creatures arrive | P2 | call the mouth's column and the beats to the inhale | 900 ms, called | P1 has a number to swipe against | the gum flies at nothing |
| 6 | A gum and a creature in the air together | P1 | swipe the gum; leave the creature | 3 beats, seen | ring 2 chokes | — |
| 7 | The inhale takes the creature P1 left alone | P2 | fire its colour before the inhale beat | 2 beats, called | the creature is gone and the throat gets nothing | a slack ring re-tightens, and the fight is longer than it was |
| **P3 — two gums, two rows** ||||||
| 8 | Two gums enter on different rows, and only one row meets the mouth | P1 | pick the row and swipe it; let the other hit the hull | 2 beats, seen | ring 3 chokes; the hull takes one gum on purpose | both gums reach the hull |
| 9 | The inhale cadence tightens from six beats to four; the mouth steps two columns a beat | — | — | — | — | — |
| 10 | A gum and a pod arrive in the same lane; the throat wants the pod | P1+P2 | she shoots the pod loose, he opens the maw under it and then swipes the gum | `intakeWindowMs`, called | ring 4 chokes and the pod is aboard | the throat eats the pod and two rings re-tighten |
| **P4 — the tube cannot close** ||||||
| 11 | Four rings slack. The tube can no longer hold its own shape and sags into a curve across the field | — | — | — | — | — |
| 12 | It inhales continuously rather than on a clock, and the pull reaches the ship: every gum on the field is dragged toward the mouth without being flung | P1 | hold a hand on one gum to brake it (THE GRIP, unchanged) | as long as the hand stays | the gum stays out of the mouth | it is swallowed and a ring re-tightens |
| 13 | The last ring, and the mouth is wide open and no longer sliding | P1+P2 | he flings the gum he has been holding; she lances the column behind it | 4 beats, called | — | — |
| 14 | **The throat everts.** With five slack rings and a full inhale it pulls itself through its own mouth — the tube turning inside out from the top down, ring by ring, each one appearing on the outside of the last, and what was the inside of the boss is drawn for the first time as it goes | — | — | — | — | — |

**THE DRAG, then THE SLOW**, and this is the concept that shows most plainly
why they are two tools. **The inhale is a DRAG**: everything in the throat's
column takes three beats to climb a row instead of one, and those are real
beats — a braking hand has three chances to arrive rather than one, and the
fingerprint records every one of them. **The fling is a SLOW**: the gum's level
flight is already the best shot in the fight, so the beat it crosses its last
row is played at a third rate with its trail drawn full length. Nothing about
the flight changes; the pair simply gets to watch it.

**Presentation.** No camera. The inhale is the **hull** answering: `ship-air.ts`
pulled toward the top of the frame, the ship's own nerves drawn taut, and a
single low shudder through `hull-shock.ts` on the beat the mouth closes. A
choked ring is a whole-frame dim for one beat — the tube going dark from that
ring down — and nothing else.

**Animation.** The rings contract in a travelling wave top to bottom, one ring
a beat, which is the thing that makes the six-beat clock readable without a
number. The mouth's lip flares a beat before it takes anything. A slack ring
stops joining the wave, so the wave visibly gets shorter as the fight goes on
— the health, the clock and the picture are one drawing.

**Colour.** The tube is rock grey, because no shot may touch it. The rings'
inner faces are violet — the ship's own colour, which is the joke: it is made
of what it eats. A gum keeps the gum's own colour. The mouth's target lock is
white. **No red and no cyan anywhere on the body**, which is the honest
statement that the cannon is not the answer here.

**Payoff.** Step 14. The eversion is the whole reason to build it: a closed
contour turning through its own opening is something no creature in this game
does, and it is `blobPath` run inside-out with the ring order reversed.

**Cost. Medium.** The gum, the grip, the maw, the pod intake and the target
lock are all shipped; the fling into a *target* is one new hit test. What is
new is the eversion (a render job, and a real one) and `ThroatState`'s five
ring tensions.

**Reusable.** `FeedTarget` — a place on a boss that accepts a body rather than
a shot. `InhaleColumn` — a column that moves bodies up instead of down, which
is THE WELL's projection arithmetic pointed the other way.

---

### 2. THE ORRERY — whether you can agree on when

> The one where three rings turn at three speeds and neither of you can see
> all three.

**Question.** *Whether you can agree on a beat you are each half-blind to.*
The Queen asks *which column*; this asks *which beat*, and it makes the answer
uncomputable from either seat alone.

**Silhouette.** A core two columns wide, held in three concentric rings of
orbiting organs — eight in the outer, six in the middle, five in the inner,
coprime on purpose. Each ring has exactly one gap. The rings are drawn as
beaded arcs rather than solid circles, so a gap is a gap in a *rhythm* and
reads at 26 px. **Health is the rings:** a ring fired through breaks at the
gap, and its organs drift off the orbit and fall as ordinary rocks. Three
rings, three hits, and the core is never touched until all three are open.

**Mechanic.** Each ring steps one organ a beat, the outer clockwise, the middle
anticlockwise, the inner clockwise. The core is exposed only on a beat all
three gaps stand over one column. **The outer ring is drawn true on both
screens. The middle is true only on player 1's and the inner only on player
2's** — on the other screen each is drawn as an unbroken grey arc with no gap
at all. So neither seat can predict the alignment, and the prediction is the
fight.

**And player 1 can turn the outer ring by hand.** A drag on its resting circle
reports a **bearing** in thousandths of a turn, exactly as `crank` does
(`sim/crank.ts`, `sim/drag-targets.ts`), and the ring follows the thumb. That
is THE MAZE's string at boss scale, and it is what turns an arithmetic problem
into a physical one: the alignment can be *brought forward* rather than waited
for.

**Player 1 — pilot.** Sees the middle ring true. Turns the outer ring. Holds the
cannon column and the trigger.

**Player 2 — navigator.** Sees the inner ring true. Holds both colours, and the
core's colour is the one thing about the core either of them can see.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one ring, and it is drawn true on both screens** ||||||
| 1 | The orrery unfolds into frame, rings starting from rest one at a time, outer first | — | — | — | — | — |
| 2 | Only the outer ring turns. Its gap crosses the field once every eight beats | P2 | call the column the gap will stand over | 900 ms, called | — | — |
| 3 | The gap stands over a column | P1 | cannon in that column | 1 beat, called | — | the ring steps on |
| 4 | Through the gap, the core is visible for one beat | P2 | fire the core's colour | 1 beat, seen | the outer ring breaks; eight organs drift loose and fall as rocks | nothing; the gap moves on |
| **P2 — the middle ring, and neither of you has the whole picture** ||||||
| 5 | The middle ring spins up anticlockwise. On player 2's screen it is a solid grey arc | P1 | read his gap's column and its direction aloud | 900 ms, called | she can cross it against her own | she is firing at armour |
| 6 | Two gaps approach alignment | P1+P2 | he holds the column; she waits | 2 beats, called | — | — |
| 7 | Two gaps align for one beat | P2 | fire | 1 beat, seen | the middle ring breaks | the rings part and the next alignment is eleven beats off |
| **P3 — three rings, and the hand on the outer one** ||||||
| 8 | The inner ring spins up. Three rings, two gaps hidden per seat, alignment every fifteen beats at best | — | — | — | — | — |
| 9 | The core begins firing down whichever column its own gap faces, a rock a cycle | P1 | slide the shield's column call to her; she stands the plate | `guardWindowMs`, called | the rock is warded | a scar, and the orrery sinks a row |
| 10 | Two gaps aligned, the outer ring's gap four organs away | P1 | **drag the outer ring** to bring its gap over the column | 3 beats, seen | three gaps over one column | the drag overshoots and the alignment is gone |
| 11 | Three gaps, one column, and the shaft all the way to the core is open | P2 | fire | 1 beat, seen | the inner ring breaks; the core is naked | the shaft closes |
| **P4 — the naked core** ||||||
| 12 | The core hangs in the wreck of three orbits, and every organ that ever drifted loose is still falling through the frame | P2 | **hold** a colour | `lancePrimeBeats`, called | the cannon lobe fills | a lift fires one ordinary bolt and the fill is gone |
| 13 | Player 1 must keep the cannon still for the whole fill, in a column full of falling debris | P1 | do nothing, precisely | `lancePrimeBeats`, called | — | the fill drops to nothing |
| 14 | **The beam stands in the column** for `lanceBeamBeats`, burning through the core and every loose organ in the shaft at once | — | — | — | the orrery goes out from the centre outward | — |

**THE SLOW.** One place, and it is the whole design: **the beat the gaps align
is played at a third rate.** Organs trail behind their own arcs, the shaft
through the body opens visibly, and a 900 ms call has 2.7 s to arrive. This is
the concept that proves THE SLOW has to exist before any of these can be built
— a one-beat alignment across a voice delay is otherwise a coin toss. And it is
the clearest case for SLOW over DRAG: three rings on coprime integer cadences
are the entire boss, and stretching the *rings* would break the arithmetic the
pair has been doing. Stretching the **second** breaks nothing.

**Presentation.** The alignment beat brightens the *shaft* rather than the
screen: a corridor of light straight down through three rings to the core, drawn
by `light-shafts.ts`, which is a picture no other boss in this game can make
because no other boss is hollow. A broken ring is `shatter.ts` along one arc.

**Animation.** Three rings at three rates, and the beaded arcs make each rate a
visible rhythm rather than a speed. A hand on the outer ring drags it with
resistance and it keeps a little of the thumb's motion after the lift, which is
what makes the overshoot in step 10 a real failure rather than an unfair one.

**Colour.** Rings rock grey, organs violet. The core carries the ammunition
colour and is the only red or cyan thing in the frame — so the whole fight is
grey machinery around one coloured statement, and the alignment is literally the
pair opening a line of sight to the only colour on screen.

**Payoff.** Step 14: the lance standing in a shaft through three broken orbits,
with the debris of twenty organs falling through the beam.

**Cost. High.** Three ring states, three per-seat visibility masks, a new
bearing-drag target, and an `Effects`-side shaft. The visibility mask is the
expensive part: `render/` has to draw the same ring two ways and
`queen-split.test.ts`'s pattern has to hold both halves shut.

**Reusable.** `PerSeatTruth` — the same body drawn true on one screen and
armoured on the other, generalised out of the Queen's two marks.
`BearingDrag` — `crank`'s thousandths-of-a-turn, on the field rather than the
panel. `AlignmentWindow` — a beat computed from several independent cadences,
which THE DIASTOLE needs too.

---

### 3. THE GORGE — what not to do

> The one that eats your shots, and the only way to hurt it is to overfeed
> exactly one part of it.

**Question.** *What not to do.* Not one boss in this game has ever asked the
pair to stop shooting. This one makes the pair's deepest habit — answer
everything with the cannon — into the failure state, and the correct play is
eleven beats of deliberate restraint.

**Silhouette.** A wide soft mass across the top of the field, seven columns of
it, translucent: a lobed sack with a puckered **intake** drawn under each
column. Inside, the shots it has swallowed hang suspended as red and cyan
beads, visible through the skin, so the boss's state is legible at a glance from
either seat. **Health runs backwards, which is the point:** it starts small and
the pair must keep it small. An intake holding four beads is **full**, goes
transparent, and is the only part of the body a shot can hurt. Pierce a full
intake and that lobe ruptures permanently and hangs open.

**Mechanic.** Every bullet that does not hit a creature is swallowed by the
intake in its column and becomes a bead. That is the whole rule. A pair that
fires freely spreads one bead across seven intakes and fills none of them,
while the sack swells and sinks a row for every four beads it holds. A pair that
fires *into one column on purpose* fills an intake in four shots — and then has
one beat to pierce it, because a full intake **vents** after four beats and the
vent is a torch out of it, the fastest thing in the field.

So the sentence is: *stop shooting, except at column four.*

**Player 1 — pilot.** Holds the cannon still on the chosen column for four shots
in a row, which means the field is answered with the shield and the maw and
nothing else for as long as the fill takes. He is the one shown each intake's
bead count (a violet tally under each lobe, on his screen only).

**Player 2 — navigator.** Fires, and must fire *nothing* at the arrivals. She is
shown which lobe is nearest full, and the colour it will need — and the colours
matter, because an intake fills only on beads of one colour and a wrong-colour
bead **empties it by one**.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one intake, an empty field** ||||||
| 1 | The sack drifts down into the top of the frame and settles, seven intakes puckering in turn | — | — | — | — | — |
| 2 | Nothing else is on the field. One intake glows faintly | P2 | four shots of one colour, same column | 8 beats, called | four beads rise into the lobe | a wrong colour takes a bead back out |
| 3 | The lobe goes transparent and swells | P2 | one more shot, same column | 4 beats, seen | **the lobe ruptures** | it vents a torch down that column |
| 4 | If it vented: a torch falls at the torch's own speed | P1+P2 | she stands the plate, he triggers | `guardWindowMs`, called | warded | a scar, and the sack sinks a row |
| **P2 — the field comes back, and the cannon is the wrong answer** ||||||
| 5 | Creatures begin arriving, two a cycle, in the colours the pair is not filling with | P2 | **do not fire at them** | — | the fill survives | every reflex shot is a bead in the wrong intake |
| 6 | A rock among them | P1+P2 | ward it — the shield is the answer now, not the cannon | `guardWindowMs`, called | warded | a scar |
| 7 | A creature reaches the hull because nobody shot it | — | — | — | — | a breach, and it is the *correct* play: the sack is what kills them |
| 8 | Second lobe full | P2 | pierce | 4 beats, seen | second rupture | a second vent |
| **P3 — it feeds itself** ||||||
| 9 | The sack begins **spitting beads back**: a swallowed bead returned down its own column as a bolt of that colour, which only the opposite colour can out-shoot | P2 | fire the opposite colour into it | 2 beats, seen | both bolts go | it reaches the hull |
| 10 | Two intakes at three beads and the arrivals at four a cycle | P1 | hold the column against everything the field is asking for | 6 beats, called | the third fills | — |
| 11 | Third rupture, and the sack can no longer hold its shape: it sags into a curtain across five columns | P2 | pierce | 4 beats, seen | — | — |
| **P4 — everything it ever swallowed** ||||||
| 12 | Four ruptured lobes hanging open. The remaining three intakes fill *by themselves* off the sack's own spat beads | — | — | — | — | — |
| 13 | The last intake goes transparent with every bead the boss has ever held in it at once — dozens, stacked up the lobe | P2 | **hold** a colour; player 1 keeps the column | `lancePrimeBeats`, called | the lobe fills past transparent | the fill drops and the lobe vents everything |
| 14 | **The beam stands in the column.** The sack ruptures along its whole width and every bead it ever swallowed leaves at once, in the colour it was fired in, straight up through the top of the frame and gone | — | — | — | — | — |

**THE SLOW.** One place, and it is the beat an intake goes full: **the four
beads rise through the lobe at a third rate**, the skin going transparent
around them as they climb. That is the tell for the one-beat pierce window and
the only warning the pair gets — and it has to be a SLOW rather than a DRAG,
because an intake that took three beats to fill would be three beats the pair
could spend not firing, which is the one thing this boss must never hand
them.

**Presentation.** A swallowed bolt is answered by the **sack**, not the screen:
the intake puckers and the bead visibly enters, which is a small picture that
happens dozens of times and teaches the rule without a word. A rupture is
`body-hit-rupture.ts` at a size nothing has asked for yet.

**Animation.** The sack breathes on the beat, the whole seven columns of it
rising and falling a third of a tile — which is `Milli` work and the only place
a boss this wide can afford it. Beads drift inside it with a lag, so the body
looks full of fluid.

**Colour.** The sack is violet-grey and translucent. Every red and cyan in the
frame is **the pair's own ammunition, inside the enemy** — which is the whole
statement of the boss, and it means the colour language does no new work at all.

**Payoff.** Step 14. Fifty beads leaving at once in two colours is the loudest
frame on this page and costs one `sprite-burst.ts` pass.

**Cost. Medium.** Bead counts per intake are seven integers. The rupture and the
translucent lobe are render jobs. Nothing new is needed in `touch.ts` at all —
this is the one concept on the page that adds **no gesture**, and it is the
cheapest of the fifteen for that reason.

**Reusable.** `AbsorbColumn` — a column that takes bullets rather than stopping
them, which is `bullet-refused.ts` with a consequence. `RestraintGate` — a
step that is passed by *not* sending a command for N beats, and the one thing on
this page the input layer has never had to express.

---

### 4. THE TASTER — what you have already spent

> The one that grows its armour in whichever colour you have been leaning on.

**Question.** *What you have already spent.* Every other boss is answered inside
its own cycle. This one is answered by how the pair played the **last thirty
beats**, which makes it the first boss in the game with a memory of the pair
rather than of itself.

**Silhouette.** A low, broad, crested body — wider than tall, hugging its row —
with a fan of eleven blades along its back, one per column, each standing up
out of the crest. A blade is armour grey along its body and carries a single
bright line of ammunition colour down its **edge**: the colour it has grown
toward. **Health is the fan.** A blade struck off is gone and the crest under
it is soft; the fan visibly thins from wherever the pair has been working, so
the silhouette records the pair's own colour habits as a shape.

**Mechanic.** It counts the pair's shots over a rolling thirty beats and grows
its next blade in the **majority** colour — and a blade is only struck off by
the colour it is **not**. That is the whole rule, it is fixed and learnable and
announced a full cycle ahead, which is what
[*fixed and learnable*](bosses.md#fixed-and-learnable) demands of any boss
that reacts to the pair at all. It never reacts to *how well* they played, only
to *what* they spent — the other condition from the same section.

The trap is automatic. A pair that finds cyan working uses cyan, and the boss
answers with cyan blades that only red can take, and by the time they need red
their last thirty beats are cyan. **The correct play is to spend the colour you
do not need**, which no shipped wave has ever rewarded.

**Player 1 — pilot.** He is the only one shown the **tally**: a violet ledger
along the hull's inner edge on his screen alone, two bars, thirty beats deep,
sliding. He holds no colour and can change the count by nothing he does — the
one who can see the number cannot move it.

**Player 2 — navigator.** She holds both colours and therefore owns the count
entirely, and sees nothing of it. Her screen shows only the blades: which are
standing and what each one's edge is. So the pair's sentence is the flat
opposite of a warding call — not "column four" but **"you're nine red to four,
give me cyan for the next eight."**

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one blade at a time, and the rule stated in the picture** ||||||
| 1 | It rises along its row, crest first, and the fan opens blade by blade from the middle outward | — | — | — | — | — |
| 2 | One blade stands, edged red. Nothing else on the field | P2 | fire cyan at it | 2 beats, seen | the blade shears off | a red shot **thickens** it: the edge widens and it now needs two cyan |
| 3 | The crest under the gap is soft and visibly wet | P1 | cannon into the gap | 1 beat, called | — | — |
| 4 | The next blade grows out of the crest over four beats, and its colour sets on the fourth | P1 | read the tally and call the next eight beats' colour | 900 ms, called | the blade grows in the colour they are *not* about to need, and it is therefore free | it grows in the colour they have been using, and it is now expensive |
| **P2 — the fan, and a field that decides the tally for them** ||||||
| 5 | Three blades standing, and creatures arriving in one colour only | P2 | answer the field, which loads the tally | 6 beats, seen | the field is clear | — |
| 6 | The fan grows three blades in that same colour at once | P1 | call the trade: spend the other colour on nothing | 900 ms, called | the tally turns over inside six beats | the fan is a wall in the colour they have |
| 7 | A blade at the edge of the fan sweeps down and throws a rock | P1+P2 | ward it | `guardWindowMs`, called | warded | a scar |
| 8 | Two blades shear in two beats when the tally has been managed | P2 | two shots, alternating colour | 2 beats, seen | two blades | — |
| **P3 — it tastes faster** ||||||
| 9 | The rolling window shortens from thirty beats to twelve, so the fan now answers the last four shots rather than the last ten | — | — | — | — | — |
| 10 | Every blade the pair leaves standing re-edges itself to the current majority each cycle | P2 | shear a blade in the beat after its edge sets and before it re-sets | 2 beats, seen | a blade | the fan is uniform again |
| 11 | The crest lifts, showing the soft body under the whole fan | P1 | cannon along it, column by column, on his own | 4 beats, seen | the crest is cut and the fan cannot re-edge | — |
| **P4 — the colour it has never tasted** ||||||
| 12 | Two blades left, and the fan **closes over the body** like a hand — the two blades meeting over the crest and interlocking | — | — | — | — | — |
| 13 | The interlocked pair is edged in both colours at once, and neither single shot touches it | P2 | **hold** the colour the tally says she has spent least of, all fight | `lancePrimeBeats`, called | the lobe fills in the one colour the boss has never grown toward | the fill drops, and the closed fan is proof against everything they have |
| 14 | **The beam stands in the column.** The interlock parts, the whole fan unlocks outward at once like a flower opening backwards, and the soft body under it is drawn for the first and last time | — | — | — | — | — |

**THE SLOW.** The beat a blade's colour **sets**: the edge crystallises at a
third rate, the colour running up the blade from the root to the tip, and both
seats watch it happen. That is the tell, the warning and the drama in one
picture, and it is the moment the pair learns whether their last conversation
worked.

**Presentation.** The hull's own light answers the tally: on player 1's screen
the ledger bar brightens as it slides, `hull-light.ts` doing the work, so the
number he has to read aloud is already the brightest thing in his frame. A
sheared blade is `break-piece.ts` and a whole-frame shudder for one beat.

**Animation.** The fan is the animation: eleven blades that rise, lean, sweep
and interlock, and one long travelling shiver along the crest whenever the
majority colour flips — a visible "it noticed."

**Colour.** This is the one boss where red and cyan are doing a *second* job
without ambiguity, because the second job is the same as the first: a blade's
edge says which colour it is vulnerable to, inverted. The rule the pair learns
in four seconds is **"shoot the other one"**, and it is the only inversion in
the game, which is why one boss may have it and no wave may.

**Payoff.** Step 14. A fan of eleven blades unlocking outward in one beat is a
silhouette event, which is the only kind of payoff this game's health rule
permits.

**Cost. Low to medium.** Two counters and a window. Everything else — blades as
armour, colour vulnerability, the lance — is shipped. The expensive part is
honest teaching: an inverted colour rule needs its own guide screen
(`.claude/skills/new-tutorial`), and it is the first mechanic in the game that
would be **wrong** to leave discoverable.

**Reusable.** `SpendLedger` — a rolling per-colour count of the pair's own
commands, hashed, which is the machinery THE MOTHER (11.1) has been waiting for
and never got. `InvertedWeakPoint` — a body vulnerable to the colour it is not.

---

### 5. THE LEDGER — whose body takes it

> The one where every wound you give it arrives on your own hull four beats
> later, and you can see it coming down the cord.

**Question.** *Whose body takes it.* The whole game so far has one direction of
damage: the field hurts the ship. This inverts the consequence without
inverting the control — you still shoot it, it still dies, and the bill is
posted to you.

**Silhouette.** A tall, narrow, bilaterally split body high in the field,
tethered to the ship by a single thick **violet cord** running from its
underside down into a socket in the hull. The cord is not decoration: it is the
mechanism, it is drawn full length, and it is the only thing in the game that
touches both bodies. **Health is the split:** the seam down its middle widens
with each hit and at five the two halves part company entirely.

**Mechanic.** A landed shot takes its share of the seam and sends the same
damage **back down the cord**, arriving in the socket's column four beats
later, `damageGauge`-sized. The guard window intercepts it: the plate in the
socket column, the trigger on the arrival beat — [warding](couplings.md#1-warding--built),
unchanged, against the pair's own shot.

So the fight has a forced order and it is the brief's own diagram, built out of
shipped parts: **act → consequence → answer the consequence → act again.** The
pair always knows exactly when the return lands, because they fired it.

**And the socket moves.** Each return roots the cord one column further along
the hull, so the column to be warded is different every time and the pair is
re-learning the same sentence with a new number every four beats.

**Player 1 — pilot.** Fires nothing and decides everything: the cannon's column
is where the shot goes, and the trigger is the only thing that saves the hull
from it. He is the one shown the **cord's charge** travelling — a bead of violet
light descending the cord on his screen alone.

**Player 2 — navigator.** Owns the shot and the plate, which means she causes the
return and positions against it, and she is the only one shown **where the
socket has moved to**. His clock, her column: warding with the two halves
swapped from every other wave in the game, which is the coupling read from the
other side.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one shot, one return** ||||||
| 1 | It descends, the cord paying out of its underside and rooting itself into the hull with a visible shock through the ship | — | — | — | — | — |
| 2 | The seam down its middle glows in one colour | P2 | fire that colour | 2 beats, seen | the seam widens; **a bead of light starts down the cord** | nothing |
| 3 | The bead descends the cord, four beats, in plain sight | P2 | call the socket's column | 900 ms, called | he knows where | he is guarding nothing |
| 4 | The bead reaches the hull | P1 | trigger, in the socket's column | `guardWindowMs`, called | the return is warded and the cord whips | a scar in the socket column, and the cord **roots deeper** — next return comes in three beats, not four |
| 5 | The cord's root slides one column along the hull | — | — | — | — | — |
| **P2 — two shots in the air, two returns on the cord** ||||||
| 6 | She fires again before the first return lands | P2 | fire | 2 beats, seen | two beads on the cord, three beats apart | — |
| 7 | Two returns, two columns, two trigger beats | P1 | trigger twice, on the three and on the six | `guardWindowMs` each, called | both warded | one scar, and the cadence tightens again |
| 8 | Arrivals begin — and every creature shot is **also** a return, because the cord bills for everything the cannon does | P2 | choose what to shoot at all | 6 beats, called | the field is answered and the hull survives it | the cord is carrying four beads and the hull cannot be in four columns |
| **P3 — the cord is full** ||||||
| 9 | The seam is wide and the body is visibly two bodies held together by the cord | — | — | — | — | — |
| 10 | Each half now fires on its own, down its own column, and a warded return **is** the answer to them: the whipped cord throws the return back up | P1 | trigger on the return, aimed rather than defensive | `guardWindowMs`, called | the return goes back up the cord and widens the seam with no bill | a scar, and both halves fire |
| 11 | The cord is carrying beads in both directions | P1+P2 | he times the whip, she keeps the plate in the root column | 3 beats, called | — | — |
| **P4 — the bill they choose to pay** ||||||
| 12 | The seam at four of five. The cord is taut enough to be drawn as a straight line for the first time | — | — | — | — | — |
| 13 | She fires the fifth, and the script does not ask for a ward. **Both seats are shown the bead coming and neither is asked to stop it** | — | — | — | — | — |
| 14 | **The return lands.** The hull takes the worst scar of the fight — and the cord, taut, tears out of the ship and takes the boss's entire underside with it, the two halves finally parting, still joined to a length of the pair's own hull plating | — | — | — | — | — |

**THE SLOW.** The bead's **last beat before it lands**, at a third rate: the
cord's strain pattern brightening up its whole length, the socket opening, the
plate's edge visible against it. Deliberately not a DRAG — the four beats down
the cord are the clock this whole fight is timed against, and buying the pair a
fifth would be giving back the debt the boss exists to collect. That is the brief's shrinking-ring prompt done as
anatomy — a clock that is a body part.

**Presentation.** Every beat of this fight is presented by the **hull**, which
is the correct answer to the brief's camera section and the thing this concept
exists to prove. `hull-shock.ts` on the rooting, `craters.ts` and `scars.ts`
where a return lands, `ship-nerves.ts` lit along the cord's line, and
`lost-bleed.ts`'s bleed if the hull gets low. No frame moves; the ship reacts.

**Animation.** The cord: paying out, rooting, sliding its socket, going taut,
whipping, and finally tearing. One drawn object carrying the entire fight is the
cheapest spectacular thing on this page — `tether-sinew.ts` and
`tether-twist.ts` are already the right code.

**Colour.** The cord and its beads are **violet**, because the damage travelling
it is the ship's own, and that single colour choice is the boss's whole
statement. The seam carries the ammunition colour. The socket's target lock is
white.

**Payoff.** Step 14: a deliberate, scripted, unwarded hit that wins the fight. A
pair that has spent the last ten minutes learning that a scar is a failure gets
told, once, to take one.

**Cost. Medium.** The return is a delayed event with a column and a beat — the
queue machinery already does exactly this shape. The cord is drawing. `LedgerState`
is a short list of beads with a beat and a column each, and it is hashed.

**Reusable.** `DelayedConsequence` — a command's effect arriving N beats later
at a named column, which is the single most reusable primitive on this page and
is what makes any *act → reaction → act* choreography possible at all.
`WardableReturn` — the guard window pointed at something the pair caused.

---

### 6. THE CURTAIN — what it is standing in front of

> The one where the boss is not the threat; it is the thing hiding the threat,
> and you shove it aside a column at a time.

**Question.** *What it is standing in front of.* Nothing in this game occludes.
Every creature is drawn where it is and answered where it is drawn. A boss whose
only property is that it is **in the way** asks the pair a question about the
field rather than about itself.

**Silhouette.** A broad membrane stretched across seven columns high in the
field, hung from a rail at the top, semi-opaque, with weighted lobes along its
lower hem — a curtain, drawn as one long slack contour with a bead of mass in
each lobe. Behind it, and only ever as a shadow through the fabric, the **core**:
a small hard body that fires down its own column. **Health is the hem.** A lobe
shot off lightens the curtain and lets it be shoved further per push; a curtain
with no lobes left cannot hold its rail.

**Mechanic.** THE PUSH at boss scale, and the shipped rule is the whole
coupling. A hand held on the membrane and carried a tile sideways moves the
**whole curtain** one column, then it stands still for `gripPushPauseBeats`
before it can be carried again — and **two hands pulling opposite ways cancel
and the body holds** ([assists](assists.md) 6.5, built). So both seats have a
hand on the same object, and the curtain does not move until the two of them
have agreed on a direction out loud. It is the first boss in the game that is
answered by a single shared word: *left.*

Behind it the core fires down whichever column it stands in. Shoving the curtain
does not move the core — it **uncovers** it, and only an uncovered core can be
shot.

**Player 1 — pilot.** Sees the hem's lobes lit for the shot — which lobes are
soft this cycle — and holds the cannon and the trigger. His half of the sentence
is *which side comes away*.

**Player 2 — navigator.** Sees the core's shadow through the fabric, and nothing
of the lobes. Her half is *which way, and how far*. Both push.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one direction, one word** ||||||
| 1 | The curtain unrolls down its rail across seven columns, the hem's lobes swinging to rest one after another | — | — | — | — | — |
| 2 | A shadow moves behind the fabric and stops | P2 | call the side it is on | 900 ms, called | he knows which way to pull | — |
| 3 | Both hands on the membrane | P1+P2 | both grab and carry the same way | 3 beats, called | the curtain steps one column | pulling opposite ways **holds** it, and a held curtain sags a row |
| 4 | The core's shadow is now at the curtain's edge, half-uncovered | P1 | cannon into its column | 1 beat, called | — | — |
| 5 | The core, uncovered, in plain sight on both screens | P2 | fire its colour | 2 beats, seen | the core takes one; the curtain's nearest lobe drops off with it | the core fires down its column |
| **P2 — the core fires, and a hand on the curtain is a hand off the shield** ||||||
| 6 | The core fires a rock down its own column | P1+P2 | ward it — which needs both hands off the membrane | `guardWindowMs`, called | warded | a scar, and the curtain re-rolls one column back |
| 7 | The curtain re-rolls itself a column toward covered every four beats if nobody is holding it | P1+P2 | push against the roll on the beat | 4 beats, called | held ground | it is fully covering again |
| 8 | Two lobes soft at once, on opposite ends | P1 | shoot the one on the side they do not want to push toward | 2 beats, seen | that end is light and pushes at double | he shoots the wrong end and the curtain is heavy the way they need it |
| **P3 — two shadows** ||||||
| 9 | A second shadow behind the fabric, and only one of them is the core | P2 | call which of two, by how it moves — the core drifts, the decoy hangs | 900 ms, called | — | they uncover a decoy and the core fires from cover |
| 10 | The curtain is now three columns of fabric and four of open air | P1+P2 | push, ward, shoot, in that order, every cycle | 6 beats, called | the core takes its third | — |
| 11 | The core begins firing **through** the fabric, which tears a hole where it fires — and a hole is a sight line the pair did not have to earn | — | — | — | — | — |
| **P4 — the sheet** ||||||
| 12 | The hem is bare. The curtain hangs from its rail by two corners | P1+P2 | one last shove, all the way to the wall | 3 beats, called | — | — |
| 13 | **It tears off the rail.** The whole membrane falls across the field as a sheet, drifting down over four beats, the core's light coming through it as it goes | — | — | — | — | — |
| 14 | The core stands naked in the middle of an empty field and fires continuously for four beats with nothing between it and the hull | P1+P2 | her plate, his trigger, then everything the cannon has | 4 beats, called | the core goes | the hull takes four rocks in four beats |

**THE SLOW.** The **shove**, played at a third rate: the membrane stretching
against its rail, the fabric thinning where the hands are, and the
shadow behind sharpening as it thins. That is the brief's "objects stretching
through space", and it costs the simulation one `Milli` field.

**Presentation.** The push is answered in the **fabric**, which is the thing the
brief's "shield impact distortion" was reaching for and this game can actually
draw: `veil-tear.ts`, `veil-strata.ts` and `band-slime.ts` are already the right
code. The tear-off in step 13 is the only four-beat event on this page with no
input in it, and it earns the silence.

**Animation.** The hem swings with a lag behind the push and overshoots on the
stop — one spring, eleven lobes, and it is what makes a seven-column object feel
heavy. The re-roll is the same motion reversed and slower, so a pair losing
ground can see themselves losing it.

**Colour.** The membrane is violet-grey and translucent; the core is the only
ammunition colour in the frame and it is dimmed by the fabric in front of it, so
"is it red or cyan" is genuinely hard while it is covered and trivial once it is
not. That is the colour language doing the occlusion work for free.

**Payoff.** Step 13, and it is the most *movie* frame on the page: a sheet the
width of the field coming down over four beats with a light behind it.

**Cost. Medium.** THE PUSH, the cancel rule and the grip are shipped; what is
new is a push that moves a seven-column object rather than a one-tile body, and
occlusion — `render/` has no z-order concept for "drawn dimmer behind a
membrane" and would need one.

**Reusable.** `SharedPush` — one object, two hands, agreement required, which is
the cancel rule promoted from an assist to a mechanic. `Occluder` — a body that
changes what the other bodies look like, which nothing in this renderer does
yet and several ideas in [ideas](ideas.md) want.

---

### 7. THE DIASTOLE — two clocks at once

> **Built, 16 September 2026**, on `claude/neon-spore-boss-design-26ee5e`: the
> simulation, THE SLOW with it, and then the look. What shipped and the three
> places it argues with the design below are [bosses](bosses.md) §11.17 — read
> that rather than this if you are changing it. The page keeps this section
> because the *question* it asks is the reason the boss exists.

> The one with two hearts on two cadences, one each, and the fight is the beat
> they coincide.

**Question.** *Whether the two of you can hold two different times at once.*
The beat is the pair's shared ground and every mechanic in the game hangs off
it. This is the only way to make the beat hard without bending it — which is
what **The Conductor (30) was deferred for**, and this is the safe version of
that ask.

**Silhouette.** A twin-lobed body one row from the top: two chambers side by
side, one column apart, with a bridge of vessels drawn between them. Each
chamber visibly pulses on its own cadence, so the silhouette is *two rhythms* —
and a rhythm is the one thing a contour can carry without colour. **Health is
two chambers.** A stopped chamber collapses inward and stays collapsed, and the
second one is much harder than the first because there is no longer a second
rhythm to count the first against.

**Mechanic.** The left chamber contracts every **3** beats, the right every
**5**. A chamber is vulnerable only on its own contraction. Each seat is shown
only their own chamber's pulse — player 1 the left, player 2 the right, and
**geometry says whose**, the way THE BALLOON's handles do. On the other screen
the far chamber is drawn as a still grey mass.

The kill takes both at once, which happens every **15 beats**, and the pair has
to count to it from two different numbers neither of them can both see. And the
weapon is already built for exactly this: **the lance beam burns a column and
stands in it for `lanceBeamBeats`** — so a beam standing in the *bridge* column
on the coincidence beat takes both chambers. The fill takes `lancePrimeBeats`
and player 1 must keep the cannon still for all of it, which means the hold
starts a fixed number of beats **before** the coincidence, off a count neither
of them owns alone.

**Player 1 — pilot.** The left chamber's pulse, the bridge column, and a cannon
that must not move. His job is arithmetic and then stillness.

**Player 2 — navigator.** The right chamber's pulse, and the thumb that must go
down at the right beat and not come off. [Couplings](couplings.md) 2 calls this
*a coupling of two silences*, and this boss is the one that asks for it against
two clocks.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one chamber, one cadence** ||||||
| 1 | The body descends and settles; the left chamber starts beating, three beats, and the right is still | — | — | — | — | — |
| 2 | The left contracts | P1 | call the beat, counting in threes | 900 ms, called | she has the count | — |
| 3 | A contraction | P2 | fire the left chamber's colour into its column | 1 beat, called | the left takes one of three | nothing |
| 4 | Three contractions taken. The left chamber slows to **four** beats — the cadence moves once per phase, so the count is re-learned rather than memorised | — | — | — | — | — |
| **P2 — two cadences, and only the bridge takes both** ||||||
| 5 | The right chamber starts, five beats, drawn true only on her screen | P2 | call her cadence | 900 ms, called | both counts are on the table | — |
| 6 | Single-chamber hits no longer land: each contraction now closes the *other* chamber's window | P1+P2 | find the coincidence beat by talking | 15 beats, called | — | they burn a cycle |
| 7 | Coincidence in `lancePrimeBeats` + 1 | P2 | **thumb down** on a colour | 900 ms, called | the cannon lobe starts filling | a lift fires one bolt and the fill is gone |
| 8 | The fill climbs while both chambers beat | P1 | keep the cannon in the bridge column, still | `lancePrimeBeats`, seen | the fill reaches the top on the coincidence beat | a slide drops the fill to nothing |
| 9 | **Both chambers contract on the same beat and the beam stands in the bridge** | — | — | — | the left chamber stops and collapses | the beam burns one chamber's column and takes one |
| **P3 — one heart, no counter-rhythm** ||||||
| 10 | The left chamber is a collapsed hollow. The right beats alone, and with nothing to count against it the pair has only the metronome | — | — | — | — | — |
| 11 | The right chamber's cadence goes to **7**, and it throws a rock on every beat it does *not* contract | P1+P2 | ward on the off-beats, which are the beats they are also counting | `guardWindowMs`, called | warded | a scar, and the cadence shifts by one |
| 12 | The bridge, with one end dead, begins pumping into the field: a slick out of the collapsed chamber every seven beats | P2 | shoot it, which costs the count | 3 beats, seen | clear | it reaches the hull |
| **P4 — the bridge** ||||||
| 13 | The right chamber contracts one last time and the pair takes it, and both chambers are now dead ends | P1+P2 | the fill again, against one clock this time | `lancePrimeBeats`, called | — | — |
| 14 | **The bridge bursts along its whole length.** With nothing pumping at either end it fills, distends vessel by vessel from both ends toward the middle over four beats, and splits open in the middle column | — | — | — | — | — |

**THE SLOW.** The **coincidence beat**, at a third rate, both chambers at full
contraction while the beam stands in the bridge. A DRAG here would be
self-defeating: the two cadences *are* the boss, and 3 against 5 stops meaning
anything the moment a beat is worth a different number of tiles. The two rhythms that have
been fighting each other all fight stop at the same instant, and that stillness
is the payoff of the count.

**Presentation.** The two chambers pulse the **hull's own light** on their own
screens — `hull-light.ts` breathing at three beats on his phone and five on
hers, so each seat *feels* their own cadence through the ship rather than
reading it. That is the single best idea on this page and it costs one existing
render call.

**Animation.** Contraction: the chamber's contour drawn in, the bridge's vessels
swelling as the fluid goes across, the far chamber bulging a beat later. One
pump, drawn twice at two rates, and the whole boss animates itself off two
integers.

**Colour.** The chambers each carry one ammunition colour and they are **not the
same one**, which is what makes the bridge column the only answer: neither
colour takes both, and the beam takes everything of the colour it is in — so the
pair has to work out that the beam in the bridge reaches both bodies because it
burns a column, not a body. Violet vessels.

**Payoff.** Step 14. A vessel bundle filling from both ends and splitting in the
middle is `gland-fluid.ts` and `gland-tube.ts` at a size they have not been
asked for.

**Cost. Low.** Two integers, two visibility masks and the shipped lance. This is
the cheapest *hard* boss on the page: almost nothing is new code and all of the
difficulty is in the pair's heads.

**Reusable.** `CoprimeCadence` — two clocks and the beat they meet, which is
`AlignmentWindow` from THE ORRERY arrived at from the other direction; they
should be one primitive. `PerSeatPulse` — a cadence expressed through the hull's
light rather than through a number.

---

### 8. THE SINEW — how hard, not when

> The one where the answer is a magnitude, and neither of you can see the whole
> gauge.

**Question.** *How hard.* Every sentence this pair has ever said to each other
is a **column** or a **beat**. Not one is a *quantity*. This boss asks for
"more", "less" and "hold it there", which is a vocabulary the game has never
made them build.

**Silhouette.** One thick fibrous tendon from the top of the field, and a heavy
lobed mass hanging off the bottom of it. The tendon is drawn as a bundle of
visible fibres with a **strain band** round its middle that brightens and
narrows the harder it is pulled. **Health is the fibres:** each one parted is
drawn parted, the bundle visibly thins, and the mass hangs a row lower for every
fibre gone — so the boss gets closer as it dies, the Queen's rule, for the
opposite reason.

**Mechanic.** A handle on each side of the tendon, `sinewLeft` and `sinewRight`,
one per seat — THE BALLOON's arrangement (`sim/balloon-pull.ts`) with the
question changed. A balloon asks for **taut and held**; this asks for a **pull
depth**, and the two seats' depths **add**. The strain band shows a target zone
a few tenths of a tile wide, and a fibre parts only while the sum sits inside
it. Over-pull and the fibre does not part — it **snaps back**, the mass swings,
and a rock comes out of it into a column.

Each seat is shown only **their own half of the band**. So neither can read the
sum, and the only way to find the zone is for one to hold still while the other
talks themselves into it: *"I'm at half. Come up a little. Little more. Stop."*

**Player 1 — pilot.** The left handle, and a cannon he is not using. He is shown
the zone's **position** and not the current sum.

**Player 2 — navigator.** The right handle. She is shown the current **sum** and
not where the zone is. So the one who knows where to go cannot see where they
are, and the one who can see where they are does not know where to go — which is
the information split at its cleanest, and the first time it has been applied to
a scalar.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one fibre, a wide zone** ||||||
| 1 | The tendon lowers the mass into frame; the fibres draw taut one at a time with the mass settling between each | — | — | — | — | — |
| 2 | Both handles hang slack, and the strain band is dark | P1+P2 | both take hold | 3 beats, seen | the band lights | — |
| 3 | The band, half on each screen | P1 | call where the zone is | 900 ms, called | she has a target | she is pulling blind |
| 4 | The sum climbs as two thumbs move | P2 | call her number while pulling | continuous, called | the sum enters the zone | it goes past and **snaps back**: the mass swings and throws a rock |
| 5 | Sum in the zone | P1+P2 | both **hold**, `balloonHoldBeats` | 4 beats, seen | one fibre parts; the mass drops a row | a thumb slackens and the hold is given back |
| **P2 — the zone moves, and the field asks for a hand** ||||||
| 6 | The zone slides along the band each cycle | P1 | re-call it | 900 ms, called | — | — |
| 7 | Creatures arrive while both hands are on the tendon | P2 | let go, shoot, take hold again | 6 beats, called | the field is clear and the pull restarts from slack | the pull is kept and the field reaches the hull |
| 8 | The mass, a row lower, is now close enough that its own lobes reach the field's middle rows | P1 | third fibre | 5 beats, called | — | — |
| **P3 — the zone narrows and the tendon fights back** ||||||
| 9 | The zone is a third as wide; the band's brightness is the only feedback | P1+P2 | fine adjustment, spoken | 6 beats, called | fourth fibre | — |
| 10 | The tendon begins **pulling back**: the sum decays toward slack every beat, so a hold is now work rather than stillness | P1+P2 | both pull *into* the decay to keep the sum steady | continuous, called | fifth fibre | the sum falls out of the zone downward, which is new — the failure used to only be too much |
| 11 | A snap-back at this height throws the rock from two rows up, and the ward window is half what it was | P1+P2 | ward | `guardWindowMs`, called | warded | a scar |
| **P4 — the swing** ||||||
| 12 | One fibre left. The mass hangs four rows above the hull and the zone is a sliver at the very top of the band | — | — | — | — | — |
| 13 | The last pull needs more than either seat can reach alone, and the script says so: both handles to their limit, both held | P1+P2 | pull to the stop and hold | 6 beats, called | the last fibre parts | a snap-back at full strain throws three rocks |
| 14 | **The mass comes down — and which column it lands in is the last thing they say to each other.** With the fibre gone it swings on the stub of its own tendon, and the pair keeps pulling to one side as it falls, walking a body the width of three columns away from the middle of their own hull | P1+P2 | keep pulling, one direction, agreed | 4 beats, called | it lands at the wall | it lands on the hull they have been defending for ten minutes |

**THE SLOW, then THE DRAG.** The moment the sum **enters the zone** is a SLOW:
the fibres go half-transparent and part one at a time at a third rate, each
with its own snap, so a success is a small sequence rather than an event. Step
14 is a **DRAG** and has to be — a mass this size takes four real beats to
cross a row, and those four beats are what makes walking it sideways possible
at all. Wall-clock seconds would not do: the pair needs *turns*.

**Presentation.** The strain band **is** the prompt, which is what the brief
asked for in its timing section: the clock is anatomy, it is on the body, and it
is half-drawn on each phone. On a snap-back, `hull-shock.ts` and a full-frame
white flash for one beat.

**Animation.** The tendon: fibres that individually go taut, thin, transparent
and part; the mass swinging with real lag and overshoot; and the whole bundle
shortening visibly as the fight goes on. `tether-sinew.ts` and
`tether-twist.ts` again, and this is the concept they were written for.

**Colour.** No ammunition colour anywhere. The tendon is violet-grey, the strain
band is **white** — neutral, the objective — and the mass is rock grey because
no shot ever touches it. The one boss on this page that the cannon cannot hurt at
all, and its colour says so honestly from the first frame.

**Payoff.** Step 14. Two people talking a three-column mass away from their own
hull, in a game where neither of them can move anything, is the best argument on
this page that the no-travel rule is a feature.

**Cost. Medium.** The handles, the two-seat pull, the hold and the taut
threshold are shipped in `balloon-pull.ts`. What is new is that the pull is a
**sum against a zone** rather than a threshold each, the decay in step 10, and
the swing — and the swing is the expensive one, because a body walked sideways
while falling is motion no `slowStep` branch expresses.

**Reusable.** `PulledMagnitude` — two seats' drag depths summed against a
window, which is the first scalar coupling in the game. `SplitGauge` — a
quantity whose value is on one screen and whose target is on the other.

---

### 9. THE SURGE — whether you can stop

> The one where holding is free and letting go is the entire skill, and you
> both have to let go together.

**Question.** *Whether you can stop.* Every hold in this game is rewarded for
lasting: the grip, the lance's fill, the ready gate, the warden's tether. This
one punishes the last beat of a hold that went one beat too long, which inverts
the most practised gesture in the pair's hands.

**Silhouette.** A bulb high in the field, ribbed, with a **pressure seam** running
right round its equator. It swells while hands are on it and the seam parts
wider the more it is charged, so the silhouette is a single number drawn as a
gap. **Health is the seam:** a successful vent leaves the seam open one notch
permanently, and five notches is a bulb that cannot hold pressure at all.

**Mechanic.** A hand anywhere on the body charges it. **Both seats' charges
add**, and the sum is drawn as the swell. Along the seam are notch marks; a
release with the sum standing at a notch **vents**, and the notch stays. A
release past it **bursts**: a spray of gum across the whole ship — the shipped
splash, the hull takes it, no scar (`sim/gum.ts`). A release short of it does
nothing at all and the charge is lost.

And the two releases must be **within one beat of each other**. That is the
brief's simultaneous action, and it is the only mechanic on this page where the
required input is a *lift* rather than a press.

**Player 1 — pilot.** Shown the **notch marks** and not the pressure. He is the
one who says "now", which is the word [couplings](couplings.md) says can never
work — except that here it is said against the beat: *"let go on the four."*

**Player 2 — navigator.** Shown the **pressure** and not the notches. She reads
the number and he owns the target, which is THE SINEW's split at a different
verb, on purpose: the two should be built together or one of them should not be
built.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one notch, and a bulb that only they can inflate** ||||||
| 1 | The bulb descends, deflated and slack, its seam shut and invisible | — | — | — | — | — |
| 2 | Both hands go on it and it starts to swell | P1+P2 | hold | continuous, seen | the seam appears and parts | — |
| 3 | The swell climbs; the first notch is near | P1 | call the release beat | 900 ms, called | she has a beat | she guesses |
| 4 | Pressure at the notch | P1+P2 | **both lift, within one beat** | 1 beat, called | it vents: a jet of violet out of the seam, and the notch stays | past the notch it **bursts** and the ship is covered |
| 5 | One seat lifts and the other does not | — | — | — | — | the charge holds on one hand and climbs alone toward the burst — the failure is a **partner** problem, not a timing one |
| **P2 — two notches, and a field that needs a hand** ||||||
| 6 | The seam's notches are now two, and only the further one counts | P1 | re-call | 900 ms, called | — | — |
| 7 | A rock falls while both hands are on the bulb | P1+P2 | let go early on purpose, ward, take hold again | `guardWindowMs`, called | warded, charge lost, nobody hurt | held through it: a scar, and the bulb is still charging |
| 8 | The bulb's swell now pushes it **down** the field a row per notch, so it is closer every time | — | — | — | — | — |
| **P3 — it charges itself** ||||||
| 9 | With no hands on it the bulb now **holds** its charge instead of decaying, and the field's arrivals add to it: a creature that reaches the bulb is absorbed and is worth a notch of pressure | P2 | shoot the arrivals before they reach it | 4 beats, called | the pressure is theirs to control | it charges past the notch on its own and bursts |
| 10 | Three notches open. The seam is wide enough to see into, and what is inside is drawn: a second, smaller bulb | — | — | — | — | — |
| 11 | The release window narrows to the beat, and the pressure climbs at double | P1+P2 | lift together | 1 beat, called | fourth notch | a burst, and a notch **closes** |
| **P4 — the eversion** ||||||
| 12 | Four notches. The bulb is a cage of ribs round a visible inner body and can barely hold shape | — | — | — | — | — |
| 13 | The last notch sits at the very top of the gauge, one tick under the burst, and there is no margin at all | P1+P2 | charge to the limit and lift on the same beat | 1 beat, called | — | a burst covers the ship and the bulb re-seals a notch |
| 14 | **It everts.** With the seam fully open and no pressure left to hold it, the bulb turns itself inside out through its own equator over five beats — ribs passing through the seam one at a time — and the inner body it has been growing is left standing in the field, naked, deflated and drawn for the first time | — | — | — | — | — |

**THE SLOW.** The **last beat before a notch**, at a third rate: the seam's rim
stretches, the skin goes translucent, and the notch line creeps toward the
pressure mark. That is the release window made visible as tissue, and it is one
of the two clearest cases on this page for THE SLOW — *"let go on the four"* is
a word that has to cross a voice delay and land on a single beat, and it is
only fair if that beat is three seconds long.

**Presentation.** A burst is presented on the **ship**: `gum-splash.ts` across
the whole hull, `splash-blob.ts` and `splash-trail.ts`, and the frame stays
smeared for several beats — a failure the pair has to keep playing through and
looking at. A vent is a clean jet and one bright beat.

**Animation.** The swell, and the seam. A ribbed body inflating is `throb.ts`
and `throb-pores.ts` with a real number behind it; the eversion in step 14 is
THE THROAT's eversion at a different axis, which is the argument for building
one of them and then the other.

**Colour.** No ammunition colour on the body at all; violet skin, white notch
marks, and the pressure mark is white too. The **inner** body revealed at step
10 carries a colour, and that is the promise the last two phases run on.

**Payoff.** Step 14, and then the inner body is a second, smaller encounter the
pair has been watching grow for ten minutes.

**Cost. Medium.** The two-seat hold and the sum are `balloon-pull.ts`. The lift
as a required input needs `touchUp` to be a **command** rather than the end of
one, which `touch.ts` can already say honestly for a colour thumb
(`world.prime`) and cannot yet for a field hold — that is the real work.

**Reusable.** `ReleaseWindow` — a step passed by lifting, not pressing.
`MutualRelease` — two lifts within N beats, **built**: the lift is a `drag`
with `on: false` (`surge-hand.ts`), and the window is `liftTogetherUntil`
(`beat-clock.ts`), which a later boss calls rather than writes out again
(`packages/sim/test/copies-table.ts`). `ChargeSum` — shared with THE SINEW.

---

### 10. THE BATON — whose turn is it

> The one where acting locks you out of the next beat, so the two of you have
> to become a metronome.

**Question.** *Whose turn is it.* Nothing in this game has ever forbidden a seat
from acting. THE WARDEN takes a *control* away and THE MALFUNCTION swaps the
panels; neither says "not you, not this beat." Strict alternation is a new
constraint and it makes the pair into one instrument.

**Silhouette.** A segmented arm hanging from the top of the field, eleven
segments long, each one a **socket**, with a single bright bead standing in one
of them. The bead is passed hand to hand down the arm's own length. **Health is
the sockets:** a socket the bead has left and not returned to goes dark and
stays dark, and the arm withers from the top down, so the boss's remaining life
is literally the distance the bead still has to travel.

**Mechanic.** The bead is invulnerable while it sits in a socket and vulnerable
only while it is **moving** between two. It moves when acted on — and **the seat
that acts is dead for the next beat**: their panel greys, which is THE WARDEN's
and THE MALFUNCTION's shipped picture doing new work. So the bead can only be
kept moving by strict alternation, one seat a beat, and the alternation is the
whole boss.

The two seats' acts are deliberately **different verbs at the same cadence**:
player 1's is the trigger, player 2's is a shot. Neither can cover for the other
and neither can double up.

**Player 1 — pilot.** The trigger, on the odd beats. His panel greys on the
evens and he spends those beats reading the arm to her.

**Player 2 — navigator.** A shot, on the even beats. Her panel greys on the
odds. Both seats see the whole arm — this is the concept the owner's *"both can
see the same, players might require different actions… one after another"*
describes exactly, and the split is entirely in the hands.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the alternation, taught by the picture** ||||||
| 1 | The arm unfolds downward, socket by socket, one a beat, and the bead lights in the topmost | — | — | — | — | — |
| 2 | The bead sits. Nothing can hurt it | P1 | trigger | 2 beats, seen | the bead leaves its socket and starts across | — |
| 3 | The bead is in flight between two sockets, and player 1's panel is grey | P2 | shoot it | 2 beats, seen | it takes a hit and lands in the next socket down | it lands untouched and the socket **relights** |
| 4 | Her panel greys; his comes back | P1 | trigger | 2 beats, seen | the bead moves again | the bead **settles**, and a settled bead goes back to the top socket |
| 5 | Four handovers in a row, alternating, at two beats each | P1+P2 | alternate | 8 beats, called | four sockets dark | — |
| **P2 — the cadence tightens and the field arrives** ||||||
| 6 | The handover goes to one beat each | P1+P2 | alternate at tempo | continuous, seen | — | one missed beat settles the bead |
| 7 | Creatures arrive, and answering one **is** the act — a shot at a creature is her turn spent | P2 | choose: the bead or the field | 4 beats, called | — | either the bead settles or the field lands |
| 8 | A rock: the ward needs *both* of them, and both of them are locked out on alternate beats | P1+P2 | she stands the plate on her beat, he triggers on his | `guardWindowMs`, called | warded — and it costs them the handover | a scar |
| **P3 — three sockets and a second bead** ||||||
| 9 | A **second bead** lights in the topmost socket, on its own alternation offset by one beat | P1+P2 | keep two beads moving on one alternation | continuous, called | — | either settles and the other is alone |
| 10 | The arm begins **swinging** across three columns, so the flight between sockets crosses a column and the cannon has to follow it | P1 | slide the cannon between his own turns, which are the only beats he can | continuous, seen | — | the shot is in the wrong column |
| 11 | The sockets the beads have darkened begin shedding: a dead segment drops off the arm and falls as a rock | P1+P2 | ward on the shared beat | `guardWindowMs`, called | warded | a scar |
| **P4 — the handover to the ship** ||||||
| 12 | Both beads in the last two sockets, the arm one segment long and hanging by a thread | — | — | — | — | — |
| 13 | The two beads merge into one, twice as bright, and the last flight is **eleven beats long** — the length of the whole arm in one crossing | P1+P2 | eleven alternating acts, no miss | 11 beats, called | the bead crosses | one miss and it goes back to the top of an arm that has grown its sockets back |
| 14 | **The arm hands the bead to the ship.** At the end of its flight the bead drops out of the last socket, falls, and is taken into the cannon lobe — and the shot that leaves is the arm's own, taking it off at every joint at once, eleven segments parting on one beat | P1 | open the maw under it | `intakeWindowMs`, called | — | — |

**THE DRAG**, and emphatically not THE SLOW. Every handover: **the bead's
flight between sockets takes three real beats.** That is what makes a one-beat
alternation legible, turns the whole fight into a visible rhythm, and gives a
called turn somewhere to arrive — without it the boss is a reaction test, which
filter 4 forbids. A SLOW cannot do this job, because the job lasts the whole
fight: slowing the beat for ten minutes is the brief's own refusal, *"do NOT
turn the entire game into permanent slow motion"*. The bead is slow; the clock
is not.

**Presentation.** The **grey panel** is the whole presentation and it is
shipped: `malfunction-look.ts` and `guard-lapse.ts` already draw a dead control.
A pair alternating at tempo watches their own band switch on and off like a
metronome, which is the picture the mechanic wants and costs nothing.

**Animation.** Eleven sockets, one bead, and a swing. The bead's flight arcs
rather than going straight, and it leaves a trail that the next flight crosses —
so the arm accumulates a visible history of its own handovers.

**Colour.** The arm is rock grey and the sockets violet. The bead carries the
ammunition colour and **changes colour on every handover**, alternating, which
is the single cheapest way to tell player 2 which colour her turn needs without
a word — and it means the colour language teaches the alternation for free.

**Payoff.** Step 14: the maw, which is the one thing player 1 finishes alone
([roles](roles.md)), used to end a fight whose whole content was that neither of
them could do anything alone.

**Cost. Low.** A lockout is a beat number per seat in `World`. The grey panel,
the maw, the target lock and the arm's segments are all shipped. This is the
cheapest concept on the page and the one most likely to be worth building first
as a **test of the whole idea** — if alternation is not fun, most of this page is
not either.

**Reusable.** `TurnLock` — a seat forbidden from sending commands for N beats,
which is THE WARDEN's clamp generalised from a control to a seat.
`Alternation` — a step list that requires the acting seat to change, and the
plainest possible `PlayerSpecificAction`.

---

### 11. THE LEAD — where it will be

> The one where you fire at where it is going, and only one of you knows which
> way that is.

**Question.** *Where it will be.* A shot in this game climbs its column tile by
tile (`sim/bullets.ts`) and every boss so far has held still long enough not to
care. This one makes the flight time the whole mechanic, and then splits the two
facts needed to solve it across two phones.

**Silhouette.** A long low body pacing its row — the Queen's motion, one column
a beat, turning at the walls — carrying its one vulnerable organ on a **stalk
that leans ahead of its travel**. The lean is the tell and it is geometry, not
colour: the silhouette itself says which way it is going. **Health is the stalk's
segments:** five, and each one shot off shortens the stalk, so the lean gets
smaller and harder to read exactly as the pair gets better at reading it.

**Mechanic.** The shot takes beats to arrive. The boss steps a column a beat. So
a shot fired at the boss's current column lands behind it, and the pair must fire
at **current column + direction × flight beats**. Neither seat has both terms:

- **Only player 1 sees the lean** — the direction — because the stalk is drawn
  leaning on his screen and drawn upright on hers.
- **Only player 2 sees the column** — the boss is an `aim` kind and the aim
  radar is hers ([roles](roles.md#the-raster-model), `radarOwner`).

So the arithmetic is unavailable to either of them and the sentence is *"column
six, going left, lead it two."*

**And THE LOCK is the tension.** A hand on a body steers every shot into it from
whatever column the cannon is in ([assists](assists.md) 6.6, built) — which
would solve this boss outright. It is refused, because `grippable.ts` refuses a
hand on a boss body and has always refused it, and **that refusal is the reason
this mechanic can exist at all.** It is the first concept in the game whose
design depends on an existing refusal rather than on an existing permission.

**Player 1 — pilot.** The lean, the cannon and the trigger. He is firing at a
column he cannot see the target in.

**Player 2 — navigator.** The column and both colours. She is calling a number
for a body whose direction she cannot see.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — a slow pace and a long lean** ||||||
| 1 | It enters at a wall and begins pacing, the stalk swinging to lean into the travel a beat after it starts | — | — | — | — | — |
| 2 | Pacing at one column a beat; the flight time is two beats | P2 | call the column | 900 ms, called | he has a number | — |
| 3 | The lean is drawn plainly on his screen | P1 | call the direction, and put the cannon two columns ahead | 900 ms, called | the cannon is where the stalk will be | it is where the stalk is, which is two beats wrong |
| 4 | The shot climbs | P2 | fire | 1 beat, called | the shot and the stalk arrive in the same tile; one segment goes | the shot passes behind it, and **it reverses** — the lean flips and the lead is now the other way |
| 5 | The reversal is the punishment and the lesson in one: a miss does not cost the hull, it costs the pair their model of the boss | — | — | — | — | — |
| **P2 — two columns a beat, and the field between them** ||||||
| 6 | The pace doubles to two columns a beat; the lead is four | P1+P2 | the same sentence with a bigger number | 4 beats, called | second segment | — |
| 7 | It begins dropping a torch off its trailing end — always behind it, so the hazard marks where it *has been* while the pair aims where it will be | P1+P2 | ward | `guardWindowMs`, called | warded | a scar |
| 8 | Rocks fall in the columns the pair must fire through, and a rock stops a shot | P1 | pick a firing column with a clear line, which is a third term in the sentence | 3 beats, called | third segment | the shot is eaten by a rock and the lead is wasted |
| **P3 — the lean lies, once** ||||||
| 9 | The stalk begins **leaning into a turn before it turns**, so the lean now predicts a reversal a beat ahead rather than reporting the current travel | P1 | read the lean as a forecast, not a report | 2 beats, called | fourth segment | — |
| 10 | The stalk is short and the lean is subtle, and it is the only information he has | P1 | describe a few degrees of angle out loud | 900 ms, called | — | — |
| 11 | It paces the full width and back in eight beats, and the flight time is now longer than a quarter of its circuit | P1+P2 | fire at a column it will reach from the other side | 6 beats, called | — | — |
| **P4 — the last pass** ||||||
| 12 | One segment. It stops dead in the middle of the field for four beats, the stalk upright, leaning nowhere — the only beats in the fight where it is honest and the only beats it is invulnerable | — | — | — | — | — |
| 13 | **It commits to one final full-width pass at three columns a beat**, and the stalk lays almost flat with the lean | P2 | **hold** a colour | `lancePrimeBeats`, called | the lobe fills | — |
| 14 | Player 1 must stand the cannon in the one column the boss will be in when the fill tops out — nine columns of lead, computed out loud from her number and his angle, and he cannot move the cannon after the hold starts or the fill drops | P1 | pick the column and do not move | `lancePrimeBeats`, called | **the beam stands there and it walks into it**; the stalk goes, the body follows, and the whole pass ends in one column | the beam burns an empty column and it reaches the wall |

**THE SLOW.** The beat a shot shares a row with the stalk, at a third rate,
with the bolt's full trail drawn. This is the page's literal delivery of the
brief's own ask — a projectile suspended in the air — and it must be a SLOW
rather than a DRAG for the reason the whole boss exists: the lead is computed
from the bolt's flight time in **beats**, so a bolt given extra beats is a bolt
the pair has to re-do their arithmetic for. Give them extra *seconds* to watch
the arithmetic they already did resolve.

**Presentation.** `target-lock.ts` on her screen, `dart-path.ts`'s existing
trail work on the bolt, and the reversal in step 4 is presented by the boss
itself — the stalk whipping over through the upright, which is the most
information-dense single frame in the fight.

**Animation.** Pace, lean, whip, and a stalk that shortens. The lean is a spring
with lag: it overshoots on a direction change and settles, so the honest reading
is available for one beat and the misleading one for the beat before it.

**Colour.** The body is rock grey, the stalk violet, the organ at its tip carries
the ammunition colour — one coloured point on a long grey body, which is what
makes the column question fine rather than obvious. Her target lock is white.

**Payoff.** Step 14: the boss walking into a standing beam nine columns from
where the pair started computing. It is the only payoff on this page that is
purely arithmetic, and it is the one a pair would tell somebody about.

**Cost. Low.** Bullet flight time, a pacing row, a direction and a per-seat
visibility mask. Every part is shipped; the only new thing is drawing the stalk
two ways and the drag on a bolt's last row.

**Reusable.** `LeadWindow` — a target column computed from travel and flight
time, which is the first mechanic in the game where the answer is a *different*
column from the one the target is in. `SplitTerms` — two facts, one per seat,
that must be combined arithmetically; THE VESSEL (11.2) wanted this and never
got the machinery.

---

### 12. THE ANTIPHON — describing a thing that has no name

> The one that grows an organ nobody has ever seen, so there is no word for it
> and you have to invent one.

**Question.** *Whether you can describe a thing you have no name for.*
[Couplings](couplings.md) 3 — **announcing** — is the one coupling still
unbuilt, and its status line says why: *"needs creatures and a second device
that do not exist yet."* The second device exists now. This is the boss that
spends the coupling.

**Silhouette.** A body whose surface **grows a new organ every cycle**, and the
organ is never the same twice: a fresh contour each time, drawn from
`tools/shape-sheet/src/drafts/` or blended from two of them, which is the exact
procedure `CLAUDE.md` already requires of a new shape. There is therefore
nothing for the pair to memorise between cycles and nothing the bestiary's
naming rule can help with. **Health is the organs:** a named one shrivels to a
pit in the surface and the surface keeps every pit, so the boss ends the fight
covered in the record of every shape the pair managed to describe.

**Mechanic.** Player 1's screen shows the new organ's **shape** — its contour,
its lobes, its turn — and nothing about its colour or column. Player 2's screen
shows a rail of **three candidate outlines** with a colour on each, one of which
is the organ. She has to find the one he is describing and fire that colour into
its column.

The whole mechanic is one sentence and the sentence does not exist yet. *"Three
lobes, the bottom one long, pinched in the middle."* The game never listens, never
evaluates, and never scores the words — `CLAUDE.md` rule 5, untouched. It simply
arranges for the pair to have to build a vocabulary in real time and gives them
nothing to build it out of.

**Player 1 — pilot.** Sees one shape and holds the cannon: he has to put the
cannon in the organ's column, which he **also** cannot see — so she has to tell
him where while he is telling her what. Two descriptions crossing in opposite
directions is the boss.

**Player 2 — navigator.** Sees three shapes, three colours and three columns.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — one organ, three candidates, generous time** ||||||
| 1 | The body rises, its surface smooth and featureless, and swells in one place | — | — | — | — | — |
| 2 | An organ pushes out of the surface over four beats, contour resolving as it comes | P1 | describe it | 6 beats, called | she has something to match | — |
| 3 | Her rail shows three outlines, one of them his | P2 | ask the one question that separates two of them | 6 beats, called | they converge | they converge on the wrong one |
| 4 | Agreed | P2 | call the column and the colour | 900 ms, called | he knows where | — |
| 5 | Cannon in the column | P1+P2 | he holds it, she fires | 2 beats, called | the organ shrivels into a pit | a wrong candidate **hardens all three**, and the next cycle gives four |
| **P2 — the shapes get closer together** ||||||
| 6 | The three candidates are now variants of one contour rather than three different ones, separated by a single lobe | P1 | describe a difference rather than a shape | 6 beats, called | second pit | — |
| 7 | Creatures arrive in the colours of the candidates she rejected, which means a wrong description is also a wrong field read | P2 | answer the field, then the organ | 6 beats, called | — | — |
| 8 | The organ begins **turning slowly in place**, so his description has to say which way up | P1 | describe an orientation | 4 beats, called | third pit | — |
| **P3 — two organs, and a clock** ||||||
| 9 | Two organs at once, on opposite sides of the body, and the rail shows five candidates for the two of them | P1+P2 | two descriptions in one conversation | 10 beats, called | — | one organ times out and **sinks back into the surface healed** |
| 10 | An organ left undescribed for eight beats fires down its own column | P1+P2 | ward | `guardWindowMs`, called | warded | a scar |
| 11 | The rail's candidates now include **a shape the pair has already killed**, and its pit is still on the body for either of them to look at | P1 | say "that's the one from before" — which is the first time in the fight they have a name | 6 beats, called | fourth pit, cheaply | — |
| **P4 — the one shape they both know** ||||||
| 12 | The surface is a field of pits. It stops growing organs and goes smooth and still for four beats | — | — | — | — | — |
| 13 | **The last organ is their own ship.** It pushes out of the surface drawn by `drawHull` — the same function, the same hull, the same violet — and her rail offers three hulls, two of them subtly wrong | P1 | describe his own ship | 4 beats, called | — | — |
| 14 | On the right one: the body cannot hold a shape it has copied, and every pit on its surface opens at once into the shape that made it, all of them at the same time — the whole fight's vocabulary erupting out of the body that took it | P2 | fire | 2 beats, seen | — | — |

**Neither, and it is the one concept that wants no time effect at all.** While
either seat rests a hand on the organ, it turns slowly in place and stops when
the hand lifts — a rotation, not a rate. It is the one place on this page where
the thing being bought is *a second viewing angle* rather than time: a shape being described can be looked at from more than one
angle, which is what makes describing it possible at all, and it is the one place
on this page where a hand on the boss is an aid rather than an action.

**Presentation.** Nothing dramatic, deliberately. This boss's whole presentation
is **two rails of shapes**, one per phone, drawn with the care
`tools/shape-sheet` applies to a sheet. The spectacle is step 14 and nothing
before it competes with the reading.

**Animation.** Organs pushing out of a surface and sinking back into it —
`body-inset.ts` and `metaball.ts` are the right code, and `metaball-spread.ts`
is how an organ merges with the surface it grew from. The turn under a hand is
`long-axis.ts`.

**Colour.** The body is violet and featureless. Every organ carries an ammunition
colour and **only she can see it**, which is the cleanest statement of the split
on this page: he has the shape and no colour, she has the colour and no shape,
and `CLAUDE.md`'s red/cyan language does the work with no additions.

**Payoff.** Step 13 is the better one, and it is the reason the concept is worth
building: after ten minutes of having no words, the pair is handed the one shape
they have both been staring at all evening — and two near-copies of it.

**Cost. High, and the cost is art rather than code.** The mechanic is a rail, a
match and a colour. What is expensive is that every organ must be a **genuinely
new, genuinely readable contour**, three at a time, distinguishable in speech —
which is `bun run shapes:report` and `bun run shapes` work, repeatedly, and the
one concept on this page that cannot be built without the owner's eye.

**Reusable.** `DescribedTarget` — one seat shown a shape, the other shown
candidates, and no channel between them but the voice. This is the announcing
coupling's machinery and building it once builds the third of the three.

---

### 13. THE UNDERTOW — where you are being hit from

> The one that is underneath your hull, so everything you know about the field
> is upside down.

**Question.** *Where you are being attacked from.* Every threat in this game
comes down the field and is answered upward. This one comes up through the
floor, which means the shield is pointing the wrong way, the cannon is pointing
the wrong way, and the only control that faces the hull is the maw.

**Silhouette.** **Nothing above the hull line**, most of the time, and that is
the design: the field is empty and the boss is drawn only where it breaks
through. What is drawn is the hull's own jagged upper edge **lifting** — a plate
bowing up a few tenths of a tile, violet light coming through the seams under it
— and then the lobe itself when it comes. **Health is inverted and it is the best
inversion on the page:** every hole it punches is also a hole to reach into, and
a hole it withdraws from becomes a permanent scar in the pair's own hull. Its
health and the ship's damage are the same drawing.

**Mechanic.** It pushes a lobe up through the hull at a column. For four beats
the lobe stands in the breach, and a lobe in a breach is the only vulnerable
thing in the fight. Then it withdraws, and the breach is a scar.

A lobe in the hull cannot be shot: the cannon fires up its column and the lobe is
*in* the column's floor. So the answer is **the maw** — player 1's, opened over
the breach's column, which takes the lobe in (`resolveIntake`, unchanged,
`intakeWindowMs`) — and for the hard ones, the **lance**, whose beam burns its
whole column standing and therefore reaches the floor of it.

**Player 1 — pilot.** Sees where the next lobe is pushing: the hull bowing, on
his screen only, because the floor is his half the way the rocks are
(`radar: "p1"`). He owns the maw and the cannon's column, which is everything
this fight needs.

**Player 2 — navigator.** Sees the breach the moment it opens, and holds the
**plate over it** — a shield standing on a breach stops it widening, which is the
first time in the game the shield has been asked to face down. And she holds both
colours for the lance.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the floor, and an empty sky** ||||||
| 1 | The field is empty. The hull's edge begins to bow upward in one column, and the ship's nerves light along the seam | — | — | — | — | — |
| 2 | The bow deepens over four beats; light through the seams | P1 | call the column | 900 ms, called | she has it | — |
| 3 | **The plate parts and a lobe comes through**, standing a tile above the hull line | P1 | open the maw in that column | `intakeWindowMs`, called | the lobe is taken in and the plate closes | it withdraws, and the breach is a permanent scar |
| 4 | A scar, if missed: the hull is visibly shorter in that column for the rest of the run | — | — | — | — | — |
| **P2 — two columns, and a shield that faces down** ||||||
| 5 | Two bows at once, four columns apart | P1 | call both, and pick which the maw takes | 900 ms, called | one is taken | — |
| 6 | The breach he could not reach begins **widening** a tenth of a tile a beat | P2 | stand the plate on it | 4 beats, called | the widening stops while the plate is there | the breach reaches two columns wide and two lobes come through it |
| 7 | A lobe already through, with the plate elsewhere | P1+P2 | he opens the maw, she moves the plate off the breach to let him | `intakeWindowMs`, called | taken | — |
| 8 | The first arrivals of the fight fall from above, into a field with holes in its floor | P1+P2 | ordinary play, over a floor that is not sound | 6 beats, called | — | a creature through a breach is worth two |
| **P3 — it comes up hard** ||||||
| 9 | A lobe comes up **fast** and stands three tiles high, too big for the maw | P2 | **hold** a colour; he keeps the column | `lancePrimeBeats`, called | the beam burns down the column into the breach and takes it | it withdraws and takes a plate of hull with it |
| 10 | The hull is now four columns shorter than it started and the pair can see the shape of their own losses | — | — | — | — | — |
| 11 | It pushes up under the **cannon itself**, and the cannon must be slid off its own column to let the plate close | P1 | slide the cannon, which drops any fill | 2 beats, seen | the plate closes | the cannon is unseated for four beats |
| **P4 — it comes all the way through** ||||||
| 12 | Every seam in the hull lights at once and the whole edge bows along its full width | — | — | — | — | — |
| 13 | **The last lobe comes up through the middle column and does not withdraw.** It stands, growing, and behind it the whole body is coming | P1 | open the maw and **hold it open** | 6 beats, called | — | it comes through anyway and the hull goes |
| 14 | The body follows the lobe up through the hole — the entire boss drawn for the first and only time, passing through a breach narrower than it is, deforming to fit — and the ship takes it in. The fight ends with the boss **inside the ship**, and the hull closes over it | — | — | — | — | — |

**THE SLOW.** The lobe's four beats in the breach are ordinary beats; what is
slowed is the **hull plate bending** — the edge deforming upward at a third
rate, seams opening, light coming through. That is the brief's "objects stretching through
space" applied to the one object in this game the pair actually cares about.

**Presentation.** This concept is the argument of correction 3 made as a whole
boss: **there is no camera and there does not need to be one, because the ship
is the stage.** `hull-break.ts`, `hull-shock.ts`, `hull-frame.ts`,
`ship-nerves.ts`, `craters.ts`, `scars.ts`, `lost-wound.ts` — every existing
piece of hull drawing gets a fight of its own.

**Animation.** A hull plate bowing, parting, closing and scarring, eleven
columns of it, and a body passing through a hole too small for it. The second is
the expensive one and it is worth the expense.

**Colour.** Violet through the seams — the boss is the same colour as the ship,
which is the fiction: it is coming up out of whatever the ship is standing on.
Rock grey lobes, and the ammunition colour only on the hard lobes that need the
lance, so a colour in the frame means *"this one needs the beam"* and nothing
else.

**Payoff.** Step 14. A boss taken **into** the ship rather than destroyed, and
the run continues with the hull closed over it. That is a finish no other boss on
this page or in the game can have.

**Cost. High.** An empty field with all the action at the hull line means
`render/` draws the hull at a fidelity it has never needed, and the sim needs a
breach that is a *place* rather than a scar — a width, a column and a state, all
hashed. The maw and the lance do the rest.

**Reusable.** `Breach` — a hull column that is open, widening, and answerable,
which [ideas](ideas.md) has wanted for THE HIVE (11.14) and never had.
`DownwardGuard` — the shield used against the floor.

---

### 14. THE CANDLE — whether you can act in the dark

> The one where the field is black and the only light in it is your own
> weapons, and neither of you sees the other's.

**Question.** *Whether you can act in the dark.* Every wave in this game is
fully lit and fully drawn. This one takes the picture away and makes light a
resource that costs ammunition, and it is the only concept on the page where
the pair's problem is **seeing** rather than reaching or timing.

**Silhouette.** Undrawn, most of the time. What is drawn is the **after-image**
of whatever the last flash lit, decaying over three beats. **Health is the boss's
own glow:** it is the only steady light source in the field, it dims a step with
every hit, and it dies at full darkness — so the pair spends the whole fight
putting out the only light they have, and the fight gets harder in exact
proportion to how well they are doing. That is the cruellest health-as-silhouette
available and it needs no bar, no petals and no plates.

**Mechanic.** The field is unlit. Three things light it, all of them shipped
controls:

- **A shot's muzzle flash** lights three columns for one beat (`muzzle.ts`).
- **A shield flash** lights the column the plate stands in (`shield-flash.ts`).
- **The lance beam** lights its whole column for `lanceBeamBeats` — the only
  sustained light either of them can buy, and it costs the fill.

**And a flash is only drawn on the screen of the seat whose control made it.**
He triggers and sees his column; she fires and sees hers; and the two of them are
describing two different half-seconds of the same darkness to each other. That is
the information split arriving not as a mask over a known field but as **two
different partial memories of an unknown one.**

**Player 1 — pilot.** The trigger and the cannon. His light is one column at a
time and he gets it by spending a guard window.

**Player 2 — navigator.** Both colours. Her light is three columns and she gets
it by spending a shot, and every shot she spends on light is a shot not spent on
something she cannot see.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the light goes out** ||||||
| 1 | An ordinary lit field, one creature falling. Then the boss arrives and **the field goes black over four beats**, corner light first, and its own glow is the only thing left | — | — | — | — | — |
| 2 | One dim glow high in the field | P2 | fire at it | 2 beats, seen | a hit, and its glow dims a step — and her muzzle flash lights three columns for one beat | — |
| 3 | In that one beat both seats learn the field is not empty | P1 | call what he saw in his three columns | 900 ms, called | — | — |
| 4 | Nothing is drawn but after-images | P1 | trigger to light his column | `guardWindowMs`, seen | one column lit, one guard window spent | — |
| **P2 — the field is full and nobody can see it** ||||||
| 5 | Arrivals in the dark, announced only by the after-images of the flashes that caught them | P1+P2 | alternate flashes deliberately, building a shared map out loud | 8 beats, called | the field is mapped and answered | a creature reaches the hull out of the dark |
| 6 | A rock in the dark, which the cannon cannot answer and the shield must | P1+P2 | ward a column neither of them can see | `guardWindowMs`, called | warded, and the flash lights it | a scar, and the breach's own light shows them the rest of the field for two beats |
| 7 | **A scar is a light source.** A breached hull glows, so damage buys vision, and the pair now has a reason to want a scar | — | — | — | — | — |
| 8 | Its glow dims a third step and the after-images get shorter | — | — | — | — | — |
| **P3 — it puts out their light too** ||||||
| 9 | It begins **eating flashes**: a muzzle flash in the column it faces is swallowed and lights nothing, and the swallowed light re-brightens its own glow | P2 | fire from a column it is not facing, which only he knows | 3 beats, called | light, and a hit | light spent for nothing, and the boss is brighter |
| 10 | The lance: the only sustained light in the game | P2 | **hold** a colour; he keeps the column | `lancePrimeBeats`, called | `lanceBeamBeats` of a fully lit column — the longest look either of them gets | the fill drops and the dark closes |
| 11 | In the beam's light the whole field is visible for the first time in minutes, and it is full | P1+P2 | say everything, fast | `lanceBeamBeats`, called | — | — |
| **P4 — the last glow** ||||||
| 12 | Its glow is a single dim organ, the only thing visible in a black frame, and everything else in the field is inferred | — | — | — | — | — |
| 13 | It stops moving and stops eating flashes. There is nothing left to work out | P2 | fire into it | 4 beats, seen | — | — |
| 14 | **The light goes out.** The frame is fully black for two beats — no after-image, no glow, nothing — and then the wave-end light comes up on a field the pair has never seen, full of everything they answered blind and everything they did not | — | — | — | — | — |

**THE SLOW, over `AfterImage`.** The after-image is not a time effect at all —
**every flash holds its lit frame for three beats as a decaying buffer**, which
is the only reason the mechanic is playable and is `Effects` work. THE SLOW sits
on top of it and does one job: the beat a flash lands is played at a third rate,
so the pair gets three seconds to read a field they are seeing for a fifth of a
beat. Together they are the brief's "particles suspended in air, trails becoming
visible", and the simulation does not know the field is dark.

**Presentation.** `key-light.ts`, `corner-light.ts`, `light-shafts.ts`,
`unseen.ts` and `hover.ts` already exist and this is the boss they were waiting
for. The after-image is an `Effects` buffer, which means it must be cleared in
`Effects.reset()` or `restart.test.ts` will say so.

**Animation.** Almost none, and that is the point: what moves is the light. The
one exception is the boss's glow, which throbs slowly and dims in five visible
steps, so the pair can hear the fight's progress in the only thing they can see.

**Colour.** The one concept where the palette is nearly all absent. Red and cyan
appear **only as muzzle flashes** — so for once the ammunition colours are
literally the pair's light, and which colour was fired is legible from the tint
the after-image decays through. Violet for the ship's own glow, white for the
lance.

**Payoff.** Step 14: two beats of total black, and then the lights up on the
field they fought without seeing. Nothing else in the game can hold an empty
frame and have it mean anything.

**Cost. Medium, and entirely in `render/`.** The simulation is unchanged — this
is the only concept on the page that is purely a rendering boss, and
`packages/render/test/*-budget.test.ts` is where it will be decided, because an
after-image buffer and per-seat light masks are real per-frame cost. Worth a
`bun run perf` before it is committed to, which is the owner's call and not a
lane's.

**Reusable.** `Darkness` — a field-wide light budget, with flashes as the only
sources. `PerSeatLight` — the same world lit differently on two phones, which is
the deepest version of the information split the renderer could express.
`AfterImage` — a decaying frame buffer, which THE GHOST and THE VEIL both want.

---

### 15. THE SCUTTLE — a boss racing you to its own death

> The one that is killing itself, and if it finishes first, you lose.

**Question.** *Whether you can beat a clock that is the boss's own body.*
Every boss in this game is a body the pair empties. This one empties itself, on
a fixed cadence, in plain sight — so for the first time the pair is not
outlasting a boss, they are **racing** it, and the clock is drawn as a
silhouette.

**Silhouette.** A body visibly coming apart on purpose: a segmented mass whose
plates, spines and organs detach one at a time and are thrown down the field as
ordinary arrivals. It begins the fight dense and complete and ends it as a frame
of empty sockets. **Health is what is left of it — and it is spending that health
as a weapon.** There is no distinction between its life and its ammunition,
which is the whole fiction and makes the bar the rule forbids impossible to even
want: the pair can count the parts still attached.

**Mechanic.** It has a fixed number of parts, and it throws one every three
beats, forever, until there are none. **When it throws the last one the wave is
lost** — not to a hit, but to the field: `wave-fail.ts`'s existing loss on a hull
at zero, reached by sheer volume of debris nobody had time to answer.

To kill it the pair must strike a part off **while it is still attached**, and
only one part is live per cycle. So every three beats the pair chooses between
answering what is already falling and reaching for what has not fallen yet, and
the arithmetic is brutal and completely visible.

**Player 1 — pilot.** Sees the parts **still attached** — what is coming, which
is his half — and holds the cannon and the trigger. He is the one who can count
the boss's remaining life, which is the same number as their remaining time.

**Player 2 — navigator.** Sees which attached part is **live** this cycle, and
where the next throw will land. She holds both colours. Neither of them can pick
the target alone: he knows how many are left, she knows which one counts.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **P1 — the cadence, and the count** ||||||
| 1 | It arrives whole, dense and still, and the pair is given four beats to look at it and count | P1 | say the number out loud | 900 ms, called | they have a clock | they play the fight without knowing it has one |
| 2 | It throws its first part: a plate that detaches over three beats, hanging by a thread, then falls as a rock | P1+P2 | ward it | `guardWindowMs`, called | warded | a scar |
| 3 | A part on the body lights as live | P2 | call it | 900 ms, called | he has a column | — |
| 4 | **The three beats of a detachment are the window**: the part is still attached and already loose | P2 | fire the live part while it hangs | 3 beats, called | it is struck off rather than thrown, and the boss loses a part **without** it becoming a threat | it lands in the field as one more thing to answer |
| 5 | Every part struck off is two things won: a part off the clock and a body out of the field | — | — | — | — | — |
| **P2 — two throws a cycle** ||||||
| 6 | Two parts detach at once, and only one is live | P1+P2 | ward one, shoot the other | `guardWindowMs`, called | — | two bodies in the field and the cadence does not wait |
| 7 | The parts it throws are now a **mix** — a rock for the shield, a slick for the cannon, a bulb for the other colour | P1+P2 | ordinary play, at volume, against a clock | 9 beats, called | — | — |
| 8 | A pod among the parts, which is the only thing in the fight that gives time back | P1+P2 | she shoots it loose, he opens the maw | `intakeWindowMs`, called | the cadence slows by a beat for the rest of the fight | it falls through |
| **P3 — it throws faster because it is lighter** ||||||
| 9 | The cadence tightens to two beats as the body thins, and the thinning is why — a lighter body throws faster, which the silhouette says without a word | — | — | — | — | — |
| 10 | The live part is now on the far side of the body from the last one, every cycle, so the cannon crosses the field between them | P1 | slide, hold, slide | 2 beats, seen | — | the shot is one column behind the call |
| 11 | Fewer than a third of the parts left, and the field is fuller than it has been all fight | P1+P2 | choose what not to answer | continuous, called | — | — |
| **P4 — the last part** ||||||
| 12 | One part left, and the boss is a frame of empty sockets holding a single organ | — | — | — | — | — |
| 13 | It does not throw it. It **winds up** — the whole frame drawing back over six beats for a throw the pair can see is the last one, and six beats is exactly `lancePrimeBeats` | P2 | **hold** the colour; he keeps the column | `lancePrimeBeats`, called | the fill tops out on the beat of the throw | the last part is thrown, the field closes over the hull, and the run ends |
| 14 | **The beam stands in the column and the throw never happens.** The last part goes while still in the socket, and with nothing left to hold it together the frame collapses inward through its own outline — every empty socket closing at once — and the only things left falling are the parts it threw minutes ago | — | — | — | — | — |

**THE DRAG.** The **detachment**: three real beats of a part hanging off the
body by a thread, which is simultaneously the window, the warning and the drama.
The whole boss is built around one drag repeated thirty times, and it is the
clearest demonstration on this page that a DRAG is a *mechanic-maker* rather
than a decoration — the three beats are the shot, so they have to be beats the
simulation counts. A SLOW on top of the last one, in step 13, is the only
presentation this fight needs.

**Presentation.** `break-piece.ts`, `shatter-fall.ts`, `debris.ts` and
`splinter.ts` — the destruction work is shipped and this is the boss that spends
all of it. The hull answers nothing special; the spectacle is the field filling
up.

**Animation.** A body that thins. Parts detaching, hanging, tearing free, and
sockets left behind that the light goes through — so late in the fight the boss
is visibly see-through and the backdrop shows between its ribs.

**Colour.** The body is rock grey with violet interiors showing through the
sockets as they empty. Live parts carry the ammunition colour — one coloured
point on a disintegrating grey body, and the colour moves every cycle.

**Payoff.** Step 13 is the real one. A boss that visibly winds up for the throw
that would end the run, for exactly the number of beats the lance takes to fill,
is the tightest piece of authored choreography on this page — and the pair either
started the hold or did not.

**Cost. Medium.** A part list with a live index and a cadence; every part it
throws is an ordinary spawn, which means the sim work is small and mostly
bookkeeping. The thinning body is the render cost and it is the good kind:
`creature-body.ts`'s existing socket work at boss scale.

**Reusable.** `SpentBody` — a boss whose arrivals come out of its own health, so
that its remaining life and the pair's remaining time are one number.
`AttachedWindow` — a target that is vulnerable only while it is coming loose,
which is the single most reusable drag on this page.

---

### 16. THE INSTAR — whether two different hands can finish one beat

> The one with no panel. Its body is marked where it will hurt you, and the
> mark says whose thumb it wants.

**Question.** *Whether two different hands can finish one beat.* Every scene
above splits the eyes or the hands and then asks the pair to talk across the
split. This one takes the panel away altogether — no cannon, no shield, no
colours, no control set — and asks the plainest thing on the page: a body in
front of you is doing something, a mark on it says what to do about it and
which of you is to do it, and the beat is not finished until *both* of you
have done your part **inside the same two beats**. The sentence between them
is one word, *now*, and the whole boss is arranged so that it has to be said.

**Where it came from.** The owner's ask of 17 September 2026, after the
last of the fifteen: a boss with no control set, *only on-screen actions* —
one seat acting while the other watches and can see whose it is, or both at
once in two places succeeding in the same moment, or both on the same spot.
His sequence, in his order: two red circles, one pulled down and one pulled
up together; one seat slapping the alien's hand until it drops its weapon
while the other swipes the eggs off three times downward before they hatch;
the boss morphs and picks up another weapon, the hand slapped again while
the other seat winds the tongue back in on the mark; the boss turns and
shows its tail, one seat pulls it up; *and so on* — a pause with an
animation, then the action shown, then the animation, then the action again.
And, mid-lane: *detailed and nice graphics like the bulb queen or the warden,
and the enemy transforms and moves and changes perspective and appearance
during the animations.* That last sentence is the look lane's brief and is
quoted here so it is not lost between the two lanes.

**Silhouette.** A body over the middle of the field that is never the same
shape twice: it **morphs** between poses and holds each one — jaws open, a
weapon in one hand and eggs on the flank, moulted with a second weapon and
its tongue out, turned away with its tail over the ship, lunging head-first.
Its health is the poses left: there is no bar, and there is no lobe count
either, because the thing the pair takes off it each beat is a *threat* —
the hand opens, the eggs are off, the tongue is in. The marks are the only
control on the screen, every one of them the same red, and **geometry says
whose** (this page's colour rule holds): a mark on the left of the body is
player 1's, on the right player 2's, one in the middle wants both.

**Mechanic — the engine.** This is the boss that built `BossSequenceStep`
(the step machinery, *build first*), and it is nothing but that primitive
run five times. A step is a pose, up to two marks, and three clocks —
`morphBeats` with the marks hidden, `windowBeats` with them up, `landBeats`
of the part giving before the next morph. The script is data in
`packages/content/src/instar-script.ts`, read by index in `sim/instar.ts`,
the cursor hashed (`instar-hash.ts`). A mark is one `Command`: every
gesture is a `drag` on the `instarMark` target with `id` naming the mark,
and the six gestures are read off what a drag already carries — the grab and
the lift from `on`, a pull and a swipe from `fromYMilli`, a turn from
`fromMilli` as a bearing the way THE ORRERY's ring and the crank read one,
a hold from two thumbs and the beat (`instar-hand.ts`, `instar-step.ts`).
Together means together: a step's marks land only when both are done inside
`instarTogetherBeats` (2, one figure for every pose — the owner, 20 September
2026: keep it simple) of each other; a count reached alone and left
waiting **slips** back to nought with a sound, and the pair starts the beat
again inside the same window. A pull or a hold is exempt, because its *done*
is a state the thumb keeps — letting go is what undoes it. The wrong seat on
a mark is refused, once per press, and told so.

**The missed branch is the wave.** A window that closes with a mark undone is
the part doing what the mark was there to stop — the weapon on the hull, the
eggs hatched, the tongue's poison, the tail's blow — and it is one strike at
the mark's column through `breachHull`, which under the owner's rule of 12
September 2026 is the wave lost. The owner's own sequence says *else it
damages the hull* at every step, and hull damage is the wave; so `StepBack`
is **still not built** by this boss, on purpose, and the brief's *failure
should not mean you lose* is answered here by the slip rather than by a
retreat — a beat missed by a hair costs the pair the beat, not the wave.

**Player 1 and Player 2.** Both see the whole body and every mark. The split
is the marks themselves: on the *gape* he pulls the lower jaw down and she
the upper jaw up; on *armed* he slaps the hand and she swipes the eggs; on
*moulted* the sides swap, she slaps and he winds the tongue; on *turned*
she alone pulls the tail and he has nothing to do but watch and say when
she has it; on the *lunge* both thumbs on the one mark for four beats. Two
of the five are one seat's while the other observes, which is the owner's
first case; two are both seats in two places, his second; one is both on the
one spot, his third.

**Payoff.** Step 2. The two counts — six slaps and three swipes — land at
different rates from different hands, and the last of each has to fall inside
two beats of the other or the finished one slips. The pair cannot pace it by
watching, because the other's count is the other's thumb; they have to say
*now*, and the first time a slap slips back to nought for want of the word is
the beat the boss is for.

**Cost. Low for the simulation, high for the look.** The engine is a cursor,
three clocks and six readings of one command, and it landed with nineteen
tests. Everything the owner asked for by name — a body that transforms, moves
and changes perspective between poses — is the look lane's, and it is the
most drawing any boss on this page has asked for.

**Reusable.** `BossSequenceStep` — built, and the next scene of this kind
authors a script and nothing else. `TogetherWindow` — two marks that count
only inside `n` beats of each other, with the slip; the page's
`SimultaneousAction`, made concrete. `SeatMark` — a control that is on both
screens and refuses one of them, which is the first handle in the game that
says *whose* by where it is drawn.

**Where this departs from the owner's sequence, and why.** Three places.
*The circles are not two colours*: he said *two red circles*, and every mark
is red, because this page's rule is that geometry says whose and a colour on
a mark would be the third colour rule the pair has to learn. *The eggs do not
hatch into bees*: nothing this boss does spawns a creature, because it fills
its wave (`bossFillsWave`) and a wave with a scripted body and free bees in
it is two waves; the undone eggs are a strike like every other undone mark.
*The strike is the wave*: argued above. The sequence's *and so on* is five
steps, which is the number the owner named plus the lunge that ends it; a
sixth is one more entry in the script.

**Built.** `claude/tutorial-boss-onscreen-actions-07cc80` — the engine and
the simulation, written up as [bosses](bosses.md) §11.32 (wave `theInstar`,
act 7e, control set `scene`). The look is the second lane and is not started.

---

## Refused by name

The sheet that came with the brief carries twelve cards. Ten of them are things
this game already ships, and saying so by name is the point of filter 8 — *a
fourth boss asks a fourth question*, and
[bosses](bosses.md) says plainly that a second boss on a shipped coupling is a
re-skin. Nothing below is a bad idea; all of it is an idea that has already been
had here, and usually better.

| The card | Already shipped as | Verdict |
|---|---|---|
| **1 TENDRIL LOCK** — both grab a tendril, pull together, keep holding | **THE BALLOON**, exactly: one handle per seat, taut past `balloonTautMilli`, both held together for `balloonHoldBeats`, and a hand that slackens gives it back | refused — this is the shipped creature with a boss's silhouette on it |
| **2 ROTATION RING** — P1 turns the outer ring, P2 the inner, align the core | **THE MAZE's string** (`mazeString`, a bearing drag on a wheel) plus a second wheel | refused as drawn. The *alignment* question is worth having and is rescued as [THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when), where the point is that neither seat can see all three rings — the card's version is two visible dials, which is arithmetic, not a conversation |
| **3 PULL THE HEART** — P1 holds a tendon, P2 shoots the exposed core | **THE WARDEN's tether** and **the Queen's mark**, both built, in that order | refused — it is two shipped mechanics stacked |
| **4 NEON PARASITE ENGINE** — each player sees part of a sequence; communicate | **THE SPLICE** (straws fed in the order the numbers say) and **THE PULSE** (*the same song, and neither of you can read all of it*) | refused — shipped twice |
| **5 THE LIVING TURRET** — shoot the arms, then the exposed core | nothing, and that is the problem | refused on the brief's own rule: *"Do NOT make 15 variations of shoot the weak point"* |
| **6 SLIME COCOON** — P1 sucks the slime away, P2 shoots the weak point | **SALVAGE's pod coupling**: she shoots it loose, he opens the maw | refused, and on a factual error worth correcting — **there is no suction on the field.** The maw is an 800 ms window at the hull (`intakeWindowMs`), not a vacuum that reaches up the screen. Any concept that needs a pull at range needs `InhaleColumn` from [THE THROAT](#1-the-throat--what-you-feed-it) |
| **7 SPINNING CRYSTAL CORE** — opposite rotation, timed release | card 2 with a different body | refused |
| **8 ENERGY BRIDGE** — P1 stands the shield at a node, P2 powers both sides | **warding** ([couplings](couplings.md) 1) for the position-and-trigger half, **THE LANCE** for the beam | refused — and the shield in this game is *passively useless*, so a shield standing somewhere as a conductor contradicts the one rule that makes warding a coupling |
| **9 THE GIANT CRANK** — both turn the crank, stop on the signal | **THE CLAW's `WIND`**, the one control in the game that is turned, `windTilesPerTurn` a turn | refused |
| **10 TUG OF WAR** — both pull a core, together or apart, into a zone | **THE PUSH**, including the cancel rule when two hands pull opposite ways | refused as drawn; the *magnitude* half is the one new thing in it and it is [THE SINEW](#8-the-sinew--how-hard-not-when) |
| **11 THE LOCKER** — P1 turns a mechanism, P2 locks it at the right moment | the turn is THE MAZE's string; **the lock is not anything** | **partly promoted.** A timed *tap* that freezes a continuous *drag* somebody else is making is a verb this game does not have, and it is the only genuinely new input on the sheet. It is not a boss on its own — it is a primitive, and it is `FreezeTap` in the library below |
| **12 THE CHAIN REACTION** — activate nodes in order, each player sees different ones | **THE SPLICE**, again | refused |

**On the sheet's pictures, which are the good part.** The density, the bloom and
the layered ring work are a fair reference for what a boss frame should feel
like, and `docs/style-guide.md` would not disagree with most of it. Three things
on it may not come across: the **HP bar** on every card (correction 2), the
**instruction text** under every card — which the brief's own cinematic rule
forbids, and which the game answers with `target-lock.ts`, `choir-arrows.ts`,
`grip-arrows.ts` and the radar instead — and **both players' hulls in one
frame**, which is the game the brief was imagining rather than this one.

**And one refusal that is the brief's, not the sheet's.** The brief asks for
"camera / presentation: explain how the screen should visually emphasize the
moment," and repeatedly for zoom, framing and camera moves. `decisions.md` #14
settled that the window is not the stage, and two portrait phones have no second
pane to cut to. Every `Presentation` line above therefore answers the question
with the **hull** — shake, shock, light, scar, bleed — which is what this game has
instead of a camera, and it is better for this brief than a camera would be,
because the ship is the thing the pair has feelings about.

## A second brief, and the four things in it this page did not have

*17 September 2026.* A second brief arrived from the same source, after
fourteen of the fifteen had shipped: twenty bosses, a fourteen-gesture
vocabulary, a worked eight-step encounter, and a reusable-interaction library
to be named at the end. It is longer than the first and it wants the same
thing, so most of it reads as confirmation — **the interaction surface is the
boss itself, no cannon, no shield, no ability buttons**, which is [THE
INSTAR](#16-the-instar--whether-two-different-hands-can-finish-one-beat), built
the day before it arrived and arrived at from the owner's own words rather than
from a sheet.

Four things in it are not on this page. They are listed first, argued below,
and only one of them is a boss.

1. **The world should say what to do, in one word.** The brief's own section is
   headed *the world should teach the player* and then asks for text only where
   necessary; the owner asked for the text directly the same day, and
   `docs/decisions.md` #34 is the ruling. It is the largest thing in the second
   brief and it is not a boss at all — it is a rule every boss on this page now
   obeys.
2. **A scene is a layer above a step.** §16's script is a flat list of steps.
   The brief writes `SCENE 1 — DORMANT`, eight steps, then `SCENE 2 — BOSS
   TRANSFORMATION`, and the scene break is where the body, the arena and the
   music all change at once. `BossSequenceStep` can express it today — a step
   whose marks are empty and whose `landBeats` are long is a transformation —
   and what is missing is the *name*, so a script can say which steps belong
   to which movement and a look can spend everything it has on the boundary.
3. **Four gestures the union does not have**, in the library below: `TRACE`,
   `SEQUENCE TAP`, `FOLLOW` and `REPEATED TAP`. The other ten of the brief's
   fourteen are `drag`, `grip`, `crank`, `instarMark` or `prime` under another
   name.
4. **Failure that costs a step and not the wave** — `StepBack`, already the
   loudest unbuilt row in the library, restated by the brief as *"do not
   automatically kill the player; describe how the scene recovers."* §16
   answers a softer version of it with the slip, and the hard version is still
   not built.

### The cue, as built

*17 September 2026, the same day.* The rule of item 1 is now a picture, and it
is deliberately a **reading** rather than machinery: `render/src/boss-cue.ts`
is a pure function from the `World` the simulation already keeps to at most one
cue, so nothing was added to `packages/sim`, to `hashWorld` or to the wire. The
readings are `boss-cue-read.ts` and the lettered pages beside it —
`boss-cue-read-b.ts` through `boss-cue-read-j.ts`, a page taken by one boss
alone once its reading outgrows a share of one — the hand is
`boss-cue-draw.ts` — THE CHOIR's target lock in `PALETTE.rock` with the verb
under it and the kind of action over it — and `frame-field.ts` draws it over
the boss, on every seat that can act.

**One at a time, and only when something is owed.** The readings return their
cues most urgent first and the screen shows the first one this seat may see.
THE GORGE is the proof that the second half of that sentence matters: it is
silent for the whole feeding movement, because the fight is *stop shooting* and
a word over a sack that wants to be left alone would be the boss asking for its
own dinner.

| Boss | The pilot is told | The navigator is told |
|---|---|---|
| THE CANDLE | `MOVE` (carry) when he is sitting in the column the flame is eating | `FIRE` (press) on the glow |
| THE GORGE | nothing — he fires nothing here | `PIERCE` (press) on an intake come full; `BURN` (hold) on the mouth |
| THE CURTAIN | `SHOVE` (carry) — the carry is either seat's; `LIFT` (carry) on the hem instead, his alone, once a hit has jammed the rail | `SHOVE`, and `FIRE` (press) on the core once it is bare — which a held hem makes it |
| THE TASTER | nothing | `SHEAR` (press) while the fan stands; `BURN` (hold) once it closes |
| THE UNDERTOW | `OPEN` (hold) on a standing lobe, `MOVE` (carry) off a seat that has come up under him | `BURN` (hold) on a tall lobe, `MOVE` (carry) off a shield keeping the maw out |
| THE BATON | `LAUNCH` (press) on the bead that is sitting | `FIRE` (press) on the bead in the air |

The other six followed the same day (`boss-cue-read-c.ts`), and **half of what
that file does is keep quiet**: these are the fights whose difficulty is a
number the pair says out loud, so the cue names the moment a *verb changes* and
never the number.

| Boss | The pilot is told | The navigator is told |
|---|---|---|
| THE THROAT | `FLING` (carry) on a gum still on the field — the one verb in the game that exists nowhere else | nothing |
| THE LEDGER | `SHIELD` (press) on the return coming down the cord, which is his half of the picture | `MOVE` (carry) onto the socket, and only while the plate is not already there |
| THE LEAD | nothing | `BURN` (hold) on the last pass, when the trigger has quietly stopped working |
| THE SCUTTLE | `MOVE` (carry) on a hanging part one column off the cannon, and on the cannon itself on the wind-up | `FIRE` (press) on the live part, and `BURN` (hold) on the wind-up |
| THE DIASTOLE | nothing | `BURN` (hold) from the beat a single-chamber hit stops landing |
| THE ORRERY | nothing | `BURN` (hold) once every ring is off |

**Three silences are load-bearing and each has a test of its own.** THE ORRERY
says nothing while its rings turn — a word on the beat the shaft opens would
*be* the boss. THE DIASTOLE says nothing about either count. THE LEDGER says
nothing about the last return, which is the one bill the pair must not answer
and the payoff the whole fight trains them for. `decisions.md` #34's own
*reconsider if* is what those cases hold shut.

**And THE SCUTTLE draws no frame**, because her screen already locks the column
the next throw lands in: the cue borrows that box and adds the word. That is
what `BossCue.framed` is for, and it is the right default for any boss whose
own picture already marks the place.

**And the three handle bosses came in, a day later.** THE SINEW, THE SURGE and
THE ANTIPHON were left alone at first, because `handle-draw.ts` already wrote
`PULL`, `HOLD` and `TURN` beside each handle while it was unheld and those
words are the verb and the kind at once. That was the right call for one lane
and the wrong shape to leave in the game: the pair met two prompt systems in
one fight, with different type, different breathing and different rules about
when a word appears. Since 18 September 2026 the handle's word is a `BossCue`
with `framed: false` — the ring is a mark already — and all fifteen speak in one
voice.

Two things had to be settled to do it.

- **The word is built where it is drawn, not read off `World`.** A handle's
  place is the drawing's own: a snap-back's whip, a bulb's swell, a body
  sinking. A reading that worked one out a second time would stand the word
  where the ring is not, so the hand was split off (`boss-cue-text.ts`) and the
  three files call it with a cue of their own making. `boss-cue.ts` is still the
  only reading, and still pure.
- **A kind line that repeats its verb is not drawn.** `HOLD` over `HOLD` and
  `TURN` over `TURN` were the objection that kept these three out, and this
  answers it in the hand rather than by keeping a second system for three
  bosses. THE SINEW gains a real one: `CARRY` over `PULL`, and over `SWAY` once
  the mass is falling.

| Boss | The pilot is told | The navigator is told |
|---|---|---|
| THE SINEW | `PULL` (carry) on his own handle while the tendon holds, `SWAY` once the mass falls | the same, on hers |
| THE SURGE | `HOLD` on his grip mark | `HOLD` on hers |
| THE ANTIPHON | `TURN` on every standing organ — one instruction, since a thumb on either turns both | nothing: the organ is not on her screen |

What that cost, and it is the point: each seat is told about **its own** mark
only. The dim word under the partner's handle is gone, because a cue is owed to
whoever can act on it — and what the pair actually needs to see of each other
there is the *thumb*, which the ring says by filling.

**And the briefings gave the words back.** The other half of #34 — *what is
explained during the boss game wave must be skipped in the tutorial briefing* —
found five rehearsal pages with nothing in them but a verb: THE CANDLE's
`PLAYER 1 SLIDES CLEAR OF IT`, THE CURTAIN's `PLAYER 1 SHOVES IT ONE OVER`, THE
UNDERTOW's `PLAYER 2 MOVES THE PLATE OFF`, THE BATON's `PLAYER 1 PULLS THE
TRIGGER` and THE LEDGER's `GUARD AS IT LANDS`. THE LEDGER's came out whole;
the other four kept their tick and their seat and were rewritten, because a
page's seat is which screen the film shows and a hand is drawn only for that
seat's acts — deleting a pilot's page between two of the navigator's does not
hand his trigger to the fight, it deletes it from the film. Each site carries a
comment saying which cue took the verb, so a later session does not put it back.
THE GORGE, THE TASTER, THE THROAT and THE DIASTOLE had nothing to take — every
page of those four carries a colour, a count or a split, which is exactly what a
cue may not say; THE LEAD's, THE SCUTTLE's and THE ORRERY's films (17 and 18
September 2026) have no page that is the cue's verb alone.
The table and the reasoning: `docs/spec/briefings.md`, *A page the fight now
speaks for loses its verb*.

### The brief's own worked encounter, read against this engine

THE HOLLOW WARDEN is the sheet's eight-step example and the clearest statement
of what the brief wants a boss to feel like. Read step by step, five of its
eight are shipped mechanics and three are the page's own unbuilt primitives —
which is the useful result, because it means the *shape* transfers and the
content does not.

| Its step | Here | Verdict |
|---|---|---|
| 1 — an eye opens and asks to be touched | a mark coming up after `morphBeats` (§16) | shipped |
| 2 — drag the eye down; the skin stretches | `pullDown` on a mark, and the part resisting | shipped |
| 3 — a tendon behind it, grabbed | `grip` on a body, `instarMark` on a boss | shipped |
| 4 — pull, and the whole body follows | THE SINEW's depth, THE BALLOON's handles | shipped |
| 5 — P2 taps the organ the pull exposed | a step whose second mark exists only after the first landed | shipped, and it is what §16's cursor is for |
| 6 — P2 rotates it until three symbols line up | `turn`, a bearing read like the crank's | shipped |
| 7 — both hold two anchors while it pulls away | THE BALLOON, and §16's `hold` | shipped |
| 8 — **both release together, and the chest explodes** | `MutualRelease` — THE SURGE's lift, a `drag` with `on: false`, judged by `liftTogetherUntil` (`surge-hand.ts`) | shipped |
| the scene break: a second creature emerges, the arena darkens | a named scene above the step list, item 2 above | **not built** |
| the shrinking ring under every prompt | the ready gate's circles, `queen-drop.ts`'s bar | shipped, reusable as-is |

**What the reading is worth.** The brief's central diagram — *event → realise →
touch → time slows → gesture → boss reacts → next event* — is
`BossSequenceStep` plus THE SLOW plus the cue, and all three of those exist as
of 17 September 2026. A scene in that shape can now be **authored** rather than
built: a script in `packages/content` and a look, with no new machinery between
them. That is the single most useful sentence in this whole page.

### The twenty categories, and where each already is

The brief asks that twenty concepts collectively cover twenty categories. Ten
of them are on this page under another name, six are shipped elsewhere in the
game, and **two are genuinely absent**. Nothing here is a bad category; most of
them are a body swap on a question already asked, which is filter 8.

| The brief's category | Here | |
|---|---|---|
| tendril / pulling | THE SINEW (8), THE BALLOON | shipped |
| rotation | THE ORRERY (2), THE MAZE's string, THE CLAW's crank | shipped |
| timing | THE DIASTOLE (7), THE SURGE (9) | shipped |
| multi-touch | THE BALLOON, §16's `hold` | shipped |
| sequence | THE SPLICE, THE PULSE, THE BATON (10) | shipped |
| chasing / follow | THE LEAD (11) | shipped |
| drag-and-place | THE THROAT (1) — a body carried into a mouth | shipped |
| push-away | THE PUSH, THE CURTAIN (6) | shipped |
| repeated-tap | nothing. §16 counts taps; nothing tracks a target that moves between them | **absent** |
| trace-path | nothing at all — there is no gesture for following a line | **absent** |
| timed-release | THE SURGE (9) — `MutualRelease`, `liftTogetherUntil` in `beat-clock.ts` | shipped |
| transformation | THE INSTAR (16) | shipped |
| split | THE SCUTTLE (15) — it comes apart into its own arrivals | shipped |
| multi-stage environmental | THE UNDERTOW (13) — it takes the hull | shipped |
| parasite | THE CLING, THE MOULT | shipped, as creatures |
| giant organic machine | THE ORRERY (2), THE ANTIPHON (12) | shipped |
| living crystal | THE CRYSTAL, and the colour-armour rule it is made of | shipped |
| swarm | THE HIVE (`bosses.md` §11.14) | shipped |
| changes the arena | THE CANDLE (14) takes the light; THE UNDERTOW (13) takes the floor | shipped |
| final multi-mechanic cinematic | the five signature candidates below | named, unwritten |

### §17 THE FILAMENT — whether you can follow a line that is still being drawn

*The one absent category worth a boss.* Trace is the only gesture on the
brief's list with no ancestor anywhere in this game, and the reason to want it
is not the gesture — it is that **a line has two ends and a phone has one
thumb**.

**Question.** *Whether you can follow a line the other of you is still
drawing.* Every trace mechanic elsewhere is one finger on a fixed glowing path,
which is a dexterity test and not a conversation. Here the path is not fixed:
one seat's thumb **lays** it, a tile a beat, and the other's has to follow it
without catching up and without falling behind, on a phone where the near end
is off the bottom of the picture.

**Silhouette.** A body at the top of the field made of loose filaments, the way
a nerve is a bundle. Its health is the filaments: each one traced end to end is
a filament pulled out and gone, and the body narrows visibly as they go. No
bar, seven filaments, and the last one is the width of the whole body.

**Mechanic.** A step arms one filament. **The pilot draws**: an ordinary `drag`
along the filament, which lights the tiles it has passed and no others, at most
one tile a beat — carrying faster than that snaps it. **The navigator
follows**: her own thumb has to stay within `filamentGapTiles` of his, on the
lit part, and the gap is the only number either of them can see — she has the
distance behind her, he has the distance ahead. Neither has both. A gap that
closes to nothing is the two thumbs colliding and the filament recoils; a gap
that opens past the window is the filament going dark and the step starting
again, which is the slip §16 already has.

**The cue**, per `docs/decisions.md` #34: `DRAW` over the lit end on his
screen, `FOLLOW` over the last lit tile on hers, and the kind line naming the
carry. Neither cue says how far apart they are, because that is the sentence.

**What this needs that does not exist.** `TraceDrag` — a drag whose progress is
a *path* rather than a depth or a bearing, stored as the tiles it has passed,
hashed. It is the fourth gesture primitive and it is the only one of the four
that is a boss rather than a convenience.

**Cost.** Medium for the simulation — a path in `World` is the largest new
hashed field any boss on this page has asked for — and medium for the look,
because a filament is a contour the shape sheet already draws and the lighting
is `corner-light.ts`'s job done along a line.

**Not built.** Nothing of it. Written 17 September 2026 from the second brief's
trace category; nobody has started it.

## Five more, asked for by name

The owner, 20 September 2026: five more of exactly this kind — heavy on
choreography, more than ten states apiece that ask the pair for an action on
every one of them, no complicated logic, a new pose or a changed situation on
every state, mostly gestures on the boss's own body rather than the panel,
though the cannon, the shield and the maw may still answer a state here and
there. Each below is written to that brief and passes filter 8 against the
seventeen above and against each other. **Nothing of any of the five is
built** — `docs/queue.md` carries the simulation lane of each as its own
entry, which any session may take, and the picture as its own `LOCAL ONLY`
entry carrying a `Needs:` line back to it, on the `.claude/skills/new-boss`
split of lane one from lane two. So the words and the states can be taken
today, and the picture is passed over by `next` until they land.

### §18 THE GIMBAL — whether the same turn means the same thing to both of you

**Question.** Whether "clockwise," called across a phone connection, means the
same motion to the hand that is turning it. Every split boss so far divides
what the two of you can *see*; this one keeps the sight nearly shared and
divides the *geometry* — the same wheel, gripped from its two opposite faces,
where a turn that reads clockwise on one screen is drawn counter-clockwise on
the other because that is honestly which way it is going, seen from there.

**Silhouette.** A sealed drum hangs from the top of the field inside two
nested rings set at right angles, the way a real gimbal holds its load — an
outer ring facing the pilot, an inner ring facing the navigator, a hatch shut
across the drum's own seam. **Health is six latch-teeth**, three to a ring: a
pair shears off, one from each ring, only when both rings are brought to true
alignment and held there together. Two rings stripped of all three teeth spin
loose, and the hatch swings open — no bar, six teeth.

**Mechanic.** Each seat grips their own ring and reports a bearing rather than
a distance — the crank's own gesture (`sim/crank.ts`, `orrery-hand.ts`),
turned loose on the field as `gimbalOuter` (pilot) and `gimbalInner`
(navigator). Because the rings are the same object read from opposite faces,
the sim keeps one true bearing and draws each seat's ring turned the
direction their own face would actually show it — `PerSeatTruth`, the Queen's
own primitive, spent on a bearing instead of a body. A tooth shears only when
both bearings sit on their matching mark at once, called out loud rather than
read off a shared number, since neither seat's screen carries the other's
mark.

**Player 1 — pilot.** Sees the outer ring and his own mark, in his own
clockwise. Never sees the inner ring, its mark, or which way turning it looks
from the other face.

**Player 2 — navigator.** Sees the inner ring and her own mark, in her own
clockwise — which is the pilot's counter-clockwise, and the sim never says so
on either screen. Never sees his ring.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the first tooth** ||||||
| 1 | The drum drops into frame between the two dark, still rings | — | — | — | — | — |
| 2 | The outer ring lights a mark, on the pilot's screen alone | P1 | turn the outer ring to the mark (`TURN`) | 4 beats, seen | the ring holds and glows | it drifts back to rest |
| 3 | The inner ring lights its own mark, on the navigator's screen alone | P2 | turn the inner ring to her mark (`TURN`) | 4 beats, seen | both rings sit true together | same drift |
| 4 | Both rings glowing at once | P1+P2 | call the alignment and hold both turns through the beat | 3 beats, called | the first tooth pair shears, both rings ring once | either ring slips and nothing shears |
| **Movement 2 — the second tooth, and the marks start moving** ||||||
| 5 | One tooth gone; the rim shows the gap | — | — | — | — | — |
| 6 | The pilot's mark now creeps a position every beat rather than sitting still | P1 | turn to keep the mark under his thumb | 3 beats, seen | — | he falls a position behind and has to catch up |
| 7 | The navigator's mark answers his and creeps the *other* way on her own face, so keeping true alignment means chasing a mark that looks like it is running from her turn | P2 | turn to keep pace | 3 beats, seen | — | same |
| 8 | Both marks held together | P1+P2 | call and hold | 3 beats, called | second tooth pair shears | the ring that slipped resets to its last mark, and the movement runs again from its start |
| 9 | With two teeth gone the drum swings loose in its cradle and a spark leaks from the seam — the fight's one ordinary hazard | P1 or P2 | fire the leaking seam, their own colour | 2 beats, seen | the spark goes out, the rings steady | the spark reaches the hull, an ordinary hull hit |
| **Movement 3 — the last tooth, a half turn each** ||||||
| 10 | The last marks sit a half-turn from rest on each ring, so a nudge will not reach them | — | — | — | — | — |
| 11 | The pilot brings the outer ring a full half-turn to its mark | P1 | turn the outer ring, all the way | 4 beats, seen | — | a half-turn short is still short |
| 12 | The navigator's own half-turn, read the other way off her face, lands as a quarter-turn on the true wheel — the two halves are not equal turns, and that is the whole of this beat | P2 | turn the inner ring, all the way | 4 beats, seen | — | — |
| 13 | Both rings held at the last alignment | P1+P2 | call and hold | 3 beats, called | the last tooth pair shears, both rings spin free | either ring short, and the movement runs again |
| 14 | **The hatch.** Both rings spinning loose, the drum splits along its seam and swings open toward the ship — the first boss on this page that ends in a door rather than a body coming apart | — | — | — | — | — |

**THE SLOW** opens on every "held together" beat (rows 4, 8, 13) — the
called window a tooth shears in is the one moment either seat can watch the
other's ring catch up without losing the thread of their own. No `DRAG`: a
bearing turn is not a fall rate, and nothing here needs more beats, only more
seconds inside the ones it has.

**Presentation.** No camera. The hull answers each shearing tooth with one
shudder through `hull-shock.ts`, and the leaking spark of row 9 is the one
frame that dims — same treatment as a choked ring on THE THROAT.

**Animation.** Six poses: dark and still; one ring turning alone; both rings
glowing at true alignment; the shearing spark and the ring's rim one tooth
shorter; both rings spinning loose with nothing left to grip; the drum split
open. The rim itself is the health — each gap is drawn, never counted.

**Colour.** Both rings rock grey, since neither is ever shot; the drum's core
violet, the leaking seam alone in red or cyan, marks white throughout.
**Geometry, not colour, says which ring is whose** — the outer ring is always
his, the inner always hers, the same rule THE BALLOON's two handles use.

**Payoff.** Row 14. A closed thing coming open toward the ship, rather than a
body dying, is a picture nothing else on this page has.

**Cost. Low–medium.** `BearingDrag` and `PerSeatTruth` are both shipped;
what's new is deriving one ring's drawn direction from the other's true
bearing, and the final hatch as its own render job.

**Reusable.** `MirroredBearing` — a bearing read true on one screen and
reversed on the other, `PerSeatTruth`'s own primitive spent on a turn instead
of a body.

**Not built.** Nothing of it. Written 20 September 2026; queued as two items,
one per lane.

### §19 THE BELLOWS — whether you can push when she is pulling

> **Taken out of the game on 24 September 2026.** The owner could not say
> what a push meant, what the goal was, or why a spark came out that the
> shield could not answer; the design below is kept as it was argued, and the
> verdict is [bosses](bosses.md) §11.35's.

**Question.** THE SINEW and THE SURGE both want two hands doing the same
thing at the same moment. This one wants the opposite: one hand pulling while
the other pushes, never together, and it punishes the pair the instant they
fall into unison — a boss built entirely around **taking turns**, rather than
answering together.

**Silhouette.** A double-chambered bellows-lung slung across the top of the
field, two ribbed housings joined at a leather waist. **Health is the waist's
four seams**: each splits when the two chambers are worked correctly out of
phase, narrowing the waist, and the fourth splits it clean in two.

**Mechanic.** The pilot grips a handle that pulls his chamber open
(`bellowsPull`, a drag); the navigator grips a plate that pushes hers shut
(`bellowsPush`, a drag). The two may never act in the same beat —
`Alternation`, THE BATON's own primitive, spent here to refuse whoever
*didn't* just act rather than whoever did, so acting together jams both
handles for a beat and splits nothing. A seam parts only on a clean
pull-then-push, in order, once a movement.

**Player 1 — pilot.** Sees his chamber's fill and a cue naming whose beat it
is. Never sees her chamber.

**Player 2 — navigator.** Sees her chamber and the same cue, mirrored. Never
sees his.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — one exchange a beat** ||||||
| 1 | Both chambers still, waist tight, four seams unbroken | — | — | — | — | — |
| 2 | His chamber marked to pull | P1 | pull the handle (`PULL`) | 3 beats, seen | chamber opens | nothing, clock runs on |
| 3 | Her chamber marked to push, right after | P2 | push the plate (`PUSH`) | 3 beats, seen | first seam splits | if she pushes inside his own beat, both handles jam for a beat and the exchange is spent for nothing |
| 4 | Waist one seam narrower, ribs creak | — | — | — | — | — |
| **Movement 2 — half a beat each** ||||||
| 5 | His mark again, tempo tighter | P1 | pull | 2 beats, seen | — | — |
| 6 | Her mark immediately after, no gap between | P2 | push | 2 beats, seen | second seam splits | acting a beat early into his jams both |
| 7 | A third exchange at the same tempo | P1 then P2 | pull, then push | 2 beats each, seen | — | — |
| 8 | The chamber leaks a spark from the new split — the fight's one ordinary hazard | P1 or P2 | fire the spark, their own colour | 2 beats, seen | quenched | ordinary hull hit |
| **Movement 3 — the exchange inside one window** ||||||
| 9 | Waist down to its last two seams; both marks light inside one shared window rather than two | P1 then P2 | pull, then push, both inside one window | 900 ms, called | third seam splits | pushing first, or either landing outside the window, jams both and the movement runs again |
| 10 | The bellows tries to force a breath of its own straight down the pilot's column | P1 | shield | 2 beats, seen | warded | ordinary hull hit |
| 11 | Last seam. Both handles glow together for the first time in the fight | — | — | — | — | — |
| **Finale — the one beat they act together** ||||||
| 12 | The cue reads the same word on both screens at once | P1+P2 | let go of the handle together (`LET GO`) | 3 beats, called | the fourth seam parts, the waist splits in two | either handle held a beat longer than the other, and the last seam holds |
| 13 | The two halves fall away from each other, venting the whole held breath as one harmless cloud across the field | — | — | — | — | — |

**THE SLOW** opens on the finale (row 12) alone — the one beat this fight
asks the pair to act *together*, after eleven beats of being told not to,
earns the same dramatic weight the other bosses give their hardest moment.
No `DRAG`.

**Presentation.** No camera. Each seam splitting is a shudder down the ribs
through `hull-shock.ts`; the finale is the one frame that gets its own held
beat of quiet before the vent.

**Animation.** Five poses: both chambers shut and still; his open, hers shut
(pull); his shut, hers open (push); both swollen full at the last seam; both
falling apart, venting. The waist's seam count is the health, drawn as a
narrowing gap rather than a number.

**Colour.** Both housings rock grey; the leaking spark alone in red or cyan;
the waist's stitching violet. Geometry says whose handle is whose — his hangs
off the left chamber, hers off the right, THE CHOIR's rule again.

**Payoff.** Row 12 — the one boss on the page whose climax is the pair doing,
once, the thing the whole fight has been training them not to.

**Cost. Low.** `Alternation` and `SimultaneousAction` are both shipped
(THE BATON, THE BALLOON); the two drag targets are ordinary depth-drags like
`sinewLeft`/`sinewRight`. Nothing new is asked of the engine.

**Reusable.** Nothing new — the finding worth keeping is that `Alternation`
reads just as well refusing a repeat of the *other* seat as it does refusing
a repeat of the *same* one.

**Not built.** Nothing of it. Written 20 September 2026; queued as two items,
one per lane.

### §20 THE HASP — whether a grip nobody can see is the one holding the door

**Question.** Whether the pair can build trust out of one hand holding
something that does nothing visible, for exactly as long as it is needed and
no longer — and a second hand, turning something the first hand cannot see
either, that only moves because the first is holding on.

**Silhouette.** Three sealed hasps down the field's centre line, each a
lobed clasp over a wheel-hub. **Health is the three hasps**: each opens once,
in its own movement, and the third opening ends the fight.

**Mechanic.** The pilot grips a latch (`haspLatch`, a hold) that shows him
nothing at all beyond his own hand's rising heat — a slow colour drift on the
mark itself, never a number, never a bar. Held past `haspHoldBeats` it burns
him off it for a beat, so his whole job is *hold, then let go before it
burns, then grip again*. The navigator's wheel (`haspWheel`, a bearing drag)
will only turn while, somewhere she cannot see, the latch is currently held —
an ordinary per-tick read of both hands, nothing new in the engine. Her whole
job is turning a wheel that mysteriously seizes and frees for reasons her
screen never shows.

**Player 1 — pilot.** Sees the latch and his own rising heat. Never sees the
wheel, whether it is turning, or that a wheel exists at all.

**Player 2 — navigator.** Sees the wheel and whether it is currently free to
turn. Never sees the latch, the heat, or that a hand is the reason.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the first hasp** ||||||
| 1 | Three sealed hasps in a row, wheels dark | — | — | — | — | — |
| 2 | The first latch lights, on the pilot's screen alone | P1 | grip the latch (`HOLD`) | held | the first wheel goes free, on the navigator's screen alone | nothing happens on either screen |
| 3 | The wheel free to turn, and only for as long as row 2 holds | P2 | turn the wheel to its mark (`TURN`) | 4 beats, seen | first hasp opens | the latch burns off before she finishes, and the wheel seizes mid-turn |
| 4 | His latch nearing its own heat, unseen by her | P1 | let go and grip again before it burns | called, on his own clock alone | the latch resets cool, the wheel stays free | the burn costs a beat and the wheel seizes |
| **Movement 2 — the second hasp, and a call across the gap** ||||||
| 5 | Second hasp; the wheel needs more turn than one grip's heat allows | P1 | grip, then regrip once mid-turn (`HOLD`) | two holds, called between them | wheel stays free the whole way | a gap between grips seizes it |
| 6 | Wheel turning the whole time he is gripped | P2 | turn, resuming exactly where it seized if it seized | 5 beats, seen | second hasp opens | — |
| 7 | The hasp's spring throws a loose bolt down its own column — the fight's one ordinary hazard | P1 or P2 | fire the bolt, their own colour | 2 beats, seen | quenched | ordinary hull hit |
| **Movement 3 — the last hasp, faster** ||||||
| 8 | Third hasp; the heat window shortens | P1 | grip (`HOLD`) | held, shorter fuse | wheel free | — |
| 9 | She has to call when she needs him regripped, since only she sees the wheel seize | P2 | call `GRIP` the instant it seizes | 900 ms, called | he regrips in time, wheel resumes | a late call burns the whole movement back to its own start |
| 10 | Turning the last stretch | P2 | turn to the final mark | 4 beats, seen | third hasp opens | — |
| 11 | **All three open.** The row of hasps swings clear together, the wheel-hubs spinning down, and the passage behind them is lit for the first time | — | — | — | — | — |

**THE SLOW** opens on every regrip call (rows 4, 5, 9) — the one moment
either seat has to act on what the other cannot show them, across the voice
delay, is exactly what a called window under `THE SLOW` is for. No `DRAG`.

**Presentation.** No camera. A seized wheel is a whole-frame dim for one
beat, the way a choked ring on THE THROAT is; an opened hasp gets one
shudder through `hull-shock.ts`.

**Animation.** Five poses: all sealed; one latch glowing under a held hand;
its wheel spinning free; a wheel seized dark mid-turn; the row swung open.
The latch's own colour drift (cool to warm) is the only readout either seat
ever gets, and it belongs to the hand alone.

**Colour.** Hasps and wheels rock grey; the loose bolt alone in red or cyan;
the latch's heat drift is the one departure from the colour statement — a
warm-to-hot glow that says nothing about ammunition, because it is a hand's
own feeling and not a target.

**Payoff.** Row 11 — three things opening together because two hands that
never saw each other's half kept faith with it anyway.

**Cost. Low.** Both marks are ordinary holds and drags; the gating rule (one
target's motion permitted only while another is held) is a single per-tick
read the sim already performs for every hand on the field. Nothing new in the
engine.

**Reusable.** Nothing named — the finding is that a gate between two hands
needs no primitive of its own, only a rule in the boss's own step function
that reads both.

**Lane one landed, 22 September 2026**, as wave 101 THE HASP and
[bosses](bosses.md) §11.37 — and the finding above held: the gate cost the
engine two `DragTarget` names and one line in this boss's own step. **Lane
two's first half landed 23 September 2026**: the door is drawn — the row, the
latch's heat drift on the pilot's screen alone, the wheel and its creep on the
navigator's alone, the dim on a seize and the row swinging clear
(`render/hasp-draw.ts`, §11.37 *The look*). **Not built:** the hands — the hit
test, the cue word and the director rows.
Five departures are argued by name in §11.37: nothing in the fight carries a
window, a late call gives nothing back, THE SLOW opens on one regrip call
rather than three, row 7's bolt takes either colour, and the wheel is wound by
travel rather than turned to a mark.

### §21 THE SPOOL — whether letting it run is the point

**Question.** Every other boss on this page is answered by doing something as
fast, as hard or as precisely as the fight allows. This one is answered by
holding back exactly enough — never more, never less — the only boss in the
game where doing less is the correct amount of effort.

**Silhouette.** A thread-spool creature slung sideways across the top of the
field, its line already run out to the hull and taut. **Health is four
wooden ribs** on the spool's own casing, and each releases clean — eases
open, rather than cracking — when the line has been paid out at the right
rate across its whole movement; the fourth release leaves the spool slack and
it drifts off, unspooled.

**Mechanic.** The pilot holds a brake at a felt depth (`spoolBrake`, a hold
read by depth): shallow pays the line out faster, deep slower, and he is
shown nothing but the mark's own grip — no number, ever. The navigator reads
a zone — how much line *should* be out by now — against the paid-out length
crawling along its own track (`SplitGauge`, THE SINEW's and THE SURGE's own
primitive: she has the target, he has the feel, neither has the other's
half). Held inside the zone across a whole movement, a rib eases; held too
shallow or too deep, the movement's window closes on the fourth rib
uncracked and the fight costs an ordinary hull hit rather than resetting.

**Player 1 — pilot.** Feels the brake's depth and nothing else — no gauge, no
zone, no number.

**Player 2 — navigator.** Sees the zone and the actual paid-out length. Never
feels the brake, and can only call `EASE` or `HOLD` from what the line is
doing.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — a wide zone** ||||||
| 1 | The spool hangs still, line taut, four ribs unbroken | — | — | — | — | — |
| 2 | The zone opens, wide, on the navigator's screen alone | P2 | call the depth she wants (`EASE` or `HOLD`) | 900 ms, called | — | — |
| 3 | The pilot answers with a felt depth | P1 | hold the brake at that depth | held, across the movement | line pays out inside the zone the whole movement; first rib eases | outside the zone at any point in the movement resets its clock |
| **Movement 2 — the zone narrows** ||||||
| 4 | Rib eased; the zone redraws narrower | — | — | — | — | — |
| 5 | She calls a correction mid-movement, since the zone has moved | P2 | call `EASE` (shallower) or `HOLD` (deeper) | 900 ms, called | — | — |
| 6 | He answers by shifting his felt depth without letting go | P1 | ease or deepen the same held brake | held, across the movement | second rib eases | a shift that overshoots the new zone resets the movement |
| 7 | The slack thrown by a bad correction flings a rock down the pilot's column — the fight's one ordinary hazard | P2 | shield | 2 beats, seen | warded | ordinary hull hit |
| **Movement 3 — a narrow zone, two corrections** ||||||
| 8 | Zone narrower again; it will take two corrections this movement rather than one | P2 | call the first correction | 900 ms, called | — | — |
| 9 | He answers | P1 | shift depth | held | — | — |
| 10 | She calls the second correction | P2 | call again | 900 ms, called | — | — |
| 11 | He answers again, all the way to the movement's end | P1 | hold through to the close | held, across the movement | third rib eases | either correction missed resets the whole movement |
| **Movement 4 — the last rib, narrowest of all** ||||||
| 12 | The last zone, barely wider than the brake's own resting play | P2 | call the depth, precisely | 900 ms, called | — | — |
| 13 | He holds it there for the whole of the last movement, correcting on her word alone | P1 | hold, correcting on call | held, across the movement | fourth rib eases | reset, and the movement runs again |
| 14 | **The spool goes slack.** All tension gone, it drifts free of the hull and off the top of the field, the line trailing loose behind it | — | — | — | — | — |

**THE SLOW** opens on every call-and-answer pair (rows 2–3, 5–6, 8–11,
12–13) — the fight is entirely about a felt thing crossing a voice delay, and
every one of those exchanges is a called window. No `DRAG`: nothing here
needs more beats, only more seconds inside the ones it already has.

**Presentation.** No camera. The hull answers a correction landed with a
settling shudder through `hull-shock.ts`; a rib easing gets its own soft
release, drawn rather than scored.

**Animation.** Five poses: taut and still; the brake shallow, line paying
fast; the brake deep, line paying slow; a rib easing open; slack and
drifting free. Nothing on the picture ever shows a number — only how fast the
line is visibly moving.

**Colour.** The spool's casing rock grey; the line itself violet, since it is
the ship's own; the one hazard rock in red or cyan as ever. No colour ever
marks the zone or the depth — that is the sentence the pair has to say.

**Payoff.** Row 14 — the only boss on the page whose finish is calm rather
than a break, because the whole fight has been training the pair toward
exactly this stillness.

**Cost. Low.** `SplitGauge` is shipped twice already (THE SINEW, THE SURGE);
`spoolBrake` is an ordinary depth-hold. Nothing new is asked of the engine.

**Reusable.** Nothing new — the finding worth keeping is that `SplitGauge`
reads as well for restraint (stay inside a zone) as it does for effort (reach
past a threshold).

**Not built.** Nothing of it. Written 20 September 2026; queued as two items,
one per lane.

### §22 THE RATCHET — whether a step can be taken back

**Question.** Every miss on every other boss on this page costs a beat or a
hull hit and the fight goes on exactly as it was. This is the first where one
specific action, once taken, is permanent for the rest of the fight — there
is no beat after it that undoes it — so a step here is a decision the pair
says out loud rather than a reflex either of them can walk back.

**Silhouette.** A toothed climbing rack down the field's centre, in full
view of both seats at once — this boss splits the **hands**, not the eyes,
the way PINBALL's table does. **Health is seven teeth**, and the rack needs
five clean advances to open the last catch at its top; the two it can afford
to lose are the whole of its margin, and it never grows more.

**Mechanic.** The navigator primes a spring-catch (`ratchetCatch`, a hold);
the pilot's own mark (`ratchetPawl`, a press, the way THE MAW TAP presses)
only advances the rack **while she is holding it**, `SequentialAction` doing
the same job it does for §16 — a step that may not be entered before the one
before it lands. A press with the catch unprimed still spends a tooth: the
rack always advances on his press, catch or no catch, but an unprimed
advance is a tooth burned for nothing rather than a clean one — the rack
never runs backward, so the two wasted teeth are the only mistakes the fight
can carry.

**Player 1 — pilot.** Sees the whole rack, the same as she does, and presses
when he believes she is holding — but never sees her hold directly, only her
own screen's cue confirming it.

**Player 2 — navigator.** Sees the whole rack too. Holds the catch and calls
`SET` across the voice delay before he presses, since he cannot see her hand
either.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| 1 | The rack hangs still, seven teeth showing, the catch unset | — | — | — | — | — |
| 2 | She primes the catch | P2 | hold the catch (`SET`) | held | catch primed | — |
| 3 | She calls it across the gap | P2 | call `SET` the instant she is holding | 900 ms, called | he presses in time | a press before the call spends a tooth for nothing |
| 4 | He presses while she holds | P1 | press the pawl | 900 ms, called | first tooth advances clean | pressing with no catch primed still advances the rack, one tooth burned |
| 5 | Rack one tooth up; catch releases, must be reset | — | — | — | — | — |
| 6 | She resets and holds again, faster this time | P2 | hold and call `SET` | held, 700 ms called | — | — |
| 7 | He presses on her call | P1 | press | 700 ms, called | second tooth advances clean | early press burns a tooth |
| 8 | The spring, half-wound, flings a loose bolt down a column — the fight's one ordinary hazard | P1 or P2 | fire the bolt, their own colour | 2 beats, seen | quenched | ordinary hull hit |
| 9 | Third climb, catch held longer this time to cover a longer press window | P2 | hold through the whole window | held | — | — |
| 10 | He presses, anywhere inside her longer hold | P1 | press | 3 beats, seen | third tooth advances clean | pressing outside her hold burns a tooth |
| 11 | Fourth climb, tempo tightest yet | P2 | hold and call `SET` | held, 600 ms called | — | — |
| 12 | He presses on the call alone, no margin left to spend | P1 | press | 600 ms, called | fourth tooth advances clean | any burned tooth here and the rack cannot reach five with two teeth left |
| 13 | **The fifth climb.** Whatever margin is left, she holds and calls one last time | P2 | hold and call `SET` | held, 600 ms called | — | — |
| 14 | He presses | P1 | press | 600 ms, called | fifth tooth advances clean, the catch at the top gives | with fewer than five clean advances banked, the top catch does not give and the rack sits at its ceiling, unopened |
| 15 | **The rack tops out.** Its catch springs wide, the whole strut folds down and away from the ship, teeth still showing the two it never got to spend | — | — | — | — | — |

**THE SLOW** opens on every catch-and-press pair — the whole fight is one
recurring called window, and every one of them is exactly where a third-rate
window buys the 900 ms `guardWindowMs` needs to cross the delay honestly. No
`DRAG`: nothing climbs at a fraction of its rate, it climbs once, cleanly, or
it does not.

**Presentation.** No camera. Every clean advance is one shudder through
`hull-shock.ts`, and a burned tooth is a flat, unlit non-event — the fight's
one silence, on purpose, because nothing should reward a mistake with a
picture.

**Animation.** Four poses, fewer than any other boss here on purpose, since
the picture is the rack's own remaining teeth rather than a body changing
shape: unset and still; the catch glowing under a held hand; a tooth
advancing with a visible click and jolt; the strut folded down at the top.

**Colour.** The rack rock grey throughout, since nothing on it is ever shot;
the one hazard bolt in red or cyan; the catch's glow white, the same colour
every target lock in the game uses, because it is a lock and not ammunition.

**Payoff.** Row 15 — the only finish on the page that shows, honestly, how
much margin the pair had left over. Two unspent teeth is a clean run; none
left is the same win, told differently.

**Cost. Low.** `SequentialAction` is shipped (§16); a press that always
advances and never reverses is a single line in the boss's own step function.
Nothing new is asked of the engine.

**Reusable.** Nothing named — the finding worth keeping is that a mistake
does not have to cost a beat or a hull hit to matter: costing a fixed and
never-replenished margin is a third kind of consequence this page had not
tried yet.

**Lane one landed, 23 September 2026**, as wave 102 THE RATCHET and
[bosses](bosses.md) §11.38 — and the cost held: two `DragTarget` names and a
rack that only ever goes one way, with nothing new in the engine. **The
picture and the hands landed the same day** (§11.38, *The look* and *The
hands*). **Not built:** the guide is prose. Nine departures are argued by name in §11.38: the burn is a dull thud rather than a silence, the windows are counted in beats rather than 900/700/600 ms, a window nobody answers burns a tooth, the catch is spent by a clean tooth and has to be lifted, the rack jams on the burn that makes five unreachable rather than playing out its dead teeth, the bolt takes either colour, there is no longer hold on rows 9–10, `SequentialAction` is not used because the press is judged rather than refused, and THE SLOW spans each window.

**Not built.** Nothing of it. Written 20 September 2026; queued as two items,
one per lane.

---

### The reusable interaction library the brief asks for

It asks for twenty-two named systems. Eighteen of them are the library below
under this game's names, and listing them twice would be two tables to keep in
step — so the four rows the library did not have are **added to it** rather
than restated here: `TraceDrag`, `SequenceTap`, `FollowTarget` and
`RepeatedTap` are in the Gesture table, and `SceneBreak` is in the step
machinery. `SlowMotionInteraction` is THE SLOW and shipped;
`CinematicFocus` is the hull's reaction and not the frame's, which is
correction 4 above; `BossSequence`, `BossSequenceStep` and `SequentialAction`
are built.

---

## Five more, both screens reading the same picture

DavidDe, 26 September 2026: more of exactly what THE INSTAR is — easy to
follow, no complex mechanics, no tutorial needed before the wave, in-game
gestures on the body rather than the panel, the standard controls allowed back
in for a specific sequence such as firing, and *both players see the same at
the same time*. That last clause is new against the two briefs above it, both
of which reached for a split in **what each seat is shown** as the first move
of nearly every concept (`PerSeatTruth`, `DescribedTarget`, `SplitGauge`). It
does not relax filter 8's *every boss splits something* — CLAUDE.md's own rule
— it says which half of a boss carries the split from here on: **the eyes stay
together, the hands do not.** Both screens draw the identical picture, at the
identical moment; what tells the two thumbs apart is geometry (whose half of
the body a mark sits on, the way THE INSTAR's own marks already do) or which
verb a step asks for (one seat holds while the other pulls). Neither screen is
ever the only one carrying a fact the other needs — there is nothing to
describe across the call, because there is nothing hidden.

**The filter these five pass**, on top of filter 8 (`## The filter these
fifteen had to pass`): a shipped boss already asking the same question is a
re-skin regardless of how it looks, so each entry below says in one line why
it is not THE INSTAR, THE GIMBAL, THE HASP, THE SPOOL, THE RATCHET or any of
the fifteen wearing a new coat. Every gesture is a member of `DragTarget` or
`Hold["kind"]`, or it is a `build first` line in the library below, named as
such. Ten steps each, minimum, each asking for an action; THE SLOW opens on
every step whose window is genuinely a decision rather than a courtesy. **No
`Files:` line below names a file the tree does not yet have** — the queue
entries at the foot of `docs/queue.md` are where each one's actual paths live,
written the ordinary way, at the moment a lane claims one.

**Nothing else here is built.** `docs/queue.md` carries the simulation lane of
each as its own entry, claimable the ordinary way (`bun run queue next`), and
the look as a second entry with a `Needs:` line back to it, same split as the
brief above (`.claude/skills/new-boss` lane one, then lane two). §23 THE
MANTLE's simulation lane landed the same sitting this section was written in —
[bosses](bosses.md) §11.40, wave 102 — and its look is queued, not yet
claimed. §24 THE KEEL's landed the same day, as §11.41, wave 103, and §25 THE
VALVE's as §11.42, wave 104, §26 THE SEAM's as §11.43, wave 105, and §27
THE OCULUS's as §11.44, wave 106; all five looks are queued too.

### §23 THE MANTLE — whether a shared number still needs two hands

**Question.** THE SINEW and THE SURGE both split one gauge across two
screens — his zone, her sum, neither the other's (`SplitGauge`). This asks the
opposite: put the *same* number on both screens, the true combined pull, and
see whether two hands are still worth having when neither is hiding anything
from the other. They are, because the body only answers a pull both thumbs are
making **at once** — a sum reached by one seat holding while the other has let
go does nothing.

**Silhouette.** A hinged carapace shell, closed over a soft core, hanging at
mid-field — the shape a beetle's wing case makes closed. **Health is four
plate-pairs (eight plates)**, always shed as a pair, one off the left valve
and one off the right, the instant the pair beneath them is pried. A shell
with no plates left splits down its seam.

**Mechanic.** The shell has two named handles, `mantleLeft` and `mantleRight`,
each an ordinary depth drag (`instarMark`'s own kind, pointed at a different
target). **Geometry, not a seat number, says whose handle is whose**: the left
valve is always pulled from the left edge of the screen and the right valve
from the right, on both phones, so a player picks up whichever handle is on
their side without being told which one that is. The sim keeps the two depths
and a `mantlePairMilli` sum; a pair shears the instant the sum crosses that
movement's threshold **while both depths are simultaneously above a floor** —
one thumb parked at maximum while the other is at zero never sums to a shear,
which is the one rule that makes it a two-hand mechanic and not an
arm-wrestle. This is `PulledMagnitude`/`ChargeSum` from the library, spent for
the first time, and shown identically on both screens rather than split.

**Player 1 and Player 2.** Identical screens: the shell, both handles, the sum
gauge (a single bar, not two), the plate count. Player 1's thumb only moves
the left handle and Player 2's only the right — the drag target checks which
half of the shell a touch fell on and refuses the wrong one, the same silent
refusal THE INSTAR's marks already use.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — learning the shell** ||||||
| 1 | The shell drops into frame, closed, both handles dark | — | — | — | — | — |
| 2 | Both handles light at once | P1+P2 | pull both handles down together (`PULL`) | 5 beats, seen | sum crosses the first threshold — first plate-pair shears | either handle drifts back if let go before the sum is reached |
| 3 | The gap under the sheared plates leaks light | — | — | — | — | — |
| **Movement 2 — a hand that stops costs both of you** ||||||
| 4 | Both handles light again, the gauge's threshold a notch higher | P1+P2 | pull together, harder | 5 beats, seen | second plate-pair shears | same |
| 5 | A spark leaks from the open gap — the ordinary hazard | P1 or P2 | fire it out, own colour | 2 beats, seen | spark goes out | spark reaches the hull, an ordinary hit |
| 6 | Third handles-light beat, threshold higher again | P1+P2 | pull together | 4 beats, seen | third plate-pair shears | same |
| **Movement 3 — the last pair, and the core underneath it** ||||||
| 7 | The last pair sits stiffer than the rest — the sim asks for the same threshold in a shorter window | P1+P2 | pull together, faster | 3 beats, seen | last plate-pair shears, shell splits down the seam | same, window resets |
| 8 | The bare core beats inside the open shell, twice a beat | — | — | — | — | — |
| 9 | The core's beat lights the left half of a ring around it | P1 | tap on the beat (`TAP`) | 1 beat, seen | left arc dims | a miss costs nothing — the core keeps beating |
| 10 | The core's beat lights the right half, a beat later | P2 | tap on the beat (`TAP`) | 1 beat, seen | right arc dims | same |
| 11 | Both arcs dim, alternating, three more rounds — a call to make sure the pair is trading rather than both mashing | P1+P2 | alternate taps, never both on the same beat | 6 beats total, seen | core goes dark, fight ends | a same-beat double tap does not cost the wave — it costs one round, replayed |

**THE SLOW** opens on every "pull together" window (rows 2, 4, 6, 7) — the
sum is drawn ticking up in real time, and the third-rate window is what lets a
pair actually watch the bar cross the line together rather than guessing.
Rows 9–10 run at tempo: a heartbeat is the one moment on this page the owner's
rule about a called window does not apply, because the whole point of the
finish is that it is fast.

**Presentation.** No camera. Each shearing pair is one hull-shock pulse; the
open gap's spark is the dim treatment THE THROAT's choked ring already uses.

**Animation.** Five poses: shut; one pair short; two pairs short; split open
with the core showing; the core dark. The valves themselves visibly bow
outward under a growing pull rather than sliding — the deformation reads off
`mantlePairMilli` directly, never off the plate count.

**Colour.** The shell is carapace grey throughout; the core is the one warm
colour on the body, red or cyan chosen once per run, and it says nothing about
which seat fires — nobody fires at it. Geometry alone says which handle is
whose, the rule THE GIMBAL's rings and THE BALLOON's two grips already use.

**Payoff.** Row 11's alternating heartbeat, coming right after nine beats of
both thumbs pulling in lockstep — the one place on this page the pair has to
stop acting together to finish the fight.

**Cost. Low.** Both handles are `instarMark`'s own drag kind pointed at two
targets instead of one; the only new state is `mantlePairMilli`, one hashed
field, and the floor-check that makes the sum a two-hand rule.

**Reusable.** The floor-checked sum — `PulledMagnitude`/`ChargeSum` finally
spent — and the alternating single-tap finish, a `RepeatedTap` cousin worth
naming if a later boss wants a heartbeat of its own.

### §24 THE KEEL — whose thumb the spine calls on next

**Question.** Every shipped boss with more than one gesture assigns a step to
a seat once, in the script. This assigns it **live**, by where a moving mark
lands: the same joint, pressed by whichever thumb is nearer it at the moment
it lights, on a spine both screens draw identically. It is not THE BATON's
`Alternation` — nothing here refuses a repeat — and it is not THE INSTAR's
geometry, which is fixed per mark; here one mark walks the whole body and the
seat it wants changes with it.

**Silhouette.** An exoskeletal spine, six segments, arched along the top of
the field like a stripped ribcage. **Health is the six segments**; a joint
answered on time locks its segment rigid and lights it, a joint missed leaves
its segment loose, and a spine with every segment loose thrashes and opens a
breach instead of dying cleanly.

**Mechanic.** One drag target, `keelJoint`, always a plain tap
(`instarMark`'s tap kind). It appears at the leftmost unlocked segment first
and at the rightmost the beat after, alternating ends rather than working
straight down the spine — so the seat it is nearest keeps changing without
`Alternation`'s refusal ever entering the sim. Whichever screen-half the joint
currently sits over is the seat it will accept; the boss cue's scan ring and
`PRESS` word appear on that seat alone, the ordinary rule.

**Player 1 and Player 2.** Identical screens: the whole spine, six segments,
the one joint mark wherever it currently sits. Neither seat is told in
advance which end the mark will visit next — reading the spine is the whole
of the difficulty.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the two ends** ||||||
| 1 | The spine arches into frame, all six segments loose and dim | — | — | — | — | — |
| 2 | The leftmost joint lights | whoever is nearer the left half | tap the joint (`PRESS`) | 4 beats, seen | segment 1 locks, lights | joint dims and re-lights the same place a beat later |
| 3 | The rightmost joint lights | whoever is nearer the right half | tap | 4 beats, seen | segment 6 locks | same |
| 4 | Second-from-left lights | nearer seat | tap | 4 beats, seen | segment 2 locks | same |
| 5 | Second-from-right lights | nearer seat | tap | 4 beats, seen | segment 5 locks | same |
| **Movement 2 — the spine opens an eye, and the cannon answers** ||||||
| 6 | With four segments locked the spine's midpoint splits, baring a single lit socket | — | — | — | — | — |
| 7 | The socket flashes a colour | whichever cannon owns that colour | fire the socket (standard control) | 3 beats, seen | socket shuts, third segment (left-middle) locks itself for free | socket stays open, an ordinary hull hit next beat |
| 8 | Fourth segment (right-middle) lights, window shorter than movement 1's | nearer seat | tap | 3 beats, seen | segment locks — spine fully rigid | joint re-lights |
| **Movement 3 — the whole spine, at tempo** ||||||
| 9 | Every joint dims at once, then relights in a fast unpredictable order, one at a time | nearer seat, per joint | tap, three joints in a row | 2 beats each, seen | each locked joint pulses brighter | a missed one loosens that segment again — it simply re-lights later |
| 10 | The spine holds rigid for one full beat, every segment locked and bright | — | — | — | — | — |
| 11 | The tail whips once, throwing a single hazard rock down the field | P1 or P2 | fire it, own colour | 2 beats, seen | rock destroyed | ordinary hull hit |
| 12 | The spine snaps straight and the fight ends | — | — | — | — | — |

**THE SLOW** opens on every joint window in movements 1 and 2 (rows 2–5, 7,
8) and on row 7's socket; movement 3's re-lit joints (row 9) run at tempo on
purpose — a spine that has taught its rule for eight beats is allowed to ask
for it fast.

**Presentation.** No camera. Each lock is a short hull-shock click; the
socket shot of row 7 is an ordinary shot's flash, nothing new.

**Animation.** Segments individually locking rigid out of a loose, faintly
swaying rest pose — six independent joints rather than one body morphing
whole, which is the one place this page's bodies do not share THE INSTAR's
single-figure blend, because a spine's whole point is that its parts move
separately.

**Colour.** Iron grey throughout; a locked segment carries a thin white seam,
never a colour that implies ownership — geometry alone says whose joint it
is, and it changes every time the mark moves.

**Payoff.** Row 9 — the rule the first eight beats taught (nearer thumb takes
the joint) run three times in two beats each, which is the fastest a pair on
this page is asked to read where a mark landed and pass it wordlessly between
them.

**Cost. Low.** One drag target, no new hashed field beyond which end the
joint currently sits at (an index, the way `instar`'s pose index already
works) and a boolean per segment.

**Reusable.** A single mark whose **owning seat is read off its position
rather than authored per step** — named `GeometrySeat` and built with lane
one (`sim/geometry-seat.ts`, `geometrySeat(col, cols)`); the purity test's
COPIES table refuses a second copy of it.

### §25 THE VALVE — freezing what the other hand is already moving

**Question.** THE HASP already couples a latch one seat holds with a wheel
the other turns, but neither screen there shows the other's half. This keeps
both halves on both screens and spends the one genuinely new verb on the
refused sheet instead: `FreezeTap`, a timed tap by one seat that stops
whatever the other seat is continuously dragging, so the drag can be pulled
out of danger rather than pursued.

**Silhouette.** A squat drum standing over the field with a single wheel set
in its face and a pin socket beside it. **Health is three latch-pins**, each
freed and pulled in its own movement; a drum with no pins seizes and splits.

**Mechanic.** `valveWheel` is a `BearingDrag` — Player 1 turns it steadily
toward a lit mark, the way `crank.ts` already reads a turn. `valvePin` is
`FreezeTap` — Player 2's tap, timed against the wheel's own mark reaching a
window, halts the wheel's motion in the sim for `valveFreezeBeats` (it does
not answer to a further turn while frozen). Only while frozen can Player 1
drag the now-still pin fully out (an ordinary depth drag) — pulling on a
moving pin does nothing, which is the coupling: the freeze is what makes the
pull possible, and the pull is a race against the freeze running out.

**Player 1 and Player 2.** Identical screens: the drum, the turning wheel,
the pin. Player 1 owns the wheel's turn; Player 2 owns the freeze tap. Once
frozen, **either** seat may pull the pin — the sim does not care whose thumb
does it, only that it happens before the freeze ends, which is the one moment
this page lets a gesture go to whichever hand is free.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the first pin** ||||||
| 1 | The drum settles into frame, wheel dark, pin socket dim | — | — | — | — | — |
| 2 | The wheel lights and begins turning toward its mark on its own | P1 | steer the wheel onto the mark (`TURN`) | 5 beats, seen | wheel holds on the mark, freeze window opens | wheel drifts off and re-approaches |
| 3 | The pin socket flashes while the wheel holds | P2 | tap to freeze (`FREEZE`) | 2 beats, seen | wheel stops dead, pin socket glows steady | wheel resumes turning, back to row 2 |
| 4 | The frozen pin sits still, glowing | P1 or P2 | pull the pin out (`PULL`) | 3 beats, frozen | first pin comes free, drum lists slightly | freeze runs out, pin locks back in, movement repeats from row 2 |
| **Movement 2 — a spark, then the second pin, faster** ||||||
| 5 | A spark leaks from the listing drum | P1 or P2 | fire it, own colour | 2 beats, seen | spark out | ordinary hull hit |
| 6 | The wheel lights again, a longer turn to its mark | P1 | steer (`TURN`) | 5 beats, seen | holds, freeze window opens | drifts off |
| 7 | Freeze window, shorter than movement 1's | P2 | tap (`FREEZE`) | 1 beat, seen | wheel stops | wheel resumes |
| 8 | Frozen pin | P1 or P2 | pull (`PULL`) | 2 beats, frozen | second pin free, drum lists further | freeze runs out, repeat from row 6 |
| **Movement 3 — the last pin holds the whole seal** ||||||
| 9 | The wheel now turns *away* from a mark that sits behind it — a full lap before it can hold | P1 | steer the long way round (`TURN`) | 6 beats, seen | holds | drifts off, tries again |
| 10 | Freeze window, the shortest yet | P2 | tap (`FREEZE`) | 1 beat, seen | stops | resumes |
| 11 | Frozen pin, deep in the drum's face | P1 or P2 | pull (`PULL`) | 2 beats, frozen | last pin free | freeze runs out, repeat from row 9 |
| 12 | With all three pins out the drum's face falls open | — | — | — | — | — |

**THE SLOW** opens on every freeze window (rows 3, 7, 10) and every pull
(rows 4, 8, 11) — the two beats a pair most needs slowed, since one thumb's
tap has to land inside a beat the other thumb cannot see coming any earlier
than the wheel's own approach shows it.

**Presentation.** No camera. Each freed pin is one hull-shock pulse; the
drum's list deepens visibly, plate by plate, which is the hull's reaction
standing in for a health bar that this boss, like every other, does not have.

**Animation.** Four poses: sealed and upright; listing one pin; listing two;
face open. The wheel's turn is drawn continuously rather than as a snap
between marks, and a frozen wheel visibly stops mid-turn rather than resetting
to the mark — the stillness is the tell that the freeze landed.

**Colour.** Drum iron grey; the wheel's mark and the pin's socket both plain
white — nothing here is colour-gated, since either seat may take the pull.

**Payoff.** Row 9's long way round, where the pattern the first two movements
taught (turn toward a visible mark) is broken on purpose the one time the
boss can afford to.

**Cost. Medium.** `BearingDrag` is shipped; `FreezeTap` is new and is the one
genuinely new verb on either brief — `tools/director/test/on-field-controls.test.ts`'s
exhaustive switch is where it is added, so the compiler is the checklist.

**Reusable.** `FreezeTap` itself, finally spent — as a press read on its edge
on `valvePin` (`sim/valve-hand.ts`), not a `Hold` kind — and available to any later
concept that wants one hand to arrest what the other is doing rather than
race it.

### §26 THE SEAM — a crack the cannon answers, in order, with the shield in between

**Question.** THE INSTAR's brief said no control set at all; this is the
other half DavidDe asked for in the same breath — a choreographed scene built
**around** the standard controls rather than instead of them, because the cue
and THE SLOW make a plain shot or a plain shield block just as legible a step
as a drag ever is. It is not THE VOLLEY or THE CRYSTAL: those are field
bosses answered with the ordinary loop running at ordinary speed, and this is
an authored beat list where each shot or block is its own step with its own
window, the way every other choreographed scene on this page works.

**Silhouette.** A shelled ridge running down the field's centre column with a
single crack along its spine, widening in three places. **Health is the
crack's three widened points**; each is sealed shut by a well-timed shot, and
a ridge with all three sealed splits along the crack instead.

**Mechanic.** Nothing new: an ordinary `Command` shot at a lit point, an
ordinary shield hold, both read the way the default loop already reads them.
What makes it choreographed rather than a field boss in a costume is that the
sim only accepts a shot or a shield at the moment its own step says so — a
shot at a point that has not lit does nothing, the way a step outside its
window never does on any boss on this page (`SequentialAction`).

**Player 1 and Player 2.** Identical screens: the whole ridge, the lit point,
whichever control the current step wants drawn with its cue word. Which seat
acts is the cannon's own colour rule already in the game — nothing new is
being split, which is the point: this concept's entire claim is that the
standard controls, timed by a script, are already legible enough.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — learning the crack** ||||||
| 1 | The ridge rises into frame, crack dark along its spine | — | — | — | — | — |
| 2 | The crack's first point lights red | red cannon's seat | fire it (standard control, `FIRE`) | 3 beats, seen | point seals, seam dims there | point stays lit, ordinary hull hit |
| 3 | The seam widens along its whole length, a spray of grit thrown at the hull | both seats | raise the shield (standard control, `SHIELD`) | 2 beats, seen | grit blocked | ordinary hull hit |
| 4 | Second point lights cyan | cyan cannon's seat | fire it (`FIRE`) | 3 beats, seen | point seals | ordinary hull hit |
| **Movement 2 — both colours, closer together** ||||||
| 5 | Two points light at once, red then cyan a beat apart | both cannons in turn | fire each in its own colour (`FIRE`) | 3 beats each, seen | both seal | whichever is missed stays lit |
| 6 | The seam widens again, longer spray | both seats | shield (`SHIELD`) | 2 beats, seen | blocked | ordinary hit |
| 7 | A hazard rock spits from the crack itself | whoever's colour it carries | fire it (`FIRE`) | 2 beats, seen | destroyed | ordinary hit |
| **Movement 3 — the last point, and both controls in the same beat** ||||||
| 8 | The last point lights white — either colour answers it, the one point on the ridge that is not colour-gated | either seat | fire it (`FIRE`) | 3 beats, seen | point seals | stays lit |
| 9 | The whole ridge shudders, throwing grit **and** a hazard rock in the same beat | one seat shields while the other fires | shield and fire, together (`SHIELD` / `FIRE`) | 3 beats, seen | both answered | whichever is missed lands as an ordinary hit |
| 10 | The sealed ridge splits down its own crack | — | — | — | — | — |

**THE SLOW** opens on every fire and shield window (rows 2–9) — the
ordinary controls, at ordinary tempo, are the whole of what THE INSTAR's
brief asked to be rid of for one boss; here they are kept and simply given
the room a choreographed step already gives every other gesture.

**Presentation.** No camera. Each sealed point is a hull-shock click; the
widening seam's grit is an ordinary deflected-hit spark, nothing new drawn.

**Animation.** Four poses: dark crack; one point sealed; two points sealed;
split open. No morph — the ridge does not move between poses, since its whole
claim is that the *standard* loop is already expressive enough without one.

**Colour.** The ridge itself shell-grey; each point lit in the cannon colour
that answers it, the game's existing rule, spent rather than reinvented.

**Payoff.** Row 9 — the one beat on this page that asks both standard
controls of both seats inside a single window, which no ordinary wave does.

**Cost. Very low.** Nothing new: a `BossSequenceStep` list gating the
existing shot and shield commands. The whole of the design is which beat asks
for which of the two things the pair already knows how to do.

**Reusable.** A choreographed scene built entirely out of gated standard
controls — worth pointing at whenever the brief's *"standard controls for a
specific sequence"* line comes up again, since this is the cheapest possible
answer to it.

### §27 THE OCULUS — shutting an eye together, then answering what was behind it

**Question.** `SimultaneousAction` (two commands inside one shared window) is
shipped machinery nothing on this page has spent on a *hold* rather than a
release — every simultaneous beat so far (THE BELLOWS's retired exchange, THE
GIMBAL's alignment) asks for two things to land at once. This asks two seats
to **keep** holding at once, for as long as the boss can still reopen what
they are holding shut — the tension is sustained rather than a single instant.

**Silhouette.** A great lens standing over mid-field, six leaves closed like
an iris across its face. **Health is the six leaves**, shut two at a time,
plus a single core exposed once all six are shut; the core takes three hits,
and a spent core lets the lens shatter.

**Mechanic.** Two hold targets, `oculusLeafLeft` and `oculusLeafRight`, one
per screen-half the way THE MANTLE's handles work. Holding both closes one
pair of leaves for as long as both holds are live; letting go before the
window's beat count reopens that pair only, never the whole lens. Once six
leaves are shut, the lens's core socket opens and the scene switches to the
ordinary shot the way THE SEAM's does — a `SceneBreak`, named here for the
first time on this page rather than left as an unlabelled long `landBeats`.

**Player 1 and Player 2.** Identical screens: the lens, both leaf-holds, the
core once it is exposed. Player 1 always holds the left leaf, Player 2 the
right — the same fixed-by-geometry rule as THE MANTLE, so nothing about who
holds which is ever said aloud.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — shutting the eye** ||||||
| 1 | The lens opens into frame, all six leaves apart | — | — | — | — | — |
| 2 | The first pair of leaves lights | P1+P2 | hold both leaves together (`HOLD`) | 4 beats, held | first pair shuts and locks | either hold breaks, leaves reopen, retry |
| 3 | Second pair lights | P1+P2 | hold together (`HOLD`) | 4 beats, held | second pair shuts | same |
| 4 | Third pair lights | P1+P2 | hold together (`HOLD`) | 4 beats, held | third pair shuts, lens fully closed | same |
| **Movement 2 — the socket, and the standard controls** ||||||
| 5 | The shut lens's centre socket cracks open, a bare core inside | — | — | — | — | — |
| 6 | The core flashes a colour | that cannon's seat | fire it (standard control, `FIRE`) | 3 beats, seen | first core hit lands | ordinary hull hit |
| 7 | Two leaves crack apart again, threatening to swallow the socket shut | P1+P2 | hold both to reseal them (`HOLD`) | 3 beats, held | leaves reseal, socket stays open | socket closes early, movement's fire beats are lost until it reopens |
| 8 | The core flashes again, other colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | second core hit | ordinary hull hit |
| **Movement 3 — the last hit, held through** ||||||
| 9 | Two more leaves crack apart, longer window | P1+P2 | hold to reseal (`HOLD`) | 4 beats, held | reseal holds | socket closes, retry |
| 10 | The core flashes white — either colour answers it | either seat | fire it (`FIRE`) | 3 beats, seen | third hit lands, core spent | stays lit |
| 11 | Every leaf springs open at once and the lens shatters | — | — | — | — | — |

**THE SLOW** opens on every hold window (rows 2–4, 7, 9) and every fire
window (rows 6, 8, 10) — a sustained hold is exactly the kind of window the
owner's 22 September rule already argues needs more seconds than beats, since
most of it is the pair confirming out loud that both thumbs are actually down.

**Presentation.** No camera. Each shut pair of leaves is a soft hull-shock
thud; a resealed pair mid-socket is the same, quieter; each core hit is an
ordinary shot's flash.

**Animation.** Five poses: open; two leaves shut; four shut; all six shut
with the socket cracking; shattered. The leaves close as a real iris does —
each pair sliding across the face rather than fading out — which is the one
place on this page a body's motion is drawn as mechanism rather than as flesh.

**Colour.** The lens rim shell-grey, the leaves themselves a dull glass tone;
the core is the only lit colour on the body, and it is lit in whichever
cannon colour a given beat wants, the same rule THE SEAM spends.

**Payoff.** Row 7 — the one beat on this page where a `HOLD` is asked for
*defensively*, to protect a `FIRE` step already under way rather than to
progress the fight on its own.

**Cost. Low–medium.** Two hold targets (shipped kind), one `SceneBreak`
(named for the first time, costing only the label — the machinery already
exists as an authored long `landBeats`), and the ordinary shot command gated
by step the way THE SEAM already gates it.

**Reusable.** A *held-open* `SimultaneousAction` rather than a released one,
and `SceneBreak` itself, finally named rather than left as an anonymous
long window.

---

## More, spent from the unclaimed gesture list

DavidDe, 26 September 2026: more choreographed concepts, easy to follow, more
than ten steps apiece, in the same "both screens read the same picture" shape
as the five above. **Written to spend gestures still sitting in `consider` on
CONTROLS › GESTURES** (`tools/director/src/gesture-unbuilt.ts`) rather than to
re-skin anything already shipped — `SQUEEZE ONE BODY`, `RUB`, `CHORD` and
`TILT, AS A LEVEL` were all four untouched by any of the twenty-two concepts
above them, and each is spent here by exactly one new concept, the same
one-primitive-one-boss discipline the library below already argues for. Four
so far; more follow the same rule against the gestures still left in
`consider`.

**Nothing here is built** but the simulation lanes of §28 THE VISE —
[bosses](bosses.md) §11.45, wave 107 — §29 THE RIME — §11.46, wave 108 —
§30 THE TRIVET — §11.47, wave 109 — and §31 THE PLUMB — §11.48,
wave 110, with THE PLUMB's lean reader — their looks queued. Same split as
the batch above: a simulation lane in `docs/queue.md`, claimable the
ordinary way, and a look lane behind a `Needs:` line back to it. Neither concept has a "Who is building what" row
below on purpose — a spec section with no row there is what puts a concept on
the director's NOT BUILT YET page (`tools/director/src/backlog-bosses.ts`'s
fourth group), and a row is only added once a lane actually claims one.

### §28 THE VISE — a gap two thumbs close from opposite sides

**Question.** `SqueezeGap` reads the distance between two touches on one body
as a depth — no boss on this page or the last has spent it, since every
closing mechanic so far reads a single continuous input (a drag's depth, a
hold's duration). This asks each seat to pinch, alone on their own half, so
the shared number a lobe cracks on is a gap held shut, not a level pushed to
one end.

**Silhouette.** A dry seed-case in two lobes, hinged at a spine down the
middle. **Health is the two lobes**, each cracked by a sustained pinch, plus a
soft kernel exposed once both are open; the kernel takes three ordinary hits.

**Mechanic.** Two pinch targets, `viseGapLeftMilli` and `viseGapRightMilli`,
one per screen-half the way THE MANTLE's handles work — `SqueezeGap`, named
here for the first time: two touches on one body, their distance apart read
as thousandths, falling as the fingers converge. Held under a closing
threshold for the window's beat count cracks that lobe; the gap widening back
past the threshold resets the lobe's progress rather than losing the step
outright, the same forgiving shape THE MANTLE's pull uses.

**Player 1 and Player 2.** Identical screens: the husk, both pinch zones, the
kernel once exposed. Player 1 always pinches the left lobe, Player 2 the
right — fixed by geometry, never said aloud, the same rule THE MANTLE and THE
OCULUS both use.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left lobe** ||||||
| 1 | The case enters whole, a hairline seam down the spine | — | — | — | — | — |
| 2 | The left lobe's seam lights | P1 | pinch it shut (`SQUEEZE ONE BODY`) | 5 beats, held | left lobe cracks along its seam | gap widens back out, retry |
| 3 | A second, tighter seam lights on the same lobe | P1 | pinch shut again | 4 beats, held | left lobe splits fully, hinges open | same |
| **Movement 2 — the right lobe** ||||||
| 4 | The right lobe's seam lights | P2 | pinch it shut | 5 beats, held | right lobe cracks | retry |
| 5 | Second seam on the right | P2 | pinch shut again | 4 beats, held | right lobe splits open, kernel bared | same |
| **Movement 3 — the kernel, held open** ||||||
| 6 | The bared kernel flashes a colour | that cannon's seat | fire it (standard control, `FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | Both lobes creep shut over the kernel again | P1+P2 | pinch to hold them open (`SQUEEZE ONE BODY`, both) | 3 beats, held | lobes stay open | kernel shuts, movement's fire beats lost until it bares again |
| 8 | Kernel flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Lobes creep shut a second time, faster | P1+P2 | pinch to hold open | 3 beats, held | stays open | shuts, retry |
| 10 | Kernel flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, kernel spent | stays lit |
| 11 | Both lobes spring wide and the case splits down the spine | — | — | — | — | — |

**THE SLOW** opens on every pinch window (rows 2, 3, 4, 5, 7, 9) and every
fire window (rows 6, 8, 10) — a sustained pinch is exactly THE OCULUS's
argument for more seconds than beats, since most of it is a seat confirming
out loud that the gap is actually closing.

**Presentation.** No camera. Each cracked lobe a soft hull-shock thud,
quieter for a reseal; each kernel hit an ordinary shot's flash.

**Animation.** Five poses: intact; left cracked; both cracked, kernel bared;
kernel guarded, lobes creeping shut; shattered. The lobes peel back the way a
real seed-case does — hinging outward along the spine rather than fading — the
same drawn-as-mechanism choice THE OCULUS makes for its leaves.

**Colour.** Case shell a dry tan-brown, the crack lines a paler dry white;
the kernel is the only lit colour on the body, lit in whichever cannon colour
a given beat wants, THE SEAM's and THE OCULUS's rule again.

**Payoff.** Rows 7 and 9 — `SQUEEZE ONE BODY` asked for defensively, guarding
a `FIRE` step already under way, the same shape as THE OCULUS's row 7 spent
on the newer gesture instead of a hold.

**Cost. Low–medium.** One new primitive, `SqueezeGap` (two-finger continuous
distance read as a depth — needs a one-thumb twin refused, and the iPhone's
native `gesturechange` stopped from firing alongside it); the crack/reseal
threshold logic reuses THE VALVE's landed/missed window shape.

**Reusable.** `SqueezeGap` itself — the first primitive on this page to read
a *distance between two touches on one body* rather than a displacement, a
bearing or a duration; any future body that closes rather than opens can
spend it without re-deriving the read.

### §29 THE RIME — a level nobody has to hold, only keep re-reaching

**Question.** `RUB` reads a level from the *count of reversals* in a
back-and-forth wipe, not from a position or a duration — the one gesture on
the unclaimed list that "survives the voice delay" on pointer events alone,
in its own write-up's words, which makes it the first choreographed step
whose progress a seat can report honestly without either side needing to
agree on a clock. This spends it on a body whose progress can also creep
backwards on its own, which nothing on this page has asked a seat to fight
before.

**Silhouette.** A lens standing over mid-field like THE OCULUS's, but frosted
opaque rather than shut — an iced pane in two halves. **Health is rime
coverage**, cleared per half by wiping, plus a bared core once both halves
are clear; the core takes three hits the ordinary way.

**Mechanic.** `rimeLeftMilli` / `rimeRightMilli`, one per screen-half fixed
by geometry. `RubCount` — named here for the first time — reads a reversal
(the touch's x changing sign) as a fixed shave off the half's rime; each half
regrows a small amount every beat nobody is wiping it, so a seat that stops
partway loses ground rather than banking it, the tension THE SPOOL's
"letting it run is the point" argues from the other direction. Once both
halves are bare, the core's socket opens the way THE OCULUS's does, and a
regrowth surge across the whole lens is answered by the standard shield
rather than by more wiping.

**Player 1 and Player 2.** Identical screens, left half / right half fixed
by geometry — the same MANTLE/OCULUS/HUSK rule a fourth time running, on
purpose: geometry, never a word, is what tells two identical screens apart
on this page.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left half** ||||||
| 1 | The lens stands opaque, both halves iced solid | — | — | — | — | — |
| 2 | The left half lights | P1 | wipe it clear (`RUB`) | 6 beats, wiped | left half clears | wipe stops, half regrows opaque, retry |
| 3 | A film regrows over the left half's clear patch | P1 | wipe it again | 4 beats, wiped | stays clear, movement ends | regrows fully, retry from row 2 |
| **Movement 2 — the right half** ||||||
| 4 | The right half lights | P2 | wipe it clear | 6 beats, wiped | right half clears | regrows, retry |
| 5 | The right half's own regrowth film | P2 | wipe again | 4 beats, wiped | stays clear | regrows, retry from row 4 |
| **Movement 3 — the bare core, held clear** ||||||
| 6 | The core flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | A rime surge crawls back across the whole lens | P1+P2 | raise the shield (standard control) | 3 beats, held | surge blocked, lens stays bare | lens re-frosts, movement's fire beats lost until both halves are wiped clear again |
| 8 | Core flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | A second surge, faster | P1+P2 | shield | 3 beats, held | blocked | re-frosts, retry |
| 10 | Core flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, core spent | stays lit |
| 11 | The whole lens shatters, ice falling away in sheets | — | — | — | — | — |

**THE SLOW** opens on every wipe window (rows 2–5) and every fire and shield
window (rows 6–10) — the wipe windows most of all, since a reversal count
read at ordinary speed is the one gesture on this page that could otherwise
look, to an eye watching rather than a hand doing it, like nothing is
happening at all.

**Presentation.** Frost flaking away in small bursts as a half clears (the
existing particle machinery, no new kind); the regrowth surge a slow pale
crawl inward from the rim; no camera.

**Animation.** Five poses: opaque; left clear; both clear, core cracking
open; guarded, a surge crawling back; shattered. Clearing is drawn as a
spreading clear patch rather than a cross-blend — the wipe's own shape made
visible, the same drawn-as-mechanism choice as THE OCULUS's leaves and THE
HUSK's lobes, a third time running.

**Colour.** The rime a pale blue-white film over dull glass-grey, the same
lens-body tone as THE OCULUS's; the core is the only lit colour, lit in
whichever cannon colour a beat wants.

**Payoff.** Rows 7 and 9 — the standard shield spent defending a wipe
already banked rather than the wipe itself, the same "defend what's already
landed" shape as THE OCULUS's row 7 and THE VISE's rows 7/9, spent here on
the shield instead of a hold or a pinch.

**Cost. Low–medium.** One new primitive, `RubCount` (a reversal count read
off pointer events alone, the unclaimed `RUB` gesture); a small per-beat
regrowth tick on an otherwise ordinary threshold field; the standard shield
gated by step the way THE SEAM already gates the standard shot.

**Reusable.** `RubCount` itself, and the regrowing-threshold shape it is
spent with — the first choreographed field on this page whose progress can
run backwards on its own, which any future body wanting the tension of
"stopping loses ground" can spend without re-deriving the tick.

### §30 THE TRIVET — three feet, each planted only while a chord holds

**Question.** `CHORD` reads two or three of one seat's own controls held
down together, not in sequence — nothing on this page or the last has asked
a single hand to press more than one control at once, since every mechanic
so far reads one continuous input per hand. This asks each seat to plant an
actual tripod stance, two thumbs down together and held, and asks both seats
to do it at once for the last foot.

**Silhouette.** A three-legged stand splayed wide over the hull, each foot a
lit socket on the seat's own panel rather than a body on the field. **Health
is the two outer feet**, one per seat, plus a lit hub once both are planted;
the hub takes three ordinary hits.

**Mechanic.** `trivetFrontHeld` / `trivetRearHeld`, one per seat, read by
`ChordHold` — named here for the first time: two (or three) of a seat's own
controls held down together, counted true only while none of them has
lifted, for the window's beat count. Either control lifting early resets
that foot's progress rather than losing the step outright, the same
forgiving shape THE VALVE's freeze and THE VISE's pinch both use. The hub's
movement asks both seats to chord at once — the first place on this page a
held window, rather than a release, is judged across both seats together.

**Player 1 and Player 2.** Identical screens, front foot / rear foot fixed
by geometry — the same rule a fifth time running: geometry, never a word, is
what tells two identical screens apart on this page.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the front foot** ||||||
| 1 | The stand drops in, both feet lifted, hub dark | — | — | — | — | — |
| 2 | The front foot's socket lights | P1 | hold two controls together (`CHORD`) | 5 beats, held | front foot plants | either lifts, foot springs back up, retry |
| 3 | A second, tighter light on the same socket | P1 | chord again, three controls | 4 beats, held | front foot driven fully home | springs back, retry from row 2 |
| **Movement 2 — the rear foot** ||||||
| 4 | The rear foot's socket lights | P2 | hold two controls together | 5 beats, held | rear foot plants | springs back, retry |
| 5 | Second, tighter light on the rear socket | P2 | chord again, three controls | 4 beats, held | rear foot driven home, hub lights | springs back, retry from row 4 |
| **Movement 3 — the hub, held down** ||||||
| 6 | The hub flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | Both outer feet creep loose under the hub | P1+P2 | chord together to replant them | 3 beats, held | hub stays down | hub rocks back up, movement's fire beats lost until both feet replant |
| 8 | Hub flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Feet creep loose a second time, faster | P1+P2 | chord together, both feet | 3 beats, held | stays down | rocks back up, retry |
| 10 | Hub flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, hub spent | stays lit |
| 11 | All three feet buckle at once and the stand collapses | — | — | — | — | — |

**THE SLOW** opens on every chord window (rows 2, 3, 4, 5, 7, 9) and every
fire window (rows 6, 8, 10) — a held chord is exactly THE VISE's argument
for seconds over beats, since most of it is a seat confirming out loud that
both thumbs are actually still down.

**Presentation.** No camera. Each planted foot a flat hull-shock thud;
each hub hit an ordinary shot's flash; a foot springing loose a short
metallic ring.

**Animation.** Five poses: both feet up; front planted; both planted, hub
lit; hub guarded, feet creeping loose; collapsed. A foot plants by swinging
down and locking rather than fading in — the same drawn-as-mechanism choice
THE OCULUS, THE VISE and THE RIME all make.

**Colour.** Stand a dull gunmetal, the sockets a cold blue-white when lit;
the hub is the only lit colour on the body, lit in whichever cannon colour
a given beat wants, THE SEAM's and THE OCULUS's rule again.

**Payoff.** Rows 7 and 9 — `CHORD` asked for defensively, replanting a
foot under a `FIRE` step already under way, the same shape as THE OCULUS's
row 7 and THE VISE's rows 7/9, spent here on a chord instead of a hold or a
pinch.

**Cost. Low.** One new primitive, `ChordHold` (a fixed set of a seat's own
controls, all held with none lifting, for a beat count — pure pointer state,
no new field type); the plant/spring threshold logic reuses THE VALVE's
landed/missed window shape.

**Reusable.** `ChordHold` itself — the first primitive on this page read
from a seat's own panel rather than from a body on the field or a phone's
sensors; any future body that wants "more than one thumb down at once" can
spend it without re-deriving what counts as a lift.

### §31 THE PLUMB — a lean held long enough to bring it level

**Question.** `TILT, AS A LEVEL` reads the phone's own lean, held at an
angle, as a level rather than a touch — the one gesture on the unclaimed
list that is not a finger at all, which makes it the first choreographed
step judged on how the phone itself is posed. `gesture-unbuilt.ts`'s own
note on it — always with an on-screen twin, and only once the motion
permission is asked for — is THE CHOIR's shake rule, carried over to a hold
instead of an instant.

**Silhouette.** A lopsided weight hung off-centre from the hull, a plumb bob
dragged out of true by its own drift. **Health is the two counterweights**,
one per seat, each brought level by a held tilt, plus a lit core once both
hang straight; the core takes three ordinary hits.

**Mechanic.** `plumbLeftTiltMilli` / `plumbRightTiltMilli`, one per seat,
read by `LevelTilt` — named here for the first time: the phone's own lean
(gamma) held inside a target range, thousandths of a degree off level,
counted only while the lean stays inside the range. Each screen draws an
on-screen level — a bubble in a glass — mirroring the reading, so the
gesture reads without anyone able to see the other phone move. Drifting
back out of range resets that weight's progress rather than losing the step
outright, the same forgiving shape THE VALVE's freeze, THE VISE's pinch and
THE TRIVET's chord all use.

**Player 1 and Player 2.** Identical screens, left weight / right weight
fixed by geometry — the same rule a sixth time running: geometry, never a
word, is what tells two identical screens apart on this page.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left weight** ||||||
| 1 | The bob hangs skewed, both weights swinging loose, core dark | — | — | — | — | — |
| 2 | The left weight's level lights | P1 | lean the phone level (`TILT, AS A LEVEL`) | 6 beats, held | left weight settles true | tilt drifts out, weight swings loose, retry |
| 3 | A tighter level lights on the same weight | P1 | lean level again | 4 beats, held | left weight locked plumb | swings loose, retry from row 2 |
| **Movement 2 — the right weight** ||||||
| 4 | The right weight's level lights | P2 | lean the phone level | 6 beats, held | right weight settles true | swings loose, retry |
| 5 | Tighter level on the right weight | P2 | lean level again | 4 beats, held | right weight locked, core lights | swings loose, retry from row 4 |
| **Movement 3 — the core, held plumb** ||||||
| 6 | The core flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | Both weights creep off true again | P1+P2 | lean level together to hold them | 3 beats, held | core stays lit | core dims, movement's fire beats lost until both weights settle true again |
| 8 | Core flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Weights creep off a second time, faster | P1+P2 | lean level together | 3 beats, held | stays lit | dims, retry |
| 10 | Core flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, core spent | stays lit |
| 11 | Both weights snap loose at once and the bob swings free, spent | — | — | — | — | — |

**THE SLOW** opens on every level window (rows 2, 3, 4, 5, 7, 9) and every
fire window (rows 6, 8, 10) — a held lean is exactly THE VISE's and THE
TRIVET's argument for seconds over beats, and more so here: a phone actually
has to be picked up and tilted, which reads as nothing on the field until
the on-screen bubble is watched too.

**Presentation.** No camera. Each settled weight a soft chime; each core
hit an ordinary shot's flash; a weight swinging loose a low creak.

**Animation.** Five poses: both weights swinging; left settled; both
settled, core lit; core guarded, weights creeping off; both swung free. A
weight settles by easing to a stop rather than snapping into place — the
same drawn-as-mechanism choice THE OCULUS, THE VISE, THE RIME and THE
TRIVET all make.

**Colour.** Bob and chains a dull verdigris bronze, the level glass a pale
green-white when lit; the core is the only lit colour on the body, lit in
whichever cannon colour a given beat wants, THE SEAM's and THE OCULUS's
rule again.

**Payoff.** Rows 7 and 9 — `TILT, AS A LEVEL` asked for defensively,
resettling a weight under a `FIRE` step already under way, the same shape
as THE OCULUS's row 7, THE VISE's rows 7/9 and THE TRIVET's rows 7/9, spent
here on a phone's own pose instead of a touch.

**Cost. Low–medium.** One new primitive, `LevelTilt` (a `deviceorientation`
gamma reading held inside a threshold range — the same iPhone motion
permission gate as the shake, and the on-screen twin `gesture-unbuilt.ts`
already names as the rule); the settle/drift threshold logic reuses THE
VALVE's landed/missed window shape.

**Reusable.** `LevelTilt` itself — the first primitive on this page read
from the phone's own orientation rather than from a touch, pairing with the
shake's existing permission gate; any future body wanting the tension of
"hold the phone still and level" can spend it without re-deriving the
threshold or the twin.

### §32 THE SLING — a draw held long enough to loose it aimed

**Question.** `HOLD, THEN SWIPE` joins two verbs already built, a hold and a
directional release, into one gesture nothing on this page has asked for:
cock a mechanism by holding it, then choose where it goes by how the finger
leaves rather than where it lands. Every hold on this page so far ends by
letting go or by a separate `FIRE`; this is the first whose release
direction is itself the answer.

**Silhouette.** A forked arm bolted mid-hull, base fixed, cup empty and
slack. **Health is the two draw-arms**, one per seat, each loosed at a lit
column, plus a lit yoke once both have loosed true; the yoke takes three
ordinary hits.

**Mechanic.** `slingLeftDrawnMilli` / `slingRightDrawnMilli`, one per seat,
read by `DrawRelease` — named here for the first time: a hold begun
anywhere on the seat's own panel, counted while continuously held, ended by
a swipe whose direction at lift is read coarse, left half or right half of
the panel. A column lights on the hull before the window opens; the draw
only counts as loosed if the release direction matches which half that
column falls in. Held too briefly, released too early, or loosed the wrong
way all spring the arm back slack rather than losing the step outright, the
same forgiving shape THE VALVE's freeze, THE VISE's pinch, THE TRIVET's
chord and THE PLUMB's lean all use.

**Player 1 and Player 2.** Identical screens, left arm / right arm fixed by
geometry — the same rule a seventh time running: geometry, never a word, is
what tells two identical screens apart on this page.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left arm** ||||||
| 1 | The arm hangs slack, cup empty, yoke dark | — | — | — | — | — |
| 2 | The left arm's cup lights, a column lit to match | P1 | hold, then loose it toward the lit column (`HOLD, THEN SWIPE`) | 5 beats, held, then released true | left arm draws home | held too short, wrong direction, or early release: arm springs slack, retry |
| 3 | A second, longer draw on the same arm | P1 | hold and loose again, column swapped | 4 beats, held, then released true | left arm locked drawn | springs slack, retry from row 2 |
| **Movement 2 — the right arm** ||||||
| 4 | The right arm's cup lights, column lit | P2 | hold, then loose it true | 5 beats, held, then released true | right arm draws home | springs slack, retry |
| 5 | Second, longer draw on the right arm | P2 | hold and loose again | 4 beats, held, then released true | right arm locked, yoke lights | springs slack, retry from row 4 |
| **Movement 3 — the yoke, held drawn** ||||||
| 6 | The yoke flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | Both arms creep slack under the yoke | P1+P2 | hold and loose together to redraw them | 3 beats, held, then released true | yoke stays drawn | yoke springs loose, movement's fire beats lost until both arms redraw true |
| 8 | Yoke flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Arms creep slack a second time, faster | P1+P2 | hold and loose together | 3 beats, held, then released true | stays drawn | springs loose, retry |
| 10 | Yoke flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, yoke spent | stays lit |
| 11 | Both arms loose at once and the fork snaps forward, spent | — | — | — | — | — |

**THE SLOW** opens on every draw window (rows 2, 3, 4, 5, 7, 9) and every
fire window (rows 6, 8, 10) — a hold that only resolves at the release is
exactly THE VISE's, THE TRIVET's and THE PLUMB's argument for seconds over
beats, more so here: the lit column can be forgotten by the time the hand
finally lets go.

**Presentation.** No camera. Each true loose a taut snap; each yoke hit an
ordinary shot's flash; a wrong-direction release a slack, empty thud.

**Animation.** Five poses: both arms slack; left drawn; both drawn, yoke
lit; yoke guarded, arms creeping slack; both loosed, fork snapped forward.
An arm draws by bending back under load rather than fading taut — the same
drawn-as-mechanism choice THE OCULUS, THE VISE, THE RIME, THE TRIVET and THE
PLUMB all make.

**Colour.** Arm and fork a scoured steel grey, the cup a hot amber when
drawn true; the yoke is the only lit colour on the body, lit in whichever
cannon colour a given beat wants, THE SEAM's and THE OCULUS's rule again.

**Payoff.** Rows 7 and 9 — `HOLD, THEN SWIPE` asked for defensively,
redrawing an arm under a `FIRE` step already under way, the same shape as
THE OCULUS's row 7, THE VISE's rows 7/9, THE TRIVET's rows 7/9 and THE
PLUMB's rows 7/9, spent here on a hold-then-direction instead of a touch or
a pose.

**Cost. Low.** One new primitive, `DrawRelease` (a held pointer, counted
while down, resolved by the coarse left/right direction of its release
against a column already lit — pure pointer state, no new field type, and
both halves of the gesture, the hold and the directional swipe, are already
built); the draw/spring threshold logic reuses THE VALVE's landed/missed
window shape.

**Reusable.** `DrawRelease` itself — the first primitive on this page whose
outcome is decided at release rather than at the moment a threshold is
crossed; any future body wanting "commit to a direction only when you let
go" can spend it without re-deriving what counts as a match.

### §33 THE GRINDSTONE — a wheel ground true, then held true by a locked caliper

**Question.** Not a new primitive — the first concept on this page spent
entirely on gestures already built for other bodies, paired in an order
neither has used before. `RUB` (THE RIME's wipe) grinds a flat; `CHORD`
(THE TRIVET's plant) locks it once ground, rather than grinding and locking
being the same motion done twice. Every choreographed boss so far answers
its own movements with its own single primitive; this one asks whether two
already-spent gestures read as a different fight in a different order.

**Silhouette.** A gritted stone wheel on a fixed axle mid-hull, two flats
facing the seats, a caliper slack around the rim. **Health is the two
flats ground clean**, one per seat, plus a lit axle once both flats are
true and the caliper has bitten; the axle takes three ordinary hits.

**Mechanic.** `grindLeftMilli` / `grindRightMilli`, one per seat, read by
`RUB` exactly as THE RIME reads it — a reversal against that seat's own
flat, shaved off per pass, regrowing a small amount every beat nobody is
grinding it. Once both flats are ground clean, `caliperHeld` — read by
`CHORD` exactly as THE TRIVET reads it — locks the wheel dead so the axle
can be fired on; either control lifting early lets the caliper spring
loose rather than losing the step outright, the same forgiving shape THE
VALVE's freeze, THE VISE's pinch, THE TRIVET's chord, THE PLUMB's lean and
THE SLING's draw all use. Nothing here is a new field type: both
thresholds are the same regrowing-shave and plant-and-spring shapes THE
RIME and THE TRIVET already carry.

**Player 1 and Player 2.** Identical screens, left flat / right flat fixed
by geometry — the same rule an eighth time running: geometry, never a
word, is what tells two identical screens apart on this page.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left flat** ||||||
| 1 | The wheel turns rough, both flats gritted, axle dark | — | — | — | — | — |
| 2 | The left flat lights | P1 | grind it clean (`RUB`) | 6 beats, wiped | left flat clears | wipe stops, flat regrits, retry |
| 3 | A film regrits over the left flat's clear patch | P1 | grind it again | 4 beats, wiped | stays clear, movement ends | regrits fully, retry from row 2 |
| **Movement 2 — the right flat** ||||||
| 4 | The right flat lights | P2 | grind it clean | 6 beats, wiped | right flat clears | regrits, retry |
| 5 | The right flat's own regrit film | P2 | grind again | 4 beats, wiped | stays clear, caliper closes | regrits, retry from row 4 |
| **Movement 3 — the axle, held locked** ||||||
| 6 | The axle flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | The caliper creeps loose on the wheel | P1+P2 | hold two controls together to re-clamp it (`CHORD`) | 3 beats, held | axle stays locked | caliper springs loose, movement's fire beats lost until both flats are ground clean again |
| 8 | Axle flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Caliper creeps loose a second time, faster | P1+P2 | chord together, re-clamp | 3 beats, held | stays locked | springs loose, retry |
| 10 | Axle flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, axle spent | stays lit |
| 11 | The caliper snaps off and the wheel spins free, spent | — | — | — | — | — |

**THE SLOW** opens on every grind window (rows 2–5) and every chord and
fire window (rows 6–10) — the grind windows most of all, exactly THE
RIME's own argument, since a reversal count read at ordinary speed looks
like nothing is happening at all.

**Presentation.** Sparks flicking off in small bursts as a flat clears
(the existing particle machinery, no new kind); the caliper's jaw a flat
metallic clack shutting; no camera.

**Animation.** Five poses: rough wheel; left ground; both ground, caliper
closing; axle guarded, caliper creeping loose; caliper snapped off, wheel
spinning free. Grinding is drawn as a spreading clear patch exactly as THE
RIME draws it; the caliper shuts by swinging down and locking exactly as
THE TRIVET's feet do — both drawn-as-mechanism choices reused whole rather
than redrawn.

**Colour.** Wheel a dull quarried grey, the ground flats a pale sandy tan;
the axle is the only lit colour on the body, lit in whichever cannon
colour a given beat wants, THE SEAM's and THE OCULUS's rule again.

**Payoff.** Rows 7 and 9 — `CHORD` asked for defensively, re-clamping the
caliper under a `FIRE` step already under way, the same shape as THE
OCULUS's row 7, THE VISE's rows 7/9, THE TRIVET's rows 7/9, THE PLUMB's
rows 7/9 and THE SLING's rows 7/9 — spent here on the same body a
different primitive already ground clean.

**Cost. Very low.** No new primitive at all — `RUB` and `CHORD` are both
already built for THE RIME and THE TRIVET, and both threshold shapes
(regrowing shave, plant-and-spring) are already carried by those bodies.
The only new code is the wheel's own two-field, two-gesture wiring: no new
field type, no new gesture, no new registration category beyond what
adding any boss already asks.

**Reusable.** The pairing itself — grind with one gesture, lock with
another, rather than a single primitive answering every movement of its
own boss — is the first proof on this page that two already-spent
gestures can carry a whole body between them; any future concept short on
budget can reach for an existing pair before inventing a new primitive.

### §34 THE CYST — a pulse stilled by one hand so the other can close it

**Question.** THE VALVE's `FreezeTap` always frees a *pull*; THE VISE's
`SqueezeGap` always closes on its own, unassisted. Neither concept has
asked the two to depend on each other — a body that convulses too fast
for a pinch to ever narrow the gap, so the pinch can only bite while the
*other* seat's freeze has stopped it dead. THE GRINDSTONE proved two
spent gestures can carry one body in sequence; this one proves they can
carry it as a dependency, one seat's hold making the other seat's squeeze
possible rather than the two never touching.

**Silhouette.** A pulsing sac mid-hull, one spine, two flanks that
convulse in a slow, uneven shudder even when nothing is happening to it —
health is the two flanks, each stilled then pinched shut, plus a soft
core exposed once both are closed; the core takes three ordinary hits.

**Mechanic.** `cystConvulsing` drives both flanks' gap wider every tick
on its own clock, too fast for a pinch alone to ever out-pace it.
`cystFreezeLeft` / `cystFreezeRight` are `FreezeTap`, read exactly as THE
VALVE reads its pin — a timed tap against the flank's own shudder
reaching a mark — and halt that flank's convulsion for `cystFreezeBeats`.
Only while frozen does `SqueezeGap`, read exactly as THE VISE reads it, on
`cystGapLeftMilli` / `cystGapRightMilli` actually fall net of the
convulsion; the freeze running out before the gap crosses its threshold
lets the shudder resume and the gap spring back open, the same
forgiving shape THE VALVE's own freeze uses on its pull.

**Player 1 and Player 2.** Identical screens, both flanks and the core
visible on both — but **the freezing hand is always the flank's own
seat's partner**, not the seat that then squeezes: Player 2 freezes the
left flank for Player 1 to pinch, Player 1 freezes the right flank for
Player 2 to pinch, the cross the Question asks for made literal in who
touches what.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left flank** ||||||
| 1 | The sac shudders in frame, both flanks dim, gap always drifting wide | — | — | — | — | — |
| 2 | The left flank's shudder mark lights | P2 | tap to still it (`FREEZE TAP`) | 2 beats, seen | left flank stops dead | shudder continues, retry |
| 3 | The stilled left flank sits frozen | P1 | pinch it shut (`SQUEEZE ONE BODY`) | 4 beats, held, frozen | left flank cracks | freeze runs out before the gap closes, flank springs back wide, retry from row 2 |
| **Movement 2 — the right flank** ||||||
| 4 | The right flank's shudder mark lights | P1 | tap to still it | 2 beats, seen | right flank stops | shudder continues, retry |
| 5 | The stilled right flank | P2 | pinch it shut | 4 beats, held, frozen | right flank cracks, core bared | freeze runs out, retry from row 4 |
| **Movement 3 — the core, held stilled while fired** ||||||
| 6 | The bared core flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | Both flanks creep back toward shuddering over the core | P1+P2 | one re-taps to still it (`FREEZE TAP`) while the other holds the pinch shut (`SQUEEZE ONE BODY`) | 3 beats, held | core stays bared | core reseals, movement's fire beats lost until both flanks crack again |
| 8 | Core flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Flanks creep back a second time, faster | P1+P2 | re-tap and hold again | 3 beats, held | stays bared | reseals, retry |
| 10 | Core flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, core spent | stays lit |
| 11 | Both flanks split wide for good and the sac hangs open, spent | — | — | — | — | — |

**THE SLOW** opens on every freeze window (rows 2, 4, 7, 9) and every
pinch window (rows 3, 5, 7, 9) together — the two are now one beat to
watch rather than two, since a freeze that lands a half-beat late costs
the partner's whole squeeze, the sharpest version yet of THE VALVE's own
argument for slowing the tap that another thumb cannot see coming.

**Presentation.** No camera. Each cracked flank a soft hull-shock thud;
the shudder itself a small, continuous wet flex with no particle of its
own, so its stopping dead is the only visible event on the body between
cracks.

**Animation.** Five poses: shuddering whole; left stilled and cracked;
both cracked, core bared; core guarded, flanks creeping back; split wide,
spent. The shudder is drawn as a continuous uneven flex rather than a
loop, so a frozen flank reads by its sudden stillness against the other
still moving — the same tell THE VALVE's stopped wheel gives.

**Colour.** Sac a dull bruised violet, the stilled flank's mark a plain
white the way THE VALVE's pin socket is; the core is the only lit colour,
lit in whichever cannon colour a given beat wants.

**Payoff.** Row 7 and 9 — the freeze and the squeeze asked for at once,
on two different seats, holding a `FIRE` step already under way; no
earlier body on this page has asked both spent-elsewhere gestures of both
seats in the same window.

**Cost. Very low.** No new primitive — `FreezeTap` and `SqueezeGap` are
both already built for THE VALVE and THE VISE. The only new code is the
sac's own continuous-drift field and the cross-seat wiring that reads one
seat's freeze against the other's squeeze, which is ordinary per-boss
wiring rather than a new field type or gesture.

**Reusable.** The dependency itself — one seat's hold gating whether the
other seat's own spent gesture can do anything at all, rather than the
two gestures only ever appearing on the same body without touching — is
the first proof on this page that a pairing can be a lock-and-key rather
than a sequence; any future concept wanting one seat to visibly need the
other's hand, not just their timing, can reach for it before inventing a
third verb.

### §35 THE DAVIT — a boom one hand steers for the other to loose

**Question.** THE PLUMB's `LevelTilt` has only ever answered its own
weight; THE SLING's `DrawRelease` has only ever aimed itself, at a column
lit on the hull and nothing else. Neither concept has asked one seat's
continuous pose to *drive* what the other seat's committed release is
judged against — THE CYST proved a hold can gate whether a squeeze does
anything; this one proves a hold can steer the very target the other
seat's release has to catch, live, rather than merely permit or deny it.

**Silhouette.** A crane boom pivoted off the hull's spine, swinging loose
on a slack chain, hook empty. **Health is the two swings**, each a boom
steered onto a lit column by one seat's held tilt and loosed there by the
other seat's draw, plus a lit pivot once both swings have landed; the
pivot takes three ordinary hits.

**Mechanic.** `davitAimMilli`, a single shared reading, tracks whichever
seat is currently steering: while that seat's `LevelTilt` sits inside its
threshold, the boom's on-screen reticle follows the tilt one-to-one
rather than merely counting a hold, so a seat correcting a lean nudges
the boom in real time; outside the threshold the boom swings free on its
own slow drift instead. The other seat's `davitLeftDrawnMilli` /
`davitRightDrawnMilli`, read by `DrawRelease`, only counts a loose as
landed if the release falls while the steering seat's tilt is still
inside threshold *and* the release direction matches the half the lit
column sits in at that instant — a swipe timed against a target the
other hand is still moving, not one already fixed. Losing the tilt
mid-draw, or loosing before it settles, springs the arm slack rather than
losing the step outright, the same forgiving shape THE VALVE's freeze,
THE VISE's pinch, THE TRIVET's chord, THE PLUMB's lean and THE SLING's
draw all use.

**Player 1 and Player 2.** Identical screens — a tilt half and a draw
half both drawn on every phone — but only one is live on a given swing;
the steering seat and the drawing seat trade which half lights on each
movement, the same role-swap-by-movement THE CYST's freezing and
squeezing hands use rather than a fixed left seat / right seat split.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left swing** ||||||
| 1 | The boom swings loose, hook empty, pivot dark | — | — | — | — | — |
| 2 | A column lights; P1's tilt half lights to steer it | P1 steers, P2 looses | P1 leans level (`TILT, AS A LEVEL`) while P2 holds, then looses at it (`HOLD, THEN SWIPE`) | 6 beats, held together | left swing lands | tilt drifts or loose mistimed: boom swings free, retry |
| 3 | A second column, roles held | P1 steers, P2 looses | steer and loose again | 4 beats, held together | left swing locked | swings free, retry from row 2 |
| **Movement 2 — the right swing** ||||||
| 4 | A column lights; P2's tilt half lights | P2 steers, P1 looses | P2 leans level while P1 holds, then looses | 6 beats, held together | right swing lands | swings free, retry |
| 5 | A second column, roles held | P2 steers, P1 looses | steer and loose again | 4 beats, held together | right swing locked, pivot lights | swings free, retry from row 4 |
| **Movement 3 — the pivot, held true** ||||||
| 6 | The pivot flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | The boom creeps off true under the pivot | P1+P2, either steering | steer and loose together to reland it | 3 beats, held together | pivot stays lit | pivot dims, movement's fire beats lost until relanded |
| 8 | Pivot flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Boom creeps off a second time, faster | P1+P2, either steering | steer and loose together | 3 beats, held together | stays lit | dims, retry |
| 10 | Pivot flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, pivot spent | stays lit |
| 11 | The boom swings free once more, spent | — | — | — | — | — |

**THE SLOW** opens on every steer-and-loose window (rows 2, 3, 4, 5, 7, 9)
and every fire window (rows 6, 8, 10) — two different holds, on two
different phones, resolving on one one shared instant is a harder read
than either THE PLUMB's or THE SLING's own window alone, and needs
seconds rather than beats to be read at all.

**Presentation.** No camera. A landed swing a taut snap into the hook;
each pivot hit an ordinary shot's flash; a mistimed loose a slack, empty
thud with no snap.

**Animation.** Five poses: boom swinging loose; left landed; both
landed, pivot lit; pivot guarded, boom creeping loose; both swings spent,
boom locked hard over. The boom eases toward wherever the live tilt
points rather than snapping to it — the same drawn-as-mechanism choice
THE OCULUS, THE VISE, THE RIME, THE TRIVET, THE PLUMB and THE SLING all
make.

**Colour.** Boom and chain a scoured steel grey, the hook a hot amber
once landed; the pivot is the only lit colour on the body, lit in
whichever cannon colour a given beat wants, THE SEAM's and THE OCULUS's
rule again.

**Payoff.** Rows 7 and 9 — steer-and-loose asked for defensively,
relanding the boom under a `FIRE` step already under way, the same shape
as THE OCULUS's row 7, THE VISE's, THE TRIVET's, THE PLUMB's and THE
SLING's rows 7/9, spent here on two seats' holds resolving together
instead of one.

**Cost. Low.** No new primitive — `LevelTilt` and `DrawRelease` are both
already built for THE PLUMB and THE SLING. The only new code is the
shared aim field one primitive writes and the other reads, and the
role-swap wiring THE CYST's freeze/squeeze pairing already proved out.

**Reusable.** The steering pairing itself — one seat's continuous pose
driving the live value the other seat's committed release is judged
against, rather than a hold merely gating a separate step — is the first
proof on this page that a pairing can be a hand-off in real time; any
future concept wanting one seat to visibly aim for the other to fire can
reach for it before inventing a third verb.

### §36 THE HALTER — a seam that only bares itself while one hand proves it isn't there

**Question.** Every gesture on this page so far is a presence — a tap, a
hold, a pinch, a lean, a chord, some command arriving and being read.
`RestraintGate` has sat in the catalogue since the touch inventory was
drawn (`docs/spec/transfers-touch.md` §4) asking for the opposite: a step
passed by sending *nothing* for a graded span, an absence the input layer
has never had to express. No boss on this page has anchored it, and none
has asked it to hold true at the same instant as an ordinary presence on
the other screen — THE CYST's freeze *gates* the squeeze that follows it,
THE DAVIT's tilt *drives* the release that follows it, but both are one
seat's hand feeding the other's turn. This one asks for two independent
holds, one of them a graded nothing, to be true **together**, and to fall
apart the moment either one is not.

**Silhouette.** A wary creature mid-hull that hugs its own plating shut
at the faintest touch — one seam down its spine, in three segments, each
baring itself only while calm and taking one hit before it closes for
good.

**Mechanic.** `halterAlarmed` holds the seam shut and refuses every hit
by default. `halterRestBeats` counts consecutive beats in which the
resting seat has sent the game *no* command at all — a drag, a hold, a
tap, every one of them resets it to nought, read exactly as
`RestraintGate` is catalogued. At `halterRestThreshold` beats of true
stillness the creature settles — but the settled segment only bares
itself while the *other* seat's `halterChordLeft` / `halterChordRight`
(`CHORD`, read exactly as THE TRIVET reads its two planted feet) are
both held down at that same instant. Either half failing — the resting
seat sending one command, or the chording seat lifting either thumb —
snaps the seam shut and both counters to nought together; the pair must
produce the stillness and the grip from nothing a second time, not merely
resume where they left off.

**Player 1 and Player 2.** Identical screens, the seam's three segments
visible on both, but which seat rests and which chords swaps by
movement, the same trade THE CYST's freeze and squeeze already make.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left segment** ||||||
| 1 | The seam sits shut, plating tight, nothing lit | — | — | — | — | — |
| 2 | The left segment's mark lights | P2 | send nothing at all (`SENDING NOTHING`) | held to threshold | rest counter reaches threshold | any command resets it, retry |
| 3 | The left segment sits ready to settle | P1 | hold both grips (`CHORD`) while P2 stays off | held to threshold, together | left segment bares and cracks | either hand fails, both counters reset, retry from row 2 |
| **Movement 2 — the right segment, roles swapped** ||||||
| 4 | The right segment's mark lights | P1 | send nothing at all | held to threshold | rest counter reaches threshold | any command resets it, retry |
| 5 | The right segment sits ready to settle | P2 | hold both grips while P1 stays off | held to threshold, together | right segment bares and cracks, centre exposed | either hand fails, retry from row 4 |
| **Movement 3 — the centre, held bared while fired** ||||||
| 6 | The bared centre flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | The plating creeps back toward alarmed over the centre | P1+P2 | one sends nothing while the other holds the chord | held to threshold, together | centre stays bared | plating shuts, movement's fire beats lost until both counters reach threshold again |
| 8 | Centre flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Plating creeps back a second time, faster | P1+P2 | rest and chord again, roles free to trade | held to threshold, together | stays bared | shuts, retry |
| 10 | Centre flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, seam spent | stays lit |
| 11 | The seam splits wide for good and the plating hangs open, spent | — | — | — | — | — |

**THE SLOW** opens on every rest-and-chord window (rows 2–3, 4–5, 7, 9)
together — the two counters are one thing to watch rather than two, since
a single stray command a beat before threshold costs the partner's whole
grip, the sharpest version yet of the forgiving-reset shape THE VALVE's
own freeze first used.

**Presentation.** No camera. The plating a small continuous tremor with
no particle of its own, so its going still is the only visible event on
the body; each cracked segment a soft hull-shock thud, same weight as
THE CYST's flanks.

**Animation.** Five poses: alarmed whole; left settled and cracked; both
cracked, centre bared; centre guarded, plating creeping back; split wide,
spent. The tremor is a continuous uneven shiver rather than a loop, so
its stopping dead against a chording thumb still moving elsewhere is the
tell, the same contrast THE CYST's frozen flank gives against its
shuddering twin.

**Colour.** Plating a dull wary grey-green, the resting seat's mark a
plain white the way THE VALVE's pin socket is; the centre is the only lit
colour, in whichever cannon colour a given beat wants.

**Payoff.** Rows 7 and 9 — a graded absence and an active chord asked of
both seats at once, holding a `FIRE` step already under way; no earlier
body on this page has asked one seat to prove they are *not* touching
anything while the other proves they are gripping something, in the same
window.

**Cost. Medium.** `RestraintGate` has never anchored a boss before this
one, so `halterRestBeats` is the primitive's first real reader — a
per-seat counter reset by any command, the mirror image of a hold
counter rather than a new field kind. `CHORD` itself is already built for
THE TRIVET. No new gesture, no new primitive class: the brief's own
catalogue already named `RestraintGate`, this is only its first tenant.

**Reusable.** The overlap itself — a graded absence from one seat true at
the same instant as an ordinary held presence from the other, either one
falling clearing both — is the first proof on this page that a pairing
can ask for a *nothing* and a *something* together rather than two
somethings in sequence or in dependency; any future concept wanting one
seat to prove restraint while the other proves grip can reach for it
before inventing a third verb.

### §37 THE CAPSTAN — a drum one hand steers, that the other hand wears down

**Question.** THE VALVE's `FreezeTap` has only ever stopped a pull dead;
THE RIME's `RubCount` has only ever worn down whatever one body sat under
it. THE CYST proved a hold can *gate* whether a squeeze does anything;
THE DAVIT proved a hold can *aim* what a release is judged against. No
concept on this page has asked a hold to *redirect*, live, which of two
targets an ongoing continuous gesture is currently wearing down, with
neither target's progress lost while it is not the chosen one — a
retarget rather than a gate or an aim, the wipe never resetting, only
pausing.

**Silhouette.** A squat rusted drum mid-hull on a cradle that rocks to
one side or the other, one grated band on each face — health is both
bands worn bright, plus a soft core under the drum's cap once both are
bare; the core takes three ordinary hits.

**Mechanic.** `capstanTiltMilli` is `TILT, AS A LEVEL`, read exactly as
THE PLUMB reads its lean, and rocks the cradle to whichever side it is
held toward, exposing that face's band to the wipe and swinging the
other out of reach. `capstanWearLeftMilli` / `capstanWearRightMilli` are
`RUB`, read exactly as THE RIME reads its reversals, but only the
exposed face's counter takes them — the hidden face's own count holds
exactly where it was, spending no reversal and losing none, until the
cradle rocks back and bares it again. Either band worn to
`capstanWearThreshold` cracks bright for good; both bright bares the
core.

**Player 1 and Player 2.** Identical screens, both bands and the core
visible on both — but **the seat steering the cradle is never the seat
wearing the exposed band**: Player 1 rocks the cradle for Player 2 to
wipe whichever face it bares, then the two trade so Player 2 rocks for
Player 1, the same cross THE CYST's freezing hand already makes literal.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the left band** ||||||
| 1 | The drum sits rusted, cradle centred, neither band exposed | — | — | — | — | — |
| 2 | The cradle's left mark lights | P1 | lean the cradle left (`TILT, AS A LEVEL`) | held, steered | left band exposed | cradle drifts back centre, band hidden again |
| 3 | The exposed left band sits bare to the wipe | P2 | wipe it bright (`RUB`) | held, wears down | left band cracks bright | P1 lets the lean drift off, wipe pauses in place, resume once re-exposed |
| **Movement 2 — the right band, roles swapped** ||||||
| 4 | The cradle's right mark lights | P2 | lean the cradle right | held, steered | right band exposed | cradle drifts back centre |
| 5 | The exposed right band | P1 | wipe it bright | held, wears down | right band cracks bright, core bared | steering drifts off, wipe pauses, resume once re-exposed |
| **Movement 3 — the core, held bared while fired** ||||||
| 6 | The bared core flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 7 | The cradle creeps back toward centred over the core | P1+P2 | one steers it fully over while the other keeps wiping | held, steered | core stays bared | cradle re-centres, movement's fire beats lost until both bands crack bright again |
| 8 | Core flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 9 | Cradle creeps back a second time, faster | P1+P2 | steer and wipe again, roles free to trade | held, steered | stays bared | re-centres, retry |
| 10 | Core flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, drum spent | stays lit |
| 11 | Both bands sit worn bright and the cap swings open, spent | — | — | — | — | — |

**THE SLOW** opens on every steer-and-wipe window (rows 2–3, 4–5, 7, 9)
together — the lean and the reversal count are one thing to watch rather
than two, since a cradle let to drift a half-beat early strands the
wiping hand's progress exactly where it stood, the same forgiving
pause-not-reset shape that makes this pairing gentler than THE CYST's
outright springback.

**Presentation.** No camera. The drum a small continuous rattle with no
particle of its own; the cradle's rock a slow, visible lean rather than a
snap, so which face is exposed is always readable at a glance, the same
legibility THE PLUMB's own weight asks for.

**Animation.** Five poses: rusted whole, cradle centred; left exposed and
worn bright; both worn bright, core bared; core guarded, cradle creeping
back; cap open, spent. The rattle is a continuous uneven judder rather
than a loop, so a wipe that pauses mid-stroke reads by the judder alone
continuing under a hand that has stopped moving.

**Colour.** Drum a dull corroded rust, the exposed band's mark a plain
white the way THE PLUMB's level mark is; the core is the only lit colour,
lit in whichever cannon colour a given beat wants.

**Payoff.** Rows 7 and 9 — a live steer and a live wipe asked of both
seats at once, holding a `FIRE` step already under way; no earlier body
on this page has asked one seat's continuous lean to keep deciding, beat
to beat, where the other seat's continuous wipe is even allowed to land.

**Cost. Low.** No new primitive — `TILT, AS A LEVEL` and `RUB` are both
already built, for THE PLUMB and THE RIME. The only new code is the
per-face wear counters that pause rather than reset when their face is
hidden, and the cradle's own two-position drive, both ordinary per-boss
wiring rather than a new field type or gesture.

**Reusable.** The pause-not-reset retarget itself — a hold continuously
choosing which of two targets a running gesture's progress applies to,
with the untouched target's progress held rather than lost or spent — is
the first proof on this page that a pairing can share one continuous
gesture across two targets by steering rather than by gating or aiming;
any future concept wanting one seat to pick where the other seat's
ongoing effort currently counts can reach for it before inventing a
third verb.

---

### §38 THE GALL — a growth that moves once the pinch that closes it lands

**Question.** THE RATCHET's own idea — a mark that moves between presses
so a count cannot be spent standing in one place — has so far only met
`TAPS ON A MOVING TARGET`, a discrete tap. This concept asks whether the
same anti-camping shape reads against `SQUEEZE ONE BODY`'s continuous
pinch instead: a body a seat must find and close by feel, that relocates
the instant it is closed rather than the instant it is touched.

**Silhouette.** A soft nodule riding a raised seam that runs the width of
the hull, four resting points along the seam it can occupy, a duller
colour than the hull it grows from. Health is three closures.

**Mechanic.** `gallPosMilli` places the nodule at one of the seam's four
points; `gallGapMilli` is `SQUEEZE ONE BODY`'s own gap, read exactly as
THE VISE reads it, closing the nodule once the two fingers pinch it shut.
The moment a close lands, `gallPosMilli` jumps to a different one of the
four points — never the one just spent, otherwise the same rule THE
RATCHET's mark already keeps — and the fingers must find it there instead
of pinching where they already are. THE VISE's own forgiving shape
carries over unchanged: letting go early loses no ground, the gap simply
widens back out and the same point is still there to find again.

**Player 1 and Player 2.** Both screens show the seam and the nodule at
its true position — there is nothing to keep from either seat, since
finding it is the whole difficulty rather than a secret one seat holds
for the other. Only whichever seat is nearer the nodule's current point,
by the seam's own geometry, does the closing; the other seat's screen
shows the same point lit but out of reach, so a wide seam asks the pair
to notice together which of them it is nearer to this time, in beat
rather than out loud.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| 1 | The nodule sits at the seam's first point, dull and slack | — | — | — | — | — |
| 2 | The nodule swells, ready to close | nearer seat | pinch it shut (`SQUEEZE ONE BODY`) | 5 beats, gap closing | first closure, nodule jumps to a new point | gap widens back, retry in place |
| 3 | The nodule reappears at a different point on the seam | whichever seat is nearer now | pinch it shut | 5 beats, gap closing | second closure, jumps again | widens, retry |
| 4 | Nodule at a third point, seam pulsing faster | nearer seat | pinch it shut, quicker window | 4 beats, gap closing | third closure, nodule spent, seam smooths flat | widens, retry |

**THE SLOW** opens on every closing window (rows 2–4) — the same argument
`SQUEEZE ONE BODY` already carries at THE VISE, sharpened here since a
seat must first place its fingers on a point neither screen had marked a
beat earlier.

**Presentation.** No camera; the nodule's jump between points is a single
frame, not a slide, so the pair reads it as relocated rather than rolling
— a rolling nodule would read as a target to lead, which is a different
game.

**Animation.** Four poses: slack at point one; swelling under a pinch;
spent and flattened into the seam; the seam's own idle ripple between
closures. The closing pinch draws exactly as THE VISE's own gap-closing
frames do, reused rather than redrawn.

**Colour.** Seam and nodule both a duller cast of the hull's own colour
family — nothing about this body is lit on its own, since what marks a
closing window is the swell, not a colour change, the way THE VISE keeps
its own body unlit until squeezed.

**Payoff.** None beyond the closures themselves — this concept spends its
whole cost on the relocation, and every row is the same gesture read
against a new position rather than a held defensive beat.

**Cost. Very low.** No new primitive — `SQUEEZE ONE BODY` is already
built for THE VISE and THE CYST, and the relocate-on-close behaviour is
ordinary per-boss wiring: a position field with four fixed values and a
jump rule, no new field type.

**Reusable.** Applying "the mark moves so the count cannot be spent in
one place" to a continuous gesture rather than a discrete one — moving
the target on the *gesture's own completion* rather than on a timer or a
touch — is a shape distinct from THE RATCHET's tap-driven relocation;
any future concept pairing a held or continuous gesture with an
anti-camping body can reach for a closure-triggered jump before inventing
a new relocation rule of its own.

---

### §39 THE BURGEE — a flag that will not hold still long enough to aim

**Question.** `FREEZE TAP` has only ever stilled something the *other*
seat was dragging by hand (THE VALVE, THE CYST); `HOLD, THEN SWIPE` has
only ever aimed at a column the hull already holds still (THE SLING, THE
DAVIT). Neither concept has asked a tapped freeze to still the very thing
a held-and-released swipe is aimed at. This one asks whether stilling a
target long enough to read it, then committing a separate seat's aim at
it, reads as a different fight from either gesture answering its own
body alone.

**Silhouette.** A small pennant on a free-swinging boom mid-hull,
sweeping back and forth across the lit columns on its own, never
resting. **Health is two catches**, each a swing stilled by one seat and
released at by the other, plus a lit spindle once both catches have
landed; the spindle takes three ordinary hits.

**Mechanic.** `burgeeSwingMilli` sweeps back and forth across the
columns under the simulation's own clock, never a player's to move
directly. One seat's `FREEZE TAP`, timed against a mark exactly as THE
VALVE reads it, stops the sweep dead for a few beats rather than
stopping whatever a hand is dragging; the other seat's `HOLD, THEN
SWIPE` only lands a catch if the release falls while the sweep is
frozen *and* the swipe's direction matches the column the flag is
frozen over — a swipe thrown at where the flag was still moving a
moment before reads as a miss even if the freeze itself held. A freeze
let lapse before the swipe releases, or a swipe loosed before any freeze
lands at all, springs nothing and costs nothing beyond the beats spent:
the sweep simply resumes, the same forgiving shape THE VALVE's freeze
and THE SLING's draw both already use.

**Player 1 and Player 2.** Identical screens, a freeze-tap half and a
hold-then-swipe half both drawn on every phone; only one is live on a
given catch, and the seat holding each half trades every movement, the
same role-swap-by-movement THE CYST's and THE DAVIT's pairings both use
rather than a fixed left seat / right seat split.

**The beat list.**

| # | Picture | Seat | Gesture | Window | Landed | Missed |
|---|---|---|---|---|---|---|
| **Movement 1 — the first catch** ||||||
| 1 | The flag sweeps loose across the columns, spindle dark | — | — | — | — | — |
| 2 | A column lights | P1 freezes, P2 aims | P1 taps the flag still on the mark (`FREEZE TAP`) while P2 holds, then looses at it once still (`HOLD, THEN SWIPE`) | 6 beats, held together | first catch lands | freeze missed or swipe mistimed: flag resumes sweeping, retry |
| **Movement 2 — the second catch** ||||||
| 3 | A second column lights, roles swapped | P2 freezes, P1 aims | P2 taps it still while P1 holds, then looses | 5 beats, held together | second catch lands, spindle lights | resumes sweeping, retry from row 2 |
| **Movement 3 — the spindle, held caught** ||||||
| 4 | The spindle flashes a colour | that cannon's seat | fire it (`FIRE`) | 3 beats, seen | first hit lands | ordinary hull hit |
| 5 | The flag creeps loose off the spindle | P1+P2, either freezing | freeze and swipe together to recatch it | 3 beats, held together | spindle stays lit | dims, movement's fire beats lost until recaught |
| 6 | Spindle flashes again | that cannon's seat | fire it | 3 beats, seen | second hit | ordinary hull hit |
| 7 | Flag creeps loose a second time, faster | P1+P2, either freezing | freeze and swipe together | 3 beats, held together | stays lit | dims, retry |
| 8 | Spindle flashes white — either colour answers it | either seat | fire it | 3 beats, seen | third hit lands, spindle spent | stays lit |
| 9 | The flag sweeps free once more, spent | — | — | — | — | — |

**THE SLOW** opens on every catch window (rows 2, 3, 5, 7) — a tapped
freeze on one phone answered by a held-and-released swipe on the other,
both judged against a single frozen instant, is a harder read than
either THE VALVE's freeze or THE SLING's draw alone.

**Presentation.** No camera. A landed catch a short taut snap as the
flag goes still; each spindle hit an ordinary shot's flash; a mistimed
swipe a limp flutter with no snap, and the sweep simply picks back up.

**Animation.** Four poses: flag sweeping loose; first catch held;
both caught, spindle lit; spindle guarded, flag creeping loose. The flag
eases into stillness on a landed freeze rather than snapping to a stop —
the same drawn-as-mechanism choice THE VALVE's freeze and THE PLUMB's
lean both make.

**Colour.** Boom and spindle a scoured steel grey, the flag itself a
dull canvas tan that only brightens once caught; the spindle is the only
lit colour on the body, lit in whichever cannon colour a given beat
wants, THE SEAM's and THE OCULUS's rule again.

**Payoff.** Rows 5 and 7 — freeze-and-swipe asked for defensively,
recatching the flag under a `FIRE` step already under way, the same
shape as THE DAVIT's rows 7/9 and every earlier body's own defensive
reuse of its pairing.

**Cost. Low.** No new primitive — `FREEZE TAP` and `HOLD, THEN SWIPE`
are both already built, for THE VALVE/THE CYST and THE SLING/THE DAVIT.
The only new code is the simulation's own free sweep for the freeze to
catch, and the role-swap wiring THE CYST's and THE DAVIT's pairings
already proved out.

**Reusable.** Stilling a body the simulation itself keeps moving, so
that a separate seat's committed release can be judged against a target
neither seat controls directly, is a shape distinct from THE DAVIT's
live-steered aim (where a seat's own hold *is* the target) and from THE
RATCHET's or THE GALL's relocating marks (where the target moves only on
a miss or a landed count); any future concept wanting a target that
drifts on its own, rather than at either seat's hand, can reach for a
tap-stilled sweep before inventing a new kind of motion for a body to
carry.

---

## The reusable boss mechanic library

The brief asks for the primitives extracted. Here they are, and the useful
finding is that **most of them already exist under another name** — the library
is shorter than the brief expected because this game has been building toward it
for months. Each entry says what it would have to support, where its shipped
ancestor is, and which of the fifteen needs it.

Nothing here is a proposal to build a framework. `decisions.md` #20 is the
warning: THE GAUGE's *interlude* category cost a second door, a `Reach` value, a
director tab and an API route before the second one was built, and the owner
retired it. **A primitive earns its name on the second boss that needs it, not
the first.** The three marked **build first** are the ones two or more concepts
above cannot exist without.

### The step machinery

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`BossSequenceStep`** — **built** | One beat of an authored scene: which seat, which gesture, which target, the window in beats, the landed branch, the missed branch, and the next index. Data in `packages/content`, read by index in `sim/`, with the cursor a hashed field the way `spawned` is (`decisions.md` #23) | `sim/instar.ts` — THE INSTAR (§16) is this primitive and nothing else: a pose, up to two marks, three clocks, read by index off `content/instar-script.ts`. The missed branch is the strike (the wave, under the owner's rule), the landed branch is the next index; a scene that wants another branch adds a field. **A step's window is authored long and its need with it** — the owner, 22 September 2026, generic to every choreographed scene: most of a window goes on the pair finding out whose mark is whose, so twenty beats rather than ten, and the need raised in the same breath or the step lands itself; which figure that is on every other boss, and which are left alone, is [choreographed-windows](choreographed-windows.md). **A step's window is also exactly THE SLOW** — the same day, generic: the field runs at a third from the tick the marks come up until the tick the step is answered or missed, never on the landing (`decisions.md` #33, `sim/slow.ts` `closeSlow`) | all fifteen; 16, built |
| **`SequentialAction`** | A step that may not be entered until the previous one landed. Falls out of the above for free | `simon.ts`'s step cursor | all fifteen |
| **`SceneBreak`** | A name over a run of steps, so a script can say which movement each belongs to and a look can spend everything it has on the boundary — the body, the arena and the sound all changing at once. Expressible today as a step with no marks and a long `landBeats`; what is missing is the name | `instar-script.ts`'s five poses, which are a movement each and say so nowhere | the second brief's scene layer; 16 would be rewritten in it |
| **`SimultaneousAction`** | Two commands inside one window from two seats. The window, not the tick, is the unit — a shared *instant* is what [latency](latency.md) forbids | SYNC in `balance.ts`; THE BALLOON's two handles | 6, 8, 9, 10 |
| **`Alternation`** | A step list that requires the acting seat to change, and refuses a repeat | `baton.ts` — THE BATON is whose turn it is, and the refusal is the fight | 10, built |
| **`TurnLock`** | A seat forbidden from sending commands for N beats, drawn as a grey panel | THE WARDEN's clamp, THE MALFUNCTION; `guard-lapse.ts` and `malfunction-look.ts` draw it | 10 |
| **`RestraintGate`** | A step passed by sending *no* command for N beats. The input layer has never had to express an absence | nothing — `world.prime` is the closest thing, and it is a presence | 3 |

### Time

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`Slow`** — **build first** | A span of beats played at a fraction of its wall-clock rate, on both devices. The **boundaries** are a hashed field of `World` so the two agree which ticks are slow; the rate is `tickMs` in `loop.ts` and nothing below it ever hears about it. **Changes `tickMs`, never `ticksPerBeat`** (`decisions.md` #33). Wants `interpolatedBeatPhase` on inside the window, and the input-delay floor re-derived against the rate | `loop.ts`'s one-off `const tickMs`; `interpolate.ts`, written and behind a flag | eleven of the fifteen; 2, 9 and 11 are unplayable without it |
| **`Drag`** | A named set of bodies moving at a fraction of their rate **in beats**, chosen by the script, hashed. A scale on tiles-per-beat, in thousandths. The other currency entirely: this buys the pair *turns*, where `Slow` buys them *seconds* | `sim/grip.ts` scales `grippedFallTiles`; `slowStep` in `slow-fall.ts` is the same idea as a per-kind rule | 1, 8, 10, 15 — and 10 and 15 are unplayable without it |
| **`AfterImage`** | A decaying frame buffer in `Effects`, cleared in `Effects.reset()` or `restart.test.ts` fails | `trail.ts`, `sparks.ts`, `ghost-trail.ts` | 14, and THE GHOST and THE VEIL want it |
| **`DelayedConsequence`** — **build first** | A command's effect arriving N beats later at a named column, queued and hashed. This is what makes *act → reaction → act* possible at all, which is the brief's central diagram | the wave's own `queue`, read by index; `fault-clock.ts` | 5, 13, and any authored scene with a consequence |
| **`CoprimeCadence`** / **`AlignmentWindow`** | The beat on which several independent cadences coincide, computable ahead and drawn | `queen-drop.ts`'s eight-beat bar; `pulse-chart.ts` | 2, 7 — and these two should be **one** primitive, arrived at from two directions |

### Gesture

Every one of these is a member added to `DragTarget` or `Hold["kind"]`, and
`tools/director/test/on-field-controls.test.ts`'s exhaustive switch means adding
one without documenting it **fails to compile** — which is the cheapest
documentation guarantee in the repository and the reason this table is short.

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`BearingDrag`** | A hand going round a circle, reporting thousandths of a turn rather than a distance | `crank` in `drag-targets.ts`, `sim/crank.ts` — shipped, on the panel; wanted on the field | 2 |
| **`PulledMagnitude`** / **`ChargeSum`** | Two seats' drag depths or hold durations **summed** against a target window, with each seat shown half the gauge. The first scalar coupling in the game | `balloon-pull.ts` sums nothing — it asks a threshold of each | 8, 9 |
| **`ReleaseWindow`** / **`MutualRelease`** | A step passed by **lifting**, and two lifts within N beats. **Built by THE SURGE** (9): the lift is a `drag` with `on: false` (`surge-hand.ts`), and the window is `liftTogetherUntil` (`beat-clock.ts`) — a later boss calls it (`copies-table.ts`) | `world.prime`'s explicit `touchUp` | 9 |
| **`FreezeTap`** | A timed tap by one seat that holds whatever the other seat is currently dragging. **The one genuinely new verb on the sheet** (card 11) | nothing | none of the fifteen, and it should be built into the first one that wants it rather than speculatively |
| **`SharedPush`** | One object, two hands, opposite pulls cancel — promoted from an assist to a mechanic, at seven columns wide | THE PUSH, `grip-push.ts`, `grip-push-dir.ts` | 6 |
| **`FeedTarget`** | A place on a boss that accepts a **body** rather than a shot | `resolveIntake` accepts a pod at the hull; nothing accepts one anywhere else | 1 |
| **`InhaleColumn`** | A column that moves bodies **up** instead of down | THE WELL's projection arithmetic, pointed the other way | 1, 9 |
| **`AttachedWindow`** | A target vulnerable only while it is coming loose from its parent | `pods.ts`: a pod hangs, is shot loose, falls | 15 |
| **`TraceDrag`** | A drag whose progress is a **path** — the tiles a thumb has passed, in order, hashed — rather than a depth or a bearing. The largest new hashed field any concept here asks for | nothing. `crank` reports a turn and `instarMark` a depth; neither remembers where the thumb has been | 17, and nothing else — which is why it is a boss rather than a convenience |
| **`SequenceTap`** | Several marks that must be answered in a written order, with a wrong one costing the step. Falls out of `BossSequenceStep` for free if a step may hold one mark and the script may hold many steps | `simon.ts`'s step cursor; §16's cursor | the second brief's sequence category, already shipped as THE SPLICE |
| **`FollowTarget`** | A hold that stays valid only while the thumb keeps up with a body that is moving under it | `grip.ts` — a hand stays on a creature until the creature stops existing, and the creature is what moves | 11, and 17's follower |
| **`RepeatedTap`** | A count of presses on a target that **moves between them**, so the count cannot be spent in one place | §16's `tap` counts grabs on a mark that stands still | the second brief's repeated-tap category — absent here, and no concept wants it yet |
| **`SqueezeGap`** | Two touches on one body, their distance apart read as a depth in thousandths, falling as the fingers converge | nothing — `gesture-unbuilt.ts`'s unclaimed `SQUEEZE ONE BODY`; needs a one-thumb twin refused and the iPhone's native `gesturechange` stopped | 28 |
| **`RubCount`** | A back-and-forth wipe over one body, read as a count of reversals (the touch's x changing sign) rather than a position; pure pointer events, so it survives the voice delay | nothing — `gesture-unbuilt.ts`'s unclaimed `RUB` | 29 |
| **`ChordHold`** | A fixed set of a seat's own controls, two or three, all held down together with none lifting, for a beat count | nothing — `gesture-unbuilt.ts`'s unclaimed `CHORD`; inside the iPhone's five-finger limit at two or three | 30 |
| **`LevelTilt`** | The phone's own lean (gamma) held inside a target range for a beat count, drawn with an on-screen twin | THE CHOIR's shake permission gate; `gesture-unbuilt.ts`'s unclaimed `TILT, AS A LEVEL` | 31 |

### Information

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`PerSeatTruth`** | The same body drawn true on one screen and armoured, still or upright on the other, with a test that holds **both** halves shut | the Queen's two marks, and `queen-split.test.ts` is the test to copy | 2, 7, 8, 11, 12, 15 — the most-wanted primitive on the page |
| **`SplitTerms`** | Two facts, one per seat, that must be combined **arithmetically** rather than just reported. THE VESSEL (11.2) asked for this and never got it | `radarOwner`, `showsRadar` | 11, 12, 15 |
| **`SplitGauge`** | A quantity whose value is on one screen and whose target is on the other | `sinew.ts`, the strain band: the pilot has the zone, the navigator the sum, and neither the other's. `surge-seam.ts` does it again at the other verb | 8, 9, both built |
| **`DescribedTarget`** | One seat shown a shape, the other shown candidates, and no channel but the voice. This **is** [announcing](couplings.md#3-announcing--partly-built), the third coupling | `antiphon-rail.ts` — THE ANTIPHON spends it, and it is the one boss built for a coupling rather than for a question | 12, built |
| **`PerSeatLight`** / **`Darkness`** | A field-wide light budget where flashes are the only sources, and the same world lit differently on two phones | `key-light.ts`, `corner-light.ts`, `unseen.ts` | 14 |

### Consequence

| Primitive | Must support | Ancestor | Wanted by |
|---|---|---|---|
| **`StepBack`** — **build first** | A missed step that returns the scene to the previous index rather than losing the wave. The brief's clearest ask — *"FAILURE should usually NOT immediately mean YOU LOSE"* — and the thing the game most conspicuously lacks: `wave-fail.ts` loses the whole wave on a hull hit, and THE MIRROR's own design says a wrong step *"is the wave lost… the whole wave is played again from the top"* | nothing. This is real new machinery and it is what separates a scene from a fight | all fifteen |
| **`Breach`** | A hull column that is open, widening and answerable — a place, not just a scar | `hull-damage.ts`, `scars.ts`, `hull-break.ts` | 13, and THE HIVE (11.14) |
| **`SpendLedger`** | A rolling per-colour count of the pair's own commands, hashed | `spend.ts`, a field of `World` rather than of THE TASTER, which is the boss it was built for: the ledger *fixed and learnable* allows any boss to read | 4, built |
| **`SpentBody`** | A boss whose arrivals come out of its own health, so its life and the pair's time are one number | `scuttle-step.ts` — every body THE SCUTTLE throws is a part off its own frame | 15, built |
| **`Occluder`** | A body that changes how the bodies behind it are drawn. `render/` has no z-concept for "dimmer, behind a membrane" | `veil-look.ts` comes closest and does not occlude | 6 |
| **`InvertedWeakPoint`** | A body vulnerable to the colour it is **not** | `colour-armour.ts` says which colour hurts a body; this says which does not | 4 |

**The four to build first, and in this order:** `BossSequenceStep`, `Slow`,
`DelayedConsequence`, `StepBack`. Those four are a **choreographed boss engine**
and nothing else on this page is reachable without them. Every one of the fifteen
then costs what `decisions.md` #20 says a round costs — one wave entry, one
`config-<name>.ts` block, one control set — plus its own state and its own
picture.

---

## The five signature candidates, and where half B goes

The brief asks for five showcase encounters at 20+ steps. Naming them is the end
of this half; writing them is the next, and the choice is made on three grounds —
a payoff frame nothing else in the game can make, a split that could not exist on
one screen, and a mechanic that spends shipped machinery rather than inventing
it.

1. **[THE UNDERTOW](#13-the-undertow--where-you-are-being-hit-from)** (13) — the
   ship is the stage, which is this page's answer to the brief's camera section.
   A boss taken *into* the hull is a finish nothing else can have.
2. **[THE CANDLE](#14-the-candle--whether-you-can-act-in-the-dark)** (14) — the
   deepest version of the information split the renderer can express, and two
   beats of black is a frame no other game on a phone would dare.
3. **[THE THROAT](#1-the-throat--what-you-feed-it)** (1) — the only boss answered
   by giving it something, built entirely out of a gesture that shipped two days
   ago, and the eversion is the best single animation on the page.
4. **[THE ORRERY](#2-the-orrery--whether-you-can-agree-on-when)** (2) — the
   concept that proves `Drag` has to exist, and the one whose whole difficulty is
   two people describing two half-pictures of the same machine.
5. **[THE LEDGER](#5-the-ledger--whose-body-takes-it)** (5) — the brief's own
   diagram, *act → consequence → answer it → act*, as a whole boss, and the only
   fight in the game that ends with a scripted hit the pair is told to take.

Two that did not make the five and are worth arguing about: **THE BATON** (10) is
the cheapest thing on the page and the best **test of the whole premise** — if
alternation at tempo is not fun, most of this page is not either, and it should
probably be built before any of the five. And **THE ANTIPHON** (12) would build
[announcing](couplings.md#3-announcing--partly-built), the last unbuilt coupling,
which is worth more to the game than any spectacle on the list — it is off the
five only because its cost is the owner's eye rather than a lane's week.

**Open, and for the owner.** Three things on this page need a decision before any
of it is worth starting, and all three are named rather than guessed at:

- **`StepBack` or not.** A scene that rewinds a step is the brief's design and it
  is not this game's: a hit loses the wave, everywhere, today. Softening that for
  bosses only is a real change to what a wave *is*, and it is the one thing here
  that reaches outside `bosses.md`.
- **~~Whether the slow is allowed at all.~~ Decided: it is.** The owner ruled on
  16 September 2026 and `docs/decisions.md` #33 carries the mechanism. What is
  left of the question is one implementation call somebody has to make rather
  than ask about: **the input-delay floor is counted in ticks**
  (`link-run.ts`), so inside a third-rate window the felt lag from thumb to
  picture triples at exactly the moment the drama peaks. It has to be
  re-derived against the rate, and whoever builds `Slow` owns that or the
  first window will feel broken rather than dramatic.
- **Answered, and by building them.** Fourteen of the fifteen were built
  inside two days of being written, so the question of how many were wanted
  turned out to be *all of them*. What that leaves open is the reverse: the
  act structure still has empty slots, and nothing on this page is queued to
  fill one.

