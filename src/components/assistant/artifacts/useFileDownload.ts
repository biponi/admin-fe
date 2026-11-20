import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { downloadAssistantReport } from "../../../api/assistant";
import type { FileArtifactPayload } from "./types";

/**
 * Authenticated download for generated report files. The blob comes through
 * the shared axios instance (VITE_API_BASE_URL + x-access-token), then a
 * synthetic anchor click saves it — the raw path is never navigated directly.
 */
export const useFileDownload = () => {
  const [busy, setBusy] = useState(false);

  const download = useCallback(async (payload: FileArtifactPayload) => {
    if (!payload.downloadPath || busy) return;
    setBusy(true);
    try {
      const { blob, fileName } = await downloadAssistantReport(
        payload.downloadPath,
        payload.fileName || "report"
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 410 || status === 404) {
        toast.error("This report link has expired — ask MITSHU AI to generate it again.");
      } else if (status === 403) {
        toast.error("Your role no longer allows this report.");
      } else {
        toast.error("Report download failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return { download, busy };
};

export default useFileDownload;
