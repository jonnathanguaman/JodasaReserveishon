import { useEffect, useState } from 'react';
import { Ban, Check, Save } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import Field from '../components/Field.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ScheduleMatrix from '../components/ScheduleMatrix.jsx';
import { api, apiMessage } from '../services/api';

const blank = {
  id_cliente: '',
  id_mesa: '',
  fecha: new Date().toISOString().slice(0, 10),
  hora_inicio: '19:00',
  hora_fin: '21:00',
  num_personas: 2,
  estado: 'pendiente',
  observaciones: ''
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ fecha: '', estado: '' });

  const load = () => api.get('/reservations', { params: filters }).then((res) => setReservations(res.data));
  useEffect(() => {
    load();
    api.get('/clients').then((res) => setClients(res.data));
    api.get('/tables').then((res) => setTables(res.data));
  }, []);

  useEffect(() => {
    if (!form.id_mesa || !form.fecha) {
      setSchedule(null);
      return;
    }
    api.get(`/tables/${form.id_mesa}/schedule`, { params: { fecha: form.fecha } })
      .then((res) => setSchedule(res.data))
      .catch(() => setSchedule(null));
  }, [form.id_mesa, form.fecha]);

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        id_cliente: Number(form.id_cliente),
        id_mesa: Number(form.id_mesa),
        num_personas: Number(form.num_personas)
      };
      editing ? await api.put(`/reservations/${editing}`, payload) : await api.post('/reservations', payload);
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  async function setStatus(id, estado) {
    await api.patch(`/reservations/${id}/status`, { estado });
    await load();
  }

  async function cancel(id) {
    await api.patch(`/reservations/${id}/cancel`);
    await load();
  }

  return (
    <>
      <header className="page-head"><div><p className="kicker">RESERVATION STREAM</p><h1>Reservas</h1></div></header>
      <Panel title={editing ? 'Modificar reserva' : 'Crear reserva'}>
        <form className="form-grid" onSubmit={submit}>
          <Field label="CLIENTE"><select value={form.id_cliente} onChange={(e) => updateForm({ id_cliente: e.target.value })} required><option value="">Seleccionar</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.nombres} {c.apellidos}</option>)}</select></Field>
          <Field label="MESA"><select value={form.id_mesa} onChange={(e) => updateForm({ id_mesa: e.target.value })} required><option value="">Seleccionar</option>{tables.map((t) => <option key={t.id} value={t.id}>#{t.numero} - {t.capacidad} pax</option>)}</select></Field>
          <Field label="FECHA"><input type="date" value={form.fecha} onChange={(e) => updateForm({ fecha: e.target.value })} /></Field>
          <Field label="INICIO"><input type="time" value={form.hora_inicio} onChange={(e) => updateForm({ hora_inicio: e.target.value })} /></Field>
          <Field label="FIN"><input type="time" value={form.hora_fin} onChange={(e) => updateForm({ hora_fin: e.target.value })} /></Field>
          <Field label="PERSONAS"><input type="number" min="1" value={form.num_personas} onChange={(e) => updateForm({ num_personas: e.target.value })} /></Field>
          <Field label="ESTADO"><select value={form.estado} onChange={(e) => updateForm({ estado: e.target.value })}><option>pendiente</option><option>confirmada</option><option>cancelada</option><option>finalizada</option><option>no_asistio</option></select></Field>
          <Field label="OBSERVACIONES"><input value={form.observaciones || ''} onChange={(e) => updateForm({ observaciones: e.target.value })} /></Field>
          <button className="primary-button"><Save size={17} /> Guardar</button>
          {error && <p className="error full">{error}</p>}
        </form>
        <div className="reservation-schedule">
          <p className="kicker">HORARIO DISPONIBLE POR MESA</p>
          <ScheduleMatrix
            schedule={schedule}
            compact
            onSelectSlot={(slot) => updateForm({ hora_inicio: slot.hora_inicio, hora_fin: slot.hora_fin })}
          />
        </div>
      </Panel>
      <Panel title="Reservas activas" actions={<button className="ghost-button" onClick={load}>Filtrar</button>}>
        <div className="form-grid">
          <Field label="FECHA"><input type="date" value={filters.fecha} onChange={(e) => setFilters({ ...filters, fecha: e.target.value })} /></Field>
          <Field label="ESTADO"><select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })}><option value="">todos</option><option>pendiente</option><option>confirmada</option><option>cancelada</option><option>finalizada</option><option>no_asistio</option></select></Field>
        </div>
        {reservations.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Cliente</th><th>Mesa</th><th>Fecha</th><th>Horario</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>{reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.nombres} {r.apellidos}</td><td>#{r.numero_mesa}</td><td>{String(r.fecha).slice(0, 10)}</td><td>{r.hora_inicio} - {r.hora_fin}</td><td><StatusBadge value={r.estado} /></td>
                  <td className="row-actions">
                    <button className="icon-button" title="Editar" onClick={() => { setEditing(r.id); setForm({ ...r, fecha: String(r.fecha).slice(0, 10) }); }}><Save size={15} /></button>
                    <button className="icon-button" title="Confirmar" onClick={() => setStatus(r.id, 'confirmada')}><Check size={15} /></button>
                    <button className="icon-button" title="Cancelar" onClick={() => cancel(r.id)}><Ban size={15} /></button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState />}
      </Panel>
    </>
  );
}
