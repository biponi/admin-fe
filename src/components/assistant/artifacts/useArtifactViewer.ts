import { create } from "zustand";
import type { ArtifactDescriptor } from "./types";

/**
 * Global artifact-viewer state so the inline cards (inside the thread) and the
 * modal host (page/sheet level) communicate without prop drilling. Works the
 * same from the /assistant page and the header AssistantSheet.
 */
interface ArtifactViewerState {
  artifact: ArtifactDescriptor | null;
  open: (artifact: ArtifactDescriptor) => void;
  close: () => void;
}

export const useArtifactViewer = create<ArtifactViewerState>((set) => ({
  artifact: null,
  open: (artifact) => set({ artifact }),
  close: () => set({ artifact: null }),
}));
