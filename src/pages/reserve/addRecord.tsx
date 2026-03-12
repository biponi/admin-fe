import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { addRecord } from "../../api/reserve";
import { Card, CardContent } from "../../components/ui/card";
import RecordForm from "./common/recordForm";
import ErrorAlertDialog from "../../components/common/ErrorAlertDialog";

const AddRecord: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

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
      const response = await addRecord({
        products: [...products],
        storeId,
      });

      if (response?.success) {
        toast.success("Record added successfully");
        navigate(`/store/${storeId}`);
      } else {
        setErrorDialog({
          isOpen: true,
          message: response?.error ?? "Record not added",
        });
      }
    } catch (error) {
      setErrorDialog({
        isOpen: true,
        message: "Failed to add record",
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
        <CardContent className='p-6 sm:p-8 relative z-10'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg'>
              <Package className='h-8 w-8 text-white' strokeWidth={2.5} />
            </div>
            <div className='flex-1'>
              <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                Add New Record
              </h1>
              <p className='text-white/90 text-sm sm:text-base'>
                Search and add products to create a new inventory record
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
    return (
      <div className='container mx-auto p-4 sm:p-6'>
        {renderHeader()}
        <Card className='border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-card/95'>
          <CardContent className='p-6'>
            <RecordForm
              storeId={storeId || ""}
              mode='add'
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

  return <MainView title='Add Record'>{renderMainView()}</MainView>;
};

export default AddRecord;
