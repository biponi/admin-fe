import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Sparkles } from "lucide-react";
import AssistantChat from "../../pages/assistant/AssistantChat";

interface AssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Right-side quick panel hosting the AI assistant chat — the same pattern as
 * SettingsPanel (controlled by the header, no internal trigger). Mounted from
 * site-header (desktop) and mobile-topbar, gated on assistant:view upstream.
 */
const AssistantSheet = ({ open, onOpenChange }: AssistantSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-[440px] p-0 flex flex-col gap-0
          data-[state=open]:duration-300'
      >
        <SheetHeader
          className='px-4 py-3 border-b
            bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30
            flex flex-row items-center justify-between space-y-0'
        >
          <div className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm'>
              <Sparkles className='w-3.5 h-3.5 text-white' />
            </div>
            <SheetTitle className='text-sm font-semibold'>AI Assistant</SheetTitle>
          </div>
        </SheetHeader>
        {/* Chat fills the remaining height; content unmounts on close so each
            open starts fresh (sessions persist server-side) */}
        {open && <AssistantChat embedded />}
      </SheetContent>
    </Sheet>
  );
};

export default AssistantSheet;
