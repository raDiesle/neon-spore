# Assist mechanics

> **Status: one of three built.** **Keep watch** is in the raster game as
> THE GRIP — see 6.4, which also answers the objection this file used to end
> that section with. Share sight and the reserve are still unbuilt, and one of
> the three existed only in the retired free-flight prototype.

**Why they exist:** to cushion differences in ability. Two people are rarely
equally fast; without a counterweight the pair stops playing — not out of
boredom, but because one of them constantly experiences themselves as the
brake.

**Two principles for every form:**

1. Help costs the helper something, and the price is visible to both.
   Otherwise the stronger player quietly plays for both and the weaker one
   watches.
2. Every form works **in both directions**. Otherwise one role is permanently
   the one in need of help — even when it is played better.

## 6.1 The three forms

| Form | Action | Price |
|---|---|---|
| **Share sight** | Release your half of the radar to the other | Your own radar image gets fainter |
| **Keep watch** | Hold a finger on a creature: it is marked and moves slower | Your own main action is blocked while the finger rests |
| **Reserve → slow motion** | Tapping fills a store that only the other can trigger | Tapping time instead of playing time |

**Share sight** is symmetric by nature: the pilot gives away the queue (*which*
are coming), the navigator the traces (*where* they are coming). Each has half
a radar to give. It is the quietest form of help — pure information, no action.

**Keep watch** is, for the pilot, the held marking from
[couplings](couplings.md) — not a new gesture, the same one with a lasting
effect: while the finger rests, the mark stays and the creature slows; your own
cannon is idle. For the navigator, fire stops instead, and the pilot sees the
creature highlighted and slowed. It is the only form where the help happens
visibly in the field instead of in a readout.

**Reserve** is tied to slow motion rather than abstract — a store with no
recognisable effect explains itself to no one. Both fill, both trigger, but
never their own store. Help has to be accepted.

> **Keep watch was re-thought rather than ported** — see 6.4. The objection
> stands as it was written: a creature may not skip a beat, because the beat
> is the shared clock.

## 6.2 Unlocking

No hidden handicap, no adaptation to measured performance. Every pair gets the
same tools at the same time; whoever needs them uses them more.

**Ordering principle:** every assist form is a variation on a verb both players
already know, and appears one or two waves after the system it borrows from. So
a new gesture never has to be explained, only a new purpose.

| From wave | Form | borrows from |
|---|---|---|
| ~4 | Share sight | radar |
| ~8 | Keep watch | marking |
| ~12 | Reserve → slow motion | slow-motion power-up |

Share sight first, because it blocks nothing — it is what makes the word "help"
thinkable inside the game at all. The reserve last, because it is the only one
that introduces a new readout.

Unlocks get the same animated preview as new creatures — and the same rule:
**only on the very first appearance**, remembered across restarts.

## 6.3 Rejected

**An open handicap chosen before the game starts** (a larger sync window or
slower creatures for one device). More honest than hidden easing, but the
staggered unlock achieves the same thing without labelling anybody.

## 6.4 THE GRIP — keep watch, built

A finger held on anything falling drags at it: it keeps
`gripSlowPermille` of its speed for as long as the finger stays, and two
hands compound. Nothing else changes — no column, no colour, no state the
other systems read.

**What the objection above got right, and how it is answered.** The beat is
untouched. A gripped creature still lands on a tile centre on every beat like
everything else; what changes is *how many tiles*, and the fraction that
leaves over is carried in thousandths (`dragMilli`) rather than rounded away.
So a slick, which falls one tile a beat, can fall at 55% of that — it stands
still on some beats and moves a whole tile on others, and the clock both
players are counting never moves.

**It does not need marking.** The spec tied keep watch to the held mark from
[couplings](couplings.md); the grip is its own gesture, on a part of the
screen that answered nothing before. Marking has since been built, as THE
LANCE, and it holds a *column* rather than a body — so it is still not the
gesture keep watch was written for, and it no longer has to be.

**The price is the hand.** Not a blocked action in the rules — nothing in the
simulation refuses a command from a player who is gripping — but the thumb
itself: it is on the field, so it is off the strip below, and a player holding
a rock is a player who is not moving their own control. Both principles at the
top of this file hold: either player may grip anything, and both screens are
told who is holding what, in words.

**Rocks are the point.** A rock cannot be shot. Before the grip, a second pair
of hands could do exactly nothing about one; now it can buy the shield a beat
to reach the column.

**Where it is taught.** `THE HAND` (wave 6) is three rocks arriving on the
same beat in three columns, against one shield — the arithmetic does not work
without a hand, and holding two of them turns one impossible beat into three
possible ones. `IN ITS SHADOW` (wave 11) is the one that has to be played to
be believed: a rock absorbs your own shots as well as everything else, so a
creature falling right behind one cannot be hit at all until the rock is gone,
and by then it is on top of the hull. Holding the creature back is the only
opening, which makes it the one wave where you grip the thing you are trying
to destroy.

**Not yet, deliberately:** the unlock schedule in 6.2. The grip is live in
every wave from the first, because what it needs first is play, and gating it
behind wave 8 would mean nobody had held anything for an hour.
