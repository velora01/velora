import Review from "../models/Review.js";

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true }).sort({ createdAt: -1 });

    const totalCount = reviews.length;
    let totalRating = 0;
    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((rev) => {
      totalRating += rev.rating;
      const rounded = Math.round(rev.rating);
      if (ratingBreakdown[rounded] !== undefined) {
        ratingBreakdown[rounded] += 1;
      }
    });

    const averageRating = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : "5.0";

    return res.status(200).json({
      success: true,
      totalCount,
      averageRating: parseFloat(averageRating),
      ratingBreakdown,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { name, location, projectType, rating, comment, avatar } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Name, rating, and review text are required.",
      });
    }

    const newReview = await Review.create({
      name,
      location: location || "Verified Homeowner",
      projectType: projectType || "Interior & Furniture",
      rating: Number(rating),
      comment,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      verified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your review has been submitted successfully.",
      data: newReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit review.",
    });
  }
};
