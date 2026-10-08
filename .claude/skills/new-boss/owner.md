# What the owner has said he likes, and does not

The record `.claude/skills/new-boss` §7 names — its own page because it is the
one part of the skill that grows with every boss he tests, and the skill is
held to 250 lines (`packages/sim/test/limits.test.ts`).

On record, with where. **This list is his to grow — add a line every time
feedback on a boss says one, with the date, in his words where he gave them.**

**His rules for every boss — the lines he marked *generic* or *for all
bosses* — are `generic.md`, next to this page.**

- **Dislikes, in his words:** THE TELL, built and removed on 11 September
  2026 — *"I do not like it and its hard to understand for players. too far
  away from the actual game setup and how it should feel."* A rule table
  drawn on the boss is still a rule table; a boss the pair has to be taught
  three symbols for before the first beat means anything is not a boss of
  this game (`bosses.md` §11.9). **Every new boss is read against this.**
- **Dislikes, in his words:** THE DAVIT, built 26 September and removed
  on 8 October 2026 — *"i do not like it. and its short to play."* One seat
  dragging a boom for the other's swipe, nine short steps and three shots:
  over before the pair had learnt it. **A boss has to last long enough to be
  learnt and then played** (`bosses.md` §11.52).
- **Likes** the field to look like the field: the ship, the band and the
  background stay in a round, the controls are drawn in the default set's
  style — THE PULSE was rebuilt to this, PINBALL made the cannon the
  mechanism (`interludes.md`, §11.7–11.8).
- **Likes** the beat list that will not advance until the beat is performed,
  and the two players given different jobs in the same beat — A Way Out's
  co-op minus its camera (`bosses-choreographed.md`); and asked for the third
  kind above by name on 17 September 2026 — pulling a hand off, pushing a
  weapon back, opening a vault — *with very nice animations and graphics*.
- **Likes** one meter that is *ours* over two that are mine and theirs, and
  what fails to fall through the picture — *let the arrows who were incorrect
  fall inside the ship like meteors do* — over a number going down (§11.8).
- **Likes** the boss to announce itself — *indicated when he will look next
  with some nice animation* (THE STARE, §11.16); a handle that reads as
  something to pull (THE WARDEN, §11.4); a thing bursting like what it is —
  a ring under pressure bursts like a sac (`effects-spark.ts`).
- **Likes** the two seats coupled in the verbs alone when the picture is
  better shared: PINBALL's table is on both screens, against advice (§11.7).
  A split is the encounter, not a decoration.
- **Likes** a colour spent when the picture needs one, over a rule kept — the
  clown's nose (`palette.ts`); and slow motion on the dramatic action, if
  both screens start and end it together (`decisions.md` #33).
- **Said twice more, 19 September 2026:** *in general, when I build mechanics
  or bosses, I expect they are easy to understand and follow by players. No
  complex logic which players cannot understand. Also players may be in
  another language, so easy and short words are crucial*; and *better to skip
  hard to understand mechanics of bosses*. That is THE TELL's verdict made
  general, and it is now a rule in §2 rather than a preference here: when a
  design and its simplicity disagree, the design loses.
- **Rules he set:** every hull damage fails the whole wave (12 September
  2026, `wave-fail.ts`); a round is never repeated; no health bar; nothing
  written for the pair to read aloud; a look is never changed under him
  unasked (`docs/looks.md`); a picture is sent, never described; nobody asks
  him whether to push.
- **Dislikes, in his words:** THE BELLOWS, played and removed on 24
  September 2026 — *"it's not clear to me how to play … what does 'push'
  means? … it's not clear what is goal … why on a curtain a jam is going out,
  no logical understandable where the connection is."* A spark the shield
  could not answer, from a lung nobody could say why it was pulled, is a
  cause and effect with no connection a player could see; THE INSTAR is his
  counter-example, *we have to open mouth so we can pull tongue — clear
  understandable*. **Every gesture needs a reason the picture gives**
  (`bosses.md` §11.35).
- **Known gestures are fine; a sequence is not a story.** THE GRINDSTONE,
  removed on 8 October 2026 because he did not like it: *known gestures are
  fine for a new boss, but the story has to be good, with more levels and
  variation* (his words, translated). Grind a flat, then clamp a caliper, nine
  steps of the same two asks, was one level played twice with no reason in
  the picture for either. Reusing spent gestures is not the fault; a boss
  still needs a story the pair can follow and **levels that change what is
  asked**, not the same ask again (`bosses.md` §11.50).
- **The gesture is the defence against what the picture is about to do**,
  25 September 2026, on THE INSTAR: *its not logical to me why we need to
  open mouth to succeed. more sense makes that the enemy already has open
  mouth to spit out fire like a dragon … and we have to close the mouth, so
  he cant spit out the fire.* So a step shows the threat already coming — a
  fireball growing in the jaws, eggs rumbling on the back, a tail swinging
  in — and the gesture stops it, and **a missed window is drawn as the threat
  carried out**: the fire over the whole field, the brood hatching and eating
  the ship, the tail hitting the hull. He asked for the entrance to *create
  some excitement* — slow, small in the background, flying at the screen —
  and for the body to leave and come back between steps, so a turn of
  perspective is something it flies into rather than a cut.
- **A turn the pair takes in order shows whose it is, on both screens**,
  25 September 2026, on THE FILAMENT: *not clear when following is correct or
  not … glow red before … player 2 should more clearly see what player 1 is
  doing … some timer when it is too late to follow.* So both thumbs are on
  both screens, the own ring green when its move is open and red with *WAIT*
  when not, arrows march the way the thumb goes, the window between them is
  drawn, the partner the line waits on wears the waiting clock, and a line
  standing still has a clock of its own that strikes the hull — any fault
  loses the wave. A landed round is *PULLED* in green with how many are left
  (`render/filament-turn-draw.ts`, `sim/filament-turn.ts`).
- **A look he cannot see is not a look**, 27 September 2026, after eight
  VERSUS candidates in a day he could not tell from the shipped picture: *do
  not try to improve visuals which are barely seen … improve the overall body
  shapes … that they look 3d and move natural … tilt and turning body pieces
  … also for bosses which are not living like but machine like.* A boss's
  enhancement is its whole body — shape, depth, pose, a visible tilt, pieces
  turning — never a few pixels on one part. Movement given to a part that is
  still today is new, so it goes straight into the game rather than to VERSUS
  (*why brand new should be on versus page and not build all of it directly
  into game?*). The test and the reasoning: `docs/looks.md`, *Big enough to
  be seen*.
- **A boss keeps the pair busy for 30 seconds or more, and is not a shipped
  boss again**, 27 September 2026, answering THE WINCH and THE SLUICE, which
  were THE DAVIT's gated draw with a chord or a pinch in place of the lean. A
  control step a shipped boss already plays may come back **as one state among
  several**, in a boss that looks exciting and different from the one that
  had it first. When that step is most of the boss, *skip it and create
  something fresh and cool with more states*.
- **No wave needs a tilt sensor or a key a player must learn**, 27 September
  2026, on THE PLUMB: *what if a phone does not support it or its played on
  desktop. i do not want to force using new keys.* THE PLUMB's lean became
  two pulls that must weigh the same in sum.
- **A hazard reads as a threat, never as a severity**, 28 September 2026,
  on THE VALVE's two sparks: *why it should look "worse"? ship hull of
  players can only hold one damage type and then needs to repeat wave.* A
  hit costs the wave whichever hazard lands it, so a second of anything is
  drawn as recognisable as the first, not worse than it.
- **A boss's own count is kept, never started again; and nothing slows
  for it**, 2 October 2026, on THE OCULUS: *when player stops hold, it
  should keep current position of process … i want to use regular standard
  process indicator for bosses, to show above boss - but without slow for.*
  THE OCULUS became three levels (hold, tap, turn like THE MAZE's lever),
  each count kept when a hand comes off, with a wave fought round it.
- **An answer is carried, not shot, when shooting would confuse; and a
  thing to be described is never in a control's colour**, 5 October 2026,
  on THE ANTIPHON: *the colours should be all green of organs, so it does
  not confuse with colour of e.g. cannon which confuses and players think it
  needs to be shot.* The candidates became three times the size, joined to
  the organ's place by veins, and dragged down one — THE FILAMENT's path —
  a decoy losing the wave; the seats swap every level, the siren says whose
  job is which, and the second time indicator went for the standard slow
  meter.
- **A boss that bites the field is seen on it, and its controls change
  each stay**, 5 October 2026, on THE LAMPREY: *the boss head is not
  visible and behind the ship, this looks weird. instead i suggest the boss
  should jump across the full screen area in random positions … use the
  default visuals for on screen controls we have … i suggest we change
  controls for every jump.* The eel became a leap from tile to tile, each
  further than the last, each stay a different ask under THE SLOW, with the
  shipped pull knobs; its living look is a lane of its own.
- **A shot gets time; a tap gets none of THE SLOW; and both seats work
  at once**, 6 October 2026, on THE GOVERNOR: *there must be more time to
  shoot with cannon controls — this is generic feedback for a good
  default*; *apply no slow if tap control is required — only on action on
  the top of boss or shooting with cannon*; *both players need to do
  something at the same time*. So a fire step's default is eight beats
  under THE SLOW, two chances at whatever it is aimed at, a tap step is
  short and at the beat's own rate, and a boss with one seat holding while
  the other acts is the shape he finds boring. THE GOVERNOR lost its brake
  for a mark each, numbered later and taken in order, and its shot is aimed
  at the needle rather than the body.
- **Dislikes, in his words:** THE HALTER, built 26 September and removed on
  8 October 2026 — *"I do not like the concept at all. and holding is bad
  visual and boring (not enough clear feedback that during holding first
  beats its the correct action player has to do). its boring to just hold."*
  A hold whose first beats look the same right or wrong is no feedback, and
  a seat asked to do nothing is THE GOVERNOR's boring shape again. He kept
  one idea from it: **shells taken off a body, one after another** — a body
  in layers, each layer a different action, the body smaller each time, and
  a picture of each layer won (`bosses.md` §11.53, *Retired*).
- **Dislikes, in his words:** THE TRIVET, built 26 September and removed on
  8 October 2026 — *"remove this wave from game. i do not like it."* No
  reason given; read with THE HALTER's verdict the same day, a boss whose
  every step is a seat holding pads down for a count is the hold he called
  boring, and a chord's first beats look the same right or wrong
  (`bosses.md` §11.47, *Retired*).
- **Open, for his feedback:** which of the three kinds the next one should be;
  how many gestures a scene may ask for in a row; whether a scene's gesture
  may be a swipe or a turn the default set does not have yet; and every boss
  he tests — one line here per verdict.
