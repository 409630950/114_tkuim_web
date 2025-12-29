const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

console.log("APP START");

// MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/petcare")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error", err.message));

const AppointmentSchema = new mongoose.Schema(
  {
    ownerName: String,
    petName: String,
    petType: String,
    appointmentDate: String,
    timeSlot: String,
    reason: String,
    status: String,
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", AppointmentSchema);


// API
app.get("/api/appointments", async (req, res) => {
  const list = await Appointment.find();
  res.json(list);
});

app.post("/api/appointments", async (req, res) => {
  const created = await Appointment.create(req.body);
  res.json(created);
});

// Root
app.get("/", (req, res) => {
  res.json({ message: "Backend OK" });
});

app.listen(5000, "127.0.0.1", () => {
  console.log("SERVER RUNNING http://127.0.0.1:5000");
});

// 保命
setInterval(() => {}, 1000);
