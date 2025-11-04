export interface Pod {
  [key: string]: string;
}

export interface PodInfo {
  labels: Record<string, string>;
  containers: { name: string; image: string }[];
  events: { reason: string; message: string; age: string }[];
}

export const POD_STATUSES = [
  "All",
  "Pending",
  "Running",
  "Succeeded",
  "Failed",
  "Unknown",
  "CrashLoopBackOff",
  "ImagePullBackOff",
  "ErrImagePull",
  "ContainerCreating",
  "Terminating",
  "Completed",
] as const;

export type PodStatus = typeof POD_STATUSES[number];

export const DEFAULT_NAMESPACE = "default" as const;

export function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "running":
      return "bg-green-100 text-green-800";
    case "pending":
    case "containercreating":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
    case "crashloopbackoff":
    case "imagepullbackoff":
    case "errimagepull":
      return "bg-red-100 text-red-800";
    case "succeeded":
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "terminating":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}