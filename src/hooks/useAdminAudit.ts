import { useState } from "react";
import {
  getAuditDashboard,
  getUserPerformanceOverview,
  getUserPerformanceDetail,
  getTopPerformers,
  DashboardOverviewResponse,
  UserPerformanceOverviewResponse,
  UserPerformanceDetailResponse,
  TopPerformersResponse,
  PerformanceMetric,
  DateRangeParams,
} from "../api/adminAudit";

/**
 * Custom hook for admin audit dashboard
 * Provides functions to fetch dashboard data, user performance, and analytics
 */
export const useAdminAudit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch dashboard overview with system-wide metrics
   */
  const fetchDashboard = async (
    params?: DateRangeParams
  ): Promise<DashboardOverviewResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAuditDashboard(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch audit dashboard";
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
   * Fetch user performance overview for all users
   */
  const fetchUserPerformance = async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<UserPerformanceOverviewResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserPerformanceOverview(params);

      if (!response.success || !response.data) {
        const errorMsg =
          response.error || "Failed to fetch user performance overview";
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
   * Fetch detailed performance report for a specific user
   */
  const fetchUserDetail = async (
    userId: string,
    params?: DateRangeParams
  ): Promise<UserPerformanceDetailResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserPerformanceDetail(userId, params);

      if (!response.success || !response.data) {
        const errorMsg =
          response.error || "Failed to fetch user performance details";
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
   * Fetch top performers based on selected metric
   */
  const fetchTopPerformers = async (params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    metric?: PerformanceMetric;
  }): Promise<TopPerformersResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getTopPerformers(params);

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Failed to fetch top performers";
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
    fetchDashboard,
    fetchUserPerformance,
    fetchUserDetail,
    fetchTopPerformers,
    isLoading,
    error,
  };
};

/**
 * Example usage:
 *
 * const AuditDashboardPage = () => {
 *   const { fetchDashboard, fetchTopPerformers, isLoading, error } = useAdminAudit();
 *   const [dashboardData, setDashboardData] = useState(null);
 *   const [topPerformers, setTopPerformers] = useState([]);
 *
 *   useEffect(() => {
 *     loadDashboard();
 *     loadTopPerformers();
 *   }, []);
 *
 *   const loadDashboard = async () => {
 *     const today = new Date();
 *     const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
 *
 *     const data = await fetchDashboard({
 *       startDate: lastMonth.toISOString(),
 *       endDate: new Date().toISOString()
 *     });
 *
 *     if (data) {
 *       setDashboardData(data);
 *     }
 *   };
 *
 *   const loadTopPerformers = async () => {
 *     const data = await fetchTopPerformers({
 *       limit: 10,
 *       metric: 'total'
 *     });
 *
 *     if (data) {
 *       setTopPerformers(data.topPerformers);
 *     }
 *   };
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div className="error">{error}</div>;
 *
 *   return (
 *     <div className="dashboard">
 *       <div className="stats">
 *         <StatCard
 *           title="Total Operations"
 *           value={dashboardData?.orderAudits.totalAudits}
 *         />
 *         <StatCard
 *           title="Product Adjustments"
 *           value={dashboardData?.productAdjustments.totalAdjustments}
 *         />
 *       </div>
 *
 *       <TopPerformersLeaderboard performers={topPerformers} />
 *     </div>
 *   );
 * };
 *
 * // Example: User Performance Table
 * const UserPerformanceTable = () => {
 *   const { fetchUserPerformance, isLoading } = useAdminAudit();
 *   const [users, setUsers] = useState([]);
 *
 *   useEffect(() => {
 *     loadUsers();
 *   }, []);
 *
 *   const loadUsers = async () => {
 *     const data = await fetchUserPerformance({ limit: 50 });
 *     if (data) {
 *       setUsers(data.users);
 *     }
 *   };
 *
 *   return (
 *     <table>
 *       <thead>
 *         <tr>
 *           <th>User</th>
 *           <th>Order Operations</th>
 *           <th>Adjustments</th>
 *           <th>Last Activity</th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         {users.map(user => (
 *           <tr key={user.userId}>
 *             <td>{user.userName}</td>
 *             <td>{user.orderOperations.total}</td>
 *             <td>{user.productAdjustments.total}</td>
 *             <td>{new Date(user.lastActivity).toLocaleString()}</td>
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   );
 * };
 *
 * // Example: User Detail View
 * const UserDetailPage = ({ userId }) => {
 *   const { fetchUserDetail, isLoading } = useAdminAudit();
 *   const [userDetail, setUserDetail] = useState(null);
 *
 *   useEffect(() => {
 *     loadUserDetail();
 *   }, [userId]);
 *
 *   const loadUserDetail = async () => {
 *     const data = await fetchUserDetail(userId, {
 *       startDate: '2025-01-01',
 *       endDate: '2025-11-06'
 *     });
 *
 *     if (data) {
 *       setUserDetail(data);
 *     }
 *   };
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h1>{userDetail?.user.name} - Performance Report</h1>
 *       <div className="summary">
 *         <p>Total Order Actions: {userDetail?.summary.totalOrderActions}</p>
 *         <p>Total Adjustments: {userDetail?.summary.totalProductAdjustments}</p>
 *       </div>
 *
 *       <ActivityChart data={userDetail?.activityTrend} />
 *     </div>
 *   );
 * };
 */
