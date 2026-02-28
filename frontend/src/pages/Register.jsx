import { useState, useEffect } from "react";
import API from "../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";

function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const deviceIdFromURL = searchParams.get("deviceId");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    deviceId: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (deviceIdFromURL) {
      setForm(prev => ({
        ...prev,
        deviceId: deviceIdFromURL
      }));
    }
  }, [deviceIdFromURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.deviceId) {
      setError("Device ID is required");
      return;
    }

    setLoading(true);

    try {
      await API.post("/register", form);

      localStorage.setItem("deviceId", form.deviceId);
      navigate(`/dashboard/${form.deviceId}`);

    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white">

        <h2 className="text-2xl font-bold text-center mb-2">
          Patient Registration
        </h2>

        <p className="text-center text-gray-300 mb-8">
          Link your device to receive alerts
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Patient Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              required
              placeholder="Enter patient name"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Family WhatsApp Number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              required
              placeholder="+91XXXXXXXXXX"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Device ID */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Device ID
            </label>
            <input
              type="text"
              value={form.deviceId}
              onChange={(e) =>
                setForm({ ...form, deviceId: e.target.value })
              }
              readOnly={!!deviceIdFromURL}
              required
              placeholder="Enter device ID"
              className={`w-full px-4 py-3 rounded-lg border transition ${
                deviceIdFromURL
                  ? "bg-gray-500/30 border-gray-400/40 text-gray-300 cursor-not-allowed"
                  : "bg-white/20 border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/40"
            }`}
          >
            {loading ? "Registering..." : "Register Device"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Register;