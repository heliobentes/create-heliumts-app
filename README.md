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
3. Automatically runs `npm install`

## Requirements

- Node.js 18.0.0 or later
- npm, yarn, or pnpm

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

## Learn More

- [HeliumTS Documentation](https://heliumts.com/docs)
- [HeliumTS GitHub](https://github.com/heliobentes/heliumts)

## License

MIT