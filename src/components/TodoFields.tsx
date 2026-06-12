import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { Input } from './ui/Input';

export const todoSchema = z
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

export type TodoFieldValues = z.infer<typeof todoSchema>;

interface TodoFieldsProps {
  register: UseFormRegister<TodoFieldValues>;
  errors: FieldErrors<TodoFieldValues>;
  showStatus?: boolean;
}

export function TodoFields({ register, errors, showStatus = true }: TodoFieldsProps) {
  return (
    <>
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
      {showStatus && (
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
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    </>
  );
}
