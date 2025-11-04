import { useEffect } from "react";
import { useKubeCommand } from "./useKubeCommand";

export function useNamespaces() {
    const { data, loading, runCommand } = useKubeCommand<string>();
  const namespaces = data
    ? ["All", ...data
        .split("\n")
        .filter((n) => n.trim().length > 0)
        .map((n) => n.replace("namespace/", ""))]
    : [];

  useEffect(() => {
    runCommand("get_namespaces");
  }, [runCommand]);

  return { namespaces, loading, refetch: () => runCommand("get_namespaces") };
}
