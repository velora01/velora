const getBaseUrl = () => {
  return "https://velora-backend-usq1.onrender.com/api";
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("velora_admin_token");
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
  return !!localStorage.getItem("velora_admin_token");
};

export const fetchAdminProfile = async () => {
  const response = await fetch(`${getBaseUrl()}/profile`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch profile info.");
  }

  if (result.success && result.data) {
    localStorage.setItem("velora_admin_user", JSON.stringify(result.data));
    return result.data;
  }
  return null;
};
