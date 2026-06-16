import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useCreateTodo } from '../hooks/useTodos';
import type { ErrorResponse } from '../types/api';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Dialog } from './ui/Dialog';
import { useToast } from './toast/useToast';
import { TodoFields, todoSchema } from './TodoFields';
import type { TodoFieldValues } from './TodoFields';

export function TodoForm() {
  const create = useCreateTodo();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const collapsedRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TodoFieldValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: { status: 'pending' },
  });

  const close = () => {
    setOpen(false);
    reset();
    setTimeout(() => collapsedRef.current?.focus(), 0);
  };

  const onSubmit = (values: TodoFieldValues) =>
    create.mutate(
      {
        ...values,
        estimateStartAt: values.estimateStartAt || null,
        estimateEndAt: values.estimateEndAt || null,
      },
      {
        onSuccess: (todo) => {
          toast.success('Todo created', todo.task);
          close();
        },
        onError: (err) => {
          const apiErrors = (err as AxiosError<ErrorResponse>).response?.data?.errors;
          apiErrors?.forEach((m) => setError('task', { message: m }));
        },
      },
    );

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        onClick={() => setOpen(true)}
        tabIndex={0}
        ref={collapsedRef}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.707a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Add a todo…</span>
        </div>
      </Card>
      <Dialog open={open} title="New Todo" onClose={close}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <TodoFields register={register} errors={errors} />
          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" isLoading={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add Todo'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
