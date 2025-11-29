import HeliumLogo from "../components/HeliumLogo";
import { useFetch } from "heliumts/client";
import { getTasks } from "heliumts/server";

export default function Home() {
  const { data: tasks, isLoading } = useFetch(getTasks, { status: "pending" });

  return (
    <div className="max-w-5xl mx-auto p-8 text-center flex flex-col items-center gap-8">
      <div className="flex justify-center mb-4">
        <a
          href="https://heliumts.com"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity"
        >
          <HeliumLogo />
          <h1 className="text-3xl font-bold">HeliumTS</h1>
        </a>
      </div>

      <div className="p-8 bg-white/5 border border-white/10 rounded-xl w-full max-w-2xl">
        {isLoading ? (
          <p className="text-lg">Loading tasks...</p>
        ) : tasks?.length ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Pending Tasks:</h2>
            <ul className="text-left space-y-2">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-3 bg-white rounded-lg border border-gray-300"
                >
                  {task.title}{" "}
                  <span className="opacity-50 ml-2">- {task.status}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-lg">No pending tasks found.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-8">
        <div className="p-6 rounded-xl bg-white border border-gray-300 text-left hover:border-teal-500/50 transition-colors">
          <h3 className="text-xl font-semibold mb-2">🚀 Blazing Fast</h3>
          <p className="opacity-80 text-sm">
            Built on Vite for instant server start, lightning fast HMR and
            snappy server calls.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white border border-gray-300 text-left hover:border-teal-500/50 transition-colors">
          <h3 className="text-xl font-semibold mb-2">🔒 Type Safe</h3>
          <p className="opacity-80 text-sm">
            End-to-end type safety from server to client without code
            generation.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white border border-gray-300 text-left hover:border-teal-500/50 transition-colors">
          <h3 className="text-xl font-semibold mb-2">📁 File Routing</h3>
          <p className="opacity-80 text-sm">
            Intuitive file-based routing system similar to Next.js.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white border border-gray-300 text-left hover:border-teal-500/50 transition-colors">
          <h3 className="text-xl font-semibold mb-2">🔌 RPC Built-in</h3>
          <p className="opacity-80 text-sm">
            Call server functions directly from your client components.
          </p>
        </div>
      </div>

      <p className="text-gray-500 mt-8">
        Click on the Helium logo to learn more or visit{" "}
        <a
          href="https://heliumts.com"
          target="_blank"
          rel="noreferrer"
          className="text-teal-500 hover:underline"
        >
          https://heliumts.com
        </a>
      </p>
    </div>
  );
}
