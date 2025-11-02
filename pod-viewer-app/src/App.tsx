import { useState, useMemo, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface Pod {
  [key: string]: string; // dynamic keys based on headers
}

function App() {
  const [pods, setPods] = useState<Pod[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");
  const [restartFilter, setRestartFilter] = useState("All");

  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState("All");

  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function fetchNamespaces() {
      try {
        const result = await invoke<string>("get_namespaces");
        const list = result
          .split("\n")
          .filter((n) => n.trim().length > 0)
          .map((n) => n.replace("namespace/", ""));
        setNamespaces(["All", ...list]);
      } catch (err) {
        console.error("Failed to load namespaces", err);
        setNamespaces(["All"]);
      }
    }
    fetchNamespaces();
  }, []);

  async function loadPods() {
    setLoading(true);
    try {
      const result = await invoke<string>("get_pods", { namespace: selectedNamespace });
      const lines = result.trim().split("\n");

      if (lines.length === 0) {
        setPods([]);
        setHeaders([]);
        return;
      }

      // First line contains headers
      const parsedHeaders = lines[0].split(/\s+/);
      setHeaders(parsedHeaders);

      // Parse remaining lines
      const podList: Pod[] = lines.slice(1).map((line) => {
        const columns = line.split(/\s+/);
        const pod: Pod = {};
        parsedHeaders.forEach((header, i) => {
          pod[header] = columns[i] || "";
        });
        if (!pod["NAMESPACE"]) {
          pod["NAMESPACE"] = selectedNamespace !== "All" ? selectedNamespace : "";
        }
        return pod;
      });
      setPods(podList);
    } catch (error) {
      console.error(error);
      setPods([{ NAME: "Error fetching pods", STATUS: "Error" }]);
      setHeaders(["NAME", "STATUS"]);
    } finally {
      setLoading(false);
    }
  }

  function statusClass(status: string) {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "error":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const statusesDrop = useMemo(() => {
    const set = new Set(pods.map((p) => p["STATUS"]));
    return ["All", ...Array.from(set)];
  }, [pods]);

  const restartsDrop = useMemo(() => {
    const set = new Set(pods.map((p) => p["RESTARTS"]));
    return ["All", ...Array.from(set)];
  }, [pods]);

  const filteredPods = useMemo(() => {
    return pods.filter((pod) => {
      const matchesStatus =
        statusFilter === "All" || pod["STATUS"] === statusFilter;
      const matchesRestart =
        restartFilter === "All" || pod["RESTARTS"] === restartFilter;

      return (
        matchesStatus &&
        matchesRestart
      );
    });
  }, [pods, statusFilter, restartFilter]);

  const sortedPods = useMemo(() => {
    if (!sortColumn) return filteredPods;

    return [...filteredPods].sort((a, b) => {
      const valA = a[sortColumn] || "";
      const valB = b[sortColumn] || "";

      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        return sortDirection === "asc"
          ? Number(valA) - Number(valB)
          : Number(valB) - Number(valA);
      }
      return sortDirection === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [filteredPods, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Kubernetes Pods
        </h1>

        <div className="flex justify-center mb-4">
          <button
            className="bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition"
            onClick={loadPods}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Pods"}
          </button>

          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {namespaces.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {statusesDrop.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={restartFilter}
            onChange={(e) => setRestartFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {restartsDrop.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-50 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    onClick={() => handleSort(header)}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-200"
                  >
                    {header}
                    {sortColumn === header && (
                      <span className="ml-1 text-gray-500">
                        {sortDirection === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPods.map((pod, idx) => (
                <tr
                  key={idx}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  {headers.map((header) => {
                    const value = pod[header];
                    if (header.toLowerCase() === "status") {
                      return (
                        <td
                          key={header}
                          className="px-4 py-2"
                        >
                          <span
                            className={`px-2 py-1 rounded-full text-sm font-semibold ${statusClass(
                              value
                            )}`}
                          >
                            {value}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={header}
                        className="px-4 py-2 font-mono text-sm text-gray-800"
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPods.length === 0 && !loading && (
            <p className="text-gray-500 text-center mt-4">
              No pods match your filters.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;