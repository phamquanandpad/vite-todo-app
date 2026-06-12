import type { Todo } from '../types/api';
import { useUpdateTodo, useDeleteTodo, useRestoreTodo } from '../hooks/useTodos';
import { useAuth } from '../auth/useAuth';
import { usePermissions } from '../auth/PermissionsContext';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useToast } from './toast/useToast';

const todayStr = () => new Date().toISOString().slice(0, 10);
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

function formatDateLabel(dateStr: string): string {
  const today = todayStr();
  const tomorrow = tomorrowStr();
  if (dateStr === today) return 'today';
  if (dateStr === tomorrow) return 'tomorrow';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(
    new Date(dateStr + 'T00:00:00'),
  );
}

function getOverdueInfo(todo: Todo): { isOverdue: boolean; isDueToday: boolean; daysOverdue: number } {
  if (!todo.estimateEndAt || todo.status === 'completed') {
    return { isOverdue: false, isDueToday: false, daysOverdue: 0 };
  }
  const today = todayStr();
  if (todo.estimateEndAt === today) return { isOverdue: false, isDueToday: true, daysOverdue: 0 };
  if (todo.estimateEndAt < today) {
    const diff = Math.round(
      (new Date(today + 'T00:00:00').getTime() - new Date(todo.estimateEndAt + 'T00:00:00').getTime()) /
        86_400_000,
    );
    return { isOverdue: true, isDueToday: false, daysOverdue: diff };
  }
  return { isOverdue: false, isDueToday: false, daysOverdue: 0 };
}

function formatDateRange(todo: Todo): string | null {
  if (!todo.estimateStartAt && !todo.estimateEndAt) return null;
  if (todo.estimateStartAt && todo.estimateEndAt) {
    return `${formatDateLabel(todo.estimateStartAt)} → ${formatDateLabel(todo.estimateEndAt)}`;
  }
  if (todo.estimateStartAt) return `Starts ${formatDateLabel(todo.estimateStartAt)}`;
  return `Due ${formatDateLabel(todo.estimateEndAt!)}`;
}

export function TodoItem({ todo, onEditStart }: {
  todo: Todo;
  isEditing?: boolean;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}) {
  const update = useUpdateTodo();
  const remove = useDeleteTodo();
  const restore = useRestoreTodo();
  const toast = useToast();
  const { userId } = useAuth();
  const { can } = usePermissions();
  const isOwner = todo.userId === userId;

  const statusOptions: Todo['status'][] = ['pending', 'in_progress', 'completed'];
  const isCompleted = todo.status === 'completed';
  const { isOverdue, isDueToday, daysOverdue } = getOverdueInfo(todo);
  const dateRange = formatDateRange(todo);

  return (
    <li className={`transition-opacity ${remove.isPending ? 'opacity-50' : 'opacity-100'}`}>
      <Card className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium text-gray-900 dark:text-white break-words ${isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
            {todo.task}
          </h3>
          {todo.description && (
            <p className={`text-sm mt-1 ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
              {todo.description}
            </p>
          )}
          {dateRange && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateRange}</span>
              {isDueToday && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Due today
                </span>
              )}
              {isOverdue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  {daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
          {onEditStart && can('todos:update') && isOwner && (
            <button
              onClick={onEditStart}
              className="text-gray-400 hover:text-accent transition-colors"
              aria-label="Edit todo"
              title="Edit todo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          <div className="relative">
            <button
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Badge status={todo.status} />
            </button>
            {can('todos:complete') && isOwner && (
            <select
              value={todo.status}
              onChange={(e) => {
                const nextStatus = e.target.value as Todo['status'];
                update.mutate(
                  { id: todo.id, body: { status: nextStatus } },
                  { onError: () => toast.error('Failed to update status') },
                );
              }}
              disabled={update.isPending}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
              aria-label="Change status"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            )}
          </div>

          {can('todos:destroy') && isOwner && (
            <button
              onClick={() => {
                remove.mutate(todo.id, {
                  onError: () => toast.error('Failed to delete todo'),
                });
                toast.show({
                  title: 'Todo deleted',
                  body: todo.task,
                  variant: 'info',
                  duration: 6_000,
                  action: {
                    label: 'Undo',
                    onClick: () => restore.mutate(todo.id),
                  },
                });
              }}
              disabled={remove.isPending}
              className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label="Delete todo"
              title="Delete todo"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </Card>
    </li>
  );
}
