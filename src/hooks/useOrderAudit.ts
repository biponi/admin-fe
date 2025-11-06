import { useState } from "react";
import {
  getOrderAudit,
  getAllAudits,
  getUserAudits,
  getAuditStats,
  OrderAuditResponse,
  AllAuditsResponse,
  UserAuditsResponse,
  AuditStatsResponse,
  AuditOperation,
} from "../api/orderAudit";

/**
 * Custom hook for order audit trail
 * Provides functions to fetch and analyze order audit logs
 */
export const useOrderAudit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch audit trail for a specific order
   */
  const fetchOrderAudit = async (
    orderId: string,
    params?: {
      limit?: number;
      operation?: AuditOperation;
    }
  ): Promise<OrderAuditResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getOrderAudit(orderId, params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch order audit trail";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch all audit logs with filters
   */
  const fetchAllAudits = async (params?: {
    limit?: number;
    page?: number;
    operation?: AuditOperation;
    userId?: string;
    orderId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AllAuditsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllAudits(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch audit logs";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch audit logs for a specific user
   */
  const fetchUserAudits = async (
    userId: string,
    params?: {
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<UserAuditsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserAudits(userId, params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch user audit logs";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch audit statistics
   */
  const fetchAuditStats = async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AuditStatsResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAuditStats(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch audit statistics";
        setError(errorMsg);
        return null;
      }

      return response.data;
    } catch (err: any) {
      const errorMsg = err.message || "An unexpected error occurred";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchOrderAudit,
    fetchAllAudits,
    fetchUserAudits,
    fetchAuditStats,
    isLoading,
    error,
  };
};

/**
 * Example usage:
 *
 * const OrderAuditTimeline = ({ orderId }) => {
 *   const { fetchOrderAudit, isLoading, error } = useOrderAudit();
 *   const [auditLogs, setAuditLogs] = useState([]);
 *
 *   useEffect(() => {
 *     loadAuditTrail();
 *   }, [orderId]);
 *
 *   const loadAuditTrail = async () => {
 *     const auditData = await fetchOrderAudit(orderId, { limit: 50 });
 *     if (auditData) {
 *       setAuditLogs(auditData.auditLogs);
 *     }
 *   };
 *
 *   if (isLoading) return <div>Loading audit trail...</div>;
 *   if (error) return <div className="error">{error}</div>;
 *
 *   return (
 *     <div className="audit-timeline">
 *       {auditLogs.map(log => (
 *         <div key={log.id} className="audit-entry">
 *           <span className="timestamp">
 *             {new Date(log.timestamps.createdAt).toLocaleString()}
 *           </span>
 *           <span className="user">{log.performedBy.userName}</span>
 *           <span className="operation">{log.operation}</span>
 *           <span className="description">{log.operationDescription}</span>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 *
 * // Example: Fetch all audits with filters
 * const AuditLogViewer = () => {
 *   const { fetchAllAudits, isLoading } = useOrderAudit();
 *   const [audits, setAudits] = useState([]);
 *
 *   const loadAudits = async () => {
 *     const data = await fetchAllAudits({
 *       operation: 'status_update',
 *       limit: 50,
 *       page: 1,
 *       startDate: '2025-01-01',
 *       endDate: '2025-11-06'
 *     });
 *
 *     if (data) {
 *       setAudits(data.auditLogs);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={loadAudits}>Load Audits</button>
 *       {isLoading && <div>Loading...</div>}
 *       {audits.map(audit => (
 *         <div key={audit.id}>{audit.operationDescription}</div>
 *       ))}
 *     </div>
 *   );
 * };
 */
