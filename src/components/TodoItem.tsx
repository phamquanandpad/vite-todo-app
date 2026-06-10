import { Todo } from '../types/api';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';

export function TodoItem({ todo }: { todo: Todo }) {
  const update = useUpdateTodo();
  const remove = useDeleteTodo();

  return (
    <li style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '0.5rem' }}>
      <strong>{todo.task}</strong>
      {todo.description && <p style={{ margin: '0.25rem 0', color: '#555' }}>{todo.description}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <select
          value={todo.status}
          onChange={(e) =>
            update.mutate({ id: todo.id, body: { status: e.target.value as Todo['status'] } })
          }
          disabled={update.isPending}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={() => remove.mutate(todo.id)}
          disabled={remove.isPending}
          style={{ color: 'red' }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
