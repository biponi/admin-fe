import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { cn } from "../../lib/utils";
import { formatFraudDate } from "../../components/fraud/fraudTheme";
import { getBkashTransactionTimeline } from "../../api/bkashTransaction";
import type { BkashTransactionLog } from "../../api/bkashTransaction";
import { EventBadge } from "./TransactionTable";
import { InlineLoader } from "@/components/loaders";

const timelineDot = (eventType: string) =>
  eventType.includes("failed")
    ? "bg-[#B3365B]"
    : eventType.includes("success") || eventType === "order_converted"
      ? "bg-[#1A7F37]"
      : "bg-[#D97757]";

interface TimelineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string | null;
}

/** Right-side sheet showing the full event timeline for one bKash paymentID */
const TimelineSheet = ({ open, onOpenChange, paymentId }: TimelineSheetProps) => {
  const [events, setEvents] = useState<BkashTransactionLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !paymentId) return;
    setLoading(true);
    getBkashTransactionTimeline(paymentId).then((result) => {
      if (result.success && result.data) {
        setEvents(result.data.events);
      } else {
        setEvents([]);
      }
      setLoading(false);
    });
  }, [open, paymentId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-[480px] overflow-y-auto bg-[#FAF9F6] border-l border-[#E8E4DC]'>
        <SheetHeader>
          <SheetTitle className='text-left text-[15px] text-[#141413]'>
            Payment timeline
          </SheetTitle>
          <SheetDescription className='text-left font-mono text-[11px] break-all text-[#8A877D]'>
            {paymentId}
          </SheetDescription>
        </SheetHeader>

        <div className='px-4 pb-6'>
          {loading ? (
            <InlineLoader domain='analytics' text='Loading Timeline' />
          ) : events.length === 0 ? (
            <div className='py-10 text-center text-[12px] text-[#8A877D]'>
              No events logged for this paymentID.
            </div>
          ) : (
            <div className='relative space-y-4 pt-2'>
              {events.map((event, i) => (
                <div key={event.id} className='relative pl-6'>
                  {/* connector line */}
                  {i < events.length - 1 ? (
                    <span className='absolute left-[7px] top-5 bottom-[-16px] w-px bg-[#E8E4DC]' />
                  ) : null}
                  <span className='absolute left-0 top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#D8D3C8] bg-white'>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        timelineDot(event.eventType),
                      )}
                    />
                  </span>

                  <div className='flex items-center gap-2 flex-wrap'>
                    <EventBadge eventType={event.eventType} />
                    <span className='text-[10px] text-[#8A877D] whitespace-nowrap'>
                      {formatFraudDate(event.timestamps?.createdAt)}
                    </span>
                  </div>

                  <div className='mt-1 space-y-0.5 text-[11px] text-[#57554D]'>
                    {event.amount != null ? (
                      <div>
                        Amount:{" "}
                        <span className='font-semibold tabular-nums text-[#141413]'>
                          ৳{event.amount}
                        </span>
                      </div>
                    ) : null}
                    {event.trxID ? (
                      <div className='font-mono text-[10px] break-all'>
                        trxID: {event.trxID}
                      </div>
                    ) : null}
                    {event.statusCode ? (
                      <div className='font-mono text-[10px]'>
                        statusCode: {event.statusCode}
                      </div>
                    ) : null}
                    {event.errorMessage ? (
                      <div className='text-[#B3365B] break-words'>
                        {event.errorMessage}
                      </div>
                    ) : null}
                    {event.context?.source ? (
                      <div className='text-[10px] text-[#8A877D]'>
                        via {event.context.source}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimelineSheet;
