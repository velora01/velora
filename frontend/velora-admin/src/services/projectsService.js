import { getAuthHeaders } from "./authService";

const getBaseUrl = () => {
  return "https://velora-backend-usq1.onrender.com/api";
};

export const createProject = async (projectData) => {
  const response = await fetch(`${getBaseUrl()}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(projectData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create project.");
  }
  return result;
};

export const uploadProjectImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${getBaseUrl()}/upload/image`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to upload image.");
  }
  return result;
};

export const uploadProjectVideo = async (file) => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch(`${getBaseUrl()}/upload/video`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to upload video.");
  }
  return result;
};
