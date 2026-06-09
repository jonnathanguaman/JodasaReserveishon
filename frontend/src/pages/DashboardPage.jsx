import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Table2, Users } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api } from '../services/api';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({});
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setMetrics(res.data));
    api.get('/reservations').then((res) => setReservations(res.data.slice(0, 6)));
  }, []);

  const cards = [
    ['Reservas hoy', metrics.reservas_hoy || 0, CalendarClock],
    ['Confirmadas', metrics.confirmadas || 0, CheckCircle2],
    ['Clientes', metrics.clientes || 0, Users],
    ['Mesas activas', metrics.mesas_activas || 0, Table2]
  ];

  return (
    <>
      <header className="page-head">
        <div>
          <p className="kicker">NEURAL RESERVATION NETWORK</p>
          <h1>Dashboard</h1>
        </div>
      </header>
      <div className="grid four">
        <div className="grid three">
          {cards.slice(0, 3).map(([label, value, Icon]) => (
            <Panel key={label}>
              <Icon color="var(--cyan)" />
              <p className="metric">{value}</p>
              <p className="kicker">{label}</p>
            </Panel>
          ))}
        </div>
        <Panel>
          <Table2 color="var(--cyan)" />
          <p className="metric">{cards[3][1]}</p>
          <p className="kicker">{cards[3][0]}</p>
        </Panel>
      </div>
      <Panel title="Ultimas reservas" kicker="LIVE FEED">
        {reservations.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Mesa</th><th>Fecha</th><th>Hora</th><th>Estado</th></tr></thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nombres} {r.apellidos}</td>
                    <td>#{r.numero_mesa}</td>
                    <td>{String(r.fecha).slice(0, 10)}</td>
                    <td>{r.hora_inicio}</td>
                    <td><StatusBadge value={r.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState />}
      </Panel>
    </>
  );
}
