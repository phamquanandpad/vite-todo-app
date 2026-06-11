import { useState } from 'react';
import type { Todo } from '../types/api';
import { useUpdateTodo, useDeleteTodo } from '../hooks/useTodos';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useToast } from './toast/useToast';

const todayStr = () => new Date().toISOString().slice(0, 10);

function isOverdue(todo: Todo): boolean {
  return (
    !!todo.estimateEndAt &&
    todo.status !== 'completed' &&
    todo.estimateEndAt <= todayStr()
  );
}

function formatRange(todo: Todo): string | null {
  if (!todo.estimateStartAt && !todo.estimateEndAt) return null;
  const start = todo.estimateStartAt ?? '—';
  const end = todo.estimateEndAt ?? '—';
  return `${start} → ${end}`;
}

export function TodoItem({ todo }: { todo: Todo }) {
  const update = useUpdateTodo();
  const remove = useDeleteTodo();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusOptions: Todo['status'][] = ['pending', 'in_progress', 'completed'];

  const isCompleted = todo.status === 'completed';

  return (
    <li className={`transition-opacity ${update.isPending || remove.isPending ? 'opacity-50' : 'opacity-100'}`}>
      <Card className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium text-gray-900 dark:text-white break-words ${isCompleted ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>
            {todo.task}
          </h3>
          {todo.description && (
            <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
              {todo.description}
            </p>
          )}
          {formatRange(todo) && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatRange(todo)}</span>
              {isOverdue(todo) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  Overdue
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative group">
            <button
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
              disabled={update.isPending}
            >
              <Badge status={todo.status} />
            </button>
            <select
              value={todo.status}
              onChange={(e) => {
                const nextStatus = e.target.value as Todo['status'];
                update.mutate(
                  { id: todo.id, body: { status: nextStatus } },
                  { onSuccess: () => toast.info('Status updated', `${todo.task}: ${nextStatus.replace('_', ' ')}`) },
                );
              }}
              disabled={update.isPending}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              title="Change status"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="relative group">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              disabled={remove.isPending}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete todo"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>

            {showDeleteConfirm && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-10 whitespace-nowrap">
                <button
                  onClick={() => {
                    remove.mutate(todo.id, {
                      onSuccess: () => toast.success('Todo deleted', todo.task),
                    });
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </li>
  );
}
