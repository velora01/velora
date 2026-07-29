const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const fetchCrmLeads = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);

  const response = await fetch(`${getBaseUrl()}/crm?${params.toString()}`);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch CRM leads.");
  }
  return result.data || [];
};

export const fetchCrmStats = async () => {
  const response = await fetch(`${getBaseUrl()}/crm/stats`);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch CRM stats.");
  }
  return result.data;
};

export const createCrmLead = async (leadData) => {
  const response = await fetch(`${getBaseUrl()}/crm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leadData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create CRM lead.");
  }
  return result.data;
};

export const updateCrmLead = async (id, leadData) => {
  const response = await fetch(`${getBaseUrl()}/crm/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leadData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update CRM lead.");
  }
  return result.data;
};

export const updateCrmStatus = async (id, status, comment = "") => {
  const response = await fetch(`${getBaseUrl()}/crm/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, comment }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update CRM status.");
  }
  return result.data;
};

export const deleteCrmLead = async (id) => {
  const response = await fetch(`${getBaseUrl()}/crm/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete CRM lead.");
  }
  return result.data;
};

export const fetchPendingSubmissions = async () => {
  const response = await fetch(`${getBaseUrl()}/crm/pending`);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch pending submissions.");
  }
  return result.data || { consults: [], contacts: [] };
};
