# HeliumTS app

- Read `node_modules/heliumts/docs/agent-start.md` once for the normal application path. If the task already embeds this context, do not read it again. It covers generated-only RPC imports, validation/auth, hooks, routing, forms and verification.
- Use exact `npx helium api NAME --from client` (or `server`) and `npx helium inspect --rpc NAME --json` only when a specific gap remains. No mandatory lookup sequence or prerequisite reading.
- Never import server implementations or `heliumts/server` into browser code. Browser RPC references come only from generated `src/rpc.generated.ts`.
- Finish with `npm run verify`, then the runtime validation required by the task/environment. Use public UI/client references, not private RPC transport internals. Report environmental restrictions honestly; preserve security, persistence and regression checks.
