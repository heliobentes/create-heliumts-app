import type { HeliumConfig } from "heliumts/server";

const config: HeliumConfig = {
  trustProxyDepth: 0, // Set the exact number of trusted reverse proxies for your deployment.
  rpc: {
    transport: "websocket",
    autoHttpOnMobile: false,
    compression: {
      enabled: true,
      threshold: 1024,
    },
    security: {
      maxConnectionsPerIP: 10,
      maxMessagesPerWindow: 200,
      rateLimitWindowMs: 60000,
      tokenValidityMs: 30000,
    },
  },
};

export default config;
