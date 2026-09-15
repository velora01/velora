const getBaseUrl = () => {
  let url = import.meta.env?.VITE_API_URL || "https://velora-backend-usq1.onrender.com/api";
  if (!url.endsWith("/api") && !url.endsWith("/api/")) {
    url = `${url.replace(/\/$/, "")}/api`;
  }
  return url;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("velora_admin_token") || localStorage.getItem("velora_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const login = async (email, password) => {
  const response = await fetch(`${getBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Invalid credentials. Please try again.");
  }

  if (result.success && result.data?.accessToken) {
    localStorage.setItem("velora_admin_token", result.data.accessToken);
    localStorage.setItem("velora_token", result.data.accessToken);
    if (result.data.refreshToken) {
      localStorage.setItem("velora_admin_refresh_token", result.data.refreshToken);
    }
    localStorage.setItem("velora_admin_user", JSON.stringify(result.data.user));
    return result.data;
  }
  
  throw new Error("Unable to authenticate with backend.");
};

export const registerAdmin = async (name, email, password) => {
  const response = await fetch(`${getBaseUrl()}/auth/register-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Registration failed.");
  }
  return result;
};

export const logout = () => {
  localStorage.removeItem("velora_admin_token");
  localStorage.removeItem("velora_token");
  localStorage.removeItem("velora_admin_refresh_token");
  localStorage.removeItem("velora_admin_user");
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("velora_admin_user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error reading cached user:", e);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!(localStorage.getItem("velora_admin_token") || localStorage.getItem("velora_token"));
};

export const updateCurrentUser = (user) => {
  localStorage.setItem("velora_admin_user", JSON.stringify(user));
  window.dispatchEvent(new Event("velora_user_updated"));
  return user;
};

export const updateAdminProfile = async (profileData) => {
  const response = await fetch(`${getBaseUrl()}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(profileData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to update profile.");
  }

  if (result.success && result.data) {
    updateCurrentUser(result.data);
    return result.data;
  }
  return null;
};
