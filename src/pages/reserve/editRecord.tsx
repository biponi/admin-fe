import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Store as StoreIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { editStoreRecord, getReserveStore } from "../../api/reserve";
import RecordForm from "./common/recordForm";
import { distinctProducts } from "./utils/functions";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";
import { IRecord } from "./interface";
import { useIsMobile } from "../../hooks/use-mobile";
import { MobilePage, MobileSkeletonList } from "../../components/mobile";
import { PageHeader } from "../../components/PageHeader";
import { PageLoader } from "@/components/loaders";

const EditRecord: React.FC = () => {
  const { storeId, recordId } = useParams<{
    storeId: string;
    recordId: string;
  }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const [initialProducts, setInitialProducts] = useState<any[]>([]);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const fetchRecord = async () => {
      if (!storeId) return;
      try {
        setIsLoadingRecord(true);
        const response = await getReserveStore(storeId);
        if (response?.success && response?.data) {
          const record = (response.data.records || []).find(
            (r: IRecord) => r.id === recordId || r._id === recordId,
          );
          if (record) {
            setInitialProducts(record.products || []);
          } else {
            toast.error("Record not found");
            navigate(`/store/${storeId}`);
          }
        } else {
          toast.error("Failed to load record");
          navigate(`/store/${storeId}`);
        }
      } catch {
        toast.error("Failed to load record");
        navigate(`/store/${storeId}`);
      } finally {
        setIsLoadingRecord(false);
      }
    };
    fetchRecord();
  }, [storeId, recordId, navigate]);

  const handleSubmit = async (products: any[]) => {
    if (!storeId || !recordId) {
      toast.error("Store ID or Record ID is missing");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await editStoreRecord({
        products: [...distinctProducts(products)],
        storeId,
        recordId,
      });
      if (response?.success) {
        toast.success("Record updated successfully");
        navigate(`/store/${storeId}`);
      } else {
        setErrorDialog({
          isOpen: true,
          message: response?.error ?? "Record not updated",
        });
      }
    } catch {
      setErrorDialog({ isOpen: true, message: "Failed to update record" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/store/${storeId}`);

  // ─── Mobile presentation ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <MobilePage
        title='Edit Record'
        icon={<StoreIcon className='h-5 w-5 text-primary' />}
        subtitle='Modify products and quantities for this record'
        back
        onBack={handleCancel}>
        <div className='space-y-4 p-4'>
          {/* Header info */}
          <div className='rounded-2xl border bg-card px-4 py-3'>
            <div className='flex items-center gap-3'>
              <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-200'>
                <Edit className='h-5 w-5' strokeWidth={2} />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-foreground leading-tight'>
                  Edit Record
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Modify products and quantities for this inventory record
                </p>
              </div>
            </div>
          </div>

          {isLoadingRecord ? (
            <MobileSkeletonList />
          ) : (
            /* Form card */
            <div className='overflow-hidden rounded-2xl border bg-card'>
              <div className='border-b px-4 py-3'>
                <p className='text-sm font-semibold text-foreground'>
                  Record Details
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Update products or quantities, then save your changes
                </p>
              </div>
              <div className='p-4'>
                <RecordForm
                  storeId={storeId || ""}
                  mode='edit'
                  recordId={recordId}
                  initialProducts={initialProducts}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>

        <ErrorAlertDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: "" })}
          message={errorDialog.message}
        />
      </MobilePage>
    );
  }

  return (
    <MainView title='Edit Record'>
      <div className='px-4 py-5 sm:px-6 space-y-4 max-w-7xl mx-auto'>
        {/* Header */}
        <PageHeader
          icon={<StoreIcon className='w-5 h-5 text-white' strokeWidth={2} />}
          title='Edit Record'
          subtitle='Modify products and quantities for this inventory record'
          actions={
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancel}
              className='h-8 px-3 text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 gap-1.5 shrink-0'>
              <ArrowLeft className='w-3.5 h-3.5' />
              Back
            </Button>
          }
        />

        {/* Loading state */}
        {isLoadingRecord ? (
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm'>
            <PageLoader domain='delivery' text='Loading Record' />
          </div>
        ) : (
          /* Form card */
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
            <div className='px-5 py-4 border-b border-gray-100'>
              <h2 className='text-sm font-semibold text-gray-900'>
                Record Details
              </h2>
              <p className='text-xs text-gray-400 mt-0.5'>
                Update products or quantities, then save your changes
              </p>
            </div>
            <div className='p-5'>
              <RecordForm
                storeId={storeId || ""}
                mode='edit'
                recordId={recordId}
                initialProducts={initialProducts}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        <ErrorAlertDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: "" })}
          message={errorDialog.message}
        />
      </div>
    </MainView>
  );
};

export default EditRecord;
