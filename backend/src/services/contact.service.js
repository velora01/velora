import Contact from "../models/contact.model.js";

export const createContactEntry = async (body) => {

  return await Contact.create(body);
};

export const getContactEntries = async () => {
  return await Contact.find();
};

export default getContactEntries;

export const getContactEntryById = async (id) => {
  return await Contact.findById(id);
};

export const updateContactEntry = async (id, body) => {
  return await Contact.findByIdAndUpdate(id, body, { new: true });
};

export const deleteContactEntry = async (id) => {
  return await Contact.findByIdAndDelete(id);
}
;