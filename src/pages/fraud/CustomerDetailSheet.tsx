import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import FraudDetailPanel from "../../components/fraud/FraudDetailPanel";

interface CustomerDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string | null;
  customerName?: string;
  onChanged?: () => void;
}

/** Right-side sheet wrapping the shared FraudDetailPanel */
const CustomerDetailSheet = ({
  open,
  onOpenChange,
  phoneNumber,
  customerName,
  onChanged,
}: CustomerDetailSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-[440px] p-0 flex flex-col gap-0 bg-white dark:bg-slate-900'
      >
        <SheetHeader className='px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/60 flex flex-row items-center justify-between space-y-0'>
          <div>
            <SheetTitle className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
              Fraud risk analysis
            </SheetTitle>
            <SheetDescription className='text-[11px] text-slate-500 dark:text-slate-400 tabular-nums'>
              {phoneNumber}
            </SheetDescription>
          </div>
        </SheetHeader>
        <div className='flex-1 overflow-y-auto px-4 py-4'>
          {phoneNumber ? (
            <FraudDetailPanel
              phoneNumber={phoneNumber}
              customerName={customerName}
              onChanged={onChanged}
            />
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerDetailSheet;
