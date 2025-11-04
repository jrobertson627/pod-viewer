import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface PodInfo {
  labels: Record<string, string>;
  containers: { name: string; image: string }[];
  events: { reason: string; message: string; age: string }[];
}

export function usePodInfo() {
  const [podInfo, setPodInfo] = useState<PodInfo>({
    labels: {},
    containers: [],
    events: [],
  });

  const getPodInfo = useCallback(
    async (podName: string, namespace: string) => {
      try {
        const result = await invoke<string>("get_pod_info", {
          namespace,
          pod: podName,
        });
        const data: PodInfo = JSON.parse(result);
        setPodInfo(data);
      } catch (err) {
        console.error("Failed to fetch pod info:", err);
        setPodInfo({ labels: {}, containers: [], events: [] });
      }
    },
    []
  );

  return { podInfo, getPodInfo };
}
