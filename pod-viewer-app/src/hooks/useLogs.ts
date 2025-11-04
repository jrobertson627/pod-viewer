import { useState, useCallback } from "react";
import { useKubeCommand } from "./useKubeCommand";

export function useLogs() {
  const { runCommand, clearData } = useKubeCommand<string>();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (podName: string, namespace: string) => {
      setLoading(true);
      setError(null);
      setLogs([]);
      try {
        const result = await runCommand("stream_logs", { podName, namespace });

        if (!result || result.trim() === "") {
          setLogs(["No logs available for this pod."]);
          return;
        }

        let parsedLogs: string[] = [];
        try {
          const parsed = JSON.parse(result);
          parsedLogs = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          parsedLogs = result.split("\n").filter((line) => line.trim().length > 0);
        }

        setLogs(parsedLogs);
      } catch (err) {
        setError("Failed to fetch logs");
        console.error("Failed to fetch logs", err);
        setLogs([]);
      }
    },
    [runCommand]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
    clearData();
  }, [clearData]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    clearLogs,
  };
}
