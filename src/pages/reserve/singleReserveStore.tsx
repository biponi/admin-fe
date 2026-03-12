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
import { Card, CardContent } from "../../components/ui/card";
import { generateInventoryPDF } from "../../utils/reactPdfStorerecord";
import { useReserveRecords } from "./hooks/useReserveRecords";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";

// Skeleton loader for table rows
const TableRowSkeleton: React.FC = () => (
  <tr className='animate-pulse'>
    <td className='whitespace-nowrap py-4 px-6'>
      <div className='h-4 w-8 bg-muted rounded'></div>
    </td>
    <td className='whitespace-nowrap py-4 px-6'>
      <div className='h-4 w-32 bg-muted rounded'></div>
    </td>
    <td className='whitespace-nowrap py-4 px-6'>
      <div className='h-4 w-24 bg-muted rounded'></div>
    </td>
    <td className='whitespace-nowrap py-4 px-6'>
      <div className='h-8 w-full bg-muted rounded'></div>
    </td>
    <td className='whitespace-nowrap py-4 px-6'>
      <div className='h-4 w-20 bg-muted rounded'></div>
    </td>
    <td className='whitespace-nowrap py-4 px-6 text-center'>
      <div className='h-8 w-16 bg-muted rounded mx-auto'></div>
    </td>
    <td className='whitespace-nowrap py-4 px-6 text-center'>
      <div className='h-8 w-16 bg-muted rounded mx-auto'></div>
    </td>
  </tr>
);

const SingleReserveStore: React.FC = () => {
  const { hasRequiredPermission } = useRoleCheck();
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  // Use the custom hook for pagination
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
  }>({ isOpen: false, message: "" });

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
          message: deleted?.error ?? "Server was unable to delete the record.",
        });
      }
    } catch (error) {
      toast.error("Failed to delete record");
    } finally {
      setDeletingRecordId(null);
    }
  };

  const renderEmptyStoreData = () => {
    return (
      <Card className='border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-card/95'>
        <CardContent className='p-16'>
          <div className='flex flex-col items-center justify-center text-center'>
            <div className='relative mb-6'>
              <div className='absolute inset-0 bg-purple-500/20 rounded-full blur-2xl'></div>
              <div className='relative p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl'>
                <Package
                  className='h-20 w-20 text-purple-600'
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h3 className='text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
              No Store Data Found
            </h3>
            <p className='text-muted-foreground max-w-md mb-6'>
              This store doesn't have any records yet. Get started by adding
              your first record to track inventory.
            </p>
            {hasRequiredPermission("ReserveRecord", "create") && (
              <Button
                onClick={() => navigate(`/store/${storeId}/add-record`)}
                className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg'>
                <Plus className='mr-2 h-4 w-4' /> Add First Record
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVariationPopover = (record: IRecord) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size={"sm"}
            className='border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300'>
            <Package className='h-3.5 w-3.5 mr-1.5' />+
            {record?.products?.length - 2} More
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-96 bg-gradient-to-br from-card via-card/98 to-card/95 border-0 shadow-2xl'>
          <div className='mb-3'>
            <h4 className='font-semibold text-sm bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
              Additional Products
            </h4>
            <p className='text-xs text-muted-foreground mt-1'>
              {record?.products?.length - 2} more items in this record
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2 w-full max-h-[30vh] overflow-y-auto pr-2'>
            {record?.products
              ?.slice(2, record?.products?.length)
              .map((val, index) => (
                <div
                  key={index}
                  className='p-2 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100/50 transition-colors duration-200'>
                  <div
                    className='text-xs font-medium text-foreground truncate'
                    title={val?.name}>
                    {val?.name}
                  </div>
                  <Badge variant='secondary' className='mt-1 text-xs'>
                    Qty: {val?.quantity}
                  </Badge>
                </div>
              ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderStoreTable = () => {
    return (
      <Card className='border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-card/95'>
        <CardContent className='p-6'>
          {/* Table Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
            <div>
              <h2 className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
                Store Records
              </h2>
              <p className='mt-1.5 text-sm text-muted-foreground'>
                Manage and track all inventory records for this store location.
              </p>
            </div>
            {hasRequiredPermission("ReserveRecord", "create") && (
              <Button
                type='button'
                onClick={() => navigate(`/store/${storeId}/add-record`)}
                className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5'>
                <Plus className='mr-2 h-4 w-4' strokeWidth={2.5} />
                Add Record
              </Button>
            )}
          </div>

          {/* Table */}
          <div className='mt-6 rounded-xl border border-border/50 shadow-sm overflow-hidden max-h-[50vh] overflow-y-auto'>
            <table className='min-w-full divide-y divide-border/50'>
              <thead className='sticky top-0 z-10 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 dark:from-purple-950/20 dark:via-indigo-950/20 dark:to-purple-950/50 shadow-sm'>
                <tr>
                  <th
                    scope='col'
                    className='py-4 pl-6 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                    #
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                    Created At
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                    Created By
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                    Products
                  </th>
                  <th
                    scope='col'
                    className='px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                    Total Amount
                  </th>
                  {hasRequiredPermission("ReserveRecord", "delete") && (
                    <th
                      scope='col'
                      className='px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                      Delete
                    </th>
                  )}
                  {hasRequiredPermission("ReserveRecord", "edit") && (
                    <th
                      scope='col'
                      className='px-3 py-4 pr-6 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                      Edit
                    </th>
                  )}
                  {hasRequiredPermission("ReserveRecord", "edit") && (
                    <th
                      scope='col'
                      className='px-3 py-4 pr-6 text-center text-xs font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-100'>
                      Download PDF
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-border/30 bg-card'>
                {isLoadingStore ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : records && records.length > 0 ? (
                  records.map((record: IRecord, index: number) => (
                    <tr
                      key={index}
                      className='hover:bg-purple-50/50 dark:hover:bg-purple-950/10 transition-colors duration-150'>
                      <td className='whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-purple-600'>
                        {(currentPage - 1) * pageLimit + Number(index) + 1}
                      </td>
                      <td className='whitespace-nowrap px-3 py-4 text-sm text-muted-foreground'>
                        {dayjs(record?.created_at).format(
                          "DD-MM-YYYY HH:mm:ss",
                        )}
                      </td>
                      <td className='whitespace-nowrap px-3 py-4 text-sm font-medium'>
                        {record?.created_by}
                      </td>
                      <td className='px-3 py-4 text-sm'>
                        <div className='flex flex-wrap gap-2'>
                          {record?.products?.length > 3 ? (
                            <>
                              {record?.products
                                ?.slice(0, 2)
                                .map((val, index) => (
                                  <div
                                    key={index}
                                    className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-800'>
                                    <span
                                      className='text-xs font-medium truncate max-w-[120px]'
                                      title={val?.name}>
                                      {val?.name}
                                    </span>
                                    <Badge
                                      variant='secondary'
                                      className='text-xs font-bold'>
                                      ×{val?.quantity}
                                    </Badge>
                                  </div>
                                ))}
                              {renderVariationPopover(record)}
                            </>
                          ) : (
                            record?.products?.map((val, index) => (
                              <div
                                key={index}
                                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-800'>
                                <span
                                  className='text-xs font-medium truncate max-w-[120px]'
                                  title={val?.name}>
                                  {val?.name}
                                </span>
                                <Badge
                                  variant='secondary'
                                  className='text-xs font-bold'>
                                  ×{val?.quantity}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-3 py-4 text-sm font-bold text-purple-600'>
                        ৳{calculateTotalPrice(record?.products)}
                      </td>
                      {hasRequiredPermission("ReserveRecord", "delete") && (
                        <td className='whitespace-nowrap px-3 py-4 text-center'>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='outline'
                                size='sm'
                                disabled={deletingRecordId === record?._id}
                                className='border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 disabled:opacity-50'>
                                {deletingRecordId === record?._id ? (
                                  <Loader2 className='w-4 h-4 animate-spin' />
                                ) : (
                                  <Trash className='w-4 h-4' />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <div className='flex items-center gap-3 mb-2'>
                                  <div className='p-2 bg-rose-500/10 rounded-lg'>
                                    <Trash className='h-5 w-5 text-rose-600' />
                                  </div>
                                  <AlertDialogTitle className='text-xl'>
                                    Delete Record
                                  </AlertDialogTitle>
                                </div>
                                <AlertDialogDescription className='text-base'>
                                  Are you sure you want to delete this record?
                                  This action cannot be undone and will
                                  permanently remove the record and all
                                  associated data from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteRecord(record?._id ?? "")
                                  }
                                  className='bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white'>
                                  Delete Record
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      )}
                      {hasRequiredPermission("ReserveRecord", "edit") && (
                        <td className='whitespace-nowrap px-3 py-4 pr-6 text-center'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              navigate(
                                `/store/${storeId}/edit-record/${record?.id}`,
                              )
                            }
                            className='border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300'>
                            <Edit className='w-4 h-4' />
                          </Button>
                        </td>
                      )}
                      {hasRequiredPermission("ReserveRecord", "edit") && (
                        <td className='whitespace-nowrap px-3 py-4 pr-6 text-center'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              generateInventoryPDF(
                                storeInfo?.name || "",
                                record?.created_by,
                                record?.created_at,
                                record?.products,
                              );
                            }}
                            className='border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300'>
                            <DownloadCloud className='w-4 h-4' />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className='py-12 text-center'>
                      <div className='flex flex-col items-center'>
                        <Package
                          className='h-12 w-12 text-purple-400 mb-3'
                          strokeWidth={1.5}
                        />
                        <p className='text-sm text-muted-foreground'>
                          No records found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className='mt-6 bg-card rounded-xl border border-border/50 p-4 shadow-sm'>
              {/* Pagination Controls */}
              <div className='flex items-center justify-between gap-4'>
                {/* Items count */}
                <div className='text-center text-sm text-muted-foreground'>
                  Showing{" "}
                  <span className='font-semibold text-foreground'>
                    {(currentPage - 1) * pageLimit + 1}-
                    {Math.min(currentPage * pageLimit, pagination.totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className='font-semibold text-foreground'>
                    {pagination.totalItems}
                  </span>{" "}
                  records
                </div>
                <span className='text-sm font-medium text-foreground'>
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <div className='flex justify-between items-center float-right gap-2'>
                  {/* Page indicator and limit selector */}
                  <div className='flex items-center gap-2'>
                    <Select
                      value={`${pageLimit}`}
                      onValueChange={(value: string) =>
                        setPageLimit(parseInt(value, 10))
                      }>
                      <SelectTrigger className='w-16 h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Per page</SelectLabel>
                          <SelectItem value='10'>10</SelectItem>
                          <SelectItem value='20'>20</SelectItem>
                          <SelectItem value='50'>50</SelectItem>
                          <SelectItem value='100'>100</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    disabled={!pagination.hasPreviousPage}
                    variant='outline'
                    size='sm'
                    onClick={prevPage}
                    className='flex items-center gap-2'>
                    <ChevronLeft className='h-4 w-4' />
                    Previous
                  </Button>

                  <Button
                    disabled={!pagination.hasNextPage}
                    variant='outline'
                    size='sm'
                    onClick={nextPage}
                    className='flex items-center gap-2'>
                    Next
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  const renderMainView = () => {
    return (
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        {/* Store Header Card */}
        <Card className='border-0 shadow-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white overflow-hidden'>
          <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32'></div>
          <CardContent className='p-4 sm:p-4 relative z-10'>
            {isLoadingStore ? (
              <div className='animate-pulse space-y-3'>
                <div className='h-8 w-48 bg-white/20 rounded'></div>
                <div className='h-4 w-64 bg-white/20 rounded'></div>
              </div>
            ) : (
              <div className='flex items-start gap-4'>
                <div className='p-3 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg'>
                  <Warehouse className='h-5 w-5 text-white' strokeWidth={2.5} />
                </div>
                <div className='flex-1 flex justify-between items-center'>
                  <h1 className='text-base sm:text-xl font-bold mb-2'>
                    {storeInfo?.name || "Store Information"}
                  </h1>
                  {storeInfo?.location && (
                    <div className='flex items-center gap-2 text-white/90'>
                      <MapPin className='h-4 w-4' />
                      <p className='text-sm sm:text-base'>
                        {storeInfo.location}
                      </p>
                    </div>
                  )}
                  {storeInfo && (
                    <div className='mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg'>
                      <Package className='h-4 w-4' />
                      <span className='text-sm font-medium'>
                        {pagination?.totalItems || 0} Records
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table or Empty State */}
        {!!storeInfo || isLoadingStore
          ? renderStoreTable()
          : renderEmptyStoreData()}

        {/* Error Alert Dialog */}
        <ErrorAlertDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: "" })}
          message={errorDialog.message}
        />
      </div>
    );
  };

  return <MainView title='Store Information'>{renderMainView()}</MainView>;
};

export default SingleReserveStore;
