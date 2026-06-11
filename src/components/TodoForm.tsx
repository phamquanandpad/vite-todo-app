import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { useCreateTodo } from '../hooks/useTodos';
import type { ErrorResponse } from '../types/api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { useToast } from './toast/useToast';

const schema = z
  .object({
    task: z.string().min(1, 'Task is required'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    estimateStartAt: z.string().optional(),
    estimateEndAt: z.string().optional(),
  })
  .refine(
    (v) =>
      !v.estimateStartAt ||
      !v.estimateEndAt ||
      v.estimateEndAt >= v.estimateStartAt,
    { message: 'End date must be on or after start date', path: ['estimateEndAt'] },
  );
type FormValues = z.infer<typeof schema>;

export function TodoForm() {
  const create = useCreateTodo();
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
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
    create.mutate(
      {
        ...values,
        estimateStartAt: values.estimateStartAt || null,
        estimateEndAt: values.estimateEndAt || null,
      },
      {
        onSuccess: (todo) => {
          toast.success('Todo created', todo.task);
          reset();
          setIsExpanded(false);
        },
        onError: (err) => {
          const apiErrors = (err as AxiosError<ErrorResponse>).response?.data?.errors;
          apiErrors?.forEach((m) => setError('task', { message: m }));
        },
      },
    );

  if (!isExpanded) {
    return (
      <Card
        className="cursor-pointer hover:shadow-md"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.707a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Add a todo…</span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          placeholder="What needs to be done?"
          {...register('task')}
          error={errors.task?.message}
          autoFocus
        />
        <Input
          placeholder="Add a description (optional)"
          {...register('description')}
          error={errors.description?.message}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Status
          </label>
          <select
            {...register('status')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-colors"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Estimated start
            </label>
            <input
              type="date"
              {...register('estimateStartAt')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-colors"
            />
            {errors.estimateStartAt?.message && (
              <p className="mt-1 text-xs text-red-600">{errors.estimateStartAt.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Estimated end
            </label>
            <input
              type="date"
              {...register('estimateEndAt')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-colors"
            />
            {errors.estimateEndAt?.message && (
              <p className="mt-1 text-xs text-red-600">{errors.estimateEndAt.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={create.isPending}>
            {create.isPending ? 'Adding…' : 'Add Todo'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsExpanded(false);
              reset();
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
