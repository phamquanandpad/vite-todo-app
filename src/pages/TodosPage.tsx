import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTodos } from '../hooks/useTodos';
import { useAuth } from '../auth/useAuth';
import type { TodoStatus } from '../types/api';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

export function TodosPage() {
  const { logout } = useAuth();
  const [status, setStatus] = useState<TodoStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useTodos({
    status: status || undefined,
    page,
    limit: 20,
  });

  return (
    <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>My Todos</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/profile">Profile</Link>
          <Link to="/deleted">Trash</Link>
          <button onClick={() => logout()}>Logout</button>
        </nav>
      </header>

      <TodoForm />

      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by status: </label>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TodoStatus | '');
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading && <p>Loading…</p>}
      {isError && <p role="alert" style={{ color: 'red' }}>{(error as Error).message}</p>}
      {data && (
        <>
          <TodoList todos={data.data} />
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
