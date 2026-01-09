import { useCallback } from "react";
import { addToFileHistory, toolMeta } from "@/lib/file-history";

export function useFileHistory() {
  const trackFile = useCallback(
    (
      tool: string,
      originalName: string,
      fileName: string,
      fileSize?: number
    ) => {
      const meta = toolMeta[tool] || {
        name: tool,
        icon: "FileText",
        color: "from-gray-500 to-gray-400",
      };

      addToFileHistory({
        fileName,
        originalName,
        tool,
        toolName: meta.name,
        toolIcon: meta.icon,
        fileSize,
      });
    },
    []
  );

  return { trackFile };
}
