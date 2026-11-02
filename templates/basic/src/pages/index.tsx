import HeliumLogo from "../components/HeliumLogo";
import { useFetch } from "heliumts/client";
import { getTasks } from "heliumts/server";

export default function Home() {
  const { data: tasks, isLoading, error } = useFetch(getTasks, { status: "pending" });

  return (
    <div>
      <div className="logo-wrapper">
        <a href="https://heliumts.com" target="_blank" rel="noreferrer">
          <HeliumLogo />
          <h1>HeliumTS</h1>
        </a>
      </div>

      <div className="card">
        {error ? (
          <p role="alert">{error}</p>
        ) : isLoading ? (
          <p>Loading tasks...</p>
        ) : tasks?.length ? (
          <>
            <h2>Pending Tasks:</h2>
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task">
                  {task.title} - {task.status}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No pending tasks found.</p>
        )}
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>🚀 Blazing Fast</h3>
          <p>
            Built on Vite for instant server start, lightning fast HMR and
            snappy server calls.
          </p>
        </div>
        <div className="feature-card">
          <h3>🔒 Type Safe</h3>
          <p>
            Typed server methods and generated client declarations keep
            requests and responses in sync.
          </p>
        </div>
        <div className="feature-card">
          <h3>📁 File Routing</h3>
          <p>Intuitive file-based routing system similar to Next.js.</p>
        </div>
        <div className="feature-card">
          <h3>🔌 RPC Built-in</h3>
          <p>Call server functions directly from your client components.</p>
        </div>
      </div>

      <p className="read-the-docs">
        Click on the Helium logo to learn more or visit{" "}
        <a href="https://heliumts.com" target="_blank" rel="noreferrer">
          https://heliumts.com
        </a>
      </p>
    </div>
  );
}
