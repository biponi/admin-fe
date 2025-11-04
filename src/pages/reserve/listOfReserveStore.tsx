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
import { Eye, Trash2, Plus, MapPin, Building2, Loader2, Package, Warehouse } from "lucide-react";
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

// Skeleton Loader Component
const StoreCardSkeleton: React.FC = () => (
  <Card className='relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg'>
    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]'></div>
    <CardHeader className='pb-3'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center space-x-3 flex-1'>
          <div className='w-12 h-12 bg-muted rounded-xl animate-pulse'></div>
          <div className='flex-1 space-y-2'>
            <div className='h-5 w-32 bg-muted rounded animate-pulse'></div>
            <div className='h-4 w-20 bg-muted rounded animate-pulse'></div>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className='pb-3'>
      <div className='h-4 w-full bg-muted rounded animate-pulse'></div>
    </CardContent>
    <CardFooter className='pt-0 gap-2'>
      <div className='h-9 w-20 bg-muted rounded animate-pulse'></div>
      <div className='h-9 w-20 bg-muted rounded animate-pulse'></div>
    </CardFooter>
  </Card>
);

const ReserveStoresList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();
  const [stores, setStores] = useState<Store[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", location: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const response = await getReserveStores();
      setStores(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      toast.error("Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (storeId: string) => {
    navigate(`/store/${storeId}`);
    // Add your view logic here
  };

  const handleDelete = async (storeId: number) => {
    try {
      setDeletingId(storeId);
      const deleted = await deleteReserve(storeId);
      if (deleted?.success) {
        fetchStores();
        toast.success("Store removed successfully");
      } else {
        toast.error(deleted?.error ?? "Server was unable to remove the store.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateStore = async () => {
    if (!newStore.name.trim() || !newStore.location.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      await createReserve(newStore);
      setIsDialogOpen(false);
      setNewStore({ name: "", location: "" });
      fetchStores();
      toast.success("Store created successfully");
    } catch (error) {
      console.error("Error creating store:", error);
      toast.error("Failed to create store");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className='border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-card/95'>
      <CardHeader className='relative overflow-hidden'>
        {/* Decorative background elements */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32'></div>
        <div className='absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl translate-y-24 -translate-x-24'></div>

        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10'>
          <div className='flex items-center gap-4'>
            <div className='p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/30'>
              <Warehouse className='h-7 w-7 text-white' strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
                Reserve Stores
              </CardTitle>
              <CardDescription className='text-sm sm:text-base mt-1.5'>
                Manage and monitor your reserve store locations
              </CardDescription>
            </div>
          </div>
          {hasRequiredPermission("ReserveStore", "create") && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5'>
                  <Plus className='mr-2 h-4 w-4' strokeWidth={2.5} /> Create Store
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='p-2 bg-purple-500/10 rounded-lg'>
                      <Building2 className='h-5 w-5 text-purple-600' />
                    </div>
                    <DialogTitle className='text-xl'>Create New Store</DialogTitle>
                  </div>
                  <DialogDescription>
                    Enter the details for your new reserve store location.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-5 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium'>
                      Store Name *
                    </Label>
                    <Input
                      id='name'
                      placeholder='e.g., Downtown Warehouse'
                      value={newStore.name}
                      onChange={(e) =>
                        setNewStore({ ...newStore, name: e.target.value })
                      }
                      className='transition-all focus:ring-2 focus:ring-purple-500/20'
                      disabled={isCreating}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='location' className='text-sm font-medium'>
                      Location *
                    </Label>
                    <Input
                      id='location'
                      placeholder='e.g., 123 Main St, City, State'
                      value={newStore.location}
                      onChange={(e) =>
                        setNewStore({ ...newStore, location: e.target.value })
                      }
                      className='transition-all focus:ring-2 focus:ring-purple-500/20'
                      disabled={isCreating}
                    />
                  </div>
                </div>
                <DialogFooter className='gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateStore}
                    disabled={isCreating}
                    className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'>
                    {isCreating ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className='mr-2 h-4 w-4' />
                        Create Store
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className='p-6 relative'>
        {isLoading ? (
          <div className='grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {[...Array(4)].map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <div className='relative mb-6'>
              <div className='absolute inset-0 bg-purple-500/20 rounded-full blur-2xl'></div>
              <div className='relative p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-3xl'>
                <Package className='h-16 w-16 text-purple-600' strokeWidth={1.5} />
              </div>
            </div>
            <h3 className='text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text'>
              No stores found
            </h3>
            <p className='text-muted-foreground mb-6 max-w-sm'>
              Get started by creating your first reserve store to manage inventory effectively.
            </p>
            {hasRequiredPermission("ReserveStore", "create") && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className='bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg'>
                <Plus className='mr-2 h-4 w-4' /> Create Your First Store
              </Button>
            )}
          </div>
        ) : (
          <div className='grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {stores.map((store) => (
              <Card key={store.id} className='group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card/95 to-card/90 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]'>
                {/* Animated gradient orb */}
                <div className='absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/20 via-indigo-400/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700'></div>

                {/* Glass morphism overlay */}
                <div className='absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                <CardHeader className='pb-3 relative z-10'>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3 flex-1'>
                      <div className='p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300'>
                        <Building2 className='h-5 w-5 text-white' strokeWidth={2.5} />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-base sm:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text truncate group-hover:text-purple-600 transition-colors'>
                          {store.name}
                        </CardTitle>
                        <Badge variant='secondary' className='mt-1.5 text-xs font-semibold'>
                          #{store.id}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='pb-4 relative z-10'>
                  <div className='flex items-start space-x-2 text-muted-foreground'>
                    <MapPin className='h-4 w-4 flex-shrink-0 mt-0.5 text-purple-600' />
                    <span className='text-sm line-clamp-2' title={store.location}>
                      {store.location}
                    </span>
                  </div>
                </CardContent>
                
                {hasSomePermissionsForPage("ReserveStore", [
                  "store_access",
                  "delete",
                ]) && (
                  <CardFooter className='pt-0 pb-4 flex flex-col sm:flex-row justify-end gap-2 relative z-10'>
                    {hasRequiredPermission("ReserveStore", "store_access") && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleView(store?.slug)}
                        className='w-full sm:w-auto border-purple-200 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300 hover:shadow-lg'>
                        <Eye className='h-4 w-4 mr-2' />
                        View Store
                      </Button>
                    )}

                    {hasRequiredPermission("ReserveStore", "delete") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            disabled={deletingId === store.id}
                            className='w-full sm:w-auto border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300 hover:shadow-lg disabled:opacity-50'>
                            {deletingId === store.id ? (
                              <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className='h-4 w-4 mr-2' />
                                Delete
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <div className='flex items-center gap-3 mb-2'>
                              <div className='p-2 bg-rose-500/10 rounded-lg'>
                                <Trash2 className='h-5 w-5 text-rose-600' />
                              </div>
                              <AlertDialogTitle className='text-xl'>
                                Delete Reserve Store
                              </AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className='text-base'>
                              Are you sure you want to delete <span className='font-semibold text-foreground'>"{store.name}"</span>?
                              This action cannot be undone and will permanently remove the store and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(store.id)}
                              className='bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white'>
                              Delete Store
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardFooter>
                )}

                {/* Bottom accent gradient */}
                <div className='h-1 w-full bg-gradient-to-r from-purple-500/40 via-indigo-500/20 to-transparent'></div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReserveStoresList;
