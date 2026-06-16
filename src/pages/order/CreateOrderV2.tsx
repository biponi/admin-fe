import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useDebounce from "../../customHook/useDebounce";
import { useCreateOrderLayoutStore } from "./createOrderLayoutStore";
import { FilterBar } from "./v2-components/FilterBar";
import { ProductGrid } from "./v2-components/ProductGrid";
import { ProductPagination } from "./v2-components/ProductPagination";
import { VariationModal } from "./v2-components/VariationModal";
import { CartPanel } from "./v2-components/CartPanel";
import { CartDrawer, CartTriggerButton } from "./v2-components/CartDrawer";
import { getProducts, getProductsByCategory } from "../../api/product";
import { createOrder } from "../../api/order";
import type { IProduct } from "../product/interface";
import type { IVariation } from "../product/interface";
import { Package } from "lucide-react";
import useCategory from "../product/hooks/useCategory";

const CreateOrderV2 = () => {
  const navigate = useNavigate();

  // Store state
  const {
    // Products
    filteredProducts,
    searchQuery,
    selectedCategory,
    selectedBrand,
    isLoadingProducts,
    currentPage,
    totalPages,
    totalProducts,
    pageSize,
    // Cart
    cart,
    isCartOpen,
    // Customer & Shipping
    customerInfo,
    shippingInfo,
    // Transaction
    transaction,
    notes,
    // UI
    isSubmitting,
    variationModalOpen,
    selectedProductForVariation,
    // Actions
    setProducts,
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
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

  // Local state
  const { categories, fetchCategories } = useCategory();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch products on mount and when filters or pagination changes
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, selectedCategory, selectedBrand, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedBrand]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Check if category filter is active
      const shouldFilterByCategory = selectedCategory && selectedCategory !== "all";

      let response;

      if (shouldFilterByCategory) {
        // Use category-filtered API with pagination
        response = await getProductsByCategory(selectedCategory, currentPage, pageSize);
      } else {
        // Use regular paginated API for all products
        response = await getProducts(pageSize, currentPage);
      }

      if (response?.success && response?.data) {
        const { products, totalPages, totalProducts } = response.data;
        setProducts(products || []);
        setPaginationInfo({ totalPages, totalProducts });
      } else {
        setProducts([]);
        setPaginationInfo({ totalPages: 1, totalProducts: 0 });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
      setPaginationInfo({ totalPages: 1, totalProducts: 0 });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product: IProduct) => {
    if (!product?.variation || product.variation.length < 1) {
      addToCart(product);
      toast.success(`${product.name} added to cart`);
    } else {
      openVariationModal(product);
    }
  };

  // Handle variation selection
  const handleSelectVariation = (product: IProduct, variation: IVariation) => {
    addToCart(product, variation);
    closeVariationModal();
    toast.success(
      `${product.name} (${variation.color} ${variation.size}) added to cart`,
    );
  };

  // Handle product click (for variations)
  const handleProductClick = (product: IProduct) => {
    console.log("CreateOrderV2 handleProductClick:", {
      product,
    });
    if (product?.variation && product.variation.length > 0) {
      console.log("Opening variation modal for:", product.name);
      openVariationModal(product);
    }
  };

  // Handle submit order
  const handleSubmitOrder = async () => {
    clearValidationErrors();

    // Validate
    if (!validateOrder()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Transform products to match old format
      const products = cart.map((item) => {
        // Create base item with required fields
        const transformedItem: any = {
          ...item,
        };

        // Add variation if exists (from selectedVariant)
        if (item.selectedVariant) {
          transformedItem.variation = item.selectedVariant;

          // Use variant image as thumbnail if available
          if (
            item.selectedVariant.images &&
            item.selectedVariant.images.length > 0 &&
            typeof item.selectedVariant.images[0] === "string"
          ) {
            transformedItem.thumbnail = item.selectedVariant.images[0];
          }
        } else if (item.variation) {
          transformedItem.variation = item.variation;
        }

        // Add variantId if exists
        if (item.variantId) {
          transformedItem.variantId = item.variantId;
        }

        return transformedItem;
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
          paid: transaction.paid || 0,
          remaining: transaction.remaining || 0,
          discount: transaction.discount || 0,
          deliveryCharge: transaction.deliveryCharge || 0,
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
        toast.error(response?.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const cartItemCount = getCartItemCount();

  return (
    <div className='flex flex-col lg:flex-row h-[calc(100vh-4rem)] md:py-2 bg-white'>
      {/* Product Section - 60% on desktop */}
      <div className='flex-1 lg:w-3/5 flex flex-col overflow-hidden'>
        {/* Filters and Product Grid */}
        <div className='flex-1 overflow-auto p-2 md:p-4 bg-gray-50'>
          {/* Header */}
          <div className='p-4 border-b bg-white rounded-md shadow mb-2'>
            <h1 className='text-2xl font-bold flex items-center gap-2'>
              <Package className='h-6 w-6' />
              Create Order
            </h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Select products and fill in customer details
            </p>
          </div>
          <div className='max-w-7xl mx-auto space-y-6'>
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedBrand={selectedBrand}
              onBrandChange={setSelectedBrand}
              categories={categories}
              brands={[]}
              isLoading={isLoadingProducts}
            />

            <ProductGrid
              products={filteredProducts}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
              isLoading={isLoadingProducts}
            />

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

      {/* Cart Section - 40% on desktop */}
      <div className='hidden md:block md:w-1/2 xl:2/5'>
        <CartPanel
          cart={cart}
          customerInfo={customerInfo}
          shippingInfo={shippingInfo}
          transaction={transaction}
          notes={notes}
          onUpdateQuantity={updateCartQuantity}
          onRemove={removeFromCart}
          onCustomerChange={setCustomer}
          onShippingChange={setShippingInfo}
          onTransactionChange={setTransaction}
          onNotesChange={setNotes}
          onSubmit={handleSubmitOrder}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Mobile Cart Drawer */}
      <CartDrawer
        open={isCartOpen}
        onOpenChange={toggleCart}
        cart={cart}
        customerInfo={customerInfo}
        shippingInfo={shippingInfo}
        transaction={transaction}
        notes={notes}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCustomerChange={setCustomer}
        onShippingChange={setShippingInfo}
        onTransactionChange={setTransaction}
        onNotesChange={setNotes}
        onSubmit={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      {/* Mobile Cart Trigger Button */}
      <div className='lg:hidden'>
        <CartTriggerButton itemCount={cartItemCount} onClick={openCart} />
      </div>

      {/* Variation Modal */}
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
