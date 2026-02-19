import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Plus, Search, Edit, Trash2, Power } from "lucide-react";
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
        return "bg-green-100 text-green-800 border-green-300";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "disabled":
        return "bg-red-100 text-red-800 border-red-300";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
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

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>Loading...</div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Global Coupons</h1>
          <p className='text-muted-foreground mt-2'>
            Manage public coupons available to all customers
          </p>
        </div>
        <Button
          onClick={() => navigate("/coupons/global/create")}
          className='gap-2'>
          <Plus className='w-4 h-4' />
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='text-sm font-medium mb-2 block'>Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value as any })
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='expired'>Expired</SelectItem>
                  <SelectItem value='disabled'>Disabled</SelectItem>
                  <SelectItem value='scheduled'>Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex-1'>
              <label className='text-sm font-medium mb-2 block'>
                Discount Type
              </label>
              <Select
                value={filters.discountType}
                onValueChange={(value) =>
                  setFilters({ ...filters, discountType: value as any })
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Types</SelectItem>
                  <SelectItem value='fixed'>Fixed Amount</SelectItem>
                  <SelectItem value='percentage'>Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex-1'>
              <label className='text-sm font-medium mb-2 block'>Search</label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  placeholder='Search by code or name...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto-Apply</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='text-center py-8 text-muted-foreground'>
                    No coupons found. Create your first coupon to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className='font-mono font-medium'>
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{coupon.name}</div>
                        {coupon.description && (
                          <div className='text-sm text-muted-foreground truncate max-w-xs'>
                            {coupon.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className='font-medium'>
                          {coupon.discountType === "fixed"
                            ? `${coupon.discountValue} BDT`
                            : `${coupon.discountValue}%`}
                        </div>
                        {coupon.maxDiscountAmount && (
                          <div className='text-xs text-muted-foreground'>
                            Max: {coupon.maxDiscountAmount} BDT
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>
                          From:{" "}
                          {new Date(coupon.validFrom).toLocaleDateString()}
                        </div>
                        <div>
                          Until:{" "}
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>{coupon.usedCount} used</div>
                        <div className='text-muted-foreground'>
                          {coupon.totalUsageLimit
                            ? `${coupon.totalUsageLimit} total`
                            : "Unlimited"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(coupon.status)}
                        variant='outline'>
                        {coupon.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.autoApply ? (
                        <Badge
                          variant='outline'
                          className='bg-green-50 text-green-700 border-green-300'>
                          Priority: {coupon.priority}
                        </Badge>
                      ) : (
                        <span className='text-muted-foreground text-sm'>
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            navigate(`/coupons/global/edit/${coupon.code}`)
                          }>
                          <Edit className='w-4 h-4' />
                        </Button>
                        {coupon.status === "active" && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDisable(coupon.code)}>
                            <Power className='w-4 h-4' />
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(coupon.code)}>
                          <Trash2 className='w-4 h-4 text-red-600' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
