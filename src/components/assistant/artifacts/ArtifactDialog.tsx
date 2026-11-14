import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useArtifactViewer } from "./useArtifactViewer";
import ArtifactChart from "./ArtifactChart";
import ArtifactTable from "./ArtifactTable";
import ArtifactDoc from "./ArtifactDoc";
import CodeBlock from "../CodeBlock";
import { Button } from "../../ui/button";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — nothing sensible to do
    }
  };
  return (
    <Button variant='ghost' size='icon' onClick={onCopy} title='Copy' className='h-7 w-7'>
      {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
    </Button>
  );
};

/**
 * Modal artifact viewer — opens from the inline ArtifactInlineCard.
 * Preview tab renders the artifact (chart / sheet / doc); Source tab shows
 * the raw markdown or JSON payload with copy. Rendered once per chat host
 * (page + header sheet); dialogs stack fine over the sheet.
 */
const ArtifactDialog = () => {
  const artifact = useArtifactViewer((s) => s.artifact);
  const close = useArtifactViewer((s) => s.close);

  const sourceText = useMemo(() => {
    if (!artifact) return "";
    if (artifact.kind === "doc") {
      return (artifact.payload as { markdown?: string }).markdown ?? "";
    }
    return JSON.stringify(artifact.payload, null, 2);
  }, [artifact]);

  return (
    <Dialog open={!!artifact} onOpenChange={(open) => !open && close()}>
      <DialogContent className='flex max-h-[85vh] w-full max-w-2xl flex-col gap-3 overflow-hidden p-5 sm:max-w-2xl'>
        {artifact && (
          <>
            <DialogHeader className='space-y-0.5'>
              <DialogTitle className='text-base leading-snug'>{artifact.title}</DialogTitle>
              <DialogDescription className='text-xs capitalize'>
                {artifact.kind} artifact
                {artifact.streaming ? " · generating…" : ""}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue='preview' className='flex min-h-0 flex-1 flex-col gap-3'>
              <div className='flex items-center justify-between'>
                <TabsList>
                  <TabsTrigger value='preview'>Preview</TabsTrigger>
                  <TabsTrigger value='source'>Source</TabsTrigger>
                </TabsList>
                <CopyButton text={sourceText} />
              </div>

              <TabsContent value='preview' className='min-h-0 flex-1 overflow-auto'>
                {artifact.kind === "chart" && <ArtifactChart payload={artifact.payload as never} />}
                {artifact.kind === "sheet" && <ArtifactTable payload={artifact.payload as never} />}
                {artifact.kind === "doc" && <ArtifactDoc payload={artifact.payload as never} />}
              </TabsContent>

              <TabsContent value='source' className='min-h-0 flex-1 overflow-auto'>
                <CodeBlock
                  code={sourceText || "—"}
                  language={artifact.kind === "doc" ? "markdown" : "json"}
                  className='max-h-[55vh] overflow-auto'
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArtifactDialog;
