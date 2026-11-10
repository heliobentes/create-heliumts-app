import { useFetch } from "heliumts/client";
import { greet } from "../rpc.generated";

export default function Home() {
  const { data, isLoading, error } = useFetch(greet, { name: "world" });
  return (
    <main>
      <h1>HeliumTS</h1>
      <p role={error ? "alert" : undefined}>
        {error ?? (isLoading ? "Loading..." : data)}
      </p>
    </main>
  );
}
