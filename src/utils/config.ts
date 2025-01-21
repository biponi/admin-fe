const baseURL = `/api/v1`;

const config = {
  refreshToken: () => `/api/refresh-token`,
  dashboard:{getDashboardAnalysis:()=>`${baseURL}/dashboard/analysis`,getDashboardAnalysisData:()=>`${baseURL}/dashboard/analysis_v2`,},
  user: {
    signup: () => `${baseURL}/user/signup`,
    login: () => `${baseURL}/user/login`,
    allUsers: () => `${baseURL}/user/all`,
    getUserById: (userId: number) => `${baseURL}/user/by/${userId}`,
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
  },
  order: {
    createOrder: () => `${baseURL}/order/prior/create`,
    updateOrderProduct: () => `${baseURL}/order/prior/update/product`,
    getOrderAnalytics: () => `${baseURL}/order/prior/analytics`,
    getOrders: () => `${baseURL}/order/prior/all`,
    editOrder: () => `${baseURL}/order/prior/edit`,
    updateOrderStatus: () => `${baseURL}/order/prior/updateStatus`,
     orderBulkAction: () => `${baseURL}/order/prior/bulk-update`,
    deleteOrder: (id: string) => `${baseURL}/order/prior/delete/${id}`,
    searchOrder: () => `${baseURL}/order/prior/search`,
    returnProducts:() =>`${baseURL}/order/prior/return-product`,
     getMultiOrderByIds: () => `${baseURL}/order/prior/by/ids`,
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
    getAllCategory: () => `${baseURL}/category/all`,
    addCategory: () => `${baseURL}/category/add`,
    editCategory: (id: string) => `${baseURL}/category/update/${id}`,
    deleteCategory: (id: string) => `${baseURL}/category/delete/${id}`,
  },
  campaign:{
    createCampaign:() => `${baseURL}/campaign/create`,
    getAllCampaign:() => `${baseURL}/campaign`,
    editCampaign:(id:string) => `${baseURL}/campaign/update/${id}`,
    getCampaignById:(id:string) => `${baseURL}/campaign/by/${id}`,
    deleteCampaign:(id:string) => `${baseURL}/campaign/remove/${id}`,
  },
  purchaseOrder:{
    purchaseList:()=>`${baseURL}/purchase-order/all`,
    purchaseSearch:()=>`${baseURL}/purchase-order/search`,
    createPurchaseOrder:()=>`${baseURL}/purchase-order/create`,
    deletePurchaseOrder:(id:string)=>`${baseURL}/purchase-order/delete/${id}`,
    restorePurchaseOrder:(id:string)=>`${baseURL}/purchase-order/restore/${id}`,
  }
};

export default config;
