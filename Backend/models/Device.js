import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      unique: true,
      required: true
    },
    linked: {
      type: Boolean,
      default: false
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);