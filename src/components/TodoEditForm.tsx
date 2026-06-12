import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Todo } from '../types/api';
import { useUpdateTodo } from '../hooks/useTodos';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { useToast } from './toast/useToast';
import { TodoFields, todoSchema } from './TodoFields';
import type { TodoFieldValues } from './TodoFields';

interface TodoEditFormProps {
  todo: Todo;
  onDone: () => void;
}

export function TodoEditForm({ todo, onDone }: TodoEditFormProps) {
  const update = useUpdateTodo();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TodoFieldValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      task: todo.task,
      description: todo.description ?? '',
      status: todo.status,
      estimateStartAt: todo.estimateStartAt ?? '',
      estimateEndAt: todo.estimateEndAt ?? '',
    },
  });

  const onSubmit = (values: TodoFieldValues) =>
    update.mutate(
      {
        id: todo.id,
        body: {
          task: values.task,
          description: values.description || undefined,
          status: values.status,
          estimateStartAt: values.estimateStartAt || null,
          estimateEndAt: values.estimateEndAt || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Todo updated', values.task);
          onDone();
        },
        onError: () => toast.error('Failed to update todo'),
      },
    );

  return (
    <li>
      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          onKeyDown={(e) => { if (e.key === 'Escape') onDone(); }}
        >
          <TodoFields register={register} errors={errors} showStatus />

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={update.isPending}>
              {update.isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </li>
  );
}
