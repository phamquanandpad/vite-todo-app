import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl font-bold text-accent mb-4">404</p>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Page not found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        You don't have permission to view this page, or it doesn't exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
      >
        Back to home
      </Link>
    </div>
  );
}
