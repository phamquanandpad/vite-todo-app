import type { Todo } from '../types/api';
import { useRestoreTodo } from '../hooks/useTodos';
import { useAuth } from '../auth/useAuth';
import { usePermissions } from '../auth/PermissionsContext';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export function DeletedTodoItem({ todo }: { todo: Todo }) {
  const restore = useRestoreTodo();
  const { userId } = useAuth();
  const { can } = usePermissions();
  const isOwner = todo.userId === userId;

  return (
    <li className={`transition-opacity ${restore.isPending ? 'opacity-50' : 'opacity-70'}`}>
      <Card className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-500 line-through break-words">
            {todo.task}
          </h3>
          {todo.description && (
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-600 line-through">
              {todo.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge status={todo.status} />
          {can('todos:restore') && isOwner && (
          <Button
            variant="ghost"
            onClick={() => restore.mutate(todo.id)}
            disabled={restore.isPending}
            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 !px-3"
          >
            Restore
          </Button>
          )}
        </div>
      </Card>
    </li>
  );
}
