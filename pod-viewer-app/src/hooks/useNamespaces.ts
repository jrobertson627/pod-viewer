import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useNamespaces() {
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNamespaces = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<string>("get_namespaces");
      const list = result
        .split("\n")
        .filter((n) => n.trim().length > 0)
        .map((n) => n.replace("namespace/", ""));
      setNamespaces(["All", ...list]);
    } catch (err) {
      console.error("Failed to fetch namespaces:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  return { namespaces, loading, fetchNamespaces };
}
