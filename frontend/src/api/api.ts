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
      localStorage.clear();
      window.location.href = "/login";
    }
    if (error.response?.status === 429) {
      alert("Too many attempts. Please wait 5 minutes.");
    }
    return Promise.reject(error);
  }
);
// ============ AUTH ENDPOINTS ============
export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("company_id", String(response.data.company_id || "1"));
    localStorage.setItem("user_id", String(response.data.user_id || "1"));
    localStorage.setItem("name", response.data.full_name || "");
  }
  return response.data;
};

// ============ ONBOARDING ============
export type MarketplaceRole = "seller" | "buyer" | "both";

export interface CompanyProfile {
  full_name?: string;
  company_name?: string;
  company_address?: string;
  city?: string;
  state?: string;
  gst_number?: string;
  contact_number?: string;
}

export const submitOnboarding = async (
  marketplaceRole: MarketplaceRole,
  profile: CompanyProfile = {},
) => {
  const response = await api.post("/api/users/onboarding", {
    marketplace_role: marketplaceRole,
    ...profile,
  });
  // Persist locally so the dashboard guard and role-based UI can read it
  // without an extra round-trip.
  localStorage.setItem("onboarding_completed", "true");
  localStorage.setItem("marketplace_role", marketplaceRole);
  if (profile.full_name) {
    localStorage.setItem("name", profile.full_name);
  }
  return response.data;
};

// ============ MARKETPLACE ============
export interface MarketplaceProfile extends CompanyProfile {
  full_name?: string;
  email?: string;
  marketplace_role?: MarketplaceRole;
}

export interface BuyerOffer {
  id: number;
  company_name: string;
  company_address: string;
  city: string;
  state: string;
  gst_number: string;
  contact_number: string;
  metal: string;
  buying_price: number;
  quantity: number;
  unit: string;
  settlement_time: string;
  notes: string;
  images: string[];
  created_at: string | null;
}

export interface ScrapListing {
  id: number;
  seller_id: number;
  metal: string;
  quantity: number;
  unit: string;
  grade: string;
  description: string;
  city: string;
  state: string;
  images: string[];
  created_at: string | null;
}

export const getMarketplaceProfile = async (): Promise<MarketplaceProfile> => {
  const { data } = await api.get("/api/users/profile");
  return data;
};

export const updateMarketplaceProfile = async (profile: MarketplaceProfile): Promise<MarketplaceProfile> => {
  const { data } = await api.put("/api/users/profile", profile);
  return data;
};

// Multipart helpers — append primitive fields + image files onto FormData.
function buildFormData(fields: Record<string, string | number | undefined | null>, images: File[]): FormData {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
  });
  images.forEach((file) => fd.append("images", file));
  return fd;
}

export const createScrapListing = async (
  fields: { metal: string; quantity: number; unit: string; grade?: string; description?: string; city?: string; state?: string },
  images: File[],
): Promise<ScrapListing> => {
  const { data } = await api.post("/api/scrap-listings", buildFormData(fields, images), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.listing;
};

export const getScrapListings = async (mine = false): Promise<ScrapListing[]> => {
  const { data } = await api.get("/api/scrap-listings", { params: mine ? { mine: true } : {} });
  return data.listings;
};

export const createBuyerOffer = async (
  fields: {
    metal: string; buying_price: number; quantity: number; unit: string;
    settlement_time?: string; notes?: string;
    company_name?: string; company_address?: string; city?: string; state?: string; gst_number?: string; contact_number?: string;
  },
  images: File[],
): Promise<BuyerOffer> => {
  const { data } = await api.post("/api/buyer-offers", buildFormData(fields, images), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.offer;
};

export const getBuyerOffers = async (): Promise<BuyerOffer[]> => {
  const { data } = await api.get("/api/buyer-offers");
  return data.offers;
};

// Real 7-day buying/selling activity for the Scrap Optimizer trend chart.
export interface MarketplaceActivityMetal {
  metal: string;
  quantity: number;
  unit: string;
  price: number;   // effective ₹ per unit
  value: number;   // total ₹ for this metal that day
}
export interface MarketplaceActivityDay {
  date: string;    // ISO date
  label: string;   // weekday short (Mon…Sun)
  total: number;   // total ₹ value that day
  metals: MarketplaceActivityMetal[];
}
export interface MarketplaceActivitySeries {
  series: MarketplaceActivityDay[];
  count: number;   // number of underlying records in the window
}
export interface MarketplaceAnalytics {
  role: MarketplaceRole | null;
  purchases: MarketplaceActivitySeries;
  sales: MarketplaceActivitySeries;
}

export const getMarketplaceAnalytics = async (): Promise<MarketplaceAnalytics> => {
  const { data } = await api.get("/api/marketplace/analytics");
  return data;
};

// Highest active buyer offer — powers the seller's "Best Buyer's Rate" card.
export interface BestBuyerRate {
  best_rate: number | null;
  metal: string | null;
  unit: string | null;
  company_name: string | null;
  city: string | null;
  state: string | null;
}

export const getBestBuyerRate = async (): Promise<BestBuyerRate> => {
  const { data } = await api.get("/api/marketplace/best-buyer-rate");
  return data;
};

// ============ DASHBOARD ENDPOINTS ============
export const getDashboardSummary = async (companyId: string) => {
  const response = await api.get("/dashboard/summary", { params: { company_id: companyId } });
  return response.data;
};

export const getDashboardRevenueChart = async (companyId: string) => {
  const response = await api.get("/dashboard/revenue-chart", { params: { company_id: companyId } });
  return response.data;
};
// ============ INVENTORY ENDPOINTS ============
export const getInventory = async (companyId?: string) => {
  const id = companyId || localStorage.getItem("company_id") || "1";
  const response = await api.get("/inventory", { params: { company_id: id } });
  return response.data;
};
export const getInventoryKPIs = async () => {
  const companyId = localStorage.getItem("company_id") || "1";
  const response = await api.get("/inventory/kpis", {
    params: {
      company_id: companyId,
    },
  });
  return response.data;
};
export const createInventoryItem = async (item: any) => {
  const response = await api.post("/inventory/simple", item);
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
  const companyId = localStorage.getItem("company_id") || "1";
  const response = await api.get("/products", { params: { company_id: companyId } });
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
  const companyId = localStorage.getItem("company_id") || "1";
  const response = await api.get("/customers", { params: { company_id: companyId } });
  return response.data;
};
export const createCustomer = async (customer: any) => {
  const { company_id, ...body } = customer;
  const response = await api.post("/customers", body, { params: { company_id } });
  return response.data;
};
// ============ ORDERS ENDPOINTS ============
export const getOrders = async () => {
  const companyId = localStorage.getItem("company_id") || "1";
  const response = await api.get("/orders", { params: { company_id: companyId } });
  return response.data;
};
export const createOrder = async (order: any) => {
  const { company_id, ...body } = order;
  const response = await api.post("/orders", body, { params: { company_id } });
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
export const getAlerts = async (companyId?: string) => {
  const response = await api.get("/alerts", { params: companyId ? { company_id: companyId } : {} });
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
