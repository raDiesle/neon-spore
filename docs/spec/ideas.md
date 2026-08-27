# Idea store

> **Status: none of it built.** Accepted in principle, not worked out. Nothing
> here is a commitment; an idea leaves this page by being designed into
> [bestiary](bestiary.md), [systems](systems.md) or
> [wave-design](wave-design.md), or by being rejected in
> [open questions](open-questions.md).

## Accepted, not yet worked out

An idea's sub-heading says **what it would become**, not how far along it is —
nothing on this page is built. A creature is a thing that falls down the field
and gets a silhouette; a mechanic is a rule the field plays by; a control is a
change to what a player's own hands do; a boss is a whole encounter waiting for
one of the slots in [bosses](bosses.md). The director's backlog page groups by
these four, so an idea that is filed wrongly is one edit here away from being
filed rightly, and there is no second list to change.

### Creatures

- **Echo** — a creature appears one second earlier for one player
- **Reverb** — repeats an action with a delay (a different thing from the Echo;
  see the name clash in [bestiary](bestiary.md#103-examined-and-rejected))
- **Countdown creature** — can only be hit at zero
- **Moulting**
- **Symbiosis** — only vulnerable while the two are far apart
- **Camouflage** — goes out when you take aim, so you have to aim beside it
- **The Colony** — spreads, hatches darts; absorbs the brood fibre and the root
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

### Bosses

Three encounters worked out far enough to be worth keeping, set aside when
[The Warden](bosses.md#114-the-warden--the-eye-that-takes-a-hand-off-you) took
the slot they were competing for. Each names the slot it would fit.

- **THE WEIGHT** — a boss held up by hands alone. A heavy sagging sac on a taut
  stalk, the only boss that descends continuously instead of holding a row, and
  the only one with no weak point at all until it has been dragged below a
  line. Two hands stop it dead, but two hands on the field is nobody firing, so
  it falls again the moment you let go to shoot; it sheds ballast rocks while
  held, so holding is never free. The whole fight is the rhythm of hands on and
  off, negotiated out loud. Its animation — the contour deforming toward the
  finger, the skin going taut and bright along the line of pull — was taken for
  the Warden's tether, so what is left here is the mechanic. Slot: The Heart
  (60), whose pillar it fits better than a pulse would
- **THE CHOIR** — warding turned into a weapon. Three small bodies suspended in
  one soap-film membrane, drifting apart and snapping back into a single merged
  contour when they sing in unison. Immune to shots: it takes damage only when
  the navigator's shot **lands on the same beat** the pilot hits the guard
  trigger — the built warding coupling ("column four, I trigger on the three")
  pointed upward instead of down. The Whisperer's pillar
  ([bestiary](bestiary.md#102-newly-accepted)) at boss scale, and the one idea
  here that needs no new rule at all. Slot: The Choir (40)
- **THE CODEX** — it rewrites what a colour means. A slab-bodied thing whose
  skin carries a scrolling glyph pattern, the Glyph creature grown up. It swaps
  what red and cyan *do* for one player without telling them, and the current
  key is legible only on the boss's own skin, which only the *other* player can
  read. Grounds **Interference** and the **Codebook table** below in one object
  rather than two systems. Slot: The Codex (80)

### Mechanics

- **Reverse wave** — from below
- **Light traces**
- **The Needle** — a geometric corridor

### Controls

- **Interference** — one player's colours are swapped and they do not know it
- **Bearing waves** — a coordinate grid, a change of controls
- **Codebook table**
- **Inverted instructions** — the Spaceteam principle

## Deliberately deferred

- **Cracks in the cockpit** — a downward spiral
- **Freighter** — overlaps with the runt
- **Chain reaction** — overlaps with the bearing waves
- **Spread shot** — too close to the standard weapon
- **A voice channel inside the game** — stays external
- **THE CONDUCTOR, bending the tempo** — a boss drawn as a pendulum arm
  sweeping the top of the field, an open contour rather than a body, whose arm
  position *is* the tempo: it speeds the beat up and slows it down, and the grid
  pulse, the shield's queued move and the fire cooldown all follow. Deferred
  rather than rejected, and deferred for one reason — the shared beat is what
  makes an announcement survive a 0.5–2 s voice delay
  ([latency](latency.md), `docs/decisions.md` #2), so a boss that bends it is
  attacking the load-bearing wall. The slot keeps the name; if something is ever
  built there it should bend something else. The pendulum shape survives the
  objection and could be spent on any of them
- **A "without words" mode** — possible as a self-imposed rule, but never
  measurable; see [the speech rule](overview.md#12-non-negotiable--speech-is-never-evaluated)

## Note

Several of these were written for free flight and assume an aim beam or
evasion — camouflage ("aim beside it"), the bearing waves, cracks in the
cockpit. They are kept because the communication idea inside them survives the
control model; the gesture does not. Anything moved off this page has to be
re-grounded in the cannon, the shield and the beat.
