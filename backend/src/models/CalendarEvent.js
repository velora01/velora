import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["Meeting", "Site Visit", "Installation", "Task", "Reminder"],
      default: "Meeting"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, default: "" },
    attendees: [{ type: String }],
    description: { type: String, default: "" },
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" }
  },
  { timestamps: true }
);

export default mongoose.model("CalendarEvent", calendarEventSchema);
