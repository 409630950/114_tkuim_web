const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    petName: { type: String, required: true, trim: true },
    petType: { type: String, default: "cat", enum: ["cat", "dog"] },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, default: "morning", enum: ["morning", "afternoon", "evening"] },
    reason: { type: String, default: "" },
    status: { type: String, default: "booked", enum: ["booked", "done", "cancelled"] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", AppointmentSchema);
