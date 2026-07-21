import Service from "../models/Service.js";

const createService = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      banner,
      gallery,
      features,
      priceFrom,
      seoTitle,
      seoDescription,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const slug = req.body.slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingService = await Service.findOne({ slug });
    if (existingService) {
      return res.status(409).json({
        success: false,
        message: "Service with this slug already exists",
      });
    }

    const service = await Service.create({
      title,
      description,
      slug,
      thumbnail: thumbnail || "",
      banner: banner || "",
      gallery: Array.isArray(gallery) ? gallery : [],
      features: Array.isArray(features) ? features : [],
      priceFrom: priceFrom || "",
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || description,
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await Service.findOne({ slug, isActive: true });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createService,
  getAllServices,
  getServiceBySlug,
};
