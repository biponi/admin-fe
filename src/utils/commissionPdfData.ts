/**
 * Commission PDF Data Utilities
 * Handles data fetching and aggregation for PDF generation
 */

import {
  getOrderCommissions,
  getOrderCommissionDetails,
  OrderCommission,
  OrderCommissionDetails,
  OrderCommissionQueryParams,
} from "../api/commission";
import { UserWiseBreakdown, OrderWithProducts, ProductCommissionInfo } from "./commissionPdfTypes";

/**
 * Fetch all order commissions with details
 */
export const fetchAllOrderDetails = async (
  filters: OrderCommissionQueryParams = {},
  onProgress?: (progress: number) => void
): Promise<OrderCommissionDetails[]> => {
  try {
    // Step 1: Fetch all orders with pagination
    let allOrders: OrderCommission[] = [];
    let currentPage = 1;
    let totalPages = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await getOrderCommissions({
        ...filters,
        page: currentPage,
        limit: 100,
      });

      if (response.success && response.data) {
        const { commissions, pagination } = response.data;

        allOrders = [...allOrders, ...commissions];
        totalPages = pagination.totalPages;
        hasMore = currentPage < totalPages;
        currentPage++;

        // Update progress
        if (onProgress) {
          const progress = Math.min(10, (currentPage / totalPages) * 10);
          onProgress(progress);
        }
      } else {
        hasMore = false;
      }
    }

    // Step 2: Fetch details for each order
    const orderDetails: OrderCommissionDetails[] = [];
    const totalOrders = allOrders.length;

    for (let i = 0; i < totalOrders; i++) {
      const order = allOrders[i];
      const detailsResponse = await getOrderCommissionDetails(order.orderId);

      if (detailsResponse.success && detailsResponse.data) {
        orderDetails.push(detailsResponse.data);
      }

      // Update progress (10-60%)
      if (onProgress) {
        const progress = 10 + ((i + 1) / totalOrders) * 50;
        onProgress(Math.min(60, progress));
      }
    }

    return orderDetails;
  } catch (error: any) {
    console.error("Error fetching order details:", error);
    throw new Error(`Failed to fetch order details: ${error.message}`);
  }
};

/**
 * Aggregate order data into user-wise breakdown
 */
export const aggregateUserWiseData = (
  orders: OrderCommissionDetails[]
): UserWiseBreakdown[] => {
  // Create a map to group by user
  const userMap = new Map<string, UserWiseBreakdown>();

  orders.forEach((order) => {
    // Process each product in the order
    order.products.forEach((product) => {
      const userId = product.commission.recipient.userId;
      const userName = product.commission.recipient.userName;
      const userAvatar = product.commission.recipient.userAvatar || "";
      const commissionAmount = product.commission.amount;
      const commissionStatus = product.commission.status;

      // Initialize user entry if not exists
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName,
          userAvatar,
          totalAmount: 0,
          paidAmount: 0,
          unpaidAmount: 0,
          pendingAmount: 0,
          holdAmount: 0,
          totalOrders: 0,
          totalProducts: 0,
          ordersAndProducts: [],
        });
      }

      const userData = userMap.get(userId)!;

      // Update amounts
      userData.totalAmount += commissionAmount;

      // Update status-specific amounts
      switch (commissionStatus) {
        case "paid":
          userData.paidAmount += commissionAmount;
          break;
        case "unpaid":
          userData.unpaidAmount += commissionAmount;
          break;
        case "pending":
          userData.pendingAmount += commissionAmount;
          break;
        case "hold":
          userData.holdAmount += commissionAmount;
          break;
        default:
          // cancelled, removed - not counted in totals
          break;
      }

      // Check if this order already exists for this user
      let orderGroup = userData.ordersAndProducts.find(
        (og) => og.orderId === order.orderId
      );

      if (!orderGroup) {
        // Create new order group
        orderGroup = {
          orderId: order.orderId,
          orderNumber: order.orderNumber,
          orderDate: order.orderDates.createdAt,
          products: [],
        };
        userData.ordersAndProducts.push(orderGroup);
        userData.totalOrders++;
      }

      // Add product to order group
      orderGroup.products.push({
        productId: product.productId,
        productName: product.productName,
        productImage: product.productImage || "",
        quantity: product.quantity,
        productPrice: product.productPrice,
        totalPrice: product.totalPrice,
        commissionAmount: commissionAmount,
        commissionType: product.commission.type,
        commissionRate: product.commission.rate,
        commissionStatus: commissionStatus,
        commissionId: product.commission.commissionId,
        paidOffDate: product.commission.paidOffDate,
      });

      userData.totalProducts++;
    });
  });

  // Convert map to array and sort by total amount (descending)
  const userWiseData = Array.from(userMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount
  );

  return userWiseData;
};

/**
 * Fetch image as base64
 * Handles WebP to PNG conversion and CORS
 * Copied from reactPdfInvoice.tsx
 */
export const fetchImageAsBase64 = async (
  imageUrl: string
): Promise<string> => {
  try {
    const response = await fetch(imageUrl, {
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      return imageUrl;
    }

    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

        if (blob.type === "image/webp") {
          const img = new Image();

          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");

              if (!ctx) {
                resolve(result);
                return;
              }

              ctx.drawImage(img, 0, 0);
              const pngDataUrl = canvas.toDataURL("image/png");
              resolve(pngDataUrl);
            } catch {
              resolve(result);
            }
          };

          img.onerror = () => {
            resolve(result);
          };

          img.src = result;
        } else {
          resolve(result);
        }
      };

      reader.onerror = () => {
        resolve(imageUrl);
      };

      reader.readAsDataURL(blob);
    });
  } catch {
    return imageUrl;
  }
};

/**
 * Preload all user avatars
 */
export const preloadUserAvatars = async (
  userWiseData: UserWiseBreakdown[],
  onProgress?: (progress: number) => void
): Promise<UserWiseBreakdown[]> => {
  const total = userWiseData.length;

  const userDataWithImages = await Promise.all(
    userWiseData.map(async (user, index) => {
      const avatar = await fetchImageAsBase64(user.userAvatar);

      // Update progress
      if (onProgress) {
        const progress = 60 + ((index + 1) / total) * 20;
        onProgress(Math.min(80, progress));
      }

      return {
        ...user,
        userAvatar: avatar,
      };
    })
  );

  return userDataWithImages;
};

/**
 * Preload all product images
 */
export const preloadProductImages = async (
  orders: OrderCommissionDetails[],
  onProgress?: (progress: number) => void
): Promise<OrderCommissionDetails[]> => {
  const allProducts = orders.flatMap((order) => order.products);
  const total = allProducts.length;

  // Create a map of product images to avoid duplicates
  const imageMap = new Map<string, string>();

  for (let i = 0; i < total; i++) {
    const product = allProducts[i];
    if (!imageMap.has(product.productImage)) {
      const base64Image = await fetchImageAsBase64(product.productImage);
      imageMap.set(product.productImage, base64Image);
    }

    // Update progress
    if (onProgress) {
      const progress = ((i + 1) / total) * 20;
      onProgress(Math.min(80, progress));
    }
  }

  // Replace image URLs with base64 in orders
  const ordersWithImages = orders.map((order) => ({
    ...order,
    products: order.products.map((product) => ({
      ...product,
      productImage: imageMap.get(product.productImage) || product.productImage,
    })),
  }));

  return ordersWithImages;
};
