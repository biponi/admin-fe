const baseURL = `/api/v1`;

const config = {
  refreshToken: () => `/api/refresh-token`,
  dashboard: {
    getDashboardAnalysis: () => `${baseURL}/dashboard/analysis`,
    getDashboardAdvanceAnalysis: () =>
      `${baseURL}/dashboard/advanced-analytics`,
    generateAnalysisReport: () => `${baseURL}/dashboard/csv-report`,
    getDashboardAnalysisData: () => `${baseURL}/dashboard/analysis_v2`,
  },
  user: {
    signup: () => `${baseURL}/user/signup`,
    login: () => `${baseURL}/user/login`,
    allUsers: () => `${baseURL}/user/all`,
    getUserById: (userId: number) => `${baseURL}/user/by/${userId}`,
    getUserProfile: () => `${baseURL}/user/member/profile`,
    updateUserData: () => `${baseURL}/user/member/update`,
    updatePasssword: () => `${baseURL}/user/member/change-password`,
    updateMemberData: (memberId: string) =>
      `${baseURL}/user/member/${memberId}/admin-change-user-data`,
    deleteMember: (memberId: string) =>
      `${baseURL}/user/member/delete/${memberId}`,
  },
  product: {
    createProduct: () => `${baseURL}/product/create`,
    updateProduct: () => `${baseURL}/product/update`,
    editProduct: () => `${baseURL}/product/edit`,
    searchProduct: () => `${baseURL}/product/search`,
    multiProducts: () => `${baseURL}/product/multi`,
    deleteProduct: (id: string) => `${baseURL}/product/delete/${id}`,
    getProductByManufecturer: (manuId: number) =>
      `${baseURL}/product/manufecture/${manuId}`,
    getProductList: () => `${baseURL}/product/all`,
    getProductData: (id: string) => `${baseURL}/product/single/${id}`,
    getProductSummary: () => `${baseURL}/product/summary`,
    searchProductV2: () => `${baseURL}/product/searchv2`,

    // Product Stock Adjustment Endpoints
    adjustStock: () => `${baseURL}/product/adjust`,
    getAdjustments: (productId?: string) =>
      productId ? `${baseURL}/product/adjustments/${productId}` : `${baseURL}/product/adjustments`,
    getAdjustmentStats: () => `${baseURL}/product/adjustment-stats`,
  },
  order: {
    createOrder: () => `${baseURL}/order/prior/create`,
    updateOrderProduct: () => `${baseURL}/order/prior/update/product`,
    getOrderAnalytics: () => `${baseURL}/order/prior/analytics`,
    getOrders: () => `${baseURL}/order/prior/all`,
    getOrderProducts: (id: string) => `${baseURL}/order/prior/${id}/products`,
    editOrder: () => `${baseURL}/order/prior/edit`,
    updateOrderStatus: () => `${baseURL}/order/prior/updateStatus`,
    orderBulkAction: () => `${baseURL}/order/prior/bulk-update`,
    deleteOrder: (id: string) => `${baseURL}/order/prior/delete/${id}`,
    searchOrder: () => `${baseURL}/order/prior/search`,
    returnProducts: () => `${baseURL}/order/prior/return-product`,
    getMultiOrderByIds: () => `${baseURL}/order/prior/by/ids`,
    modifyOrderProducts: (id: string) =>
      `${baseURL}/order/prior/${id}/products`,

    // Order Audit Trail Endpoints
    getOrderAudit: (orderId: string) => `${baseURL}/order/prior/${orderId}/audit`,
    getAllAudits: () => `${baseURL}/order/audit`,
    getUserAudits: (userId: string) => `${baseURL}/order/audit/user/${userId}`,
    getAuditStats: () => `${baseURL}/order/audit/stats`,
  },
  transaction: {
    create: () => `${baseURL}/transection/create`,
    getTransectionByOrder: (orderId: number) =>
      `${baseURL}/transection/order/${orderId}/transactions`,
    search: () => `${baseURL}/transection/list`,
    update: (transectionId: number) =>
      `${baseURL}/transection/${transectionId}/edit`,
    getTransectionById: (transectionId: number) =>
      `${baseURL}/transection/${transectionId}`,
    delete: (transectionId: number) =>
      `${baseURL}/transection/${transectionId}/delete`,
  },
  manufecturer: {
    manufecturerList: () => `${baseURL}/manufecturer/all`,
    manufecturerAdd: () => `${baseURL}/manufecturer/add`,
    manufecturerCreateAccess: () => `${baseURL}/manufecturer/add/access`,
    getManufecturerById: (manuId: number) =>
      `${baseURL}/manufecturer/${manuId}`,
  },
  category: {
    // Get all categories (flat list with hierarchy info)
    getAllCategory: () => `${baseURL}/category/all`,

    // Get categories in tree structure
    getCategoryTree: () => `${baseURL}/category/tree`,

    // Get single category by ID or slug
    getCategoryByIdOrSlug: (identifier: string) =>
      `${baseURL}/category/${identifier}`,

    // Create new category
    addCategory: () => `${baseURL}/category/add`,

    // Update existing category
    editCategory: (id: string) => `${baseURL}/category/update/${id}`,

    // Move category to new parent
    moveCategory: (id: string) => `${baseURL}/category/move/${id}`,

    // Delete category (supports ?force=true query param)
    deleteCategory: (id: string) => `${baseURL}/category/delete/${id}`,
  },
  campaign: {
    createCampaign: () => `${baseURL}/campaign/create`,
    getAllCampaign: () => `${baseURL}/campaign`,
    editCampaign: (id: string) => `${baseURL}/campaign/update/${id}`,
    getCampaignById: (id: string) => `${baseURL}/campaign/by/${id}`,
    deleteCampaign: (id: string) => `${baseURL}/campaign/remove/${id}`,
  },
  purchaseOrder: {
    purchaseList: () => `${baseURL}/purchase-order/all`,
    updatePurchaseOrderById: (id: string) =>
      `${baseURL}/purchase-order/update/${id}`,
    getPuirchaseOrderById: (id: string) => `${baseURL}/purchase-order/${id}`,
    purchaseSearch: () => `${baseURL}/purchase-order/search`,
    createPurchaseOrder: () => `${baseURL}/purchase-order/create`,
    deletePurchaseOrder: (id: string) =>
      `${baseURL}/purchase-order/delete/${id}`,
    restorePurchaseOrder: (id: string) =>
      `${baseURL}/purchase-order/restore/${id}`,
  },
  reserve: {
    getReserveStores: () => `${baseURL}/store-reserve/stores`,
    createReserve: () => `${baseURL}/store-reserve/create`,
    getReserveStore: (id: string) => `${baseURL}/store-reserve/store/${id}`,
    addRecord: () => `${baseURL}/store-reserve/store/record/add`,
    editStoreRecord: () => `${baseURL}/store-reserve/store/record/edit`,
    deleteStoreRecord: () => `${baseURL}/store-reserve/store/record/delete`,
    deleteReserve: (id: number) => `${baseURL}/store-reserve/store/${id}`,
  },
  role: {
    // Basic CRUD operations
    fetchRoles: () => `${baseURL}/role`,
    fetchRoleById: (id: string) => `${baseURL}/role/${id}`,
    createRole: () => `${baseURL}/role`,
    updateRole: (id: string) => `${baseURL}/role/${id}`,
    deleteRole: (id: string) => `${baseURL}/role/${id}`,

    // Additional endpoints
    permanentDeleteRole: (id: string) => `${baseURL}/role/${id}/permanent`,
    getRolePermissions: (id: string) => `${baseURL}/role/${id}/permissions`,
    updateRolePermissions: (id: string) => `${baseURL}/role/${id}/permissions`,
  },
  otp: {
    sendOTP: () => `${baseURL}/otp/send`,
    verifyOTP: () => `${baseURL}/otp/verify`,
    resendOTP: () => `${baseURL}/otp/resend`,
  },
  report: {
    salesOverview: () => `${baseURL}/report/sales-overview`,
    salesTrend: () => `${baseURL}/report/sales-trend`,
    customerInsights: () => `${baseURL}/report/customer-insights`,
    productPerformance: () => `${baseURL}/report/product-performance`,
    export: () => `${baseURL}/report/export`,
  },
  courier: {
    createOrder: () => `${baseURL}/courier/create`,
    bulkCreate: () => `${baseURL}/courier/bulk-create`,
    status: (identifier: string) => `${baseURL}/courier/status/${identifier}`,
    dashboard: () => `${baseURL}/courier/dashboard`,
    orders: () => `${baseURL}/courier/orders`,
    balance: () => `${baseURL}/courier/balance`,
    invoice: (consignmentId: string) =>
      `${baseURL}/courier/invoice/${consignmentId}`,
    report: () => `${baseURL}/courier/report`,
  },
  admin: {
    // Admin Audit Dashboard Endpoints
    auditDashboard: () => `${baseURL}/admin/audit/dashboard`,
    userPerformanceOverview: () => `${baseURL}/admin/audit/users`,
    userPerformanceDetail: (userId: string) =>
      `${baseURL}/admin/audit/users/${userId}`,
    topPerformers: () => `${baseURL}/admin/audit/top-performers`,
  },
};

export default config;
