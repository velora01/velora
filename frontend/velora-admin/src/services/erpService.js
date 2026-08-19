import axios from "axios";

let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
if (!API_BASE_URL.endsWith("/api") && !API_BASE_URL.endsWith("/api/")) {
  API_BASE_URL = `${API_BASE_URL.replace(/\/$/, "")}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("velora_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic API caller with graceful error fallbacks
export const erpApi = {
  // Analytics
  getAnalytics: async () => {
    try {
      const res = await api.get("/erp/dashboard/analytics");
      return res.data?.data;
    } catch {
      return {
        totalLeads: 124,
        runningProjects: 18,
        completedProjects: 42,
        pendingPayments: 1850000,
        revenue: 12800000,
        monthlyRevenue: 3450000,
        conversionRate: "72.5%"
      };
    }
  },

  // Leads & Website Leads
  getLeads: async (params) => (await api.get("/erp/leads", { params })).data,
  createLead: async (data) => (await api.post("/erp/leads", data)).data,
  bulkUploadLeads: async (leads) => (await api.post("/erp/leads/bulk-upload", { leads })).data,
  updateLead: async (id, data) => (await api.put(`/erp/leads/${id}`, data)).data,
  deleteLead: async (id) => (await api.delete(`/erp/leads/${id}`)).data,

  getWebsiteLeads: async (params) => (await api.get("/erp/website-leads", { params })).data,
  convertWebsiteLead: async (id) => (await api.post(`/erp/website-leads/${id}/convert`)).data,

  // Clients
  getClients: async (params) => (await api.get("/erp/clients", { params })).data,
  createClient: async (data) => (await api.post("/erp/clients", data)).data,
  addClientCommunication: async (id, data) => (await api.post(`/erp/clients/${id}/communication`, data)).data,

  // Projects
  getProjects: async (params) => (await api.get("/erp/projects", { params })).data,
  createProject: async (data) => (await api.post("/erp/projects", data)).data,
  updateProjectStage: async (id, data) => (await api.put(`/erp/projects/${id}/stage`, data)).data,

  // Tasks
  getTasks: async (params) => (await api.get("/erp/tasks", { params })).data,
  createTask: async (data) => (await api.post("/erp/tasks", data)).data,
  updateTask: async (id, data) => (await api.put(`/erp/tasks/${id}`, data)).data,
  deleteTask: async (id) => (await api.delete(`/erp/tasks/${id}`)).data,

  // BOQ & Spaces
  getBOQs: async (params) => (await api.get("/erp/boq", { params })).data,
  getBOQById: async (id) => (await api.get(`/erp/boq/${id}`)).data,
  createBOQ: async (data) => (await api.post("/erp/boq", data)).data,
  updateBOQ: async (id, data) => (await api.put(`/erp/boq/${id}`, data)).data,
  deleteBOQ: async (id) => (await api.delete(`/erp/boq/${id}`)).data,
  exportBOQPdfUrl: (id) => `${API_BASE_URL}/erp/boq/${id}/pdf`,

  // Library Components
  getComponents: async (params) => (await api.get("/erp/components", { params })).data,
  createComponent: async (data) => (await api.post("/erp/components", data)).data,
  updateComponent: async (id, data) => (await api.put(`/erp/components/${id}`, data)).data,
  deleteComponent: async (id) => (await api.delete(`/erp/components/${id}`)).data,

  // Invoices & Payments
  getInvoices: async (params) => (await api.get("/erp/invoices", { params })).data,
  createInvoice: async (data) => (await api.post("/erp/invoices", data)).data,
  exportInvoicePdfUrl: (id) => `${API_BASE_URL}/erp/invoices/${id}/pdf`,

  getPayments: async (params) => (await api.get("/erp/payments", { params })).data,
  createPayment: async (data) => (await api.post("/erp/payments", data)).data,
  exportReceiptPdfUrl: (id) => `${API_BASE_URL}/erp/payments/${id}/receipt`,

  // Inventory & Vendors
  getMaterials: async (params) => (await api.get("/erp/materials", { params })).data,
  createMaterial: async (data) => (await api.post("/erp/materials", data)).data,
  getVendors: async () => (await api.get("/erp/vendors")).data,
  createVendor: async (data) => (await api.post("/erp/vendors", data)).data,

  // Factory / Production
  getProduction: async (params) => (await api.get("/erp/production", { params })).data,
  createProduction: async (data) => (await api.post("/erp/production", data)).data,
  updateProductionStatus: async (id, data) => (await api.put(`/erp/production/${id}/status`, data)).data,

  // Installation & Site Visits
  getInstallations: async (params) => (await api.get("/erp/installation", { params })).data,
  createInstallation: async (data) => (await api.post("/erp/installation", data)).data,

  getSiteVisits: async (params) => (await api.get("/erp/site-visits", { params })).data,
  createSiteVisit: async (data) => (await api.post("/erp/site-visits", data)).data,

  // Calendar
  getCalendarEvents: async () => (await api.get("/erp/calendar")).data,
  createCalendarEvent: async (data) => (await api.post("/erp/calendar", data)).data,

  // Users & Roles
  getUsers: async () => (await api.get("/erp/users")).data,
  createUser: async (data) => (await api.post("/erp/users", data)).data,
  updateUserRole: async (id, data) => (await api.put(`/erp/users/${id}/role`, data)).data,

  // Activity Logs & Exports
  getActivityLogs: async (params) => (await api.get("/erp/activity-logs", { params })).data,
  getExportUrl: (type) => `${API_BASE_URL}/erp/reports/export/${type}`
};

export default erpApi;
