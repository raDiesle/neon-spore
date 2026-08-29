## `a8f7fc9` — the controls page

> on the controls page, can you find every thing you can touch on the field itself — what it looks like, whose it is, and whether you press it, hold it or drag it

- **badge** implementation
- **subject** the CONTROLS tab (renamed from CONTROL SETS) of GAME MECHANICS, and `docs/spec/controls.md`
- **changed** CONTROLS now holds PANELS (unchanged), ON THE FIELD (grip, THE MAZE's string, THE WARDEN's tether, the guide's hold) and TRIED AND SET ASIDE (hold-to-tear)
- **decide** does each ON THE FIELD row read true against the running game — where it appears, whose it is, and whether it is a press, a hold, or a grab and drag
- **before** in-screen controls had no name, no list and no page; only `touch.ts` itself said what existed
- **after** a CONTROLS tab with three inner tabs, and one prose copy in `docs/spec/controls.md`
- **where** director → ▣ GAME MECHANICS → CONTROLS
