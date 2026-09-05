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

## 6.5 THE LOCK — the same hand, read a second way, built

While **player 1** has a hand on a body, every shot the cannon puts out steers
into it and lands, from whatever column it left the muzzle in. Take the hand
off and a bolt already in the air stops steering and finishes its climb
straight up from wherever it had got to. `sim/lock.ts` is the whole rule and
`render/lock-mark.ts` the whole picture.

**It is not a new gesture.** It is 6.4's, held by the seat that owns the
cannon. That matters because the price is already built in: a thumb on the
field is a thumb off the strip below it, so a pilot who has locked a body
cannot move the cannon while they hold it. The shot goes where the hand is
*instead of* where the muzzle is — a trade rather than an addition. Player 2's
hand stays a brake and locks nothing.

**It takes the column out of the conversation and leaves the colour in.** The
lock says nothing about what a shot is loaded with, and player 2 holds both
lobes, so a locked bolt of the wrong colour arrives and bounces exactly as it
always did. The sentence the pair says shortens from *"third from the left,
cyan"* to *"cyan"*, and that is the whole of what this is for: the naming of a
column is the thing a pilot can now do with a finger, and the naming of a
colour is the thing they still cannot.

**Two bodies are held and not locked**, and both refusals are one sentence — a
mark that promises a hit must not be drawn over something a shot cannot answer.

- **A rock**, which cannot be shot at all. Rocks are the point of 6.4, and a
  lock on one would turn the pilot's own assist into a wall eating every bolt
  the pair fires for as long as the hand stays.
- **A ghost**, whose column is the secret and whose secret is kept from player
  1 exactly. A shot that found one without the pilot being told which lane it
  was in would be that creature undone.

**There is no cap on how fast the bolt slides sideways**, and that is a
decision rather than an omission. The rule is a pure proportion — the shot
crosses the same share of what is left sideways as this tick's climb is of what
is left upwards — so it arrives exactly, whatever the two distances were. A
speed limit would be a number that decides, for some pairs of distances, that
the frame drawn round the body was lying. A body nearly level with the muzzle
and far to one side is therefore answered by a bolt that whips almost sideways,
which is what reaching it means.

**A locked shot passes through nothing.** It sweeps its column like any other
bolt, so a body that wanders into the diagonal is met first and stops it. The
lock aims the shot; it does not excuse it from the field.

**Where it is live.** Everywhere there is a field to put a finger on, which is
every ordinary wave and no round: THE GAUGE, SNAKE, PINBALL and THE FLEET take
the picture away and have no creatures for a hand to land on. It needs no
switch on the panel and has none — the grip is the gate.
