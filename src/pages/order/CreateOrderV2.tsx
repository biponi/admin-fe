import { useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCreateOrderLayoutStore } from "./createOrderLayoutStore";
import { FilterBar } from "./v2-components/FilterBar";
import { ProductGrid } from "./v2-components/ProductGrid";
import { ProductPagination } from "./v2-components/ProductPagination";
import { VariationModal } from "./v2-components/VariationModal";
import { CartPanel } from "./v2-components/CartPanel";
import { CartDrawer, CartTriggerButton } from "./v2-components/CartDrawer";
import { getProducts, searchActiveProducts } from "../../api/product";
import { createOrder } from "../../api/order";
import type { IProduct, IVariation } from "../product/interface";
import { Package } from "lucide-react";
import useCategory from "../product/hooks/useCategory";
import useDebounce from "../../customHook/useDebounce";
import { getVariationImageUrl } from "../../utils/functions";

// ─── Header (stable — no props that change on every render) ───────────────────
const OrderHeader = memo(({ totalProducts }: { totalProducts: number }) => (
  <div className='px-5 py-[15px] border-b border-border'>
    <div className='flex items-center gap-3'>
      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm'>
        <Package className='h-4 w-4 text-primary-foreground' />
      </div>
      <div className='min-w-0'>
        <h2 className='text-base font-semibold leading-tight text-foreground'>
          Create Order
        </h2>
        <p className='mt-0.5 text-xs text-muted-foreground'>
          {totalProducts} {totalProducts === 1 ? "product" : "products"} ·
          Select products · Fill customer details · Submit
        </p>
      </div>
    </div>
  </div>
));
OrderHeader.displayName = "OrderHeader";

// ─── Main Component ───────────────────────────────────────────────────────────
const CreateOrderV2 = () => {
  const navigate = useNavigate();

  const {
    filteredProducts,
    searchQuery,
    selectedCategory,
    selectedBrand,
    sortBy,
    sortOrder,
    isLoadingProducts,
    currentPage,
    totalPages,
    totalProducts,
    pageSize,
    cart,
    isCartOpen,
    customerInfo,
    shippingInfo,
    transaction,
    notes,
    validationErrors,
    isSubmitting,
    variationModalOpen,
    selectedProductForVariation,
    setProducts,
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
    setSortBy,
    setSortOrder,
    setLoadingProducts,
    setCurrentPage,
    setPageSize,
    setPaginationInfo,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleCart,
    openCart,
    setCustomer,
    setShippingInfo,
    setTransaction,
    setNotes,
    openVariationModal,
    closeVariationModal,
    setSubmitting,
    validateOrder,
    clearValidationErrors,
    reset,
    getCartItemCount,
  } = useCreateOrderLayoutStore();

  const { categories, fetchCategories } = useCategory();

  // Fetch categories once
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce only the search — category/page changes fire immediately
  const debouncedSearch = useDebounce(searchQuery, 450);

  // Core fetch function — stable reference via useCallback
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      let response;

      // Use searchActiveProducts API when there's a search query
      if (debouncedSearch) {
        const categoryId =
          selectedCategory && selectedCategory !== "all"
            ? selectedCategory
            : undefined;
        response = await searchActiveProducts(
          debouncedSearch,
          categoryId,
          true, // includeSubcategories
          currentPage,
          pageSize,
          sortBy,
          sortOrder,
        );
      } else {
        // Use getProducts API for regular listing/pagination
        response = await getProducts(
          pageSize,
          currentPage,
          selectedCategory && selectedCategory !== "all"
            ? selectedCategory
            : undefined,
          sortBy,
          sortOrder,
        );
      }

      if (response?.success && response?.data) {
        const { products, totalPages, totalProducts } = response.data;
        setProducts(products ?? []);
        setPaginationInfo({ totalPages, totalProducts });
      } else {
        setProducts([]);
        setPaginationInfo({ totalPages: 1, totalProducts: 0 });
      }
    } catch {
      toast.error("Failed to fetch products");
      setProducts([]);
      setPaginationInfo({ totalPages: 1, totalProducts: 0 });
    } finally {
      setLoadingProducts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    selectedCategory,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Cart handlers (stable refs) ──────────────────────────────────────────
  const handleAddToCart = useCallback(
    (product: IProduct) => {
      if (!product?.variation || product.variation.length < 1) {
        addToCart(product);
        toast.success(`${product.name} added to cart`);
      } else {
        openVariationModal(product);
      }
    },
    [addToCart, openVariationModal],
  );

  const handleSelectVariation = useCallback(
    (product: IProduct, variation: IVariation) => {
      addToCart(product, variation);
      closeVariationModal();
      toast.success(
        `${product.name} (${variation.color} ${variation.size}) added to cart`,
      );
    },
    [addToCart, closeVariationModal],
  );

  const handleProductClick = useCallback(
    (product: IProduct) => {
      if (product?.variation && product.variation.length > 0) {
        openVariationModal(product);
      }
    },
    [openVariationModal],
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmitOrder = useCallback(async () => {
    clearValidationErrors();
    if (!validateOrder()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const products = cart.map((item) => {
        const transformed: any = { ...item };

        if (item.selectedVariant) {
          transformed.variation = item.selectedVariant;
          // Try variation images → image groups for thumbnail
          const variantImageUrl = getVariationImageUrl(
            item.selectedVariant,
            item.imageGroups,
          );
          if (variantImageUrl) {
            transformed.thumbnail = variantImageUrl;
          }
        } else if (item.variation) {
          transformed.variation = item.variation;
        }

        if (item.variantId) transformed.variantId = item.variantId;
        return transformed;
      });

      const orderData = {
        customerInformation: {
          customer: {
            name: customerInfo.name!,
            phoneNumber: customerInfo.phoneNumber!,
            email: customerInfo.email,
          },
          shipping: {
            division: shippingInfo.division!,
            district: shippingInfo.district!,
            address: shippingInfo.address!,
          },
        },
        transectionData: {
          totalPrice: transaction.totalPrice,
          paid: transaction.paid ?? 0,
          remaining: transaction.remaining ?? 0,
          discount: transaction.discount ?? 0,
          deliveryCharge: transaction.deliveryCharge ?? 0,
        },
        products,
        notes,
      };

      const response = await createOrder(orderData);
      if (response?.success) {
        toast.success("Order created successfully!");
        reset();
        navigate("/order");
      } else {
        toast.error(response?.error ?? "Failed to create order");
      }
    } catch {
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }, [
    cart,
    customerInfo,
    shippingInfo,
    transaction,
    notes,
    clearValidationErrors,
    validateOrder,
    setSubmitting,
    reset,
    navigate,
  ]);

  const cartItemCount = getCartItemCount();

  // Quantity of each product already in the cart (all variations merged) —
  // lets product cards show an "already picked ×N" chip.
  const cartQtyByProductId = useMemo(() => {
    return cart.reduce(
      (map, item) => {
        const id = item.productId || item.id;
        map[id] = (map[id] ?? 0) + item.quantity;
        return map;
      },
      {} as Record<string, number>,
    );
  }, [cart]);

  // ── Shared cart props (avoids repeating spread in JSX) ───────────────────
  const cartProps = {
    cart,
    customerInfo,
    shippingInfo,
    transaction,
    notes,
    validationErrors,
    onUpdateQuantity: updateCartQuantity,
    onRemove: removeFromCart,
    onCustomerChange: setCustomer,
    onShippingChange: setShippingInfo,
    onTransactionChange: setTransaction,
    onNotesChange: setNotes,
    onSubmit: handleSubmitOrder,
    isSubmitting,
  };

  return (
    <div className='flex flex-row h-full bg-muted md:h-[calc(100dvh-4.5rem)]'>
      {/* ── Product Section ─────────────────────────────────────── */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <div className='flex-1 overflow-y-auto bg-background'>
          <OrderHeader totalProducts={totalProducts} />

          <div className='max-w-5xl mx-auto space-y-4 px-2 md:px-6'>
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              sortBy={sortBy}
              onSortChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              categories={categories}
              brands={[]}
              isLoading={isLoadingProducts}
            />

            <div
              className='w-full md:max-h-[67dvh] overflow-y-auto '
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
              }}>
              <ProductGrid
                products={filteredProducts}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                isLoading={isLoadingProducts}
                cartQtyByProductId={cartQtyByProductId}
              />
            </div>
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              isLoading={isLoadingProducts}
            />
          </div>
        </div>
      </div>

      {/* ── Cart Panel (desktop) ────────────────────────────────── */}
      <div className='hidden md:flex md:w-[42%] xl:w-[38%] min-w-[420px] md:h-full shrink-0 flex-col border-l border-border bg-background'>
        <CartPanel {...cartProps} />
      </div>

      {/* ── Mobile: Drawer + Trigger ────────────────────────────── */}
      <CartDrawer open={isCartOpen} onOpenChange={toggleCart} {...cartProps} />

      <div className='md:hidden'>
        <CartTriggerButton itemCount={cartItemCount} onClick={openCart} />
      </div>

      {/* ── Variation Modal ─────────────────────────────────────── */}
      <VariationModal
        product={selectedProductForVariation}
        open={variationModalOpen}
        onOpenChange={closeVariationModal}
        onSelectVariation={handleSelectVariation}
      />
    </div>
  );
};

export default CreateOrderV2;
