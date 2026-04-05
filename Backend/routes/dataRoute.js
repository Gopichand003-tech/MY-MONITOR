import express from "express";
import Reading from "../models/Reading.js";
import Patient from "../models/Paitent.js";
import { startAlert, stopAlert } from "../services/AlertService.js";

const router = express.Router();

const HEART_MAX = 120;
const HEART_MIN = 50;
const TEMP_MAX = 39;
const ALERT_COOLDOWN = 60000;

// ✅ PER DEVICE ALERT TRACKING
const alertMap = new Map();

router.post("/data", async (req, res) => {
  try {
    const { deviceId, heartRate, temperature } = req.body;

    const hr = Number(heartRate);
    const temp = Number(temperature);

    // ❌ INVALID DATA CHECK
    if (!deviceId || isNaN(hr) || isNaN(temp)) {
      return res.status(400).json({ error: "Invalid sensor data" });
    }

    // ❌ SENSOR ERROR FILTER
    if (temp < 0 || temp > 100) {
      console.log("❌ Invalid temperature ignored:", temp);
      return res.sendStatus(200);
    }

    if (hr <= 0 || hr > 250) {
      console.log("❌ Invalid heart rate ignored:", hr);
      return res.sendStatus(200);
    }

    // 🔎 FIND PATIENT
    const patient = await Patient.findOne({ deviceId });

    if (!patient) {
      return res.status(404).json({ error: "Device not linked" });
    }

    let status = "Normal";

    const isCritical =
      hr > HEART_MAX ||
      hr < HEART_MIN ||
      temp > TEMP_MAX;

    // 🚨 CRITICAL CONDITION
    if (isCritical) {
      status = "Critical";

      const now = Date.now();
      const lastTime = alertMap.get(deviceId) || 0;

      if (now - lastTime > ALERT_COOLDOWN) {
        await startAlert({
          deviceId, // ✅ IMPORTANT
          name: patient.name,
          heartRate: hr,
          temperature: temp,
          phone: patient.familyPhone
        });

        alertMap.set(deviceId, now);
      }

    } else {
      // 🛑 STOP ALERT WHEN NORMAL
      stopAlert(deviceId);
      alertMap.delete(deviceId);
    }

    // 💾 SAVE DATA
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

// 📡 GET LATEST DATA
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