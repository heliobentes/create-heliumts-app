import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import helium from "heliumts/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), helium()],
});
