const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const fetchGalleryItems = async (category = "All", style = "All", search = "") => {
  try {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (style && style !== "All") params.append("style", style);
    if (search) params.append("search", search);

    const url = `${getBaseUrl()}/gallery?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to load gallery items");
    }

    const result = await response.json();
    return Array.isArray(result?.data) ? result.data : [];
  } catch (error) {
    console.warn("Gallery API fetch failed, falling back to local dataset:", error);
    return null; // Signals component to use fallback if network fails
  }
};
