import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";


function History() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/history/${deviceId}`);
        setHistory(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, [deviceId]);

  // 🔍 FILTER LOGIC
  const filtered = history.filter(item =>
    item.heartRate?.toString().includes(search)
  );

  // 📊 STATS
  const total = history.length;
  const criticalCount = history.filter(
    h => h.heartRate > 120 || h.heartRate < 50 || h.temperature > 39
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">

      {/* 🔷 NAVBAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-wide">MY MONITOR</h1>

       <button
  onClick={() => navigate(`/dashboard/${deviceId}`)}
  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-xl font-semibold transition shadow-lg mr-4 -translate-x-15 "
>
  ← Dashboard
</button>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">

  {/* LEFT SIDE */}
  <div>
    <h1 className="text-4xl font-bold mb-1 flex items-center gap-2">
       <span>Health History</span>
    </h1>

    <p className="text-gray-400 text-sm">
      Monitor past health readings and detect abnormal patterns
    </p>
  </div>

  {/* RIGHT SIDE (LIVE STATUS / EXTRA INFO) */}
  <div className="flex items-center gap-3">

    {/* LIVE INDICATOR */}
    <span className="flex items-center gap-2 text-green-400 text-sm font-semibold">
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
      Live Data
    </span>

    {/* TOTAL COUNT BADGE */}
    <span className="bg-white/10 px-3 py-1 rounded-full text-sm">
      {history.length} Records
    </span>

  </div>

</div>

      {/* 🔷 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 max-w-7xl mx-auto">

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg shadow-lg">
          <p className="text-gray-400">Total Records</p>
          <h2 className="text-3xl font-bold">{total}</h2>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg shadow-lg">
          <p className="text-gray-400">Critical Cases</p>
          <h2 className="text-3xl font-bold text-red-400">
            {criticalCount}
          </h2>
        </div>

        <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg shadow-lg">
          <p className="text-gray-400">Normal Cases</p>
          <h2 className="text-3xl font-bold text-green-400">
            {total - criticalCount}
          </h2>
        </div>

      </div>

      {/* 🔍 SEARCH */}
      <div className="px-6 mt-6 max-w-7xl mx-auto">
        <input
          type="text"
          placeholder="Search by Heart Rate..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />
      </div>

      {/* 📋 TABLE */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            No history data available
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-300 border-b border-white/20">
                  <th className="p-4">Date & Time</th>
                  <th>Heart Rate</th>
                  <th>Temperature</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, i) => {
                  const heart = item.heartRate ?? 0;
                  const temp = item.temperature ?? 0;
                  const critical =
                    heart > 120 || heart < 50 || temp > 39;

                  return (
                    <tr
                      key={i}
                      className={`border-b border-white/10 transition ${
                        critical
                          ? "bg-red-500/10 hover:bg-red-500/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="p-4">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td className="font-semibold">
                        ❤️ {heart}
                      </td>

                      <td className="font-semibold">
                        🌡 {temp}
                      </td>

                      <td>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            critical
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {critical ? "Critical" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔻 FOOTER */}
      <div className="text-center text-gray-500 pb-6 text-sm">
        Showing {filtered.length} of {total} records
      </div>

    </div>
  );
}

export default History;