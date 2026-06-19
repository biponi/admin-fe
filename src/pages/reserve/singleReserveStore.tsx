import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trash,
  Loader2,
  Package,
  Edit,
  Plus,
  Warehouse,
  MapPin,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Palette,
  Hash,
  Clock,
  User,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { IRecord } from "./interface";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { deleteStoreRecord } from "../../api/reserve";
import dayjs from "dayjs";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { calculateTotalPrice } from "./utils/functions";
import { Badge } from "../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { generateInventoryPDF } from "../../utils/reactPdfStorerecord";
import { useReserveRecords } from "./hooks/useReserveRecords";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const RowSkeleton: React.FC = () => (
  <tr className='animate-pulse border-b border-gray-100'>
    {[28, 120, 96, 200, 80, 40, 40, 40].map((w, i) => (
      <td key={i} className='py-4 px-4'>
        <div
          className={`h-3.5 bg-gray-100 rounded-full`}
          style={{ width: w }}
        />
      </td>
    ))}
  </tr>
);

// ─── Product chip ─────────────────────────────────────────────────────────────
const ProductChip: React.FC<{ val: any }> = ({ val }) => (
  <div className='inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-violet-50 border border-violet-100 text-xs'>
    {(val.variantDetails?.image || val.image) && (
      <img
        src={val.variantDetails?.image || val.image}
        alt=''
        className='w-7 h-7 object-cover rounded-md border border-violet-200 shrink-0'
      />
    )}
    <span
      className='font-medium text-gray-800 truncate max-w-[90px]'
      title={val?.name}>
      {val?.name}
    </span>
    {val.variantDetails?.size && (
      <span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-medium'>
        <Ruler className='w-2.5 h-2.5' />
        {val.variantDetails.size}
      </span>
    )}
    {val.variantDetails?.color && (
      <span className='inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-medium'>
        <Palette className='w-2.5 h-2.5' />
        {val.variantDetails.color}
      </span>
    )}
    <span className='ml-0.5 px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold'>
      ×{val?.quantity}
    </span>
  </div>
);

// ─── Column header ─────────────────────────────────────────────────────────────
const Th: React.FC<{
  icon?: React.ReactNode;
  children: React.ReactNode;
  center?: boolean;
}> = ({ icon, children, center }) => (
  <th
    className={`px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap ${center ? "text-center" : "text-left"}`}>
    <span
      className={`inline-flex items-center gap-1.5 ${center ? "justify-center" : ""}`}>
      {icon}
      {children}
    </span>
  </th>
);

// ─── Main component ────────────────────────────────────────────────────────────
const SingleReserveStore: React.FC = () => {
  const { hasRequiredPermission } = useRoleCheck();
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const {
    records,
    storeInfo,
    pagination,
    isLoading: isLoadingStore,
    currentPage,
    pageLimit,
    setPageLimit,
    nextPage,
    prevPage,
    refreshRecords,
  } = useReserveRecords(storeId);

  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  const handleDeleteRecord = async (recordId: string) => {
    if (!recordId || !storeId) return;
    try {
      setDeletingRecordId(recordId);
      const deleted = await deleteStoreRecord(storeId, recordId);
      if (deleted?.success) {
        refreshRecords();
        toast.success("Record removed successfully");
      } else {
        setErrorDialog({
          isOpen: true,
          message: deleted?.error ?? "Unable to delete the record.",
        });
      }
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeletingRecordId(null);
    }
  };

  // ─── Popover for extra products ──────────────────────────────────────────────
  const renderOverflowPopover = (record: IRecord) => (
    <Popover>
      <PopoverTrigger asChild>
        <button className='inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-dashed border-violet-300 text-violet-600 text-xs font-semibold hover:bg-violet-50 transition-colors'>
          <Plus className='w-3 h-3' />
          {record.products.length - 2} more
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0 shadow-xl border border-gray-100 rounded-2xl overflow-hidden'>
        <div className='px-4 py-3 border-b border-gray-100 bg-gray-50'>
          <p className='text-sm font-semibold text-gray-800'>More products</p>
          <p className='text-xs text-gray-400 mt-0.5'>
            {record.products.length - 2} additional items
          </p>
        </div>
        <div className='p-3 flex flex-col gap-2 max-h-64 overflow-y-auto'>
          {record.products.slice(2).map((val, i) => (
            <ProductChip key={i} val={val} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  // ─── Empty state ─────────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <div className='flex flex-col items-center justify-center py-20 px-4 text-center'>
      <div className='w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4'>
        <Package className='w-8 h-8 text-violet-400' strokeWidth={1.5} />
      </div>
      <h3 className='text-base font-semibold text-gray-800 mb-1'>
        No records yet
      </h3>
      <p className='text-sm text-gray-400 max-w-xs mb-6'>
        Start tracking inventory by adding the first record to this store.
      </p>
      {hasRequiredPermission("ReserveRecord", "create") && (
        <Button
          onClick={() => navigate(`/store/${storeId}/add-record`)}
          className='bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 shadow-sm'>
          <Plus className='w-4 h-4' />
          Add First Record
        </Button>
      )}
    </div>
  );

  // ─── No store empty state ────────────────────────────────────────────────────
  const renderNoStore = () => (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm'>
      {renderEmpty()}
    </div>
  );

  // ─── Table ───────────────────────────────────────────────────────────────────
  const renderTable = () => (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
      {/* Table toolbar */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100'>
        <div>
          <h2 className='text-sm font-semibold text-gray-900'>
            Inventory Records
          </h2>
          <p className='text-xs text-gray-400 mt-0.5'>
            {pagination?.totalItems ?? 0} total record
            {pagination?.totalItems !== 1 ? "s" : ""}
          </p>
        </div>
        {hasRequiredPermission("ReserveRecord", "create") && (
          <Button
            onClick={() => navigate(`/store/${storeId}/add-record`)}
            size='sm'
            className='bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-1.5 shadow-sm text-xs h-8 px-3'>
            <Plus className='w-3.5 h-3.5' strokeWidth={2.5} />
            Add Record
          </Button>
        )}
      </div>

      {/* Scrollable table */}
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[700px]'>
          <thead>
            <tr className='bg-gray-50/80 border-b border-gray-100'>
              <Th icon={<Hash className='w-3 h-3' />}>#</Th>
              <Th icon={<Clock className='w-3 h-3' />}>Created</Th>
              <Th icon={<User className='w-3 h-3' />}>Created by</Th>
              <Th icon={<ShoppingBag className='w-3 h-3' />}>Products</Th>
              <Th icon={<DollarSign className='w-3 h-3' />}>Total</Th>
              {hasRequiredPermission("ReserveRecord", "delete") && (
                <Th center>Delete</Th>
              )}
              {hasRequiredPermission("ReserveRecord", "edit") && (
                <Th center>Edit</Th>
              )}
              {hasRequiredPermission("ReserveRecord", "edit") && (
                <Th center>PDF</Th>
              )}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-50'>
            {isLoadingStore ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : records && records.length > 0 ? (
              records.map((record: IRecord, index: number) => (
                <tr
                  key={index}
                  className='hover:bg-gray-50/60 transition-colors group'>
                  {/* # */}
                  <td className='px-4 py-3.5 text-xs font-bold text-violet-500 whitespace-nowrap'>
                    {(currentPage - 1) * pageLimit + index + 1}
                  </td>

                  {/* Created At */}
                  <td className='px-4 py-3.5 whitespace-nowrap'>
                    <span className='text-xs text-gray-500'>
                      {dayjs(record?.created_at).format("DD MMM YYYY")}
                    </span>
                    <span className='block text-[10px] text-gray-300 mt-0.5'>
                      {dayjs(record?.created_at).format("HH:mm")}
                    </span>
                  </td>

                  {/* Created By */}
                  <td className='px-4 py-3.5 whitespace-nowrap'>
                    <div className='flex items-center gap-2'>
                      <div className='w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0'>
                        <span className='text-[10px] font-bold text-violet-600'>
                          {record?.created_by?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <span className='text-xs font-medium text-gray-700 truncate max-w-[100px]'>
                        {record?.created_by}
                      </span>
                    </div>
                  </td>

                  {/* Products */}
                  <td className='px-4 py-3.5'>
                    <div className='flex flex-wrap gap-1.5'>
                      {record.products.length > 3 ? (
                        <>
                          {record.products.slice(0, 2).map((val, i) => (
                            <ProductChip key={i} val={val} />
                          ))}
                          {renderOverflowPopover(record)}
                        </>
                      ) : (
                        record.products.map((val, i) => (
                          <ProductChip key={i} val={val} />
                        ))
                      )}
                    </div>
                  </td>

                  {/* Total */}
                  <td className='px-4 py-3.5 whitespace-nowrap'>
                    <span className='text-sm font-bold text-gray-900'>
                      ৳{calculateTotalPrice(record?.products)}
                    </span>
                  </td>

                  {/* Delete */}
                  {hasRequiredPermission("ReserveRecord", "delete") && (
                    <td className='px-4 py-3.5 text-center whitespace-nowrap'>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={deletingRecordId === record?._id}
                            className='w-7 h-7 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-40'>
                            {deletingRecordId === record?._id ? (
                              <Loader2 className='w-3.5 h-3.5 animate-spin' />
                            ) : (
                              <Trash className='w-3.5 h-3.5' />
                            )}
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className='rounded-2xl'>
                          <AlertDialogHeader>
                            <div className='flex items-center gap-3 mb-1'>
                              <div className='w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center'>
                                <Trash className='w-4 h-4 text-rose-600' />
                              </div>
                              <AlertDialogTitle>Delete Record</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription>
                              This record will be permanently removed. This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className='rounded-xl'>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteRecord(record?._id ?? "")
                              }
                              className='bg-rose-600 hover:bg-rose-700 rounded-xl text-white'>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  )}

                  {/* Edit */}
                  {hasRequiredPermission("ReserveRecord", "edit") && (
                    <td className='px-4 py-3.5 text-center whitespace-nowrap'>
                      <button
                        onClick={() =>
                          navigate(
                            `/store/${storeId}/edit-record/${record?.id}`,
                          )
                        }
                        className='w-7 h-7 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50 transition-all'>
                        <Edit className='w-3.5 h-3.5' />
                      </button>
                    </td>
                  )}

                  {/* PDF */}
                  {hasRequiredPermission("ReserveRecord", "edit") && (
                    <td className='px-4 py-3.5 text-center whitespace-nowrap'>
                      <button
                        onClick={() =>
                          generateInventoryPDF(
                            storeInfo?.name || "",
                            record?.created_by,
                            record?.created_at,
                            record?.products,
                          )
                        }
                        className='w-7 h-7 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-sky-200 hover:text-sky-600 hover:bg-sky-50 transition-all'>
                        <DownloadCloud className='w-3.5 h-3.5' />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>{renderEmpty()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50'>
          <p className='text-xs text-gray-400 order-2 sm:order-1'>
            Showing{" "}
            <span className='font-semibold text-gray-700'>
              {(currentPage - 1) * pageLimit + 1}–
              {Math.min(currentPage * pageLimit, pagination.totalItems)}
            </span>{" "}
            of{" "}
            <span className='font-semibold text-gray-700'>
              {pagination.totalItems}
            </span>
          </p>

          <div className='flex items-center gap-2 order-1 sm:order-2'>
            <Select
              value={`${pageLimit}`}
              onValueChange={(v) => setPageLimit(parseInt(v, 10))}>
              <SelectTrigger className='h-7 w-16 text-xs rounded-lg border-gray-200'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className='text-xs'>Per page</SelectLabel>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={`${n}`} className='text-xs'>
                      {n}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                disabled={!pagination.hasPreviousPage}
                onClick={prevPage}
                className='h-7 px-2.5 text-xs rounded-lg border-gray-200 gap-1'>
                <ChevronLeft className='w-3 h-3' />
                Prev
              </Button>
              <span className='px-2 text-xs font-medium text-gray-500'>
                {currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={!pagination.hasNextPage}
                onClick={nextPage}
                className='h-7 px-2.5 text-xs rounded-lg border-gray-200 gap-1'>
                Next
                <ChevronRight className='w-3 h-3' />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Store header ─────────────────────────────────────────────────────────────
  const renderHeader = () => (
    <div className='bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4'>
      {isLoadingStore ? (
        <div className='animate-pulse flex items-center gap-4'>
          <div className='w-12 h-12 rounded-xl bg-gray-100' />
          <div className='flex-1 space-y-2'>
            <div className='h-4 w-40 bg-gray-100 rounded-full' />
            <div className='h-3 w-24 bg-gray-100 rounded-full' />
          </div>
        </div>
      ) : (
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200'>
              <Warehouse className='w-5 h-5 text-white' strokeWidth={2} />
            </div>
            <div>
              <h1 className='text-base font-bold text-gray-900 leading-tight'>
                {storeInfo?.name || "Store"}
              </h1>
              {storeInfo?.location && (
                <p className='flex items-center gap-1 text-xs text-gray-400 mt-0.5'>
                  <MapPin className='w-3 h-3' />
                  {storeInfo.location}
                </p>
              )}
            </div>
          </div>

          {storeInfo && (
            <div className='flex items-center gap-2'>
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100'>
                <Package className='w-3.5 h-3.5 text-violet-500' />
                <span className='text-xs font-semibold text-violet-700'>
                  {pagination?.totalItems ?? 0} Records
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <MainView title='Store Information'>
      <div className='px-4 py-5 sm:px-6 space-y-4 md:container mx-auto'>
        {renderHeader()}
        {!!storeInfo || isLoadingStore ? renderTable() : renderNoStore()}
        <ErrorAlertDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: "" })}
          message={errorDialog.message}
        />
      </div>
    </MainView>
  );
};

export default SingleReserveStore;
