import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainView from "../../../coreComponents/mainView";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Plus, Search, Edit, Trash2, Power, Ticket } from "lucide-react";
import Swal from "sweetalert2";
import * as couponAPI from "../../../api/coupon";
import type { GlobalCoupon, FilterOptions } from "../interface";

export default function GlobalCouponsPage() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<GlobalCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    discountType: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCoupons();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.status !== "all") params.status = filters.status;
      if (filters.discountType !== "all")
        params.discountType = filters.discountType;

      const response = await couponAPI.getAllGlobalCoupons(params);
      if (response.success && response.data) {
        setCoupons(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "expired":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "disabled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "scheduled":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const handleDisable = async (code: string) => {
    const result = await Swal.fire({
      title: "Disable Coupon",
      text: "Are you sure you want to disable this coupon?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, disable it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await couponAPI.disableGlobalCoupon(code);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Disabled",
            text: "Coupon has been disabled successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchCoupons();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: response?.error || "Failed to disable coupon",
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.message || "Failed to disable coupon",
        });
      }
    }
  };

  const handleDelete = async (code: string) => {
    const result = await Swal.fire({
      title: "Delete Coupon",
      text: "Are you sure you want to delete this coupon? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await couponAPI.deleteGlobalCoupon(code);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Coupon has been deleted successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchCoupons();
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: response?.error || "Failed to delete coupon",
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.message || "Failed to delete coupon",
        });
      }
    }
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === "active").length;
  const expiredCoupons = coupons.filter((c) => c.status === "expired").length;
  const totalUsed = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  if (loading) {
    return (
      <MainView title="Global Coupons">
        <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
          <div className="text-slate-500">Loading...</div>
        </div>
      </MainView>
    );
  }

  return (
    <MainView title="Global Coupons">
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
                <Ticket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 leading-tight">
                  Global Coupons
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage public coupons available to all customers
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/coupons/global/create")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200">
                <Plus className="h-4 w-4" />
                Create Coupon
              </button>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: "Total Coupons",
                value: totalCoupons.toString(),
                accent: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                label: "Active Coupons",
                value: activeCoupons.toString(),
                accent: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                label: "Expired Coupons",
                value: expiredCoupons.toString(),
                accent: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Total Used",
                value: totalUsed.toString(),
                accent: "text-rose-600",
                bg: "bg-rose-50",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm">
                <div
                  className={`w-2 h-2 rounded-full ${stat.bg.replace("bg-", "bg-").replace("50", "400")}`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-lg font-semibold ${stat.accent} leading-none`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    setFilters({ ...filters, status: value as any })
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Discount Type
                </label>
                <Select
                  value={filters.discountType}
                  onValueChange={(value) =>
                    setFilters({ ...filters, discountType: value as any })
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-slate-50/50">
                    <TableHead className="font-semibold text-slate-700">
                      Code
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Discount
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Validity
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Usage
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Auto-Apply
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <Ticket className="w-12 h-12 text-slate-300" />
                          <p>No coupons found. Create your first coupon to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow
                        key={coupon._id}
                        className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-mono font-medium text-slate-900">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">
                              {coupon.name}
                            </div>
                            {coupon.description && (
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {coupon.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900">
                              {coupon.discountType === "fixed"
                                ? `${coupon.discountValue} BDT`
                                : `${coupon.discountValue}%`}
                            </div>
                            {coupon.maxDiscountAmount && (
                              <div className="text-xs text-slate-500">
                                Max: {coupon.maxDiscountAmount} BDT
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            <div>
                              From:{" "}
                              {new Date(coupon.validFrom).toLocaleDateString()}
                            </div>
                            <div>
                              Until:{" "}
                              {new Date(
                                coupon.validUntil,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">
                            <div className="font-medium text-slate-900">
                              {coupon.usedCount} used
                            </div>
                            <div className="text-slate-500">
                              {coupon.totalUsageLimit
                                ? `${coupon.totalUsageLimit} total`
                                : "Unlimited"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusColor(coupon.status)}
                            variant="outline">
                            {coupon.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.autoApply ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Priority: {coupon.priority}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-sm">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() =>
                                navigate(
                                  `/coupons/global/edit/${coupon.code}`,
                                )
                              }
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-150">
                              <Edit className="w-4 h-4" />
                            </button>
                            {coupon.status === "active" && (
                              <button
                                onClick={() => handleDisable(coupon.code)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-all duration-150">
                                <Power className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(coupon.code)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </MainView>
  );
}
