const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const fetchReviews = async () => {
  try {
    const response = await fetch(`${getBaseUrl()}/reviews`);

    if (!response.ok) {
      throw new Error("Failed to load reviews");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.warn("Reviews API fetch failed:", error);
    return null;
  }
};

export const submitReview = async (reviewData) => {
  const response = await fetch(`${getBaseUrl()}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to submit review");
  }
  return result;
};
