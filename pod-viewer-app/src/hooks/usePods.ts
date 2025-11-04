import { useState, useCallback } from "react";
import { useKubeCommand } from "./useKubeCommand";

interface Pod {
  [key: string]: string;
}

export function usePods() {
  const { loading, runCommand } = useKubeCommand<string>();
  const [pods, setPods] = useState<Pod[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const loadPods = useCallback(
    async (namespace: string): Promise<{ pods: Pod[]; headers: string[] }> => {
      const result = await runCommand("get_pods", { namespace });
      if (!result) {
        setPods([]);
        setHeaders([]);
        return { pods: [], headers: [] };
      }

      const lines = result.trim().split("\n");
      const parsedHeaders = lines[0].split(/\s+/);
      if (!parsedHeaders.includes("Logs")) parsedHeaders.push("Logs");

      const parsedPods: Pod[] = lines.slice(1).map((line) => {
        const columns = line.split(/\s+/);
        const pod: Pod = {};
        parsedHeaders.forEach((h, i) => (pod[h] = columns[i] || ""));
        return pod;
      });

      setPods(parsedPods);
      setHeaders(parsedHeaders);
      return { pods: parsedPods, headers: parsedHeaders };
    },
    [runCommand]
  );

  return { pods, headers, loadPods, loading };
}
