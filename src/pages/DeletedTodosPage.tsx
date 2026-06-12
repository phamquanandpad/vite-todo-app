import { useSearchParams } from 'react-router-dom';
import { useDeletedTodos } from '../hooks/useTodos';
import { DeletedTodoItem } from '../components/DeletedTodoItem';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';

export function DeletedTodosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const setPage = (n: number) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (n > 1) next.set('page', String(n)); else next.delete('page');
      return next;
    });
  const { data, isLoading, isError, error } = useDeletedTodos({ page, limit: 20 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Trash</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Deleted todos are soft-deleted and can be restored. Once permanently deleted, they cannot be recovered.
        </p>
      </div>

      {isLoading && <SkeletonGrid count={3} />}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {(error as Error).message}
        </div>
      )}

      {data && (
        data.data.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Trash is empty</h3>
            <p className="text-gray-600 dark:text-gray-400">No deleted todos yet</p>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {data.data.map((todo) => (
                <DeletedTodoItem key={todo.id} todo={todo} />
              ))}
            </ul>
            {data.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setPage(Math.max(1, page - 1))}
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
                  onClick={() => setPage(page + 1)}
                  disabled={page >= data.meta.totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}
