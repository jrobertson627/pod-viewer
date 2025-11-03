import { Table, Card, Dropdown, Button, LogModal } from "./components";
import { POD_STATUSES, statusClass } from "./constants";
import { useLogs } from "./hooks/useLogs";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Pod {
  [key: string]: string;
}

export default function App() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("All");
  const [podLoading, setPodLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const { logs, loading, error, fetchLogs, clearLogs } = useLogs();
  const [showLogs, setShowLogs] = useState(false);
  const handleShowLogs = async (podName: string) => {
    await fetchLogs(podName);
    setShowLogs(true);
  };

  useEffect(() => {
    async function fetchNamespaces() {
      const result = await invoke<string>("get_namespaces");
      const list = result
        .split("\n")
        .filter((n) => n.trim().length > 0)
        .map((n) => n.replace("namespace/", ""));
      setNamespaces(["All", ...list]);
    }
    fetchNamespaces();
  }, []);

  async function loadPods() {
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
    } finally {
      setPodLoading(false);
    }
  }

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
                    <button
                      onClick={() => handleShowLogs(row["NAME"])}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                    >
                      Logs
                    </button>
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
    </main>
  );
}
