import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    familyPhone: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);