import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import Panel from '../components/Panel.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { apiMessage } from '../services/api';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(apiMessage(err));
    }
  }

  return (
    <div className="login-screen">
      <Panel className="login-card" kicker="ACCESS NODE" title="MESA//SYSTEM">
        <form className="grid" onSubmit={submit}>
          <Field label="USER">
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Field>
          <Field label="PASSWORD">
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {error && <p className="error">{error}</p>}
          <button className="primary-button" type="submit"><LockKeyhole size={18} /> Iniciar sesion</button>
        </form>
      </Panel>
    </div>
  );
}
