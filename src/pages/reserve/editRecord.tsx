import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { editStoreRecord } from "../../api/reserve";
import { getReserveStore } from "../../api/reserve";
import { Card, CardContent } from "../../components/ui/card";
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
  }>({ isOpen: false, message: "" });

  // Load existing record data
  useEffect(() => {
    const fetchRecord = async () => {
      if (!storeId) return;

      try {
        setIsLoadingRecord(true);
        const response = await getReserveStore(storeId);

        if (response?.success && response?.data) {
          const records = response.data.records || [];
          const record = records.find(
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
      } catch (error) {
        console.error("Error fetching record:", error);
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

    const productList = distinctProducts(products);

    try {
      setIsSubmitting(true);
      const response = await editStoreRecord({
        products: [...productList],
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
    } catch (error) {
      setErrorDialog({
        isOpen: true,
        message: "Failed to update record",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/store/${storeId}`);
  };

  const renderHeader = () => {
    return (
      <Card className='border-0 shadow-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white overflow-hidden mb-6'>
        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32'></div>
        <CardContent className='p-4 sm:p-4 relative z-10'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg'>
              <Edit className='h-5 w-5 text-white' strokeWidth={2.5} />
            </div>
            <div className='flex-1'>
              <h1 className='text-xl sm:text-2xl font-bold mb-2'>
                Edit Record
              </h1>
              <p className='text-white/90 text-sm sm:text-base'>
                Modify products and quantities for this inventory record
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancel}
              className='bg-white/10 hover:bg-white/20 border-white/20 text-white'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Store
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMainView = () => {
    if (isLoadingRecord) {
      return (
        <div className='container mx-auto p-4 sm:p-6'>
          {renderHeader()}
          <Card className='border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-card/95'>
            <CardContent className='p-12'>
              <div className='flex flex-col items-center justify-center py-16'>
                <Loader2 className='w-12 h-12 text-purple-600 animate-spin mb-4' />
                <p className='text-lg font-semibold text-foreground'>
                  Loading record...
                </p>
                <p className='text-sm text-muted-foreground mt-2'>
                  Please wait a moment
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className='w-full mx-auto p-4'>
        {renderHeader()}
        <Card className='border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-card/95'>
          <CardContent className='p-6'>
            <RecordForm
              storeId={storeId || ""}
              mode='edit'
              recordId={recordId}
              initialProducts={initialProducts}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
        <ErrorAlertDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog({ isOpen: false, message: "" })}
          message={errorDialog.message}
        />
      </div>
    );
  };

  return <MainView title='Edit Record'>{renderMainView()}</MainView>;
};

export default EditRecord;
