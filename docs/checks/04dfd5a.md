## `04dfd5a` — hold to open the guide, in the director

> in the director with BRIEFINGS on, hold the mouse on the stage after the guide — do the circles fill where you can see them, and does the wave start when they are full?

- **badge** implementation
- **subject** the two ready circles under a wave's guide, in the director
- **changed** the director never told the simulation a wave had a guide, so the guide (and the circles under it) never appeared there at all; a hold now fills them, the same gesture the phone uses
- **decide** does a held click on the stage fill both circles where you can watch them, and does the wave start the moment they are full?
- **before** nothing — a click straight through the introduction and the wave was already playing, guide skipped
- **after** the introduction, then the guide card, then a held click filling two circles before the wave starts
- **where** `DIRECTOR_HOST=127.0.0.1 bun run dev`, TEST tab → wave 1 FIRST STEP, with the BRIEFINGS toggle on
