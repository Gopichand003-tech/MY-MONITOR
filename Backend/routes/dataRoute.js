import express from "express";
import Reading from "../models/Reading.js";
import Patient from "../models/Paitent.js";
import { startAlert, stopAlert } from "../services/AlertService.js";

const router = express.Router();

const HEART_MAX = 120;
const HEART_MIN = 50;
const TEMP_MAX = 39;
const ALERT_COOLDOWN = 60000; // 1 minute

// 🔥 per device alert cooldown
const alertMap = new Map();

router.post("/data", async (req, res) => {
  try {
    const { deviceId, heartRate, temperature } = req.body;

    const hr = Number(heartRate);
    const temp = Number(temperature);

    // ❌ basic validation
    if (!deviceId || isNaN(hr) || isNaN(temp)) {
      return res.status(400).json({ error: "Invalid sensor data" });
    }

    // ❌ temperature sensor error (-127 etc)
    if (temp < 0 || temp > 100) {
      console.log("❌ Invalid temperature ignored:", temp);
      return res.sendStatus(200);
    }

    // 🔎 find patient
    const patient = await Patient.findOne({ deviceId });

    if (!patient) {
      return res.status(404).json({ error: "Device not linked" });
    }

    let status = "Normal";

    // 🚨 NEW LOGIC (YOUR REQUIREMENT)
    const isCritical =
      hr === 0 ||           // 🔥 important
      hr < HEART_MIN ||
      hr > HEART_MAX ||
      temp > TEMP_MAX;

    if (isCritical) {
      status = "Critical";

      const now = Date.now();
      const lastTime = alertMap.get(deviceId) || 0;

      // 🔥 cooldown control (no spam)
      if (now - lastTime > ALERT_COOLDOWN) {
        await startAlert({
          deviceId,
          name: patient.name,
          heartRate: hr,
          temperature: temp,
          phone: patient.familyPhone
        });

        alertMap.set(deviceId, now);
      }

    } else {
      // ✅ stop alert when back to normal
      stopAlert(deviceId);
      alertMap.delete(deviceId);
    }

    // 💾 save reading (INCLUDING hr=0)
    const newReading = new Reading({
      deviceId,
      patientId: patient._id,
      heartRate: hr,
      temperature: temp,
      status
    });

    await newReading.save();

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// 📡 GET LATEST
router.get("/latest/:deviceId", async (req, res) => {
  try {
    const reading = await Reading.findOne({
      deviceId: req.params.deviceId
    }).sort({ createdAt: -1 });

    res.json(reading);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching latest data" });
  }
});


// 📊 GET HISTORY
router.get("/history/:deviceId", async (req, res) => {
  try {
    const readings = await Reading.find({
      deviceId: req.params.deviceId
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(readings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching history" });
  }
});

export default router;