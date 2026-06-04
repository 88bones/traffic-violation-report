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
          {/*<Route path="users" element={<Users />} /> */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
