# HeliumTS App

This is a [HeliumTS](https://heliumts.com) project bootstrapped with `create-heliumts-app`.

## Requirements

Use Node.js 20.19 or later on Node 20, or Node.js 22.12 or later (`^20.19.0 || >=22.12.0`). This template uses HeliumTS 0.9.7 and Vite 7.3.7 or later within Vite 7.

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

For calls in event handlers or other browser code outside hooks, import `callMethod` from `heliumts/client`: `await callMethod(getTasks, { status: "pending" })`. Its result includes `data`, request `stats`, and the transport used. Pass `{ transport: "http" }` or `{ transport: "websocket" }` as the third argument to require one transport for that call. Browser RPC APIs cannot run during SSR or SSG rendering; use `getServerSideProps` for request-time server data.

WebSocket RPC shares a persistent connection. Performance depends on your network, payloads, compression, and hosting proxies; HTTP/2 and HTTP/3 can also reuse connections. Smaller MessagePack payloads do not guarantee faster responses. Compare both transports with your application workload.

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

