import { MarkdownText } from "../../assistant-ui/elements/markdown-text";
import type { DocArtifactPayload } from "./types";

/**
 * Doc artifact renderer — read-only markdown with full GFM + code blocks.
 * Reuses the thread's markdown pipeline so styling stays identical.
 */
const ArtifactDoc = ({ payload }: { payload: DocArtifactPayload }) => {
  if (!payload?.markdown?.trim()) {
    return <p className='py-6 text-center text-sm text-muted-foreground'>Empty document</p>;
  }
  return (
    <div className='aui-md max-h-[65vh] overflow-auto pe-1'>
      <MarkdownText components={{}} text={payload.markdown} />
    </div>
  );
};

export default ArtifactDoc;
