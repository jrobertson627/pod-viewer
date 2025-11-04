import { useKubeCommand } from "./useKubeCommand";

interface PodInfo {
  labels: Record<string, string>;
  containers: { name: string; image: string }[];
  events: { reason: string; message: string; age: string }[];
}

export function usePodInfo() {
  const { data: podInfo, loading, runCommand } = useKubeCommand<PodInfo>();

  const getPodInfo = async (podName: string, namespace: string) => {
    await runCommand("get_pod_info", { pod: podName, namespace }, true);
  };

  return { podInfo, loading, getPodInfo };
}
