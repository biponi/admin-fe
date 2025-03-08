export const normalizeProduct = (product: any) => {
  /**
   * Normalizes a product object to the desired format.
   * Handles cases where variant may or may not have color, size, or both.
   */
  const normalized = {
    id: product.id,
    name: product.name || "",
    quantity: product.quantity || 0,
    unitPrice: product.unitPrice || 0,
    variantId: product.variantId || (product.variant ? product.variant.id : ""),
  };

  // Handle the name field based on variant properties
  if (product.variant) {
    const variantParts = [];
    if (product.variant.color) {
      variantParts.push(product.variant.color);
    }
    if (product.variant.size) {
      variantParts.push(product.variant.size);
    }
    if (variantParts.length > 0) {
      normalized.name = `${product.name} ${variantParts.join("-")}`.trim();
    }
  }

  return normalized;
};

export const distinctProducts = (products: any) => {
  /**
   * Takes a list of product objects, normalizes them, and combines quantities
   * for products with the same 'id' and 'variantId'.
   */
  const productMap = new Map();

  for (const product of products) {
    const normalizedProduct = normalizeProduct(product);
    const key = `${normalizedProduct.id}-${normalizedProduct.variantId}`;

    // If the product already exists in the map, add the quantities
    if (productMap.has(key)) {
      const existingProduct = productMap.get(key);
      existingProduct.quantity += normalizedProduct.quantity;
    } else {
      // Otherwise, add the product to the map
      productMap.set(key, { ...normalizedProduct });
    }
  }

  // Convert the map values to an array
  return Array.from(productMap.values());
};

export const calculateTotalPrice = (products: any) => {
  /**
   * Calculates the total price of all products in the list.
   * Total price = sum of (quantity * unitPrice) for each product.
   */
  return products.reduce((total: number, product: any) => {
    return total + product.quantity * product.unitPrice;
  }, 0);
};
