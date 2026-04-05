import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function Dashboard() {
  const { deviceId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("checking");
  const [played, setPlayed] = useState(false);
  // const [history, setHistory] = useState([]);
  const [audio] = useState(new Audio("/alarm_tone.mp3"));

  // ===============================
  // ✅ SAFE CALCULATIONS
  // ===============================
  const heartRate = data?.heartRate ?? 0;
const temperature = data?.temperature ?? 0;

const heartCritical = heartRate > 120 || heartRate < 50;
const tempCritical = temperature > 39;

  const isCritical =
    heartCritical || tempCritical;

  // ===============================
  // 🔔 ALERT SOUND
  // ===============================
  useEffect(() => {
  if (!data) return;

  if (isCritical) {
    audio.loop = true;   // 🔁 loop only in critical
    audio.play().catch(() => {});
    setPlayed(true);
  } else {
    audio.pause();       // 🛑 STOP SOUND
    audio.currentTime = 0; // reset
    setPlayed(false);
  }

}, [isCritical, data]);

  // ===============================
  // 🔄 DEVICE CHECK + POLLING
  // ===============================
  useEffect(() => {
    let interval;

   const fetchData = async () => {
  try {
    const res = await API.get(`/latest/${deviceId}`);

    if (!res.data) {
      console.log("No live data yet");
      return;
    }

    // ✅ ONLY LIVE DATA
    setData(res.data);

  } catch (err) {
    console.error("Fetch error:", err);
  }
};

    const startPolling = () => {
      fetchData();
      interval = setInterval(fetchData, 3000);
    };

    const verifyDevice = async () => {
      try {
        const res = await API.get(`/device-status/${deviceId}`);

        // if (!res.data.exists) {
        //   setStatus("not-exists");
        //   return;
        // }

        // if (!res.data.linked) {
        //   setStatus("not-linked");
        //   return;
        // }

        // setStatus("ready");

       
    if (!res.data.exists) {
      setStatus("not-exists");
    } else if (!res.data.linked) {
      setStatus("not-linked");
    } else {
      setStatus("ready");   // ✅ THIS WAS MISSING
      startPolling();       // ✅ start only when valid
    }

  } catch (err) {
    console.error("Verification error:", err);
    setStatus("not-exists");
  }
  };

    verifyDevice();

    return () => clearInterval(interval);
  }, [deviceId]);

  // ===============================
  // 🧠 UI STATES
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Device Not Found</h1>
        <p className="text-gray-400 mb-6">Please power ON your device first.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 px-6 py-3 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (status === "not-linked") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Device Not Registered</h1>
        <p className="text-gray-400 mb-6">
          Device is not linked to any patient.
        </p>
        <button
          onClick={() => navigate(`/register?deviceId=${deviceId}`)}
          className="bg-blue-500 px-6 py-3 rounded-lg"
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
  // 🎨 MAIN DASHBOARD UI
  // ===============================
 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">

    {/* 🔷 NAVBAR */}
    <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
      <h1 className="text-2xl font-bold tracking-wide">
        MY MONITOR
      </h1>
 
      <button
  onClick={() => navigate(`/history/${deviceId}`)}
  className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
>
   View History
</button>

      <button
        onClick={() => {
  localStorage.clear();
  navigate("/", { replace: true });
}}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-semibold transition hover:scale-105 shadow-lg"
      >
         Sign Out
      </button>
    </div>

    {/* 🔴 ALERT */}
    {isCritical && (
      <div className="mx-6 mt-6 bg-red-600 text-center py-3 rounded-xl animate-pulse font-bold shadow-lg">
        🚨 CRITICAL CONDITION DETECTED 🚨
      </div>
    )}

    {/* 🔷 TITLE */}
    <h1 className="text-4xl font-bold text-center mt-8">
      Live Health Monitor
    </h1>

    {/* 🔷 CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 py-10">

      {/* ❤️ HEART */}
      <div className={`rounded-2xl p-8 text-center backdrop-blur-xl bg-white/10 border transition-all duration-300 hover:scale-105 ${
        heartCritical
          ? "border-red-500 shadow-red-500/40 shadow-2xl"
          : "border-pink-400 shadow-pink-400/20 shadow-lg"
      }`}>
        <h2 className="text-xl mb-4">❤️ Heart Rate</h2>

        <div className={`text-6xl font-bold mb-2 ${heartCritical ? "animate-pulse" : ""}`}>
          {data?.heartRate ?? "--"}
        </div>

        <p className="text-gray-300">BPM</p>

        <p className="text-sm mt-2 text-gray-400">
          {(data?.heartRate ?? 0) > 100 ? "⬆ High" : "⬇ Normal"}
        </p>
      </div>

      {/* 🌡 TEMP */}
      <div className={`rounded-2xl p-8 text-center backdrop-blur-xl bg-white/10 border transition-all duration-300 hover:scale-105 ${
        tempCritical
          ? "border-orange-500 shadow-orange-500/40 shadow-2xl"
          : "border-blue-400 shadow-blue-400/20 shadow-lg"
      }`}>
        <h2 className="text-xl mb-4">🌡 Temperature</h2>

        <div className={`text-6xl font-bold mb-2 ${tempCritical ? "animate-pulse" : ""}`}>
          {data?.temperature ?? "--"}
        </div>

        <p className="text-gray-300">°C</p>

        <p className="text-sm mt-2 text-gray-400">
         {(data?.temperature ?? 0) > 38 ? "⬆ High" : "⬇ Normal"}
        </p>
      </div>

      {/* 🟢 STATUS */}
      <div className={`rounded-2xl p-8 text-center font-bold text-xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${
        isCritical
          ? "bg-red-600 shadow-red-500/50 shadow-2xl animate-pulse"
          : "bg-green-600 shadow-green-500/40 shadow-xl"
      }`}>
        <h2 className="mb-4">Status</h2>

        <div className="text-3xl flex items-center gap-2">
          {isCritical ? "⚠️ Critical" : "Normal"}
        </div>
      </div>

    </div>

    <div className="max-w-6xl mx-auto px-6 pb-10 space-y-10">

  {/* ❤️ HEART RATE GRAPH */}
  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg">
    <h2 className="text-xl mb-4">❤️ Heart Rate Trend</h2>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={history}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="time" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="heartRate"
          stroke="#ff4d6d"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>


  {/* 🌡 TEMPERATURE GRAPH */}
  <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg">
    <h2 className="text-xl mb-4">🌡 Temperature Trend</h2>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={history}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="time" stroke="#ccc" />
        <YAxis stroke="#ccc" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="#4dabf7"
          strokeWidth={3}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

</div>

    {/* ⏱ FOOTER */}
    <div className="text-center text-gray-400 pb-10">
      Last Updated: {new Date(data.createdAt).toLocaleTimeString()}
      <p className="text-xs mt-2 text-gray-500">
        Auto-refreshing every 3 seconds...
      </p>
    </div>

  </div>
);
}

export default Dashboard;