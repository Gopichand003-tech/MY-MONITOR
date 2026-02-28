import express from "express";
import Device from "../models/Device.js";

const router = express.Router();

// ESP32 calls this when booting
router.post("/device-register", async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: "Device ID required" });
  }

  let device = await Device.findOne({ deviceId });

  if (!device) {
    device = new Device({ deviceId });
    await device.save();
  }

  res.json({ success: true });
});

router.get("/device-status/:deviceId", async (req, res) => {
  const device = await Device.findOne({ deviceId: req.params.deviceId })
    .populate("patient");

  if (!device) {
    return res.json({ exists: false });
  }

  if (device.linked) {
    return res.json({
      exists: true,
      linked: true,
      patient: device.patient
    });
  }

  res.json({ exists: true, linked: false });
});

export default router;