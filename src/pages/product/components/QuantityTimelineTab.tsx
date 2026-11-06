import { useEffect, useState, ReactNode } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../../../components/ui/drawer";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
  History,
  List,
  CalendarRange,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useStockTimeline } from "../hooks/useStockTimeline";
import { TimelineEvent, TimelineVariation } from "../../../api/stockTimeline";
import { format } from "date-fns";
import QuantityTimelineRail from "./QuantityTimelineRail";
import QuantityTimelineBoard from "./QuantityTimelineBoard";
import { NODE_STYLES } from "./timelineShared";

interface QuantityTimelineTabProps {
  productId: string;
}

type TimelineView = "board" | "rail";

const QuantityTimelineTab = ({ productId }: QuantityTimelineTabProps) => {
  const isMobile = useIsMobile();
  const {
    loading,
    timelineData,
    fetchTimeline,
    detailEvent,
    detailLoading,
    fetchEventDetail,
    clearDetail,
  } = useStockTimeline(productId);

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(
    null,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [view, setView] = useState<TimelineView>("board");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetchTimeline({ limit: 50, page: 1 });
    //eslint-disable-next-line
  }, []);

  // close fullscreen on Escape
  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreen]);

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
    fetchEventDetail(event.id);
  };

  const handleDetailsOpenChange = (open: boolean) => {
    setShowDetails(open);
    if (!open) {
      setSelectedEvent(null);
      clearDetail();
    }
  };

  const items = timelineData?.items || [];
  const pagination = timelineData?.pagination;
  const activeView: TimelineView = isMobile ? "rail" : view;

  if (loading && !timelineData) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4'></div>
          <p className='text-sm text-slate-500'>Loading quantity timeline...</p>
        </div>
      </div>
    );
  }

  const viewOptions: { value: TimelineView; label: string; icon: ReactNode }[] =
    [
      { value: "board", label: "Timeline", icon: <CalendarRange /> },
      { value: "rail", label: "List", icon: <List /> },
    ];

  return (
    <div className='space-y-5 w-full min-w-0 flex-1'>
      <div
        className={`bg-white flex flex-col ${
          fullscreen
            ? "fixed inset-0 z-40 rounded-none border-0 shadow-2xl"
            : "rounded-xl border border-slate-200 shadow-sm container"
        }`}>
        {/* Title bar + view switcher + fullscreen */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 shrink-0'>
          <div className='flex items-center gap-2'>
            <History className='h-4 w-4 text-indigo-600' />
            <h3 className='text-sm font-semibold text-slate-900'>
              Quantity Timeline
            </h3>
            <span className='text-xs text-slate-500'>
              {pagination?.totalItems || 0} event
              {(pagination?.totalItems || 0) === 1 ? "" : "s"}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            {!isMobile && (
              <div className='flex items-center rounded-lg border border-slate-200 p-0.5'>
                {viewOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => setView(opt.value)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      view === opt.value
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}>
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type='button'
              onClick={() => setFullscreen((f) => !f)}
              title={fullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
              className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50'>
              {fullscreen ? (
                <Minimize2 className='h-4 w-4' />
              ) : (
                <Maximize2 className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          className={
            fullscreen ? "min-w-0 min-h-0 flex-1 overflow-hidden" : "min-w-0"
          }>
          {activeView === "board" ? (
            <QuantityTimelineBoard items={items} onSelect={handleEventClick} />
          ) : (
            <div className={fullscreen ? "h-full overflow-y-auto" : undefined}>
              <QuantityTimelineRail items={items} onSelect={handleEventClick} />
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className='shrink-0 border-t border-slate-200 px-5 py-4'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
            <div className='text-sm text-slate-600'>
              Showing{" "}
              {((pagination?.currentPage || 1) - 1) *
                (pagination?.itemsPerPage || 20) +
                1}
              -
              {Math.min(
                (pagination?.currentPage || 1) *
                  (pagination?.itemsPerPage || 20),
                pagination?.totalItems || 0,
              )}{" "}
              of {pagination?.totalItems || 0} events
            </div>
            <div className='flex items-center gap-2'>
              <Select
                value={`${pagination?.itemsPerPage || 20}`}
                onValueChange={(value) =>
                  fetchTimeline({ limit: Number(value), page: 1 })
                }>
                <SelectTrigger className='w-20 h-9'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='20'>20</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                  <SelectItem value='100'>100</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant='outline'
                size='sm'
                disabled={!pagination?.hasPreviousPage}
                onClick={() =>
                  fetchTimeline({ page: (pagination?.currentPage || 1) - 1 })
                }
                className='border-slate-300 text-slate-700 hover:bg-slate-50'>
                Previous
              </Button>
              <span className='text-sm text-slate-700'>
                Page {pagination?.currentPage || 1} of{" "}
                {pagination?.totalPages || 1}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={!pagination?.hasNextPage}
                onClick={() =>
                  fetchTimeline({ page: (pagination?.currentPage || 1) + 1 })
                }
                className='border-slate-300 text-slate-700 hover:bg-slate-50'>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Drawer (mobile) / Sheet (desktop) */}
      {isMobile ? (
        <Drawer open={showDetails} onOpenChange={handleDetailsOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                <EventDetailHeader event={detailEvent || selectedEvent} />
              </DrawerTitle>
            </DrawerHeader>
            <ScrollArea className='h-[65vh] px-4 pb-6'>
              <EventDetailContent
                event={detailEvent}
                loading={detailLoading}
                selected={selectedEvent}
              />
            </ScrollArea>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={showDetails} onOpenChange={handleDetailsOpenChange}>
          <SheetContent className='w-full sm:max-w-xl'>
            <SheetHeader>
              <SheetTitle>
                <EventDetailHeader event={detailEvent || selectedEvent} />
              </SheetTitle>
              <SheetDescription className='sr-only'>
                Quantity event detail
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className='h-[calc(100vh-190px)] mt-4 pr-2'>
              <EventDetailContent
                event={detailEvent}
                loading={detailLoading}
                selected={selectedEvent}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

interface EventDetailHeaderProps {
  event: TimelineEvent | null;
}

const EventDetailHeader = ({ event }: EventDetailHeaderProps) => {
  if (!event) return <span>Quantity Event</span>;
  const positive = (event.impact.change || 0) > 0;
  const negative = (event.impact.change || 0) < 0;
  return (
    <div className='flex items-center gap-4'>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${
          NODE_STYLES[event.movementType] || "bg-slate-500"
        }`}>
        <History className='h-5 w-5' />
      </div>
      <div className='min-w-0 text-left'>
        <p className='text-base font-semibold text-slate-900'>{event.label}</p>
        <p className='truncate text-xs text-slate-500'>
          {event.reference.display || "Internal event"}
        </p>
      </div>
      <div
        className={`ml-auto rounded-lg px-3 py-1.5 text-lg font-bold ${
          positive
            ? "bg-emerald-50 text-emerald-700"
            : negative
              ? "bg-rose-50 text-rose-700"
              : "bg-slate-100 text-slate-600"
        }`}>
        {positive ? "+" : ""}
        {event.impact.change ?? 0}
      </div>
    </div>
  );
};

interface EventDetailContentProps {
  event: TimelineEvent | null;
  selected: TimelineEvent | null;
  loading: boolean;
}

const EventDetailContent = ({
  event,
  selected,
  loading,
}: EventDetailContentProps) => {
  if (loading) {
    return (
      <div className='flex items-center justify-center h-40'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4'></div>
          <p className='text-sm text-slate-500'>Loading event details...</p>
        </div>
      </div>
    );
  }

  const data = event || selected;
  if (!data) {
    return (
      <div className='text-center py-8 text-slate-500 text-sm'>
        Event details unavailable
      </div>
    );
  }

  const changeClass =
    data.impact.change === null || data.impact.change === undefined
      ? "text-slate-600"
      : data.impact.change > 0
        ? "text-emerald-600"
        : data.impact.change < 0
          ? "text-rose-600"
          : "text-slate-600";

  const variationRows: TimelineVariation[] = data.variations || [];

  return (
    <div className='space-y-5'>
      {/* Quantity impact */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-center'>
          <p className='text-[11px] font-medium uppercase tracking-wide text-slate-500'>
            Before
          </p>
          <p className='mt-1 text-xl font-bold text-slate-800'>
            {data.impact.before ?? "-"}
          </p>
        </div>
        <div className='rounded-lg border border-slate-200 bg-white p-3 text-center'>
          <p className='text-[11px] font-medium uppercase tracking-wide text-slate-500'>
            Change
          </p>
          <p className={`mt-1 text-xl font-bold ${changeClass}`}>
            {data.impact.change === null || data.impact.change === undefined
              ? "-"
              : `${data.impact.change > 0 ? "+" : ""}${data.impact.change}`}
          </p>
        </div>
        <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center'>
          <p className='text-[11px] font-medium uppercase tracking-wide text-indigo-500'>
            After
          </p>
          <p className='mt-1 text-xl font-bold text-indigo-700'>
            {data.impact.after ?? "-"}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className='rounded-lg border border-slate-200 divide-y divide-slate-100'>
        {[
          ["Reason", data.reason || "-"],
          ["Performed by", data.performedBy || "system"],
          [
            "Date",
            data.createdAt
              ? format(new Date(data.createdAt), "dd MMM yyyy, HH:mm:ss")
              : "-",
          ],
          ["Variants affected", `${data.variationCount}`],
        ].map(([label, value]) => (
          <div
            key={label}
            className='flex items-start justify-between gap-4 px-4 py-2.5 text-sm'>
            <span className='shrink-0 text-slate-500'>{label}</span>
            <span className='text-right capitalize text-slate-800'>
              {value}
            </span>
          </div>
        ))}
        <div className='flex items-start justify-between gap-4 px-4 py-2.5 text-sm'>
          <span className='shrink-0 text-slate-500'>Reference</span>
          <span className='text-right text-slate-800'>
            {data.reference.display || "-"}
            {data.reference.type && (
              <span className='ml-1 text-xs text-slate-400'>
                ({data.reference.type})
              </span>
            )}
          </span>
        </div>
        {data.referenceDetail && (
          <div className='px-4 py-3 space-y-1.5 text-sm'>
            {data.referenceDetail.orderNumber && (
              <div className='flex justify-between gap-4'>
                <span className='text-slate-500'>
                  {data.referenceDetail.type === "return_order"
                    ? "Return #"
                    : "Order #"}
                </span>
                <span className='font-mono text-slate-800'>
                  {data.referenceDetail.orderNumber}
                </span>
              </div>
            )}
            {data.referenceDetail.purchaseNumber && (
              <div className='flex justify-between gap-4'>
                <span className='text-slate-500'>Purchase #</span>
                <span className='font-mono text-slate-800'>
                  {data.referenceDetail.purchaseNumber}
                </span>
              </div>
            )}
            {data.referenceDetail.status && (
              <div className='flex justify-between gap-4'>
                <span className='text-slate-500'>Status</span>
                <span className='capitalize text-slate-800'>
                  {data.referenceDetail.status}
                </span>
              </div>
            )}
            {data.referenceDetail.customer && (
              <div className='flex justify-between gap-4'>
                <span className='text-slate-500'>Customer</span>
                <span className='text-slate-800'>
                  {data.referenceDetail.customer}
                </span>
              </div>
            )}
            {data.referenceDetail.total !== undefined && (
              <div className='flex justify-between gap-4'>
                <span className='text-slate-500'>Total</span>
                <span className='text-slate-800'>
                  {data.referenceDetail.total}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variant breakdown */}
      {variationRows.length > 0 && (
        <div>
          <h4 className='mb-2 text-sm font-semibold text-slate-900'>
            Variant Breakdown
          </h4>
          <div className='overflow-x-auto rounded-lg border border-slate-200'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-200 bg-slate-50 text-left'>
                  <th className='px-3 py-2 font-semibold text-slate-600'>
                    Variant
                  </th>
                  <th className='px-3 py-2 font-semibold text-slate-600 text-right'>
                    Before
                  </th>
                  <th className='px-3 py-2 font-semibold text-slate-600 text-right'>
                    Change
                  </th>
                  <th className='px-3 py-2 font-semibold text-slate-600 text-right'>
                    After
                  </th>
                </tr>
              </thead>
              <tbody>
                {variationRows.map((variation) => (
                  <tr
                    key={variation.variationId}
                    className='border-b border-slate-100 last:border-0'>
                    <td className='px-3 py-2'>
                      <p className='font-medium text-slate-800'>
                        {variation.title ||
                          variation.sku ||
                          variation.variationId}
                      </p>
                      <p className='text-xs text-slate-500'>
                        {[variation.color, variation.size]
                          .filter(Boolean)
                          .join(" / ") ||
                          variation.sku ||
                          "Standard"}
                      </p>
                    </td>
                    <td className='px-3 py-2 text-right text-slate-700'>
                      {variation.before}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-semibold ${
                        variation.change > 0
                          ? "text-emerald-600"
                          : variation.change < 0
                            ? "text-rose-600"
                            : "text-slate-600"
                      }`}>
                      {variation.change > 0 ? "+" : ""}
                      {variation.change}
                    </td>
                    <td className='px-3 py-2 text-right font-semibold text-slate-800'>
                      {variation.after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityTimelineTab;
