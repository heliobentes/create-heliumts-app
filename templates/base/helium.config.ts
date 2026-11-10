import type { HeliumConfig } from "heliumts/server";

const config: HeliumConfig = {
  trustProxyDepth: 0, // Set the exact number of trusted reverse proxies for your deployment.
  rpc: {
    maxBodySize: 1_048_576,
    maxBatchSize: 20,
    security: {
      maxRequestsPerWindow: 200,
      rateLimitWindowMs: 60000,
      tokenValidityMs: 30000,
    },
  },
};

export default config;
