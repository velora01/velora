import Contact from "../models/contact.model.js";

export const createContactEntry = async (body) => {
  return await Contact.create(body);
};

export const getContactEntries = async () => {
  return await Contact.find();
};

export default getContactEntries;
