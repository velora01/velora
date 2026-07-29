import EstimatorQuote from "../models/EstimatorQuote.js";

// Rate cards per sq.ft based on tier
const BASE_RATES = {
  Essential: 1200, // ₹1,200 per sqft
  Premium: 1850,   // ₹1,850 per sqft
  Luxury: 2800,    // ₹2,800 per sqft
};

const FURNITURE_ADDON_RATES = {
  "Modular Kitchen": 120000,
  "Master Bedroom Wardrobe": 85000,
  "Luxury L-Shape Sofa": 65000,
  "6-Seater Dining Table": 50000,
  "Custom TV Unit & Wall Design": 45000,
  "False Ceiling & Ambient Lighting": 55000,
  "Smart Home Lighting Integration": 40000,
  "Italian Marble / Premium Flooring": 110000,
};

export const calculateCost = async (req, res) => {
  try {
    const { sqft = 800, packageTier = "Premium", selectedFurniture = [] } = req.body;

    const ratePerSqft = BASE_RATES[packageTier] || BASE_RATES.Premium;
    let baseCost = sqft * ratePerSqft;

    let addonsTotal = 0;
    selectedFurniture.forEach((item) => {
      if (FURNITURE_ADDON_RATES[item]) {
        addonsTotal += FURNITURE_ADDON_RATES[item];
      }
    });

    const totalEstimate = baseCost + addonsTotal;
    const minEstimate = Math.round(totalEstimate * 0.95);
    const maxEstimate = Math.round(totalEstimate * 1.1);

    return res.status(200).json({
      success: true,
      calculation: {
        sqft,
        packageTier,
        ratePerSqft,
        baseCost,
        addonsTotal,
        estimatedPriceMin: minEstimate,
        estimatedPriceMax: maxEstimate,
        formattedMin: `₹${minEstimate.toLocaleString("en-IN")}`,
        formattedMax: `₹${maxEstimate.toLocaleString("en-IN")}`,
        estimatedTimelineDays: sqft > 1500 ? "45–60 Days" : "30–45 Days",
      },
    });
  } catch (error) {
    console.error("Error calculating estimate:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate cost estimate.",
    });
  }
};

export const createQuoteRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      homeType,
      sqft,
      packageTier,
      selectedFurniture,
      estimatedPriceMin,
      estimatedPriceMax,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone number are required.",
      });
    }

    const newQuote = await EstimatorQuote.create({
      name,
      email,
      phone,
      homeType: homeType || "2 BHK",
      sqft: Number(sqft) || 1000,
      packageTier: packageTier || "Premium",
      selectedFurniture: selectedFurniture || [],
      estimatedPriceMin: Number(estimatedPriceMin) || 500000,
      estimatedPriceMax: Number(estimatedPriceMax) || 650000,
    });

    return res.status(201).json({
      success: true,
      message: "Your cost estimate quote request has been saved. Our designer will call you shortly!",
      data: newQuote,
    });
  } catch (error) {
    console.error("Error saving quote request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quote request.",
    });
  }
};
