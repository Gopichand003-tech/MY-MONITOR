import express from "express";
import Reading from "../models/Reading.js";
import Patient from "../models/Paitent.js";
import { startAlert } from "../services/AlertService.js";

const router = express.Router();

const HEART_MAX = 120;
const HEART_MIN = 50;
const TEMP_MAX = 39;
const ALERT_COOLDOWN = 60000;

let lastAlertTime = 0;

router.post("/data", async (req, res) => {
  try {
    const { deviceId, heartRate, temperature } = req.body;

    const hr = Number(heartRate);
    const temp = Number(temperature);

    if (!deviceId || isNaN(hr) || isNaN(temp)) {
      return res.status(400).json({ error: "Invalid sensor data" });
    }

    // 🔎 Find patient using deviceId
    const patient = await Patient.findOne({ deviceId });

    if (!patient) {
      return res.status(404).json({ error: "Device not linked" });
    }

    let status = "Normal";

    const isCritical =
      hr > HEART_MAX ||
      hr < HEART_MIN ||
      temp > TEMP_MAX;

    if (isCritical) {
      status = "Critical";

      if (Date.now() - lastAlertTime > ALERT_COOLDOWN) {
        await startAlert({
          name: patient.name,
          heartRate: hr,
          temperature: temp,
          phone: patient.familyPhone
        });

        lastAlertTime = Date.now();
      }
    }

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
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/latest/:deviceId", async (req, res) => {
  const reading = await Reading.findOne({ deviceId: req.params.deviceId })
    .sort({ createdAt: -1 });

  res.json(reading);
});

router.get("/history/:deviceId", async (req, res) => {
  const readings = await Reading.find({ deviceId: req.params.deviceId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(readings);
});

export default router;