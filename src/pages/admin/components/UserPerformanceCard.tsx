import React, { useEffect, useState } from "react";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import { UserPerformanceSummary } from "../../../api/adminAudit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  Package,
  ShoppingCart,
  User,
  TrendingUp,
  Activity,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserPerformanceDialog } from "./UserPerformanceDialog";

dayjs.extend(relativeTime);

interface UserPerformanceCardProps {
  startDate: string;
  endDate: string;
}

export const UserPerformanceCard: React.FC<UserPerformanceCardProps> = ({
  startDate,
  endDate,
}) => {
  const { fetchUserPerformance, isLoading, error } = useAdminAudit();
  const [users, setUsers] = useState<UserPerformanceSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserPerformanceSummary | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  const loadUsers = async () => {
    const data = await fetchUserPerformance({
      startDate,
      endDate,
      limit: 100,
    });

    if (data) {
      setUsers(data.users);
      if (data.users.length > 0 && !selectedUserId) {
        setSelectedUserId(data.users[0].userId);
        setSelectedUser(data.users[0]);
      }
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find((u) => u.userId === userId);
    setSelectedUser(user || null);
  };

  const handleViewDetails = () => {
    if (selectedUser) {
      setDialogOpen(true);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Performance Overview</CardTitle>
          <CardDescription>No user data available</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No users found in the selected date range
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Performance Overview</CardTitle>
          <CardDescription>
            Select a user to view their performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Selection Dropdown */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium min-w-fit">
              Select User:
            </label>
            <Select value={selectedUserId} onValueChange={handleUserChange}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.userId} value={user.userId}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        ({user.userEmail})
                      </span>
                      <Badge variant="outline" className="ml-2">
                        {user.userType}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected User Stats */}
          {selectedUser && (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Actions */}
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Actions
                    </p>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">
                    {(
                      selectedUser.orderOperations.total +
                      selectedUser.productAdjustments.total
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Combined activities
                  </p>
                </div>

                {/* Order Operations */}
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Order Operations
                    </p>
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedUser.orderOperations.total.toLocaleString()}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Creates:</span>
                      <span className="font-medium text-green-600">
                        {selectedUser.orderOperations.creates}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium">
                        {selectedUser.orderOperations.statusUpdates}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payments:</span>
                      <span className="font-medium">
                        {selectedUser.orderOperations.paymentUpdates}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product Adjustments */}
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Stock Adjustments
                    </p>
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedUser.productAdjustments.total.toLocaleString()}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Added:</span>
                      <span className="font-medium text-green-600">
                        +{selectedUser.productAdjustments.quantityAdded}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Removed:</span>
                      <span className="font-medium text-red-600">
                        -{selectedUser.productAdjustments.quantityRemoved}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span className="font-medium">
                        {selectedUser.productAdjustments.uniqueProducts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      Last Activity
                    </p>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold">
                    {dayjs(selectedUser.lastActivity).fromNow()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dayjs(selectedUser.lastActivity).format(
                      "MMM DD, YYYY HH:mm"
                    )}
                  </p>
                </div>
              </div>

              {/* User Info and Actions */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedUser.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.userEmail}
                    </p>
                  </div>
                  <Badge variant="secondary">{selectedUser.userType}</Badge>
                </div>
                <button
                  onClick={handleViewDetails}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium">
                  View Detailed Report
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detailed User Performance Dialog */}
      {selectedUser && (
        <UserPerformanceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          userId={selectedUser.userId}
          userName={selectedUser.userName}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
};
