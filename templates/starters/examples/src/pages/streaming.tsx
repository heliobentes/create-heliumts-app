import { Link, useStreaming } from "heliumts/client";
import { streamText } from "../rpc.generated";
import { useState } from "react";

export default function StreamingDemo() {
  const [prompt, setPrompt] = useState("Helium");
  const [simulateError, setSimulateError] = useState(false);
  const { chunks, text, isStreaming, error, stats, start, cancel, reset } =
    useStreaming(streamText);

  return (
    <div
      className="card"
      style={{ maxWidth: 760, margin: "2rem auto", padding: "1.5rem" }}
    >
      <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
        Typed HTTP Streaming
      </h1>
      <p style={{ marginBottom: "1rem" }}>
        This deterministic demo emits a word every 60 ms. It needs no API key or
        database.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void start({ prompt, failAfterFirstChunk: simulateError });
        }}
        style={{ display: "grid", gap: "0.75rem", textAlign: "left" }}
      >
        <label htmlFor="stream-prompt">Prompt</label>
        <input
          id="stream-prompt"
          value={prompt}
          maxLength={200}
          onChange={(event) => setPrompt(event.target.value)}
          style={{
            padding: "0.6rem",
            border: "1px solid #9ca3af",
            borderRadius: 6,
          }}
        />
        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(event) => setSimulateError(event.target.checked)}
          />
          Simulate an error after the first chunk
        </label>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="submit"
            className="button primary"
            style={{
              padding: "0.6rem 1rem",
              border: "1px solid #0f766e",
              borderRadius: 6,
              backgroundColor: "#0f766e",
              color: "white",
              opacity: prompt.trim() ? 1 : 0.5,
            }}
            disabled={!prompt.trim()}
          >
            {isStreaming ? "Restart" : "Start streaming"}
          </button>
          <button
            type="button"
            className="button"
            style={{
              padding: "0.6rem 1rem",
              border: "1px solid #9ca3af",
              borderRadius: 6,
              backgroundColor: "transparent",
              color: "inherit",
              opacity: isStreaming ? 1 : 0.5,
            }}
            onClick={cancel}
            disabled={!isStreaming}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button"
            style={{
              padding: "0.6rem 1rem",
              border: "1px solid #9ca3af",
              borderRadius: 6,
              backgroundColor: "transparent",
              color: "inherit",
            }}
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </form>
      <p role="status" style={{ margin: "1rem 0" }}>
        {isStreaming
          ? "Receiving chunks…"
          : `${chunks.length} chunks received.`}
      </p>
      <output
        aria-live="polite"
        style={{
          display: "block",
          whiteSpace: "pre-wrap",
          minHeight: 100,
          padding: "1rem",
          border: "1px solid #d1d5db",
          borderRadius: 6,
          textAlign: "left",
        }}
      >
        {text || "Your reply appears here."}
      </output>
      {error && (
        <p role="alert" style={{ color: "#b91c1c", marginTop: "0.75rem" }}>
          {error}
        </p>
      )}
      {stats && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
          Requests remaining in this IP window: {stats.remainingRequests}
        </p>
      )}
      <p style={{ marginTop: "1rem" }}>
        Cancel and errors keep received chunks. Restart replaces the previous
        reply; reset cancels and clears it.
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">Back to home</Link>
      </p>
    </div>
  );
}
