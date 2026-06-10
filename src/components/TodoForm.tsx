import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useCreateTodo } from '../hooks/useTodos';
import type { ErrorResponse } from '../types/api';

const schema = z.object({
  task: z.string().min(1, 'Task is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});
type FormValues = z.infer<typeof schema>;

export function TodoForm() {
  const create = useCreateTodo();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'pending' },
  });

  const onSubmit = (values: FormValues) =>
    create.mutate(values, {
      onSuccess: () => reset(),
      onError: (err) => {
        const apiErrors = (err as AxiosError<ErrorResponse>).response?.data?.errors;
        apiErrors?.forEach((m) => setError('task', { message: m }));
      },
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
      <div>
        <input placeholder="Task" {...register('task')} />
        {errors.task && <span role="alert" style={{ color: 'red', display: 'block', fontSize: '0.875rem' }}>{errors.task.message}</span>}
      </div>
      <input placeholder="Description (optional)" {...register('description')} />
      <select {...register('status')}>
        <option value="pending">Pending</option>
        <option value="in_progress">In progress</option>
        <option value="completed">Completed</option>
      </select>
      <button type="submit" disabled={create.isPending}>
        {create.isPending ? 'Adding…' : 'Add'}
      </button>
    </form>
  );
}
