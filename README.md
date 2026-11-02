# create-heliumts-app

Create [HeliumTS](https://github.com/heliobentes/heliumts) apps with one command.

## Usage

```bash
npx create-heliumts-app my-app
```

Or to scaffold in the current directory:

```bash
npx create-heliumts-app .
```

### Options

| Flag | Description |
|------|-------------|
| `--tailwind` | Use Tailwind CSS template (skips prompt) |
| `--no-tailwind` | Use basic template without Tailwind (skips prompt) |
| `--skip-install` | Scaffold files without running npm install |

```bash
# Use Tailwind CSS (default, skips prompt)
npx create-heliumts-app my-app --tailwind

# Use basic template without Tailwind (skips prompt)
npx create-heliumts-app my-app --no-tailwind
```

## What it does

1. Asks if you want to use **Tailwind CSS** (defaults to Yes)
2. Scaffolds a complete HeliumTS project with one of two templates:
   - `tailwind` - HeliumTS with Tailwind CSS pre-configured (default)
   - `basic` - Standard HeliumTS setup
3. Automatically runs `npm install` unless `--skip-install` is provided.

Both templates use HeliumTS 0.10.2 and Vite 7.3.7 or later within Vite 7. Open `/streaming` in the generated app for a typed HTTP streaming demo with restart, cancellation, and partial errors; it needs no external provider or credentials.
Existing project files, including dotfiles, are protected from overwrite; `.git` and `.DS_Store` may remain in an otherwise empty directory.

To install with another package manager:

```bash
npx create-heliumts-app my-app --no-tailwind --skip-install
cd my-app
pnpm install
```

## Requirements

- Node.js 20.19 or later on Node 20, or Node.js 22.12 or later (`^20.19.0 || >=22.12.0`)
- npm to run the scaffolder; npm, yarn, or pnpm can install the generated app

## After Installation

```bash
cd my-app
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run typecheck` | Check application and configuration types |
| `npm run lint` | Check source code with ESLint |

## Learn More

- [HeliumTS Documentation](https://heliumts.com/docs)
- [HeliumTS GitHub](https://github.com/heliobentes/heliumts)

## License

MIT