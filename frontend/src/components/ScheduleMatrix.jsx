import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function ScheduleMatrix({ schedule, onSelectSlot, compact = false }) {
  if (!schedule) return <EmptyState text="SELECCIONA_MESA // FECHA PARA ESCANEAR" />;

  return (
    <div className={compact ? 'schedule-compact' : ''}>
      {schedule.reservas?.length ? (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Reservado</th><th>Cliente</th><th>Personas</th><th>Estado</th></tr></thead>
            <tbody>
              {schedule.reservas.map((r) => (
                <tr key={r.id}>
                  <td>{r.hora_inicio.slice(0, 5)} - {r.hora_fin.slice(0, 5)}</td>
                  <td>{r.nombres} {r.apellidos}</td>
                  <td>{r.num_personas}</td>
                  <td><StatusBadge value={r.estado} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState text="SIN_RESERVAS // TODO EL DIA DISPONIBLE" />}

      <div className="slot-grid">
        {schedule.slots?.map((slot) => {
          const available = slot.estado === 'disponible';
          const Component = onSelectSlot && available ? 'button' : 'div';
          return (
            <Component
              key={slot.hora_inicio}
              className={`slot ${slot.estado}`}
              type={Component === 'button' ? 'button' : undefined}
              onClick={available && onSelectSlot ? () => onSelectSlot(slot) : undefined}
              title={available && onSelectSlot ? 'Usar este horario' : undefined}
            >
              <strong>{slot.hora_inicio} - {slot.hora_fin}</strong>
              <span>{available ? 'Disponible para reservar' : `Reservada: ${slot.reserva.nombres} ${slot.reserva.apellidos}`}</span>
            </Component>
          );
        })}
      </div>
    </div>
  );
}
