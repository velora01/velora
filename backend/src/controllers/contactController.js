import { createContactEntry, getContactEntries } from "../services/contact.service.js";

export const createContact = async (req, res) => {
  try {
    const contact = await createContactEntry(req.body);

    return res.status(201).json({
      success: true,
      message: "Contact message sent successfully",
      data: contact,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await getContactEntries();

    return res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully",
      data: contacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default getContacts;
