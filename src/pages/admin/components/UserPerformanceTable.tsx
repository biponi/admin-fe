import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import {
  UserPerformanceSummary,
  TopPerformer,
  PerformanceMetric,
} from "../../../api/adminAudit";
import { useNavigate } from "react-router-dom";

interface UserPerformanceTableProps {
  limit?: number;
  showTopPerformers?: boolean;
}

/**
 * User Performance Table Component
 * Displays comprehensive user activity and performance metrics
 */
export const UserPerformanceTable: React.FC<UserPerformanceTableProps> = ({
  limit = 50,
  showTopPerformers = true,
}) => {
  const navigate = useNavigate();
  const { fetchUserPerformance, fetchTopPerformers, isLoading, error } =
    useAdminAudit();

  const [users, setUsers] = useState<UserPerformanceSummary[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "orderOperations.total", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetric, setSelectedMetric] =
    useState<PerformanceMetric>("total");

  useEffect(() => {
    loadData();
  }, [dateRange, selectedMetric]);

  const loadData = async () => {
    // Load user performance
    const userData = await fetchUserPerformance({
      startDate: new Date(dateRange.startDate).toISOString(),
      endDate: new Date(dateRange.endDate).toISOString(),
      limit,
    });

    if (userData) {
      setUsers(userData.users);
    }

    // Load top performers
    if (showTopPerformers) {
      const topData = await fetchTopPerformers({
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate).toISOString(),
        limit: 10,
        metric: selectedMetric,
      });

      if (topData) {
        setTopPerformers(topData.topPerformers);
      }
    }
  };

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "desc"
          ? "asc"
          : "desc",
    });
  };

  const handleUserClick = (userId: string) => {
    // Navigate to user detail page
    navigate(`/admin/users/${userId}/performance`);
  };

  const getSortedUsers = () => {
    const filtered = users.filter(
      (user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  if (isLoading) {
    return (
      <div className="performance-loading">
        <div className="spinner"></div>
        <p>Loading user performance data...</p>
      </div>
    );
  }

  if (error) {
    return <div className="performance-error">Error: {error}</div>;
  }

  const sortedUsers = getSortedUsers();

  return (
    <div className="user-performance-container">
      {/* Header */}
      <div className="performance-header">
        <h2>User Performance Overview</h2>
        <div className="header-actions">
          <div className="date-filters">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Top Performers Section */}
      {showTopPerformers && topPerformers.length > 0 && (
        <div className="top-performers-section">
          <div className="section-header">
            <h3>🏆 Top Performers</h3>
            <select
              value={selectedMetric}
              onChange={(e) =>
                setSelectedMetric(e.target.value as PerformanceMetric)
              }
            >
              <option value="total">Total Actions</option>
              <option value="orders">Order Operations</option>
              <option value="adjustments">Product Adjustments</option>
            </select>
          </div>
          <div className="leaderboard">
            {topPerformers.slice(0, 3).map((performer, index) => (
              <div
                key={performer.userId}
                className={`leaderboard-card rank-${index + 1}`}
              >
                <div className="rank-badge">{index + 1}</div>
                <div className="performer-info">
                  <div className="performer-name">{performer.userName}</div>
                  <div className="performer-email">{performer.userEmail}</div>
                </div>
                <div className="performer-stats">
                  <div className="stat">
                    <span className="value">{performer.totalActions}</span>
                    <span className="label">Total</span>
                  </div>
                  <div className="stat">
                    <span className="value">{performer.orderActions}</span>
                    <span className="label">Orders</span>
                  </div>
                  <div className="stat">
                    <span className="value">
                      {performer.productAdjustments}
                    </span>
                    <span className="label">Adjustments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Performance Table */}
      <div className="performance-table-wrapper">
        <table className="performance-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("userName")} className="sortable">
                User
                {sortConfig.key === "userName" && (
                  <span className="sort-icon">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("userType")} className="sortable">
                Type
                {sortConfig.key === "userType" && (
                  <span className="sort-icon">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("orderOperations.total")}
                className="sortable"
              >
                Order Operations
                {sortConfig.key === "orderOperations.total" && (
                  <span className="sort-icon">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("productAdjustments.total")}
                className="sortable"
              >
                Product Adjustments
                {sortConfig.key === "productAdjustments.total" && (
                  <span className="sort-icon">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort("lastActivity")}
                className="sortable"
              >
                Last Activity
                {sortConfig.key === "lastActivity" && (
                  <span className="sort-icon">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.userId} onClick={() => handleUserClick(user.userId)}>
                <td>
                  <div className="user-cell">
                    <div className="user-name">{user.userName}</div>
                    <div className="user-email">{user.userEmail}</div>
                  </div>
                </td>
                <td>
                  <span className={`user-type-badge ${user.userType}`}>
                    {user.userType}
                  </span>
                </td>
                <td>
                  <div className="operations-cell">
                    <div className="total">{user.orderOperations.total}</div>
                    <div className="breakdown">
                      <span>C: {user.orderOperations.creates}</span>
                      <span>U: {user.orderOperations.statusUpdates}</span>
                      <span>P: {user.orderOperations.paymentUpdates}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="adjustments-cell">
                    <div className="total">{user.productAdjustments.total}</div>
                    <div className="breakdown">
                      <span className="positive">
                        +{user.productAdjustments.quantityAdded}
                      </span>
                      <span className="negative">
                        -{user.productAdjustments.quantityRemoved}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{formatDateTime(user.lastActivity)}</td>
                <td>
                  <button
                    className="btn-view-details"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user.userId);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="table-footer">
        <p>
          Showing {sortedUsers.length} of {users.length} users
        </p>
      </div>
    </div>
  );
};

// Helper Functions

const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Example CSS (add to your stylesheet):
 *
 * .user-performance-container {
 *   padding: 24px;
 * }
 *
 * .performance-header {
 *   display: flex;
 *   justify-content: space-between;
 *   align-items: center;
 *   margin-bottom: 24px;
 * }
 *
 * .top-performers-section {
 *   background: white;
 *   padding: 24px;
 *   border-radius: 8px;
 *   margin-bottom: 24px;
 *   box-shadow: 0 1px 3px rgba(0,0,0,0.1);
 * }
 *
 * .leaderboard {
 *   display: grid;
 *   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
 *   gap: 16px;
 *   margin-top: 16px;
 * }
 *
 * .leaderboard-card {
 *   background: #f9fafb;
 *   border-radius: 8px;
 *   padding: 20px;
 *   display: flex;
 *   gap: 16px;
 *   align-items: center;
 * }
 *
 * .rank-badge {
 *   width: 48px;
 *   height: 48px;
 *   border-radius: 50%;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   font-size: 24px;
 *   font-weight: 700;
 * }
 *
 * .rank-1 .rank-badge {
 *   background: linear-gradient(135deg, #ffd700, #ffed4e);
 *   color: #92400e;
 * }
 *
 * .performance-table {
 *   width: 100%;
 *   border-collapse: collapse;
 *   background: white;
 * }
 *
 * .performance-table th {
 *   background: #f9fafb;
 *   padding: 12px;
 *   text-align: left;
 *   font-weight: 600;
 * }
 *
 * .performance-table td {
 *   padding: 12px;
 *   border-bottom: 1px solid #e5e7eb;
 * }
 *
 * .performance-table tbody tr:hover {
 *   background: #f9fafb;
 *   cursor: pointer;
 * }
 *
 * .sortable {
 *   cursor: pointer;
 *   user-select: none;
 * }
 */
