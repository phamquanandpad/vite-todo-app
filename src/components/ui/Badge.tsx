interface BadgeProps {
  status: 'pending' | 'in_progress' | 'completed';
}

export function Badge({ status }: BadgeProps) {
  const styles = {
    pending: 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    in_progress: 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    completed: 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  };

  const labels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${styles[status]}`}>
      <span className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-amber-500' : status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'}`} />
      {labels[status]}
    </span>
  );
}
