import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import DashBoard from "./pages/DashBoard";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layouts/Layout";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import PdfViewer from "./components/layouts/PdfViewer";
import FlaggedPlates from "./pages/FlaggedPlates";
import Hotspot from "./pages/Hotspot";

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
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashBoard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="flagged-plates" element={<FlaggedPlates />} />
          <Route path="hotspot" element={<Hotspot />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/pdf/:id" element={<PdfViewer />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
