import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Eye,
  Trash2,
  Plus,
  MapPin,
  Building2,
  Loader2,
  Package,
  Warehouse,
  Search,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
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
import {
  getReserveStores,
  createReserve,
  deleteReserve,
} from "../../api/reserve";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { cn } from "../../lib/utils";

interface Store {
  id: number;
  name: string;
  location: string;
  slug: string;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
const StoreCardSkeleton: React.FC = () => (
  <div className='rounded-2xl border border-slate-100 bg-white p-4 space-y-3 animate-pulse'>
    <div className='flex items-center gap-3'>
      <div className='w-10 h-10 rounded-xl bg-slate-100 shrink-0' />
      <div className='flex-1 space-y-1.5'>
        <div className='h-4 w-28 bg-slate-100 rounded' />
        <div className='h-3 w-16 bg-slate-100 rounded' />
      </div>
    </div>
    <div className='h-3.5 w-full bg-slate-100 rounded' />
    <div className='h-3.5 w-3/4 bg-slate-100 rounded' />
    <div className='flex gap-2 pt-1'>
      <div className='h-8 flex-1 bg-slate-100 rounded-lg' />
      <div className='h-8 flex-1 bg-slate-100 rounded-lg' />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ReserveStoresList: React.FC = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission, hasSomePermissionsForPage } = useRoleCheck();

  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", location: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    setFilteredStores(
      q
        ? stores.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.location.toLowerCase().includes(q),
          )
        : stores,
    );
  }, [searchQuery, stores]);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const response = await getReserveStores();
      setStores(response.data.stores || []);
    } catch {
      toast.error("Failed to load stores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (storeId: number) => {
    try {
      setDeletingId(storeId);
      const deleted = await deleteReserve(storeId);
      if (deleted?.success) {
        fetchStores();
        toast.success("Store removed");
      } else {
        toast.error(deleted?.error ?? "Failed to remove store");
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
      toast.success("Store created");
    } catch {
      toast.error("Failed to create store");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* ─── Page header ─── */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
              <Warehouse className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                Reserve Stores
              </h1>
              <p className='text-sm text-slate-500 mt-0.5'>
                {isLoading
                  ? "Loading…"
                  : `${stores.length} store${stores.length !== 1 ? "s" : ""} total`}
              </p>
            </div>
          </div>

        <div className='flex items-center gap-2'>
          {/* Search */}
          {stores.length > 0 && (
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400' />
              <input
                type='text'
                placeholder='Search stores…'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 bg-white
                           focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 outline-none
                           placeholder:text-slate-400 transition-all w-48'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2'>
                  <XCircle className='w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors' />
                </button>
              )}
            </div>
          )}

          {hasRequiredPermission("ReserveStore", "create") && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className='inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                         text-sm font-medium text-white transition-all duration-150 shadow-sm shadow-indigo-200'>
              <Plus className='w-4 h-4' />
              <span className='hidden sm:inline'>New store</span>
              <span className='sm:hidden'>New</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Content ─── */}
      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <StoreCardSkeleton key={i} />
          ))}
        </div>
      ) : stores.length === 0 ? (
        /* Empty state */
        <div className='flex flex-col items-center justify-center py-20 gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50'>
          <div className='w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center'>
            <Package className='w-6 h-6 text-slate-300' />
          </div>
          <div className='text-center'>
            <p className='text-sm font-semibold text-slate-700'>No stores yet</p>
            <p className='text-xs text-slate-500 mt-1 max-w-xs'>
              Create your first reserve store to start managing inventory across
              locations.
            </p>
          </div>
          {hasRequiredPermission("ReserveStore", "create") && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className='mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                         text-sm font-medium text-white transition-all duration-150 shadow-sm shadow-indigo-200'>
              <Plus className='w-3.5 h-3.5' />
              Create first store
            </button>
          )}
        </div>
      ) : filteredStores.length === 0 ? (
        /* Search no results */
        <div className='flex flex-col items-center justify-center py-16 gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50'>
          <Search className='w-6 h-6 text-slate-300' />
          <p className='text-sm font-semibold text-slate-600'>
            No stores match "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className='text-xs text-indigo-600 hover:text-indigo-700 font-medium'>
            Clear search
          </button>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              deletingId={deletingId}
              onView={(slug) => navigate(`/store/${slug}`)}
              onDelete={handleDelete}
              hasViewPermission={hasRequiredPermission(
                "ReserveStore",
                "store_access",
              )}
              hasDeletePermission={hasRequiredPermission(
                "ReserveStore",
                "delete",
              )}
              hasSomePermission={hasSomePermissionsForPage("ReserveStore", [
                "store_access",
                "delete",
              ])}
            />
          ))}
        </div>
      )}

      {/* ─── Create store dialog ─── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-sm p-0 gap-0 rounded-2xl border-slate-100 overflow-hidden'>
          <DialogHeader className='px-5 pt-5 pb-4 border-b border-slate-100'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0'>
                <Building2 className='w-4 h-4 text-indigo-600' />
              </div>
              <div>
                <DialogTitle className='text-sm font-semibold text-slate-900 leading-none'>
                  New reserve store
                </DialogTitle>
                <DialogDescription className='text-xs text-slate-500 mt-0.5'>
                  Fill in the details below to create a new location.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='px-5 py-5 space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600'>
                Store name <span className='text-red-400'>*</span>
              </label>
              <input
                placeholder='e.g. Downtown Warehouse'
                value={newStore.name}
                onChange={(e) =>
                  setNewStore({ ...newStore, name: e.target.value })
                }
                disabled={isCreating}
                className='w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50
                           focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50
                           outline-none placeholder:text-slate-400 transition-all disabled:opacity-50'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-600'>
                Location <span className='text-red-400'>*</span>
              </label>
              <input
                placeholder='e.g. 123 Main St, Dhaka'
                value={newStore.location}
                onChange={(e) =>
                  setNewStore({ ...newStore, location: e.target.value })
                }
                disabled={isCreating}
                onKeyDown={(e) => e.key === "Enter" && handleCreateStore()}
                className='w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50
                           focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50
                           outline-none placeholder:text-slate-400 transition-all disabled:opacity-50'
              />
            </div>
          </div>

          <div className='px-5 pb-5 flex gap-2'>
            <button
              onClick={() => {
                setIsDialogOpen(false);
                setNewStore({ name: "", location: "" });
              }}
              disabled={isCreating}
              className='flex-1 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50
                         text-sm font-medium text-slate-600 transition-colors disabled:opacity-50'>
              Cancel
            </button>
            <button
              onClick={handleCreateStore}
              disabled={
                isCreating || !newStore.name.trim() || !newStore.location.trim()
              }
              className='flex-[2] h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                         text-sm font-semibold text-white flex items-center justify-center gap-2
                         transition-all duration-150 shadow-sm shadow-indigo-200
                         disabled:opacity-50 disabled:cursor-not-allowed'>
              {isCreating ? (
                <>
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className='w-3.5 h-3.5' />
                  Create store
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

// ─── Store Card ──────────────────────────────────────────────────────────────
interface StoreCardProps {
  store: Store;
  deletingId: number | null;
  onView: (slug: string) => void;
  onDelete: (id: number) => void;
  hasViewPermission: boolean;
  hasDeletePermission: boolean;
  hasSomePermission: boolean;
}

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  deletingId,
  onView,
  onDelete,
  hasViewPermission,
  hasDeletePermission,
  hasSomePermission,
}) => {
  const isDeleting = deletingId === store.id;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl border bg-white overflow-hidden transition-shadow duration-200",
        "border-slate-100 shadow-sm hover:shadow-md",
      )}>
      {/* Card body */}
      <div className='p-4 flex-1 space-y-3'>
        {/* Store icon + name */}
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 transition-colors group-hover:bg-indigo-100'>
            <Building2 className='w-4 h-4 text-indigo-600' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold text-slate-900 truncate leading-snug'>
              {store.name}
            </p>
            <p className='text-[11px] text-slate-400 font-mono mt-0.5'>
              #{store.id}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className='flex items-start gap-2'>
          <MapPin className='w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5' />
          <p
            className='text-xs text-slate-600 leading-relaxed line-clamp-2'
            title={store.location}>
            {store.location}
          </p>
        </div>
      </div>

      {/* Card footer */}
      {hasSomePermission && (
        <div className='px-4 pb-4 flex items-center gap-2'>
          {hasViewPermission && (
            <button
              onClick={() => onView(store.slug)}
              className='flex items-center justify-center gap-1.5 flex-1 h-8 rounded-lg
                         border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200
                         text-xs font-medium text-slate-600 hover:text-indigo-600 transition-all duration-150'>
              <Eye className='w-3.5 h-3.5' />
              View
            </button>
          )}

          {hasDeletePermission && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={isDeleting}
                  className='flex items-center justify-center gap-1.5 flex-1 h-8 rounded-lg
                             border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200
                             text-xs font-medium text-slate-600 hover:text-red-600 transition-all duration-150
                             disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isDeleting ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className='w-3.5 h-3.5' />
                      Delete
                    </>
                  )}
                </button>
              </AlertDialogTrigger>

              <AlertDialogContent className='max-w-sm rounded-2xl border-slate-100 p-0 gap-0 overflow-hidden'>
                <AlertDialogHeader className='px-5 pt-5 pb-4 border-b border-slate-100'>
                  <div className='flex items-center gap-3'>
                    <div className='w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0'>
                      <Trash2 className='w-4 h-4 text-red-600' />
                    </div>
                    <div>
                      <AlertDialogTitle className='text-sm font-semibold text-slate-900 leading-none'>
                        Delete store
                      </AlertDialogTitle>
                      <p className='text-xs text-slate-500 mt-0.5'>
                        This cannot be undone
                      </p>
                    </div>
                  </div>
                </AlertDialogHeader>

                <AlertDialogDescription className='px-5 py-4 text-sm text-slate-600 leading-relaxed'>
                  You're about to permanently delete{" "}
                  <span className='font-semibold text-slate-900'>
                    "{store.name}"
                  </span>{" "}
                  and all its associated data. Are you sure?
                </AlertDialogDescription>

                <AlertDialogFooter className='px-5 pb-5 flex gap-2'>
                  <AlertDialogCancel className='flex-1 h-9 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors'>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(store.id)}
                    className='flex-[2] h-9 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-semibold text-white transition-colors shadow-sm'>
                    Delete store
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
    </div>
  );
};

export default ReserveStoresList;
