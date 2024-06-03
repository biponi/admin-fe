const baseURL = `/api/v1`;

const config = {
  refreshToken: () => `/api/refresh-token`,
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
    deleteProduct: (id: string) => `${baseURL}/product/delete/${id}`,
    getProductByManufecturer: (manuId: number) =>
      `${baseURL}/product/manufecture/${manuId}`,
    getProductList: () => `${baseURL}/product/all`,
    getProductData: (id: string) => `${baseURL}/product/single/${id}`,
  },
  order: {
    createOrder: () => `${baseURL}/order/prior/create`,
    getOrderAnalytics: () => `${baseURL}/order/prior/analytics`,
    getOrders: () => `${baseURL}/order/prior/all`,
    editOrder: () => `${baseURL}/order/prior/edit`,
    updateOrderStatus: () => `${baseURL}/order/prior/updateStatus`,
    deleteOrder: (id: string) => `${baseURL}/order/prior/delete/${id}`,
    searchOrder: () => `${baseURL}/order/prior/search`,
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
};

export default config;
