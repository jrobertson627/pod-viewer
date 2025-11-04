import React from "react";
import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";

interface PodInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  podName: string;
  namespace: string;
  labels?: Record<string, string>;
  containers?: { name: string; image: string }[];
  events?: { reason: string; message: string; age: string }[];
}

export const PodInfoModal: React.FC<PodInfoModalProps> = ({
  isOpen,
  onClose,
  podName,
  namespace,
  labels = {},
  containers = [],
  events = [],
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pod Info: ${podName}`}>
      <div className="space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Namespace</h3>
          <p className="text-gray-600">{namespace}</p>
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Labels</h3>
          {Object.keys(labels).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Object.entries(labels).map(([key, val]) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700"
                >
                  {key}: <span className="font-semibold">{val}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No labels found.</p>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Containers
          </h3>
          {containers.length > 0 ? (
            <table className="min-w-full text-sm border border-gray-200 rounded">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="px-3 py-1 text-left">Name</th>
                  <th className="px-3 py-1 text-left">Image</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((c, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-1 font-mono">{c.name}</td>
                    <td className="px-3 py-1 font-mono text-gray-600">
                      {c.image}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-sm">No containers found.</p>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Events</h3>
          {events.length > 0 ? (
            <ul className="space-y-1">
              {events.map((e, i) => (
                <li
                  key={i}
                  className="p-2 bg-gray-50 border border-gray-200 rounded text-sm"
                >
                  <p className="font-semibold text-gray-800">{e.reason}</p>
                  <p className="text-gray-600">{e.message}</p>
                  <p className="text-xs text-gray-400">{e.age}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No recent events.</p>
          )}
        </Card>
        <div className="text-right">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
