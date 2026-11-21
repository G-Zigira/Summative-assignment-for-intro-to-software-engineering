# ADR 0002: Local save strategy

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

Progress must persist without accounts (NFR 1). `localStorage` can be unavailable, full, or
return unreadable data (FR 3.5, NFR 8). A save bug can destroy a player's progress, so saving
must fail safely.

## Decision

1. Store **one JSON record** in `localStorage` under `sankofa-trails/save`, with a `version` field.
2. All access goes through **`createSafeStorage()`**, which converts every exception into a
   `{ok:false, error}` result. Nothing else touches `localStorage`.
3. **Verify every write** by reading it back, retry once, and restore the previous value if
   both attempts fail.
4. **Validate on load.** Unreadable or wrong-version data becomes a status (`corrupt`,
   `incompatible`), never an exception. Replacing it needs the player's confirmation.
5. Check storage availability **once at startup** and disable Continue and Save if unavailable;
   the game stays playable from memory.
6. Save only at **defined save points**, never mid-dialogue (FR 3.2.4).

## Consequences

- A player can never lose a good save to a failed write.
- Quota errors, private mode and corrupted data are all testable with a fake backend.
- Autosaves only happen at save points, so a crash mid-scene loses at most one scene of progress.
- `localStorage` is per-browser and per-device: progress does not move between devices.
  IndexedDB would allow more space but is more complex; revisit if saves ever approach the
  5 MB limit (unlikely: a save is a few hundred bytes).
- Changing the save format needs a version bump or a migration ([SAVE-DATA.md](../SAVE-DATA.md)).
