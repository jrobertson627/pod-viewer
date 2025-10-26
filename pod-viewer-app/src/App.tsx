import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [pods, setPods] = useState("");

  async function loadPods() {
    try {
      const result = await invoke<string>("get_pods");
      setPods(result);
    } catch (error) {
      console.error(error);
      setPods("Error fetching pods.");
    }
  }

  return (
    <main className="container">
    <div className="p-4 font-mono">
      <h1 className="text-xl mb-2">Kubernetes Pods</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={loadPods}
      >
        Load Pods
      </button>
      <pre className="mt-4 whitespace-pre-wrap">{pods}</pre>
    </div>
    </main>
  );
}

export default App;
