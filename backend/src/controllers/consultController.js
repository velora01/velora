import { createConsult } from "../services/consult.service.js";

export const createConsultation = async (req, res) => {
  try {
    const consultation = await createConsult(req.body);

    return res.status(201).json({
      success: true,
      message: "Consultation Booked Successfully",
      data: consultation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};