import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Store as StoreIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { addRecord } from "../../api/reserve";
import RecordForm from "./common/recordForm";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";
import { useIsMobile } from "../../hooks/use-mobile";
import { MobilePage } from "../../components/mobile";
import { PageHeader } from "../../components/PageHeader";

const AddRecord: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  const handleSubmit = async (products: any[]) => {
    if (!storeId) {
      toast.error("Store ID is missing");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await addRecord({ products: [...products], storeId });
      if (response?.success) {
        toast.success("Record added successfully");
        navigate(`/store/${storeId}`);
      } else {
        setErrorDialog({
          isOpen: true,
          message: response?.error ?? "Record not added",
        });
      }
    } catch {
      setErrorDialog({ isOpen: true, message: "Failed to add record" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(`/store/${storeId}`);

  // ─── Mobile presentation ──────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <MobilePage
        title='Add Record'
        icon={<StoreIcon className='h-5 w-5 text-primary' />}
        subtitle='Search and add products to create an inventory record'
        back
        onBack={handleCancel}>
        <div className='space-y-4 p-4'>
          {/* Header info */}
          <div className='rounded-2xl border bg-card px-4 py-3'>
            <div className='flex items-center gap-3'>
              <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-200'>
                <Package className='h-5 w-5' strokeWidth={2} />
              </div>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-foreground leading-tight'>
                  Add New Record
                </p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  Search and add products to create an inventory record
                </p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className='overflow-hidden rounded-2xl border bg-card'>
            <div className='border-b px-4 py-3'>
              <p className='text-sm font-semibold text-foreground'>
                Record Details
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Add at least one product to save this record
              </p>
            </div>
            <div className='p-4'>
              <RecordForm
                storeId={storeId || ""}
                mode='add'
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
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
    <MainView title='Add Record'>
      <div className='px-4 py-5 sm:px-6 space-y-4 md:container mx-auto'>
        {/* Header */}
        <PageHeader
          icon={<StoreIcon className='w-5 h-5 text-white' strokeWidth={2} />}
          title='Add Record'
          subtitle='Search and add products to create an inventory record'
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

        {/* Form card */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-gray-100'>
            <h2 className='text-sm font-semibold text-gray-900'>
              Record Details
            </h2>
            <p className='text-xs text-gray-400 mt-0.5'>
              Add at least one product to save this record
            </p>
          </div>
          <div className='p-5'>
            <RecordForm
              storeId={storeId || ""}
              mode='add'
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        <ErrorAlertDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: "" })}
          message={errorDialog.message}
        />
      </div>
    </MainView>
  );
};

export default AddRecord;
