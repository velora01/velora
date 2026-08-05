import { getAuthHeaders } from "./authService";

const getBaseUrl = () => {
  return "https://velora-backend-usq1.onrender.com/api";
};

export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.search) params.append("search", filters.search);

  const response = await fetch(`${getBaseUrl()}/products?${params.toString()}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to load showroom products.");
  }
  return result.data || [];
};

export const createProduct = async (productData) => {
  const response = await fetch(`${getBaseUrl()}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to register new product.");
  }
  return result.data;
};

export const updateProduct = async (id, productData) => {
  const response = await fetch(`${getBaseUrl()}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update product details.");
  }
  return result.data;
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${getBaseUrl()}/products/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to remove product from store.");
  }
  return result;
};
