import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("checking"); 
  // checking | not-exists | not-linked | ready

  useEffect(() => {
    let interval;

    const verifyDevice = async () => {
      try {
        const res = await API.get(`/device-status/${deviceId}`);

        if (!res.data.exists) {
          setStatus("not-exists");
          return;
        }

        if (!res.data.linked) {
          setStatus("not-linked");
          return;
        }

        setStatus("ready");
        startPolling();

      } catch (err) {
        console.error("Verification error:", err);
        setStatus("not-exists");
      }
    };

    const startPolling = () => {
      fetchData();
      interval = setInterval(fetchData, 3000);
    };

    const fetchData = async () => {
      try {
        const res = await API.get(`/latest/${deviceId}`);
        setData(res.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    verifyDevice();

    return () => clearInterval(interval);
  }, [deviceId]);

  // ===============================
  // UI STATES
  // ===============================

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xl">
        Checking device...
      </div>
    );
  }

  if (status === "not-exists") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Device Not Found
        </h1>
        <p className="text-gray-400 mb-6">
          Please power ON your device first.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (status === "not-linked") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Device Not Registered
        </h1>
        <p className="text-gray-400 mb-6">
          This device is powered ON but not linked to any patient.
        </p>
        <button
          onClick={() => navigate(`/register?deviceId=${deviceId}`)}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition"
        >
          Register Device
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xl">
        Waiting for live data...
      </div>
    );
  }

  // ===============================
  // DASHBOARD READY STATE
  // ===============================

  const heartCritical =
    data.heartRate > 120 || data.heartRate < 50;

  const tempCritical =
    data.temperature > 39;

  const isCritical =
    heartCritical || tempCritical;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white px-6 py-10">

      <h1 className="text-4xl font-bold text-center mb-8">
        🏥 Live Health Monitor
      </h1>

      {isCritical && (
        <div className="bg-red-600 text-center py-3 rounded-lg mb-8 animate-pulse font-bold">
          🚨 CRITICAL CONDITION DETECTED 🚨
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* Heart Rate */}
        <div className={`rounded-2xl p-8 text-center backdrop-blur-lg bg-white/10 border ${
          heartCritical
            ? "border-red-500 shadow-red-500/40 shadow-xl"
            : "border-pink-400 shadow-pink-400/20 shadow-lg"
        }`}>
          <h2 className="text-xl mb-4">❤️ Heart Rate</h2>
          <div className="text-6xl font-bold mb-2">
            {data.heartRate}
          </div>
          <p className="text-gray-300">BPM</p>
        </div>

        {/* Temperature */}
        <div className={`rounded-2xl p-8 text-center backdrop-blur-lg bg-white/10 border ${
          tempCritical
            ? "border-orange-500 shadow-orange-500/40 shadow-xl"
            : "border-blue-400 shadow-blue-400/20 shadow-lg"
        }`}>
          <h2 className="text-xl mb-4">🌡 Temperature</h2>
          <div className="text-6xl font-bold mb-2">
            {data.temperature}
          </div>
          <p className="text-gray-300">°C</p>
        </div>

        {/* Status */}
        <div className={`rounded-2xl p-8 text-center font-bold text-xl ${
          isCritical
            ? "bg-red-600 shadow-red-500/50 shadow-xl"
            : "bg-green-600 shadow-green-500/40 shadow-lg"
        }`}>
          <h2 className="mb-4">Status</h2>
          <div className="text-3xl">
            {data.status}
          </div>
        </div>

      </div>

      <div className="text-center text-gray-400 mt-10">
        Last Updated: {new Date(data.createdAt).toLocaleTimeString()}
      </div>

    </div>
  );
}

export default Dashboard;