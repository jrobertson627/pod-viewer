import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useKubeCommand<T = string>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runCommand = useCallback(
    async (command: string, args?: Record<string, unknown>, parseJson = false): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const result = await invoke<string>(command, args);

        const parsed = parseJson
          ? (JSON.parse(result) as T)
          : (result as unknown as T);

        setData(parsed);
        return parsed;
      } catch (err: any) {
        console.error(`Command failed: ${command}`, err);
        setError(err.toString());
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearData = useCallback(() => setData(null), [])

  return { data, error, loading, runCommand, clearData };
}
