import Guide from "../models/Guide.js";

export const getGuides = async (req, res) => {
  try {
    const { category } = req.query;

    let query = { isActive: true };
    if (category) {
      query.category = category.toLowerCase();
    }

    const guides = await Guide.find(query).sort({ createdAt: -1 });

    // Group by category for easy frontend usage
    const grouped = {};
    guides.forEach((guide) => {
      const cat = guide.category;
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(guide);
    });

    return res.status(200).json({
      success: true,
      count: guides.length,
      grouped,
      data: guides,
    });
  } catch (error) {
    console.error("Error fetching guides:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch design guides.",
    });
  }
};

export const getGuideById = async (req, res) => {
  try {
    const { id } = req.params;
    const guide = await Guide.findById(id);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error) {
    console.error("Error fetching guide details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch guide details.",
    });
  }
};
