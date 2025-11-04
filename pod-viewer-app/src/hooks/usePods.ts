import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Pod {
  [key: string]: string;
}

export function usePods() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPods = useCallback(async (namespace: string) => {
    setLoading(true);
    try {
      const result = await invoke<string>("get_pods", { namespace });
      const lines = result.trim().split("\n");
      const parsedHeaders = lines[0].split(/\s+/);
      if (!parsedHeaders.includes("Logs")) parsedHeaders.push("Logs");

      const podList: Pod[] = lines.slice(1).map((line) => {
        const columns = line.split(/\s+/);
        const pod: Pod = {};
        parsedHeaders.forEach((h, i) => (pod[h] = columns[i] || ""));
        return pod;
      });

      setHeaders(parsedHeaders);
      setPods(podList);
    } catch (err) {
      console.error("Failed to load pods:", err);
      setPods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { pods, headers, loading, loadPods };
}
