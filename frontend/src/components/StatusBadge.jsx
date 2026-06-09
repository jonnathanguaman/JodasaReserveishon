const variants = {
  pendiente: 'warning',
  confirmada: 'success',
  cancelada: 'danger',
  finalizada: 'neutral',
  no_asistio: 'danger',
  disponible: 'success',
  ocupada: 'warning',
  mantenimiento: 'danger',
  inactiva: 'neutral'
};

export default function StatusBadge({ value }) {
  return <span className={`badge ${variants[value] || 'neutral'}`}>{value}</span>;
}
