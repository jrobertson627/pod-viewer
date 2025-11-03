// hooks/useLogs.ts
import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core"

export function useLogs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (podName: string, namespace?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("stream_logs", { podName, namespace });
      setLogs(result.split("\n"));
      console.log(logs);
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    clearLogs,
  };
}
