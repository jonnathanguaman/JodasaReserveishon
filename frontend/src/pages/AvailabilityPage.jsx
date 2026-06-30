import { useState } from 'react';
import { Radar } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import Field from '../components/Field.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api, apiMessage } from '../services/api';

export default function AvailabilityPage() {
  const [form, setForm] = useState({ fecha: new Date().toISOString().slice(0, 10), hora_inicio: '19:00', hora_fin: '21:00', num_personas: 2 });
  const [tables, setTables] = useState([]);
  const [error, setError] = useState('');

  async function search(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.get('/reservations/availability', { params: form });
      setTables(res.data);
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <>
      <header className="page-head"><div><p className="kicker">AVAILABILITY SCANNER</p><h1>Disponibilidad</h1></div></header>
      <Panel title="Consulta por horario">
        <form className="form-grid" onSubmit={search}>
          <Field label="FECHA"><input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></Field>
          <Field label="INICIO"><input type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} /></Field>
          <Field label="FIN"><input type="time" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} /></Field>
          <Field label="PERSONAS"><input type="number" min="1" value={form.num_personas} onChange={(e) => setForm({ ...form, num_personas: e.target.value })} /></Field>
          <button className="primary-button"><Radar size={17} /> Escanear</button>
          {error && <p className="error full">{error}</p>}
        </form>
      </Panel>
      <div className="grid three">
        {tables.length ? tables.map((t) => (
          <Panel key={t.id}>
            <h2>Mesa #{t.numero}</h2>
            <p className="metric">{t.capacidad}</p>
            <p className="kicker">{t.ubicacion} // DISPONIBLE</p>
          </Panel>
        )) : <EmptyState text="NO_DATA // EJECUTA UN ESCANEO" />}
      </div>
    </>
  );
}
