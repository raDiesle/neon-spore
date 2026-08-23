# Open questions

> **Status: this is the live list.** Questions that have been answered move to
> `docs/decisions.md` and leave a line in "Settled" below. Questions that were
> made moot by a decision are struck out rather than deleted — the reasoning is
> worth keeping.

## From the move to space

These arrived with the setting change and nothing has been decided about them.

**S1. What justifies colour now?** The marine fiction had a clean answer:
colour is bioluminescence, and a matching shot shatters the light organ by
resonance. The structure is worth keeping (a property of the creature that a
matching shot resonates with) but it needs a reason that fits a void.

~~**S2. Do the creatures stay sea life?**~~ **Settled:** no. Renamed to a
blob-and-slime vocabulary, with the three naming rules in
[bestiary](bestiary.md#naming). `docs/decisions.md` #13.

**S3. What is the hull, in the fiction?** "You are a bubble in an ocean" no
longer holds, and it was carrying the tone: not the warriors, the fragile
thing. The fixed hull with a sliding cannon reads as a station or a wreck more
than as a creature. What keeps the fragility?

**S4. What does the field look like?** `packages/render/src/field.ts` still
describes its background as "deep-water" and draws a purple radial gradient. It
happens to read fine as a nebula, but nothing has decided that it is one.

**S5. Does the name still point at the right thing?** *Neon Spore* was chosen
as organic-plus-science-fiction. Against a space setting the "spore" half is
now doing more work than it was asked to. Probably fine; noted because the
trademark search is still outstanding either way.

## Design

1. **The tone of the fiction:** "a fight against a fleet" has become "an
   encounter with an ecosystem". Does chasing a high score still fit that?
2. **Scars on a membrane:** a bubble with scratches makes little sense. Dents
   and cloudings? Or does the bubble become an armoured cockpit with an energy
   shell? *Partly answered by the raster: the hull is armoured and its scars
   are built. The question survives for whatever the fiction makes the hull.*
3. **Swapping roles:** with two devices there are no screen halves to swap —
   different controls would appear on your own device. Unproblematic as a
   replay incentive after a run; questionable mid-level.
4. ~~**Charging vs. evading:** whoever charges has their thumb occupied.~~
   Moot — there is no evasion.
5. **The runt instead of an escape pod:** not shooting a helpless young thing is
   stronger, but more unpleasant. Is that wanted?
6. **The ignition-lock mechanic** (announcing a three-digit code) needs about
   6 s with the delay. Shorten it to two digits?
7. **The veil** is stylistically a foreign body — wanted,
   because it hides?
8. **A meteor with no glow of its own** could get lost in the neon picture.
   *Built and it reads: the meteor is matt against the glow, and its craters
   give it a silhouette.*
9. **Swarm behaviour vs. choreography:** loose swarms contradict the fixed
   choreography. Compromise: fixed starting position and count, loose behaviour
   after that.

## From the later rounds

10. How does the Blind One's interference visibly differ from a real
    disconnection? Also concerns the general network indicator, which does not
    exist yet.
11. Does a wave with a modifier count as its own wave or as a variant? Affects
    the numbering and therefore the save points.
12. May two assist forms run at once? Sharing sight costs no thumb, keeping
    watch does. Proposal: at most one holding form.
13. Does keeping watch also slow creatures in a ramming attack? The mark goes
    out there ([couplings](couplings.md)) — the watch would then be worthless
    exactly when it is needed most.
14. **Trust mode** (deliberately giving information only indirectly) — deferred,
    overlaps heavily with act 9.

## From the raster round

15. ~~**Which control model becomes the game?**~~ **Settled:** the raster.
    `docs/decisions.md` #2.
16. **Is the shared ward fairly distributed?** Player 2 sets up in space,
    player 1 hits in time. Timing under a voice delay is the harder job, so
    player 1 carries the more thankless half. Check whether that is felt as
    unequal in play, and whether the roles should swap between acts.
17. **Does the hull stay mute?** It is now the only element nobody operates.
    That is calm and readable, but it could contribute something (repair?
    switching segments off?). Deliberately left open rather than filled in
    prematurely.
18. **The size of the trigger window.** The prototype ran **600 ms**
    (`guardWindowMs`) and the port now runs **900 ms**; the 260 ms once quoted
    in section 2.2 was guessed and never in any running code. Measure it with two people over a
    real voice channel — the number decides whether the mechanic feels precise
    or mean.

## Settled

- **Network model** → delayed lockstep, local timestamps, Durable Objects.
  `docs/architecture.md`, `docs/decisions.md` #8.
- **Idle tapping** → the Reserve, tied to slow motion.
  [assists](assists.md#61-the-three-forms).
- **The Vessel as an arithmetic task** → re-read as an announcement.
  [bosses](bosses.md#112-the-vessel).
- **Randomness in the prototype** → waves are drawn from a generator seeded
  with the wave index: same wave, same run. Only what one knows and the other
  does not stays random. [structure](structure.md#73-the-randomness-rule--built).
- **One assist mechanic built** → "keeping watch", in the free-flight
  prototype, including a visible price. Retired with that prototype.
- **The name** → Neon Spore. `docs/decisions.md` #1. The trademark and
  app-store search is still outstanding.
- **The control model** → the raster. `docs/decisions.md` #2.
- **Guard window** → 600 ms, from the running code rather than from the spec.
  `docs/decisions.md` #9.
