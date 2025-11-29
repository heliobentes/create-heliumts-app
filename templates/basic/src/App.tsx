import { type AppShellProps } from "heliumts/client";

export default function App({ Component, pageProps }: AppShellProps) {
  return <Component {...pageProps} />;
}
