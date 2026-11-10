# create-heliumts-app

Scaffold a React + TypeScript HeliumTS app with typed HTTP RPC.
Requires Node.js ^20.19.0 or >=22.12.0.

```sh
npm create heliumts-app@latest my-app
cd my-app
npm run dev
```

The minimal starter has one page and one typed RPC method. Use `npm create heliumts-app@latest my-app -- --template examples` for the tasks, routing, and streaming demo. These defaults apply to version 0.11.0.

Agents: read the generated AGENTS.md and the installed one-read startup context, then use npm run verify. The normal starter does not initialize experimental project memory.

`--skip-install` writes no lockfile; `npm install` creates the project lock from the actual published dependencies.

## CLI

```
create-heliumts-app <directory> [options]
--template minimal|examples  Starter (default: minimal)
--tailwind                  Tailwind CSS
--no-tailwind               Plain CSS (default)
--skip-install              Do not run npm install
--json                      One JSON result; npm logs go to stderr
-h, --help                  Usage
-v, --version               Version
```

No prompts are used, including in non-TTY/CI runs. Existing `--tailwind`,
`--no-tailwind`, `--skip-install`, and current-directory (`.`) usage work.
Unknown, repeated, conflicting flags and extra positionals fail before writes.
Use `--` before a directory beginning with `-`.
An existing directory must be empty except for `.git` and `.DS_Store`.

Successful scaffolding exits 0; failed validation, filesystem operations, or
installation exit 1. Installation failure keeps the scaffold for retry and does
not claim the app is ready. `--skip-install` succeeds with
`dependenciesInstalled: false`. JSON results include `ok`, `scaffolded`, and
`dependenciesInstalled`; successful scaffolds also include directory, template,
style, and next steps.

## Generated project

- Minimal: one page, one RPC method, stylesheet, and configuration.
- Examples: the existing tasks and HTTP streaming demo.
- Both styles include `AGENTS.md` and `npm run verify` for check → lint → production build, stopping on failure.
- Starter pages import typed method references from `src/rpc.generated.ts`. `npm run dev` and `npm run build` generate this module automatically.
- `npm run check` generates the RPC module, then checks TypeScript. Verify already includes this work; use typegen/typecheck separately only for focused tasks.
- `npm run lint` checks lint; `npm run build` builds production assets.

The generated RPC module and the `helium check` and `helium typegen` commands require the coordinated framework release. During development, use a matching local framework build.

## Development

```sh
npm test
```

Templates compose `templates/base`, `templates/starters/<name>`, and optional
style overlays. Shared configuration lives once; example-specific Tailwind
markup stays in `examples-tailwind`. Source-checkout lockfiles are retained per
dependency set and renamed along with the generated package. As before, the npm
distribution excludes them; installation creates a fresh lockfile. Tests cover all four starter/style
combinations, CLI errors, non-TTY behavior, and installation failure.
