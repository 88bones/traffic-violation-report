import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
