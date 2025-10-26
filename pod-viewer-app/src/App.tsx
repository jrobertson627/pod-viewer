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
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Kubernetes Pods
        </h1>

        <div className="flex justify-center mb-4">
          <button
            className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
            onClick={loadPods}
          >
            Load Pods
          </button>
        </div>

        <pre className="bg-gray-100 p-4 rounded-lg shadow-inner text-sm whitespace-pre-wrap overflow-x-auto">
          {pods || "Click 'Load Pods' to fetch pod data."}
        </pre>
      </div>
    </main>
  );
}

export default App;
