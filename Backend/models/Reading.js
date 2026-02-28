import mongoose from "mongoose";

const readingSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      index: true
    },

    deviceId: {
      type: String,
      required: true
    },

    heartRate: {
      type: Number,
      required: true,
      min: 0
    },

    temperature: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["Normal", "Critical"],
      default: "Normal"
    },

    alertSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // automatically adds createdAt & updatedAt
  }
);

// Compound index for faster patient queries
readingSchema.index({ patientId: 1, createdAt: -1 });

const Reading = mongoose.model("Reading", readingSchema);

export default Reading;