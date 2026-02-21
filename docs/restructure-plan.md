# Repo Restructure Plan

Purpose
-------
Align repository layout to a flat, feature-organized structure (no nested `src` for UI libs), simplify imports, and make API routes feature-based under `app/api/`.

Goals
-----
- Remove nested `src` for `components` and `lib` — place them at repository root.
- Introduce dedicated `hooks/` and `database/` folders.
- Organize API as feature folders under `app/api/` (e.g. `calendly`, `realtime-rag`, `contact`).
- Keep changes minimal and provide a clear migration checklist and rollback plan.

Target tree
-----------

```
├── app/                    # Next.js App Router
│   ├── api/                # Feature-based API routes
│   │   ├── calendly/       # Scheduling
│   │   ├── contact/        # Contact form
│   │   ├── realtime-rag/   # Voice/RAG
│   │   └── admin/roles/    # Admin management
│   └── actions/            # Server Actions
├── components/             # React components (root level, not src/)
│   ├── ui/                 # shadcn/ui primitives
│   ├── ai-chat.tsx         # AI chat interface
│   ├── voice-chat.tsx      # Voice conversation
│   ├── experience.tsx      # Portfolio sections
│   └── ...
├── hooks/                  # Custom React hooks
│   ├── use-debounce.ts
│   └── use-openai-realtime.ts
├── lib/                    # Utilities & services
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions
│   ├── database.ts         # DB connection
│   ├── vector-search.ts    # Semantic search
│   └── calendly-api.ts     # API integrations
├── database/               # SQL schema files
│   ├── schema.sql
│   └── optimize.sql
└── docs/                   # Documentation
```

Migration steps (high-level)
----------------------------

1. Inventory & map current files
   - Gather current locations for `components`, `lib`, `src`, `digital-twin/src/*`, and `digital-twin-frontend/src/*`.
   - Produce a mapping table: old path → new path.

2. Draft the plan (this document)

3. Scaffold new top-level folders
   - Create empty `components/`, `hooks/`, `lib/`, and `database/` at repo root.

4. Move non-App Router UI code
   - Move presentational components from `digital-twin/src/components` (and other `src` folders) into `components/`.
   - Keep `app/` pages & server components in place.

5. Move shared utilities & types
   - Move shared helpers into `lib/utils/`, and `lib/types/`.
   - Move DB connectors to `lib/database.ts` and SQL files to `database/`.

6. Add `hooks/` and refactor
   - Extract reusable hooks into `hooks/`.
   - Replace relative imports accordingly.

7. Update API routes under `app/api/`
   - Refactor existing API handlers into feature folders: `app/api/calendly/`, `app/api/contact/`, `app/api/realtime-rag/`, `app/api/admin/roles/`.

8. Update TypeScript configuration
   - Update `tsconfig.json` paths to reflect new `components/*`, `lib/*`, `hooks/*`.

9. Run codebase-wide import updates
   - Use codemods or `ts-morph` script to update import paths (preferred) rather than manual edits.

10. Test build and runtime
    - `pnpm install` then `pnpm build` and `pnpm dev` smoke tests.
    - Run any existing tests and fix failures.

11. Create PR with migration notes
    - Add a top-level migration README with mapping table and any manual steps.

Detailed actions & notes
------------------------

- Inventory & mapping
  - Script: `scripts/inventory-structure.js` (recommend adding) to produce a JSON mapping of files and exports.

- Moving files safely
  - Move files in small batches (e.g., 10–20 files) and run the build after each batch.
  - Prefer updating imports with codemods to avoid human error.

- Import patterns to replace
  - `../../../../components/foo` → `components/foo`
  - `../../../lib/utils` → `lib/utils`

- tsconfig
  - Add `baseUrl: .` and `paths`:

```json
"paths": {
  "components/*": ["components/*"],
  "lib/*": ["lib/*"],
  "hooks/*": ["hooks/*"]
}
```

- Next.js considerations
  - Preserve `app/` routing and server components. Only move client components and shared UI.
  - API folder structure under `app/api` must follow Next.js App Router conventions — test endpoints after moving.

- Automated tooling recommendations
  - Use `jscodeshift` or `ts-morph` for import rewrites.
  - Use `git mv` where possible to preserve history; when moving across folders that change casing or repo area, history may be partial.

Validation checklist
--------------------

- Build completes with `pnpm build`.
- App runs locally: route checks for core pages (chat, admin, api endpoints).
- No remaining references to old `src/` locations for shared UI components.
- TypeScript errors resolved.

Rollback plan
-------------

- Keep each batch as a separate commit. If a batch breaks the build, revert that commit.
- If larger problems occur, open PR discussion and revert the migration branch.

PR checklist for migration
-------------------------

- Include mapping table (old → new) in PR description.
- Document any manual fixes applied.
- Note any environment changes (e.g., updated `tsconfig.json`).

Estimated effort
----------------

- Inventory & mapping: 2–4 hours
- Scaffolding & small batch moves (with codemods): 4–12 hours depending on size
- Testing & fixes: 2–8 hours

Next steps (recommended)
------------------------

1. Run an inventory script to map current locations.
2. Create the empty folders and update `tsconfig.json` paths.
3. Execute a codemod to rewrite imports for a small batch and validate build.

If you'd like, I can:

- generate the inventory script and run it here, or
- scaffold the new folders and create a codemod to update imports.
