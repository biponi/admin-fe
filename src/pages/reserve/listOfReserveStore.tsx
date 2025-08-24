import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Eye, Trash2, Plus, MapPin, Building2 } from "lucide-react";
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
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface Store {
  id: number;
  name: string;
  location: string;
  slug: string;
}

const ReserveStoresList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
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
    <Card>
      <CardHeader>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
          <div>
            <CardTitle className='text-2xl'>Reserve Stores</CardTitle>
            <CardDescription className='text-base mt-1'>Manage and monitor your reserve store locations</CardDescription>
          </div>
          {hasRequiredPermission("ReserveStore", "create") && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='w-full sm:w-auto'>
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
          )}
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {stores.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <Building2 className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No stores found</h3>
            <p className='text-muted-foreground mb-4'>Get started by creating your first reserve store.</p>
          </div>
        ) : (
          <div className='grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {stores.map((store) => (
              <Card key={store.id} className='group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-2'>
                      <div className='p-2 bg-primary/10 rounded-lg'>
                        <Building2 className='h-5 w-5 text-primary' />
                      </div>
                      <div>
                        <CardTitle className='text-lg group-hover:text-primary transition-colors'>
                          {store.name}
                        </CardTitle>
                        <Badge variant='secondary' className='mt-1 text-xs'>
                          ID: {store.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className='pb-3'>
                  <div className='flex items-center space-x-2 text-muted-foreground'>
                    <MapPin className='h-4 w-4 flex-shrink-0' />
                    <span className='text-sm truncate' title={store.location}>
                      {store.location}
                    </span>
                  </div>
                </CardContent>
                
                {hasSomePermissionsForPage("ReserveStore", [
                  "store_access",
                  "delete",
                ]) && (
                  <CardFooter className='pt-0 flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2'>
                    {hasRequiredPermission("ReserveStore", "store_access") && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleView(store?.slug)}
                        className='w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors'>
                        <Eye className='h-4 w-4 mr-2' />
                        View
                      </Button>
                    )}
                    
                    {hasRequiredPermission("ReserveStore", "delete") && (
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button variant='outline' size='sm' className='w-full sm:w-auto hover:bg-destructive hover:text-destructive-foreground transition-colors'>
                            <Trash2 className='h-4 w-4 mr-2' />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Reserve Store
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{store.name}"? This action cannot be undone and will permanently remove the store and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(store.id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                              Delete Store
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReserveStoresList;
