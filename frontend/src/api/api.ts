import axios, { AxiosInstance, AxiosError } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ENDPOINTS ============
export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
};

// ============ DASHBOARD ENDPOINTS ============
export const getDashboardSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data;
};

export const getDashboardRevenueChart = async () => {
  const response = await api.get("/dashboard/revenue-chart");
  return response.data;
};

// ============ INVENTORY ENDPOINTS ============
export const getInventory = async () => {
  const response = await api.get("/inventory");
  return response.data;
};

export const getInventoryKPIs = async () => {
  const response = await api.get("/inventory/kpis");
  return response.data;
};

export const createInventoryItem = async (item: any) => {
  const response = await api.post("/inventory", item);
  return response.data;
};

export const updateInventoryItem = async (itemId: string, updates: any) => {
  const response = await api.patch(`/inventory/${itemId}`, updates);
  return response.data;
};

export const deleteInventoryItem = async (itemId: string) => {
  const response = await api.delete(`/inventory/${itemId}`);
  return response.data;
};

// ============ PRODUCTS ENDPOINTS ============
export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getProductById = async (productId: string) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const createProduct = async (product: any) => {
  const response = await api.post("/products", product);
  return response.data;
};

// ============ WAREHOUSES ENDPOINTS ============
export const getWarehouses = async () => {
  const response = await api.get("/warehouses");
  return response.data;
};

export const createWarehouse = async (warehouse: any) => {
  const response = await api.post("/warehouses", warehouse);
  return response.data;
};

// ============ CUSTOMERS ENDPOINTS ============
export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

export const createCustomer = async (customer: any) => {
  const response = await api.post("/customers", customer);
  return response.data;
};

// ============ ORDERS ENDPOINTS ============
export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const createOrder = async (order: any) => {
  const response = await api.post("/orders", order);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: string
) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const getOrderById = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// ============ MARKETS ENDPOINTS ============
export const getMarketPrices = async () => {
  const response = await api.get("/markets/prices");
  return response.data;
};

export const getMarketHistory = async (code: string) => {
  const response = await api.get(`/markets/history/${code}`);
  return response.data;
};

export const getMarketForecasts = async () => {
  const response = await api.get("/markets/forecasts");
  return response.data;
};

export const refreshMarketPrices = async () => {
  const response = await api.post("/markets/prices/refresh");
  return response.data;
};

// ============ ANALYTICS ENDPOINTS ============
export const getAnalyticsKPIs = async () => {
  const response = await api.get("/analytics/kpis");
  return response.data;
};

export const getAnalyticsRevenueTrend = async () => {
  const response = await api.get("/analytics/revenue-trend");
  return response.data;
};

export const getAnalyticsCustomerGrowth = async () => {
  const response = await api.get("/analytics/customer-growth");
  return response.data;
};

export const getAnalyticsCategoryRevenue = async () => {
  const response = await api.get("/analytics/category-revenue");
  return response.data;
};

export const getAnalyticsHealth = async () => {
  const response = await api.get("/analytics/health");
  return response.data;
};

// ============ SETTINGS ENDPOINTS ============
export const getUserProfile = async (userId: string) => {
  const response = await api.get(`/settings/profile/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const response = await api.patch(`/settings/profile/${userId}`, updates);
  return response.data;
};

export const getUserNotifications = async (userId: string) => {
  const response = await api.get(`/settings/notifications/${userId}`);
  return response.data;
};

export const updateUserNotifications = async (userId: string, settings: any) => {
  const response = await api.patch(`/settings/notifications/${userId}`, settings);
  return response.data;
};

export const getCompanySettings = async (companyId: string) => {
  const response = await api.get(`/settings/company/${companyId}`);
  return response.data;
};

export const updateCompanySettings = async (companyId: string, updates: any) => {
  const response = await api.patch(`/settings/company/${companyId}`, updates);
  return response.data;
};

export const getIntegrations = async (companyId: string) => {
  const response = await api.get(`/settings/integrations/${companyId}`);
  return response.data;
};

export const updateIntegration = async (integrationId: string, updates: any) => {
  const response = await api.patch(`/settings/integrations/${integrationId}`, updates);
  return response.data;
};

// ============ ALERTS ENDPOINTS ============
export const getAlerts = async () => {
  const response = await api.get("/alerts");
  return response.data;
};

export const markAlertAsRead = async (alertId: string) => {
  const response = await api.patch(`/alerts/${alertId}/read`);
  return response.data;
};

// ============ ASTRA AI ENDPOINTS ============
export const chatWithAstra = async (message: string, context?: any) => {
  try {
    const response = await api.post("/astra/chat", { message, context });
    return response.data;
  } catch (error) {
    console.error("Failed to chat with Astra:", error);
    // Return null to indicate AI endpoint not available
    return null;
  }
};

export default api;
