import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [pods, setPods] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

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
      <h1>Welcome to Tauri + React</h1>

      return (
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
  );
    </main>
  );
}

export default App;
