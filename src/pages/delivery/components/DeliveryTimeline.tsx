import React from "react";
import {
  DeliveryTimelineEntry,
  formatDeliveryStatus,
  getStatusBadgeClasses,
} from "../types";
import { Badge } from "../../../components/ui/badge";
import { MapPin, Calendar, User } from "lucide-react";
import dayjs from "dayjs";

interface DeliveryTimelineProps {
  provider: "pathao" | "steadfast";
  timeline: DeliveryTimelineEntry[];
}

export const DeliveryTimeline: React.FC<DeliveryTimelineProps> = ({
  provider,
  timeline,
}) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        <p>No timeline data available</p>
      </div>
    );
  }

  return (
    <div className='relative space-y-6'>
      {/* Vertical line */}
      <div className='absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200' />

      {timeline.map((entry, index) => {
        const statusClasses = getStatusBadgeClasses(entry.status);
        const isLatest = index === 0;

        return (
          <div key={index} className='relative pl-10'>
            {/* Timeline dot */}
            {/* // {entry.status==='pending'} */}
            <div
              className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white ${
                isLatest ? statusClasses.bg : "bg-gray-300"
              } flex items-center justify-center`}>
              <div className='w-3 h-3 bg-white rounded-full' />
            </div>

            {/* Content card */}
            <div
              className={`bg-white border rounded-lg p-4 shadow-sm ${
                isLatest ? "border-blue-300 shadow-md" : "border-gray-200"
              }`}>
              {/* Status badge */}
              <div className='flex items-center justify-between mb-2'>
                <div className='flex justify-start items-center gap-2'>
                  {provider.includes("pathao") ? (
                    <img
                      className='rounded-full shadow w-8'
                      src='https://logosandtypes.com/wp-content/uploads/2025/04/Pathao.png'
                      alt='pathao'
                    />
                  ) : (
                    <img
                      className='rounded-full shadow w-8'
                      src='https://play-lh.googleusercontent.com/9OYsIvc-iKHte4jqVe-c4sA0vNL-tljBDVPguou6B-qdxQgSKpj8pZ7ZYh6MYEbawbo=w240-h480-rw'
                      alt='steadfast'
                    />
                  )}
                  <Badge
                    className={`${statusClasses.bg} ${statusClasses.text} border-0`}>
                    {formatDeliveryStatus(entry.status)}
                  </Badge>
                </div>
                {isLatest && (
                  <span className='text-xs font-semibold text-blue-600 uppercase tracking-wide'>
                    Current
                  </span>
                )}
              </div>

              {/* Timestamp */}
              <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                <Calendar className='w-4 h-4' />
                <span>
                  {dayjs(entry.timestamp).format("MMM D, YYYY [at] h:mm A")}
                </span>
              </div>

              {/* Location */}
              {entry.location && (
                <div className='flex items-center gap-2 text-sm text-gray-700 mb-2'>
                  <MapPin className='w-4 h-4' />
                  <span className='font-medium'>{entry.location}</span>
                </div>
              )}

              {/* Remarks */}
              {entry.remarks && (
                <p className='text-sm text-gray-800 mb-2 pl-6'>
                  {entry.remarks}
                </p>
              )}

              {/* Updated by */}
              <div className='flex items-center gap-2 text-xs text-gray-500 pl-6'>
                <User className='w-3 h-3' />
                <span>Updated by: {entry.updatedBy}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeliveryTimeline;
