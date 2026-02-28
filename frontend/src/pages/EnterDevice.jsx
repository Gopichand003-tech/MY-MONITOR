import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function EnterDevice() {
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.get(`/device-status/${deviceId}`);

      if (!res.data.exists) {
        setError("Device not found. Please power ON the device first.");
        setLoading(false);
        return;
      }

      if (res.data.linked) {
        localStorage.setItem("deviceId", deviceId);
        navigate(`/dashboard/${deviceId}`);
      } else {
        navigate(`/register?deviceId=${deviceId}`);
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4">

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-white border border-white/20">

        <h1 className="text-3xl font-bold text-center mb-2">
          IoT Health Monitor
        </h1>

        <p className="text-center text-gray-300 mb-8">
          Enter your Device ID to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Device ID
            </label>

            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="Enter Device ID"
              required
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/40"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Checking...
              </span>
            ) : (
              "Continue"
            )}
          </button>
        </form>
        
        <div className="text-center mt-6">
  <button
    onClick={() => navigate("/register")}
    className="text-blue-400 hover:text-blue-300 underline"
  >
    Register New Device
  </button>
</div>

      </div>
    </div>
  );
}

export default EnterDevice;