import Consult from "../models/consult.model.js";

export const createConsult = async (body) => {
  return await Consult.create(body);
};

export const getConsults = async () => {
  return await Consult.find();
};

export default getConsults;