import React, { useEffect, useState } from "react";
import { useOrderAudit } from "../../../hooks/useOrderAudit";
import { AuditLogEntry } from "../../../api/orderAudit";

interface OrderAuditTimelineProps {
  orderId: string;
  limit?: number;
}

/**
 * Example component for displaying order audit trail
 * Demonstrates proper usage of the Order Audit API
 */
export const OrderAuditTimeline: React.FC<OrderAuditTimelineProps> = ({
  orderId,
  limit = 50,
}) => {
  const { fetchOrderAudit, isLoading, error } = useOrderAudit();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const loadAuditTrail = async () => {
      const auditData = await fetchOrderAudit(orderId, { limit });
      if (auditData) {
        setAuditLogs(auditData.auditLogs);
        setTotalLogs(auditData.totalLogs);
      }
    };

    loadAuditTrail();
  }, [orderId, limit, fetchOrderAudit]);

  const getOperationIcon = (operation: string) => {
    const icons: Record<string, string> = {
      create: "🆕",
      status_update: "🔄",
      payment_update: "💰",
      product_update: "📦",
      bulk_action: "📋",
      customer_update: "👤",
      shipping_update: "🚚",
      courier_update: "📮",
      cancel: "❌",
      delete: "🗑️",
      restore: "↩️",
      fraud_review: "⚠️",
      notes_update: "📝",
    };
    return icons[operation] || "•";
  };

  const getOperationColor = (operation: string) => {
    const colors: Record<string, string> = {
      create: "#22c55e",
      status_update: "#3b82f6",
      payment_update: "#f59e0b",
      product_update: "#8b5cf6",
      cancel: "#ef4444",
      delete: "#dc2626",
      fraud_review: "#f97316",
    };
    return colors[operation] || "#6b7280";
  };

  if (isLoading) {
    return <div className="audit-timeline-loading">Loading audit trail...</div>;
  }

  if (error) {
    return <div className="audit-timeline-error">Error: {error}</div>;
  }

  return (
    <div className="order-audit-timeline">
      <div className="timeline-header">
        <h3>Order Audit Trail</h3>
        <span className="total-logs">
          {totalLogs} {totalLogs === 1 ? "entry" : "entries"}
        </span>
      </div>

      {auditLogs.length === 0 ? (
        <div className="no-logs">No audit logs found for this order.</div>
      ) : (
        <div className="timeline-container">
          {auditLogs.map((log, index) => (
            <div key={log.id} className="timeline-entry">
              <div
                className="timeline-marker"
                style={{ backgroundColor: getOperationColor(log.operation) }}
              >
                <span className="operation-icon">
                  {getOperationIcon(log.operation)}
                </span>
              </div>

              <div className="timeline-content">
                <div className="entry-header">
                  <span className="operation-type">{log.operation}</span>
                  <span className="timestamp">
                    {new Date(log.timestamps.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="entry-description">
                  {log.operationDescription}
                </div>

                <div className="entry-metadata">
                  <span className="user-info">
                    By: {log.performedBy.userName} (
                    {log.performedBy.userEmail})
                  </span>
                  {log.isBulkOperation && (
                    <span className="bulk-badge">Bulk Operation</span>
                  )}
                </div>

                {log.changesummary && log.changesummary.length > 0 && (
                  <div className="changes-summary">
                    <strong>Changes:</strong>
                    <ul>
                      {log.changesummary.map((change, idx) => (
                        <li key={idx}>
                          <strong>{change.field}:</strong>{" "}
                          <span className="old-value">
                            {JSON.stringify(change.oldValue)}
                          </span>{" "}
                          →
                          <span className="new-value">
                            {JSON.stringify(change.newValue)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {log.reason && (
                  <div className="entry-reason">
                    <strong>Reason:</strong> {log.reason}
                  </div>
                )}

                {log.ipAddress && (
                  <div className="entry-ip">
                    <small>IP: {log.ipAddress}</small>
                  </div>
                )}
              </div>

              {index < auditLogs.length - 1 && (
                <div className="timeline-connector" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Example CSS for styling (add to your stylesheet):
 *
 * .order-audit-timeline {
 *   max-width: 800px;
 *   margin: 20px auto;
 *   padding: 20px;
 * }
 *
 * .timeline-header {
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: center;
 *   margin-bottom: 20px;
 * }
 *
 * .timeline-container {
 *   position: relative;
 *   padding-left: 40px;
 * }
 *
 * .timeline-entry {
 *   position: relative;
 *   padding-bottom: 30px;
 * }
 *
 * .timeline-marker {
 *   position: absolute;
 *   left: -40px;
 *   width: 32px;
 *   height: 32px;
 *   border-radius: 50%;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   color: white;
 *   font-size: 16px;
 * }
 *
 * .timeline-connector {
 *   position: absolute;
 *   left: -24px;
 *   top: 32px;
 *   width: 2px;
 *   height: calc(100% - 32px);
 *   background-color: #e5e7eb;
 * }
 *
 * .timeline-content {
 *   background: white;
 *   border: 1px solid #e5e7eb;
 *   border-radius: 8px;
 *   padding: 16px;
 * }
 *
 * .entry-header {
 *   display: flex;
 *   justify-content: space-between;
 *   margin-bottom: 8px;
 * }
 *
 * .operation-type {
 *   font-weight: 600;
 *   text-transform: uppercase;
 *   font-size: 12px;
 *   color: #6b7280;
 * }
 *
 * .timestamp {
 *   font-size: 12px;
 *   color: #9ca3af;
 * }
 *
 * .entry-description {
 *   margin-bottom: 12px;
 *   color: #1f2937;
 * }
 *
 * .changes-summary {
 *   margin-top: 12px;
 *   padding: 12px;
 *   background-color: #f9fafb;
 *   border-radius: 4px;
 * }
 *
 * .old-value {
 *   color: #ef4444;
 *   text-decoration: line-through;
 * }
 *
 * .new-value {
 *   color: #22c55e;
 *   font-weight: 500;
 * }
 *
 * .bulk-badge {
 *   background-color: #fbbf24;
 *   color: #78350f;
 *   padding: 2px 8px;
 *   border-radius: 12px;
 *   font-size: 11px;
 *   margin-left: 8px;
 * }
 */

/**
 * Example Usage in Parent Component:
 *
 * @example
 * ```tsx
 * const OrderDetailPage = ({ orderId }) => {
 *   return (
 *     <div>
 *       <h1>Order Details</h1>
 *       <div className="order-info">
 *         Order information here
 *       </div>
 *       <OrderAuditTimeline orderId={orderId} limit={50} />
 *     </div>
 *   );
 * };
 * ```
 */
