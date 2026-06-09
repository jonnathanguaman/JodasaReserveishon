import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, CalendarCheck, Gauge, LogOut, Radar, Table2, Users, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/reservations', label: 'Reservas', icon: CalendarCheck },
  { to: '/availability', label: 'Disponibilidad', icon: Radar },
  { to: '/tables', label: 'Mesas', icon: Table2 },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/reports', label: 'Reportes', icon: BarChart3 }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function endSession() {
    logout();
    navigate('/login');
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <Utensils size={28} />
          <span>MESA//SYSTEM</span>
        </Link>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="nav-item">
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="user-chip">
          <span>{user?.nombre}</span>
          <small>{user?.rol}</small>
        </div>
        <button className="ghost-button" type="button" onClick={endSession}>
          <LogOut size={17} /> Salir
        </button>
      </aside>
      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
