import Gallery from "../models/Gallery.js";

export const getGalleryItems = async (req, res) => {
  try {
    const { category, style, search } = req.query;

    let query = { isActive: true };

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (style && style !== "All") {
      query.style = { $regex: new RegExp(`^${style}$`, "i") };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { style: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Gallery.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery items.",
    });
  }
};

export const getGalleryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching gallery item:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery item details.",
    });
  }
};
