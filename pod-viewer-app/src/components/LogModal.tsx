import React, { useEffect, useRef } from "react";
import { Modal } from "./Modal";

interface LogModalProps {
  open: boolean;
  onClose: () => void;
  logs: string[];
}

export const LogModal: React.FC<LogModalProps> = ({ open, onClose, logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Modal isOpen={open} onClose={onClose} title="Pod Logs">
      <div
        ref={scrollRef}
        className="max-h-[70vh] overflow-y-auto bg-gray-900 text-green-200 p-4 font-mono text-sm rounded-lg"
      >
        {logs.length > 0 ? (
          logs.map((line, i) => <div key={i}>{line}</div>)
        ) : (
          <div className="text-gray-400 italic">No logs available.</div>
        )}
      </div>
    </Modal>
  );
};
