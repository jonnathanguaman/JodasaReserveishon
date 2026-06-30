import { useEffect, useState } from 'react';
import { Save, Search } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import Field from '../components/Field.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api, apiMessage } from '../services/api';

const blank = { nombres: '', apellidos: '', telefono: '', email: '', num_id: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/clients', { params: { search } }).then((res) => setClients(res.data));
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      editing ? await api.put(`/clients/${editing}`, form) : await api.post('/clients', form);
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <>
      <header className="page-head"><div><p className="kicker">CLIENT GRID</p><h1>Clientes</h1></div></header>
      <Panel title={editing ? 'Actualizar cliente' : 'Registrar cliente'}>
        <form className="form-grid" onSubmit={submit}>
          {['nombres', 'apellidos', 'telefono', 'email', 'num_id'].map((key) => (
            <Field key={key} label={key}>
              <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key === 'nombres' || key === 'apellidos'} />
            </Field>
          ))}
          <button className="primary-button"><Save size={17} /> Guardar</button>
          {error && <p className="error full">{error}</p>}
        </form>
      </Panel>
      <Panel title="Directorio" actions={<button className="ghost-button" onClick={load}><Search size={16} /> Buscar</button>}>
        <Field label="SEARCH">
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        </Field>
        {clients.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>Telefono</th><th>Email</th><th>ID</th></tr></thead>
              <tbody>{clients.map((c) => (
                <tr key={c.id} onClick={() => { setEditing(c.id); setForm(c); }}>
                  <td>{c.nombres} {c.apellidos}</td><td>{c.telefono}</td><td>{c.email}</td><td>{c.num_id}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState />}
      </Panel>
    </>
  );
}
