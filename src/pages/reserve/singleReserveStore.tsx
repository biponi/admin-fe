import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Cat, Trash } from "lucide-react";
import { IRecord, IStoreReserve } from "./interface";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  addRecord,
  deleteStoreRecord,
  editStoreRecord,
  getReserveStore,
} from "../../api/reserve";
import dayjs from "dayjs";
import DialogForRecord from "./common/dialogForRecord";
import MainView from "../../coreComponents/mainView";
import toast from "react-hot-toast";
import { calculateTotalPrice, distinctProducts } from "./utils/functions";
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

const SingleReserveStore: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [id, setId] = useState<string | undefined>(undefined);
  const [storeInformation, setStoreInformation] =
    useState<IStoreReserve | null>(null);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedProducs, setSelectedProducts] = useState<any[]>([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [recordId, setRecordId] = useState("");

  const getStoreinformation = async () => {
    if (!id) return;
    const storeData = await getReserveStore(id);
    if (storeData?.success) {
      setStoreInformation(storeData?.data);
    }
  };

  useEffect(() => {
    if (!!storeId) {
      setId(storeId);
    }
  }, [storeId]);

  useEffect(() => {
    if (!!id) {
      getStoreinformation();
    }
    //eslint-disable-next-line
  }, [id]);

  const handleSaveRecord = async () => {
    const response = await addRecord({
      products: [...selectedProducs],
      storeId,
    });
    if (response?.success) {
      getStoreinformation();
      setOpenCreateDialog(false);
      setSelectedProducts([]);
    } else {
      toast.error(response?.error ?? "Record not added");
    }
  };

  const handleEditRecord = async () => {
    if (selectedProducs.length < 1) return;

    const productList = distinctProducts(selectedProducs);

    const response = await editStoreRecord({
      products: [...productList],
      storeId,
      recordId,
    });
    if (response?.success) {
      getStoreinformation();
      setOpenEditDialog(false);
      setSelectedProducts([]);
      setRecordId("");
      toast.success("Record updated successfully");
    } else {
      toast.error(response?.error ?? "Record not updated");
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!recordId || !storeId) return;
    const deleted = await deleteStoreRecord(storeId, recordId);
    if (deleted?.success) {
      getStoreinformation();
      toast.success("Record removed successfully");
    } else {
      toast.error(deleted?.error ?? "Server was unable to delete the record.");
    }
  };

  const renderEmptyStoreData = () => {
    return (
      <div className='w-full p-10 flex justify-center items-center rounded-md border border-dashed border-gray-950'>
        <Cat className='w-5 h-5 p-2' />
        <span className='text-base text-red-950 '>
          No Data Found For This Specific Store.
        </span>
      </div>
    );
  };

  const renderVariationPopover = (record: IRecord) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='default' className='bg-gray-700' size={"sm"}>
            View More
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-96'>
          <div className='grid grid-cols-2 gap-2 w-full'>
            {record?.products
              ?.slice(2, record?.products?.length)
              .map((val, index) => (
                <Button key={index} variant={"default"} size={"sm"}>
                  {`${val?.name}`}{" "}
                  <Badge
                    variant={"secondary"}
                    className='ml-2'>{`x${val?.quantity}`}</Badge>
                </Button>
              ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const renderStoreTable = () => {
    return (
      <div>
        <div className='sm:flex sm:items-center'>
          <div className='sm:flex-auto'>
            <h1 className='text-base font-semibold text-gray-900'>Records</h1>
            <p className='mt-2 text-sm text-gray-700'>
              A list of all the stores in your database including their records.
            </p>
          </div>
          <div className='mt-4 sm:ml-16 sm:mt-0 sm:flex-none'>
            <Button
              type='button'
              onClick={() => setOpenCreateDialog(true)}
              className='block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
              Add Record
            </Button>
          </div>
        </div>
        <div className='mt-8 flow-root'>
          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
              <div className='overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-300'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                        SL NO
                      </th>
                      <th
                        scope='col'
                        className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'>
                        Created At
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Created By
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Products
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Total Amount
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Delete
                      </th>
                      <th
                        scope='col'
                        className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                        <span className='sr-only'>Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {storeInformation?.records.map(
                      (record: IRecord, index: number) => (
                        <tr key={index}>
                          <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                            {Number(index) + 1}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {dayjs(record?.created_at).format(
                              "DD-MM-YYYY HH:mm:ss"
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {record?.created_by}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                            {record?.products?.length > 3 ? (
                              <>
                                {record?.products
                                  ?.slice(0, 2)
                                  .map((val, index) => (
                                    <Button
                                      key={index}
                                      className='mx-1'
                                      variant={"default"}
                                      size={"sm"}>
                                      {`${val?.name} `}{" "}
                                      <Badge
                                        variant={"secondary"}
                                        className='ml-2'>{`x${val?.quantity}`}</Badge>
                                    </Button>
                                  ))}{" "}
                                {renderVariationPopover(record)}
                              </>
                            ) : (
                              record?.products?.map((val, index) => (
                                <Button
                                  key={index}
                                  className='mx-1'
                                  variant={"default"}
                                  size={"sm"}>
                                  {`${val?.name} `}{" "}
                                  <Badge
                                    variant={"secondary"}
                                    className='ml-2'>{`x${val?.quantity}`}</Badge>
                                </Button>
                              ))
                            )}
                          </td>
                          <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                            {calculateTotalPrice(record?.products)}
                          </td>
                          <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <Button variant={"destructive"}>
                                  <Trash className='w-5 h-5' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your record and remove
                                    your data from admin servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteRecord(record?._id ?? "")
                                    }>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                          <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                            <Button
                              className='bg-blue-600'
                              onClick={() => {
                                setSelectedProducts([...record?.products]);
                                setOpenEditDialog(true);
                                setRecordId(record?.id);
                              }}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderMainView = () => {
    return (
      <>
        <Card className='w-[93vw]'>
          <CardHeader>
            <CardTitle>Store Data</CardTitle>
            {!!storeInformation && (
              <CardDescription>
                Here is the information of{" "}
                <span className='font-bold '>{storeInformation?.name}</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!!storeInformation ? renderStoreTable() : renderEmptyStoreData()}
          </CardContent>
        </Card>
        <DialogForRecord
          openDialog={openCreateDialog}
          setOpenDialog={setOpenCreateDialog}
          selectedProducts={selectedProducs}
          setSelectedProducts={setSelectedProducts}
          handleSubmit={() => handleSaveRecord()}
        />
        <DialogForRecord
          openDialog={openEditDialog}
          setOpenDialog={setOpenEditDialog}
          selectedProducts={selectedProducs}
          setSelectedProducts={setSelectedProducts}
          handleSubmit={() => handleEditRecord()}
        />
      </>
    );
  };

  return <MainView title='Store Information'>{renderMainView()}</MainView>;
};

export default SingleReserveStore;
