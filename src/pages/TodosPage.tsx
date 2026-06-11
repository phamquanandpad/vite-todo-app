import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import type { TodoStatus } from '../types/api';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export function TodosPage() {
  const [status, setStatus] = useState<TodoStatus | ''>('');
  const [overdue, setOverdue] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useTodos({
    status: status || undefined,
    overdue: overdue || undefined,
    page,
    limit: 20,
  });

  const filterOptions: Array<{ value: TodoStatus | ''; label: string }> = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Todos</h1>
        <p className="text-gray-600 dark:text-gray-400">Stay organized and track your tasks</p>
      </div>

      <TodoForm />

      <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit flex-wrap">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              setStatus(option.value);
              setOverdue(false);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              status === option.value && !overdue
                ? 'bg-accent text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
        <button
          onClick={() => {
            setOverdue((v) => !v);
            setStatus('');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            overdue
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Overdue
        </button>
      </div>

      {isLoading && <SkeletonGrid count={3} />}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {(error as Error).message}
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No todos yet</h3>
              <p className="text-gray-600 dark:text-gray-400">Create your first todo to get started</p>
            </div>
          ) : (
            <>
              <TodoList todos={data.data} />
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ← Previous
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-medium text-gray-900 dark:text-white">{data.meta.page}</span> of{' '}
                  <span className="font-medium text-gray-900 dark:text-white">{data.meta.totalPages}</span>
                </span>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages}
                >
                  Next →
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
