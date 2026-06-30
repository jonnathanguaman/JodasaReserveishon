export default function EmptyState({ text = 'CONNECTION_LOST // NO_DATA' }) {
  return <div className="empty-state">{text}</div>;
}
