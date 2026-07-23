import { createConsult, getConsults } from "../services/consult.service.js";

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

export const getConsultations = async (req, res) => {
  try {
    const consultations = await getConsults();

    return res.status(200).json({
      success: true,
      message: "Consultations fetched successfully",
      data: consultations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getConsultations;
