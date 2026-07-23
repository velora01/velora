const API_URL = "https://velora-backend-usq1.onrender.com/api/projects";

export const fetchProjects = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to load projects from the server.");
  }

  const result = await response.json();
  return Array.isArray(result?.data) ? result.data : [];
};
