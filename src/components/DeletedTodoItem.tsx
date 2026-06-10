import type { Todo } from '../types/api';
import { useRestoreTodo } from '../hooks/useTodos';

export function DeletedTodoItem({ todo }: { todo: Todo }) {
  const restore = useRestoreTodo();

  return (
    <li style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem', opacity: 0.7 }}>
      <strong>{todo.task}</strong>
      {todo.description && <p style={{ margin: '0.25rem 0', color: '#555' }}>{todo.description}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#888' }}>Status: {todo.status}</span>
        <button
          onClick={() => restore.mutate(todo.id)}
          disabled={restore.isPending}
          style={{ color: 'green' }}
        >
          Restore
        </button>
      </div>
    </li>
  );
}
