import express from "express";
import Patient from "../models/Paitent.js";
import Device from "../models/Device.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    let { name, phone, deviceId } = req.body;

    if (!name || !phone || !deviceId) {
      return res.status(400).json({ error: "All fields required" });
    }

    // 🔥 Normalize phone number (India default)
    phone = phone.trim();
    if (!phone.startsWith("+")) {
      phone = "+91" + phone;
    }

    // 🔥 Check if device exists
    let device = await Device.findOne({ deviceId });

    // 🔥 If NOT exist → create device automatically
    if (!device) {
      device = new Device({
        deviceId,
        linked: false
      });
      await device.save();
    }

    if (device.linked) {
      return res.status(400).json({ error: "Device already linked" });
    }

    // Create patient
    const patient = new Patient({
      name,
      familyPhone: phone,
      deviceId
    });

    await patient.save();

    // Link device
    device.linked = true;
    device.patient = patient._id;
    await device.save();

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

export default router;