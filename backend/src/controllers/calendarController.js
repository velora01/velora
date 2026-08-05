import CalendarEvent from "../models/CalendarEvent.js";

export const getEvents = async (req, res) => {
  try {
    const events = await CalendarEvent.find().sort({ startDate: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
