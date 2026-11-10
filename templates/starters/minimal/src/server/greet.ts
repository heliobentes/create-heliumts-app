import { defineMethod } from "heliumts/server";

export const greet = defineMethod((args: { name: string }) => {
  const name = typeof args?.name === "string" ? args.name.trim().slice(0, 100) : "";
  return `Hello, ${name || "world"}!`;
});
