import { useState, useCallback } from "react";
import { useToast } from "../../../components/ui/use-toast";
import {
  getStockTimeline,
  getStockTimelineEvent,
  StockTimelineResponse,
  TimelineEvent,
  TimelineQueryParams,
} from "../../../api/stockTimeline";

export const useStockTimeline = (productId: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timelineData, setTimelineData] =
    useState<StockTimelineResponse | null>(null);
  const [timelineParams, setTimelineParams] = useState<TimelineQueryParams>({
    page: 1,
    limit: 20,
    sort: "desc",
  });

  const [detailEvent, setDetailEvent] = useState<TimelineEvent | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTimeline = useCallback(
    async (params?: TimelineQueryParams) => {
      setLoading(true);
      setError(null);
      try {
        const mergedParams = { ...timelineParams, ...params };
        const response = await getStockTimeline(productId, mergedParams);
        if (response?.success && response?.data) {
          setTimelineData(response.data);
          if (params) {
            setTimelineParams(mergedParams);
          }
        } else {
          setError(response?.error || "Failed to fetch quantity timeline");
          toast({
            variant: "destructive",
            title: "Error",
            description:
              response?.error || "Failed to fetch quantity timeline",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [productId, toast],
  ); // timelineParams intentionally omitted to prevent infinite loop

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchEventDetail = useCallback(
    async (eventId: string) => {
      if (!eventId) return;
      setDetailLoading(true);
      setError(null);
      try {
        const response = await getStockTimelineEvent(productId, eventId);
        if (response?.success && response?.data) {
          setDetailEvent(response.data.event);
        } else {
          setError(response?.error || "Failed to fetch timeline event");
          toast({
            variant: "destructive",
            title: "Error",
            description: response?.error || "Failed to fetch timeline event",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setDetailLoading(false);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [productId, toast],
  );

  const clearDetail = useCallback(() => {
    setDetailEvent(null);
  }, []);

  return {
    loading,
    error,
    timelineData,
    timelineParams,
    fetchTimeline,
    detailEvent,
    detailLoading,
    fetchEventDetail,
    clearDetail,
  };
};
