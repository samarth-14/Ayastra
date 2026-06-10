const BASE_URL = "http://127.0.0.1:8000";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// --- AUTH ---
export const login = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("company_id", data.company_id);
    localStorage.setItem("name", data.name);
  }
  return data;
};

export const logout = () => {
  localStorage.clear();
};

// --- DASHBOARD ---
export const getDashboardSummary = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/summary`, { headers: authHeaders() });
  return res.json();
};

export const getRevenueChart = async () => {
  const res = await fetch(`${BASE_URL}/dashboard/revenue-chart`, { headers: authHeaders() });
  return res.json();
};

// --- INVENTORY ---
export const getInventory = async () => {
  const res = await fetch(`${BASE_URL}/inventory`, { headers: authHeaders() });
  return res.json();
};

export const getInventoryKpis = async () => {
  const res = await fetch(`${BASE_URL}/inventory/kpis`, { headers: authHeaders() });
  return res.json();
};

export const addInventory = async (data: object) => {
  const res = await fetch(`${BASE_URL}/inventory`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateInventory = async (itemId: number, data: object) => {
  const res = await fetch(`${BASE_URL}/inventory/${itemId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteInventory = async (itemId: number) => {
  const res = await fetch(`${BASE_URL}/inventory/${itemId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
};

// --- PRODUCTS ---
export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`, { headers: authHeaders() });
  return res.json();
};

export const createProduct = async (data: object) => {
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

// --- ORDERS ---
export const getOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`, { headers: authHeaders() });
  return res.json();
};

export const createOrder = async (data: object) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// --- MARKETS ---
export const getMarketPrices = async () => {
  const res = await fetch(`${BASE_URL}/markets/prices`, { headers: authHeaders() });
  return res.json();
};

export const getPriceHistory = async (code: string) => {
  const res = await fetch(`${BASE_URL}/markets/history/${code}`, { headers: authHeaders() });
  return res.json();
};

export const getForecasts = async () => {
  const res = await fetch(`${BASE_URL}/markets/forecasts`, { headers: authHeaders() });
  return res.json();
};

export const refreshMarketPrices = async () => {
  const res = await fetch(`${BASE_URL}/markets/prices/refresh`, {
    method: "POST",
    headers: authHeaders(),
  });
  return res.json();
};

// --- ANALYTICS ---
export const getAnalyticsKpis = async () => {
  const res = await fetch(`${BASE_URL}/analytics/kpis`, { headers: authHeaders() });
  return res.json();
};

export const getRevenueTrend = async () => {
  const res = await fetch(`${BASE_URL}/analytics/revenue-trend`, { headers: authHeaders() });
  return res.json();
};

export const getCustomerGrowth = async () => {
  const res = await fetch(`${BASE_URL}/analytics/customer-growth`, { headers: authHeaders() });
  return res.json();
};

export const getCategoryRevenue = async () => {
  const res = await fetch(`${BASE_URL}/analytics/category-revenue`, { headers: authHeaders() });
  return res.json();
};

export const getBusinessHealth = async () => {
  const res = await fetch(`${BASE_URL}/analytics/health`, { headers: authHeaders() });
  return res.json();
};

// --- ALERTS ---
export const getAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`, { headers: authHeaders() });
  return res.json();
};

export const markAlertRead = async (alertId: number) => {
  const res = await fetch(`${BASE_URL}/alerts/${alertId}/read`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return res.json();
};

// --- SETTINGS ---
export const getProfile = async () => {
  const userId = localStorage.getItem("user_id");
  const res = await fetch(`${BASE_URL}/settings/profile/${userId}`, { headers: authHeaders() });
  return res.json();
};

export const getCompany = async () => {
  const companyId = localStorage.getItem("company_id");
  const res = await fetch(`${BASE_URL}/settings/company/${companyId}`, { headers: authHeaders() });
  return res.json();
};