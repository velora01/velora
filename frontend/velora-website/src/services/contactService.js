const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const submitContactForm = async (contactData) => {
  const response = await fetch(`${getBaseUrl()}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to submit contact message.");
  }
  return result;
};
