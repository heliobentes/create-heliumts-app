# HeliumTS App (with Tailwind CSS)

This is a [HeliumTS](https://heliumts.com) project bootstrapped with `create-heliumts-app` using the Tailwind CSS template.

## Requirements

Use Node.js 20.19 or later on Node 20, or Node.js 22.12 or later (`^20.19.0 || >=22.12.0`). This template uses HeliumTS 0.10.1 and Vite 7.3.7 or later within Vite 7.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

You can start editing the page by modifying `src/pages/index.tsx`. The page auto-updates as you edit the file.

## Tailwind CSS

This project comes pre-configured with [Tailwind CSS v4](https://tailwindcss.com/).
You can start using Tailwind utility classes in your components immediately.

## Project Structure

- `src/pages` - File-based routing for your application.
- `src/server` - Server-side logic and RPC functions.
- `src/components` - React components.
- `helium.config.ts` - HeliumTS configuration.

## Rendering and Server Code

Pages render in the browser by default. Add `"use ssg";` to static pages to render them during `npm run build`, or `"use ssr";` to render a page for each request.

For SSR data, keep server code in a sidecar such as `src/pages/profile.server.ts`:

```ts
import type { GetServerSideProps } from "heliumts/server";

export const getServerSideProps: GetServerSideProps = async (request) => {
  return { name: request.query.name || "Visitor" };
};
```

The matching `src/pages/profile.tsx` starts with `"use ssr";` and receives `name` as a prop. Sidecars stay out of the browser bundle. Layouts and `src/App.tsx` wrap browser, SSR, and static pages.

RPC methods belong in `src/server`. Import their generated stubs from `heliumts/server` in pages, then call `useFetch` for queries or `useCall` for mutations. The Helium CLI refreshes `src/types/heliumts-server.d.ts`; do not edit generated declarations by hand.

For calls in event handlers or browser utilities outside hooks, use `callMethod(getTasks, args)` from `heliumts/client`; its result contains `data` and request `stats`. RPC uses HTTP with MessagePack and automatic batching. Browser RPC APIs do not run during SSR or SSG rendering; use `getServerSideProps` for request-time data.

## Streaming

Open `/streaming` for a runnable deterministic example. `src/server/streaming.ts` defines an async generator with `defineMethod`; the page consumes it with `useStreaming`. No provider SDK, API key, or database is required.

The hook exposes typed `chunks`, concatenated string `text`, `isStreaming`, `error`, `stats`, `start(args)`, `cancel()`, and `reset()`. Starting again replaces the previous stream. Cancel and partial failures retain received chunks; reset clears them. Streams are never replayed automatically. The server passes `ctx.signal` into cancellable work.

## Production

```bash
npm run build
npm run typecheck
npm run lint
npm run start
```

Set a stable `HELIUM_SECRET` environment variable for production, shared by every server instance. Keep `trustProxyDepth: 0` for direct connections; set it to the exact number of trusted reverse proxies only when deploying behind them. Forwarded headers are not trusted by default.

## Learn More

To learn more about HeliumTS, take a look at the following resources:

- [HeliumTS Documentation](https://heliumts.com/docs) - learn about HeliumTS features and API.
- [HeliumTS GitHub](https://github.com/heliobentes/heliumts) - check out the source code and contribute.

