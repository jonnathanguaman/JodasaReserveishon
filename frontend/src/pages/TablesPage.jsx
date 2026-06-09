import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import Field from '../components/Field.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, apiMessage } from '../services/api';

const blank = { numero: '', capacidad: '', ubicacion: 'interior', estado: 'disponible', activo: true };

export default function TablesPage() {
  const { isAdmin } = useAuth();
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const load = () => api.get('/tables').then((res) => setTables(res.data));
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, numero: Number(form.numero), capacidad: Number(form.capacidad), activo: Boolean(form.activo) };
      editing ? await api.put(`/tables/${editing}`, payload) : await api.post('/tables', payload);
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <>
      <header className="page-head"><div><p className="kicker">TABLE TOPOLOGY</p><h1>Mesas</h1></div></header>
      {isAdmin && (
        <Panel title={editing ? 'Actualizar mesa' : 'Registrar mesa'}>
          <form className="form-grid" onSubmit={submit}>
            <Field label="NUMERO"><input type="number" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required /></Field>
            <Field label="CAPACIDAD"><input type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} required /></Field>
            <Field label="UBICACION"><select value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}><option>interior</option><option>terraza</option><option>ventana</option><option>salon_privado</option><option>barra</option></select></Field>
            <Field label="ESTADO"><select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}><option>disponible</option><option>ocupada</option><option>mantenimiento</option><option>inactiva</option></select></Field>
            <Field label="ACTIVA"><select value={String(form.activo)} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}><option value="true">si</option><option value="false">no</option></select></Field>
            <button className="primary-button"><Save size={17} /> Guardar</button>
            {error && <p className="error full">{error}</p>}
          </form>
        </Panel>
      )}
      <div className="grid three">
        {tables.length ? tables.map((t) => (
          <Panel key={t.id}>
            <div className="panel-head"><h2>Mesa #{t.numero}</h2><StatusBadge value={t.estado} /></div>
            <p className="metric">{t.capacidad}</p>
            <p className="kicker">{t.ubicacion} // {t.activo ? 'ACTIVA' : 'OFFLINE'}</p>
            {isAdmin && <button className="ghost-button" onClick={() => { setEditing(t.id); setForm(t); }}>Editar</button>}
          </Panel>
        )) : <EmptyState />}
      </div>
    </>
  );
}
