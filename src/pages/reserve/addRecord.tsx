import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { addRecord } from "../../api/reserve";
import RecordForm from "./common/recordForm";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";

const AddRecord: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
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

  return (
    <MainView title='Add Record'>
      <div className='px-4 py-5 sm:px-6 space-y-4 md:container mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200'>
                <Package className='w-5 h-5 text-white' strokeWidth={2} />
              </div>
              <div>
                <h1 className='text-base font-bold text-gray-900 leading-tight'>
                  Add New Record
                </h1>
                <p className='text-xs text-gray-400 mt-0.5'>
                  Search and add products to create an inventory record
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancel}
              className='h-8 px-3 text-xs rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 gap-1.5 shrink-0'>
              <ArrowLeft className='w-3.5 h-3.5' />
              Back
            </Button>
          </div>
        </div>

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
