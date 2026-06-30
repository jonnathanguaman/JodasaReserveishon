import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReservationsPage from './pages/ReservationsPage.jsx';
import AvailabilityPage from './pages/AvailabilityPage.jsx';
import TablesPage from './pages/TablesPage.jsx';
import ClientsPage from './pages/ClientsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<DashboardPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="tables" element={<TablesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
