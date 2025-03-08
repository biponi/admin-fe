import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Eye, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  getReserveStores,
  createReserve,
  deleteReserve,
} from "../../api/reserve";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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

interface Store {
  id: number;
  name: string;
  location: string;
  slug: string;
}

const ReserveStoresList: React.FC = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState<Store[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", location: "" });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await getReserveStores(); // Replace with your API endpoint
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const handleView = (storeId: string) => {
    navigate(`/store/${storeId}`);
    // Add your view logic here
  };

  const handleDelete = async (storeId: number) => {
    const deleted = await deleteReserve(storeId);
    if (deleted?.success) {
      fetchStores();
      toast.success("Store removed successfully");
    } else {
      toast.error(deleted?.error ?? "Server was unable to remove the store.");
    }
  };

  const handleCreateStore = async () => {
    try {
      await createReserve(newStore); // Replace with your API endpoint
      setIsDialogOpen(false); // Close the dialog
      setNewStore({ name: "", location: "" }); // Reset the form
      fetchStores(); // Refresh the list of stores
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  return (
    <Card className='w-[93vw]'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>Reserve Stores</CardTitle>
            <CardDescription>List of all reserve stores</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='mr-2 h-4 w-4' /> Create Store
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Store</DialogTitle>
                <DialogDescription>
                  Enter the details for the new store.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='name' className='text-right'>
                    Name
                  </Label>
                  <Input
                    id='name'
                    value={newStore.name}
                    onChange={(e) =>
                      setNewStore({ ...newStore, name: e.target.value })
                    }
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='location' className='text-right'>
                    Location
                  </Label>
                  <Input
                    id='location'
                    value={newStore.location}
                    onChange={(e) =>
                      setNewStore({ ...newStore, location: e.target.value })
                    }
                    className='col-span-3'
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateStore}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stores.map((store) => (
              <TableRow key={store.id}>
                <TableCell>{store.id}</TableCell>
                <TableCell>{store.name}</TableCell>
                <TableCell>{store.location}</TableCell>
                <TableCell>
                  <div className='flex space-x-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleView(store?.slug)}>
                      <Eye className='h-4 w-4' />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant='ghost' size='icon'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your store and remove your data from admin
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(store.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ReserveStoresList;
