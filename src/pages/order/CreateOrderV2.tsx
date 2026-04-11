import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useDebounce from "../../customHook/useDebounce";
import { useCreateOrderLayoutStore } from "./createOrderLayoutStore";
import { FilterBar } from "./v2-components/FilterBar";
import { ProductGrid } from "./v2-components/ProductGrid";
import { VariationModal } from "./v2-components/VariationModal";
import { CartPanel } from "./v2-components/CartPanel";
import { CartDrawer, CartTriggerButton } from "./v2-components/CartDrawer";
import { searchProducts } from "../../api";
import { getProducts } from "../../api/product";
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

  // Fetch products on mount and when filters change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, selectedCategory]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // If there's a search query OR category/brand filter, use searchProducts
      if (
        debouncedSearchQuery ||
        (selectedCategory && selectedCategory !== "all") ||
        (selectedBrand && selectedBrand !== "all")
      ) {
        const query = debouncedSearchQuery || "*";
        const response = await searchProducts(query);

        if (response?.success && response?.data) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } else {
        // Initial load: Use getProducts with limit of 50
        const response = await getProducts(50, 1);

        if (response?.success && response?.data) {
          setProducts(response.data.products || []);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = (product: IProduct) => {
    if (!product.hasVariation) {
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
    if (product.hasVariation) {
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
    <div className='flex flex-col lg:flex-row h-[calc(100vh-4rem)] py-2 bg-gray-100'>
      {/* Product Section - 60% on desktop */}
      <div className='flex-1 lg:w-3/5 flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='p-4 border-b bg-white rounded-md shadow mx-4'>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Package className='h-6 w-6' />
            Create Order
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Select products and fill in customer details
          </p>
        </div>

        {/* Filters and Product Grid */}
        <div className='flex-1 overflow-auto p-4 bg-gray-50'>
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
