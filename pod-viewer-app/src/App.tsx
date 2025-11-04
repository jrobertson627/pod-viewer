import { Table, Card, Dropdown, Button, LogModal, PodInfoModal } from "./components";
import { POD_STATUSES, statusClass } from "./constants";
import { useLogs, useNamespaces, usePodInfo, usePods } from "./hooks";
import { useState } from "react";

export default function App() {
  /* STATE */
  const { namespaces } = useNamespaces();
  const { pods, headers, loading: podLoading, loadPods } = usePods();
  const { logs, fetchLogs, clearLogs } = useLogs();
  const { podInfo, getPodInfo } = usePodInfo();

  const [selectedNamespace, setSelectedNamespace] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPod, setSelectedPod] = useState<{ name: string; namespace: string } | null>(null);

  const [showLogs, setShowLogs] = useState(false);
  
  /* SHOW LOGS MODAL */
  const handleShowLogs = async (podName: string, namespace: string) => {
    await fetchLogs(podName, namespace);
    setShowLogs(true);
  };
 
  /* OPEN POD'S INFO MODAL */
  const openPodInfo = async (podName: string, namespace: string) => {
    setSelectedPod({ name: podName, namespace });
    await getPodInfo(podName, namespace);
  }

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
            <Button onClick={() => loadPods(selectedNamespace)} disabled={podLoading}>
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
                      {row["NAMESPACE"] !== "kube-system" &&
                      (<button
                        onClick={() => handleShowLogs(row["NAME"], row["NAMESPACE"])}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline transition"
                      >
                        Logs
                      </button>)
                    }
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
        labels={podInfo?.labels}
        containers={podInfo?.containers}
        events={podInfo?.events}
      />
    </main>
  );
}
