import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EnterDevice from "./pages/EnterDevice";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";

function App() {
  const savedDevice = localStorage.getItem("deviceId");

  return (
    <BrowserRouter>
      <Routes>
        {/* Root Route */}
        <Route
          path="/"
          element={
            savedDevice
              ? <Navigate to={`/dashboard/${savedDevice}`} replace />
              : <EnterDevice />
          }
        />

        {/* Register Route */}
        <Route path="/register" element={<Register />} />

        {/* Dashboard Route */}
        <Route path="/dashboard/:deviceId" element={<Dashboard />} />

        {/* History Route */}
        <Route path="/history/:deviceId" element={<History />} />

        {/* Catch All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;