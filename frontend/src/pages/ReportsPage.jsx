import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Panel from '../components/Panel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [data, setData] = useState({ byDay: [], topTables: [], frequent: [], peak: [], cancelled: [] });

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      api.get('/reports/by-day'),
      api.get('/reports/top-tables'),
      api.get('/reports/frequent-clients'),
      api.get('/reports/peak-hours'),
      api.get('/reports/cancelled')
    ]).then(([byDay, topTables, frequent, peak, cancelled]) => {
      setData({
        byDay: byDay.data,
        topTables: topTables.data,
        frequent: frequent.data,
        peak: peak.data,
        cancelled: cancelled.data
      });
    });
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <>
        <header className="page-head"><div><p className="kicker">ADMIN ONLY</p><h1>Reportes</h1></div></header>
        <Panel><EmptyState text="ACCESS_DENIED // ROL ADMINISTRADOR REQUERIDO" /></Panel>
      </>
    );
  }

  return (
    <>
      <header className="page-head"><div><p className="kicker">ANALYTICS CORE</p><h1>Reportes</h1></div></header>
      <div className="grid two">
        <ChartPanel title="Reservas por estado" data={data.byDay} xKey="estado" yKey="total" />
        <ChartPanel title="Mesas mas reservadas" data={data.topTables} xKey="numero" yKey="total_reservas" />
        <ChartPanel title="Horarios pico" data={data.peak} xKey="hora_inicio" yKey="total" />
        <Panel title="Clientes frecuentes">
          {data.frequent.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Cliente</th><th>Email</th><th>Total</th></tr></thead>
                <tbody>{data.frequent.map((c) => <tr key={`${c.email}-${c.nombres}`}><td>{c.nombres} {c.apellidos}</td><td>{c.email}</td><td>{c.total_reservas}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <EmptyState />}
        </Panel>
      </div>
      <Panel title="Canceladas recientes">
        {data.cancelled.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Mesa</th><th>Fecha</th><th>Hora</th></tr></thead>
              <tbody>{data.cancelled.map((r) => <tr key={r.id}><td>{r.nombres} {r.apellidos}</td><td>#{r.mesa}</td><td>{String(r.fecha).slice(0, 10)}</td><td>{r.hora_inicio}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <EmptyState />}
      </Panel>
    </>
  );
}

function ChartPanel({ title, data, xKey, yKey }) {
  return (
    <Panel title={title}>
      {data.length ? (
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(132,148,149,0.2)" />
              <XAxis dataKey={xKey} stroke="#b9cacb" />
              <YAxis stroke="#b9cacb" />
              <Tooltip contentStyle={{ background: '#111820', border: '1px solid #00f0ff', color: '#e0e2ee' }} />
              <Bar dataKey={yKey} fill="#00f0ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <EmptyState />}
    </Panel>
  );
}
