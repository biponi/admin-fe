import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { editStoreRecord, getReserveStore } from "../../api/reserve";
import RecordForm from "./common/recordForm";
import { distinctProducts } from "./utils/functions";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";
import { IRecord } from "./interface";

const EditRecord: React.FC = () => {
  const { storeId, recordId } = useParams<{
    storeId: string;
    recordId: string;
  }>();
  const navigate = useNavigate();

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

  return (
    <MainView title='Edit Record'>
      <div className='px-4 py-5 sm:px-6 space-y-4 max-w-7xl mx-auto'>
        {/* Header */}
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200'>
                <Edit className='w-5 h-5 text-white' strokeWidth={2} />
              </div>
              <div>
                <h1 className='text-base font-bold text-gray-900 leading-tight'>
                  Edit Record
                </h1>
                <p className='text-xs text-gray-400 mt-0.5'>
                  Modify products and quantities for this inventory record
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

        {/* Loading state */}
        {isLoadingRecord ? (
          <div className='bg-white rounded-2xl border border-gray-100 shadow-sm'>
            <div className='flex flex-col items-center justify-center py-20 gap-3'>
              <Loader2 className='w-8 h-8 text-violet-500 animate-spin' />
              <p className='text-sm font-medium text-gray-700'>
                Loading record…
              </p>
              <p className='text-xs text-gray-400'>Please wait a moment</p>
            </div>
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
