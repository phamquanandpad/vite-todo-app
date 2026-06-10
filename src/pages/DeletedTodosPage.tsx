import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDeletedTodos } from '../hooks/useTodos';
import { DeletedTodoItem } from '../components/DeletedTodoItem';

export function DeletedTodosPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useDeletedTodos({ page, limit: 20 });

  return (
    <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Deleted Todos</h1>
        <Link to="/">← Back to Todos</Link>
      </header>

      <p style={{ color: '#666', marginBottom: '1rem' }}>
        These todos have been soft-deleted and can be restored. Once purged, they cannot be recovered.
      </p>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert" style={{ color: 'red' }}>{(error as Error).message}</p>}

      {data && data.data.length === 0 && (
        <p style={{ color: '#888' }}>No deleted todos.</p>
      )}

      {data && data.data.length > 0 && (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.data.map((todo) => (
              <DeletedTodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {data.meta.page} / {data.meta.totalPages}</span>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
