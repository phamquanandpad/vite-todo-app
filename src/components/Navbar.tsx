import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Button } from './ui/Button';

export function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-[#16171d]/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-accent transition-colors">
          <div className="w-6 h-6 bg-accent rounded-full" />
          <span className="text-lg">My Todos</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-accent font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Todos"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 012-2h6a2 2 0 012 2v2h4a1 1 0 010 2h-1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7H2a1 1 0 010-2h4V3zm8 0H7v2h6V3zm-6 9a1 1 0 011-1h3a1 1 0 110 2H8a1 1 0 01-1-1zm5-2a1 1 0 10-2 0 1 1 0 002 0z" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Todos</span>
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'text-accent font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Profile"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Profile</span>
          </Link>

          <Link
            to="/deleted"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/deleted')
                ? 'text-accent font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title="Trash"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Trash</span>
          </Link>

          <Button
            variant="ghost"
            onClick={() => logout()}
            className="!px-3 text-sm"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
