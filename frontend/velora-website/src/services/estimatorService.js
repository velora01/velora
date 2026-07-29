const getBaseUrl = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:3000/api";
  }
  return "https://velora-backend-usq1.onrender.com/api";
};

export const calculateCost = async (data) => {
  try {
    const response = await fetch(`${getBaseUrl()}/estimator/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error("Calculation error");
    return result.calculation;
  } catch (error) {
    console.warn("Estimator calculate API error, using client-side math:", error);
    // Client side fallback calculation
    const rateMap = { Essential: 1200, Premium: 1850, Luxury: 2800 };
    const rate = rateMap[data.packageTier] || 1850;
    const base = (data.sqft || 800) * rate;
    const minEst = Math.round(base * 0.95);
    const maxEst = Math.round(base * 1.1);

    return {
      sqft: data.sqft,
      packageTier: data.packageTier,
      formattedMin: "Tailored Scope",
      formattedMax: "Custom Consultation",
      estimatedTimelineDays: (data.sqft > 1500) ? "45–60 Days" : "30–45 Days",
    };
  }
};

export const submitQuoteRequest = async (quoteData) => {
  const response = await fetch(`${getBaseUrl()}/estimator/quote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quoteData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to submit quote request.");
  }
  return result;
};
