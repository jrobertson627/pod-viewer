import { Table, Card, Dropdown, Button, LogModal, PodInfoModal } from "./components";
import { POD_STATUSES, statusClass } from "./constants";
import { useLogs } from "./hooks/useLogs";
import { useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Pod {
  [key: string]: string;
}

interface PodInfo {
  labels: Record<string, string>;
  containers: { name: string; image: string }[];
  events: { reason: string; message: string; age: string }[];
}

export default function App() {
  /* STATE */
  const [pods, setPods] = useState<Pod[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("All");
  const [podLoading, setPodLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const { logs, fetchLogs, clearLogs } = useLogs();
  const [showLogs, setShowLogs] = useState(false);
  const [selectedPod, setSelectedPod] = useState<{ name: string; namespace: string } | null>(null);
  const [podInfo, setPodInfo] = useState<PodInfo>({
    labels: {},
    containers: [],
    events: [],
  });

  /* API CALLS */
  /** Fetch all namespaces */
  const getNamespaces = useCallback(async () => {
    try {
      const result = await invoke<string>("get_namespaces");
      const list = result
        .split("\n")
        .filter((n) => n.trim().length > 0)
        .map((n) => n.replace("namespace/", ""));
      setNamespaces(["All", ...list]);
    } catch (err) {
      console.error("Failed to fetch namespaces:", err);
    }
  }, []);

  /* LOAD PODS FOR A NAMESPACE */
  const loadPods = useCallback(async () => {
    setPodLoading(true);
    try {
      const result = await invoke<string>("get_pods", {
        namespace: selectedNamespace,
      });

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
      setSelectedStatus("All");
    } catch (err) {
      console.error("Failed to load pods:", err);
    } finally {
      setPodLoading(false);
    }
  }, [selectedNamespace]);

  /* FETCH A SINGLE POD'S DETAILS */
  const getPodInfo = useCallback(
    async ({ name, namespace }: { name: string; namespace: string }) => {
    try {
     const result = await invoke<string>("get_pod_info", {
        namespace: namespace,
        pod: name,
      });

      const data: PodInfo = JSON.parse(result);
      setPodInfo(data);
    } catch (err) {
      console.error("Failed to load pod info:", err);
      setPodInfo({ labels: {}, containers: [], events: [] });
    }
  }, []);

  /* SHOW LOGS MODAL */
  const handleShowLogs = async (podName: string) => {
    await fetchLogs(podName);
    setShowLogs(true);
  };
 
  /* OPEN POD'S INFO MODAL */
  const openPodInfo = async (podName: string, namespace: string) => {
    setSelectedPod({ name: podName, namespace });
    await getPodInfo({name: podName, namespace});
  }

  /** EFFECTS */
  useEffect(() => {
    getNamespaces();
  }, [getNamespaces]);

  /* FILTERED PODS */
  const filteredPods = pods.filter((pod) => {
    const matchesStatus =
      selectedStatus === "All" || pod["STATUS"] === selectedStatus;
    return matchesStatus;
  });

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-6xl space-y-6">
        <Card>
          <div className="flex gap-4 items-end flex-wrap">
            <Dropdown
              label="Namespace (click Load Pods)"
              value={selectedNamespace}
              options={namespaces}
              onChange={setSelectedNamespace}
            />
            <Button onClick={loadPods} disabled={podLoading}>
              {podLoading ? "Loading..." : "Load Pods"}
            </Button>
            {pods.length > 0 && (
              <Dropdown
                label="Filter by Status"
                value={selectedStatus}
                options={POD_STATUSES as unknown as string[]} // cast to string[]
                onChange={setSelectedStatus}
                variant={"secondary"}
              />
            )}
          </div>
        </Card>

        {pods.length > 0 && (
          <Card>
            <Table
              data={filteredPods}
              columns={headers}
              initialRowsPerPage={5}
              renderCell={(col, value, row) => {
                const lowerCol = col.toLowerCase();
                if (lowerCol === "status") {
                  return (
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-semibold ${statusClass(
                        value ?? ""
                      )}`}
                    >
                      {value}
                    </span>
                  );
                }
                if (lowerCol === "logs") {
                  return (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleShowLogs(row["NAME"])}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                      >
                        Logs
                      </button>
                      <button
                        onClick={() => openPodInfo(row["NAME"], row["NAMESPACE"])}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                      >
                        Info
                      </button>
                    </div>
                  );
                }
                return value;
              }}
            />
          </Card>
        )}
      </div>
      <LogModal
        open={showLogs}
        onClose={() => {
          setShowLogs(false);
          clearLogs();
        }}
        logs={logs}
      />
      <PodInfoModal
        isOpen={!!selectedPod}
        onClose={() => setSelectedPod(null)}
        podName={selectedPod?.name ?? ""}
        namespace={selectedPod?.namespace ?? ""}
        labels={podInfo.labels}
        containers={podInfo.containers}
        events={podInfo.events}
      />
    </main>
  );
}
