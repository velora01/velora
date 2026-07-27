const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const fetchProjects = async () => {
  const response = await fetch(`${getBaseUrl()}/projects`);

  if (!response.ok) {
    throw new Error("Unable to load projects from the server.");
  }

  const result = await response.json();
  return Array.isArray(result?.data) ? result.data : [];
};

export const createProject = async (projectData) => {
  const response = await fetch(`${getBaseUrl()}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to upload image.");
  }
  return result;
};
