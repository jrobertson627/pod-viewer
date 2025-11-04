import { useState, useCallback, useEffect } from "react";
import { useKubeCommand } from "./useKubeCommand";

export function useLogs() {
  const { data, loading, error, runCommand, clearData } = useKubeCommand<string>();
  const [logs, setLogs] = useState<string[]>([]);

  const fetchLogs = useCallback(
    async (podName: string, namespace = "default") => {
      try {
        const result = await runCommand("stream_logs", { podName, namespace });

        let parsedLogs: string[];
        try {
          const parsed = JSON.parse(result);
          parsedLogs = Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          parsedLogs = result.split("\n").filter((line) => line.trim().length > 0);
        }

        setLogs(parsedLogs);
        console.log("Logs fetched for", podName, parsedLogs.length, "lines");
      } catch (err) {
        console.error("Failed to fetch logs", err);
        setLogs([]);
      }
    },
    [runCommand]
  );

  /** Clear logs */
  const clearLogs = useCallback(() => {
    setLogs([]);
    clearData();
  }, [clearData]);

  // Optional: automatically parse logs whenever data changes
  useEffect(() => {
    if (!data) return;
    const parsed = data
      .split("\n")
      .filter((line) => line.trim().length > 0);
    setLogs(parsed);
  }, [data]);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    clearLogs,
  };
}
