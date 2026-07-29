const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const fetchGuides = async (category = "") => {
  try {
    const url = category ? `${getBaseUrl()}/guides?category=${category}` : `${getBaseUrl()}/guides`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to load design guides");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn("Guides API fetch failed, falling back to local dataset:", error);
    return null;
  }
};
