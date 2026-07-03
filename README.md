# UniNest FUW — MVP

A working MVP of the UniNest FUW student housing platform. No dummy data —
everything starts empty and is built up through real user actions, persisted
to browser localStorage.

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
```

## How to test the full flow

1. **Bed Inventory** — Add a block (e.g. Block A, Female, Rooms 1-10, 4 beds/room) to create real bed records.
2. **Bed Allocator** — Submit a student application (matric, name, gender, etc.). The automated engine runs:
   - Checks for an existing active allocation (anti-duplication lock)
   - Scans the live bed pool for an available bed matching the student's gender
   - Assigns the bed and updates inventory in real time
3. **Occupancy Map** — See the real bed grid update; click any bed for details.
4. **Applications** — View the full queue, sorted by priority (disability > Year 1 > distant state).
   Use "Process All Pending" to batch-run the engine.
5. **Landlords** — Onboard a landlord. Entering a 10+ digit NIN auto-verifies them (simulated KYC).
6. **Marketplace** — Only verified landlords can publish listings.
7. **Payments & Escrow** — Record a transaction, then release or dispute it.
8. **Settings** — View live record counts and reset all data.

All data persists across page refreshes via localStorage. Use "Reset All Data"
in Settings to start fresh.
