const Appointment = require("../models/Appointment");

const ok = (res, message, data) => res.json({ success: true, message, data });
const fail = (res, status, message) => res.status(status).json({ success: false, message });

exports.getAllAppointments = async (req, res, next) => {
  try {
    const list = await Appointment.find().sort({ createdAt: -1 });
    return ok(res, "Appointments fetched", list);
  } catch (err) { next(err); }
};

exports.getAppointmentById = async (req, res, next) => {
  try {
    const item = await Appointment.findById(req.params.id);
    if (!item) return fail(res, 404, "Appointment not found");
    return ok(res, "Appointment fetched", item);
  } catch (err) { next(err); }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const created = await Appointment.create(req.body);
    return ok(res, "Appointment created", created);
  } catch (err) { next(err); }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!updated) return fail(res, 404, "Appointment not found");
    return ok(res, "Appointment updated", updated);
  } catch (err) { next(err); }
};

exports.deleteAppointment = async (req, res, next) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return fail(res, 404, "Appointment not found");
    return ok(res, "Appointment deleted", deleted);
  } catch (err) { next(err); }
};
