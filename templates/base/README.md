# HeliumTS app

```sh
npm run dev
```

If dependencies are missing, run `npm install` first.

Edit `src/pages/index.tsx` for the page and `src/server/` for typed HTTP RPC.
Pages import method references from `src/rpc.generated.ts`. The dev server,
build and check commands generate it from your server methods.
Start with `AGENTS.md` and read `node_modules/heliumts/docs/agent-start.md` once.
Use exact public API/discovery lookups only if a specific gap remains.

Finish changes with `npm run verify` (check → lint → production build, stopping
on failure). Check already generates RPC imports and checks TypeScript; do not
also run typegen or typecheck as part of this sequence. Keep task-specific runtime tests.
`npm run build` builds production assets; `npm start` serves them.

The minimal starter has one page and one method. The examples starter also includes
routing, tasks, and cancellable HTTP streaming at `/streaming`.
