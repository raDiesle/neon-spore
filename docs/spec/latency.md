# The hard constraint: voice delay

> **Status: built into the timing.** The 4-second rule is satisfied by the
> field geometry, and the beat exists. The measurement with two people has not
> been done.

Communication runs over Discord or WhatsApp: **0.5–2 s delay**. A complete
announcement chain including noticing and reacting: **2.1–3.6 s**.

**The rule:** every creature whose defeat requires an announcement needs at
least **4 seconds** from becoming visible to impact, better 5–6. Creatures that
need no announcement may be arbitrarily fast — the contrast is a design tool.

**The beat solves part of the problem.** An audible pulse is a shared clock.
Instead of "now!" — wrong by the time it lands — you say "on the three", which
stays true however long it takes to arrive.

## How the geometry satisfies it

The bottom row is the hull, so a creature entering at row 0 travels
`rows - 1` = 14 beats. At 96 BPM that is **8.75 s**, with room to spare.

This is why `rows` is a fixed field of `SimConfig` and not derived from the
tile size: two devices that disagree about the height of the field disagree
about when a creature reaches the hull. The tile shrinks to fit instead. See
`hullRow()` in `packages/sim/src/config.ts`.

## Still to measure

The 600 ms trigger window (`guardWindowMs`) decides whether the shared defence
feels precise or mean. It has never been measured with two people over a real
voice channel. `docs/decisions.md` #10 proposes a second config preset so two
values can be compared side by side.
