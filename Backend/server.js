import dotenv from "dotenv";
dotenv.config();  // MUST BE FIRST

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dataRoutes from "./routes/dataRoute.js";
import PaitentRoutes from "./routes/paitentRoute.js";
import deviceRoutes from "./routes/deviceRoute.js";
import { stopAlert } from "./services/AlertService.js";



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use("/api", dataRoutes);
app.use("/api",PaitentRoutes);
app.use("/api",deviceRoutes);

app.post("/whatsapp-webhook", (req, res) => {
  console.log("Webhook working");
  return res.status(200).send("OK");
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

  })
  .catch(err => console.error("❌ Mongo Error:", err));