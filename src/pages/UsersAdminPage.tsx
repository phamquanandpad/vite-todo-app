import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { User } from '../types/api';
import { useUserList, useChangeUserRole } from '../hooks/useUsersAdmin';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useToast } from '../components/toast/useToast';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { RoleChangeConfirmDialog } from '../components/users/RoleChangeConfirmDialog';

const ROLES = ['admin', 'member'] as const;

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function UsersAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [draft, setDraft] = useState(q);
  const debounced = useDebouncedValue(draft, 300);

  const [pending, setPending] = useState<{ user: User; newRole: string } | null>(null);
  const changeRole = useChangeUserRole();
  const toast = useToast();

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debounced) { next.set('q', debounced); } else { next.delete('q'); }
      next.delete('page');
      return next;
    }, { replace: true });
  }, [debounced, setSearchParams]);

  const { data, isLoading, isError, isFetching, isPlaceholderData } = useUserList({
    q: q || undefined,
    page,
    limit: 20,
  });

  const setPage = (p: number) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (p > 1) { next.set('page', String(p)); } else { next.delete('page'); }
      return next;
    });

  const handleRoleSelect = (user: User, newRole: string) => {
    if (newRole === user.role) return;
    setPending({ user, newRole });
  };

  const handleConfirm = () => {
    if (!pending) return;
    changeRole.mutate(
      { id: pending.user.id, role: pending.newRole },
      {
        onSuccess: () => {
          toast.success('Role updated', `${pending.user.username} is now ${pending.newRole}`);
          setPending(null);
        },
        onError: () => setPending(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Users</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={<SearchIcon />}
            placeholder="Search by username or email…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <SkeletonGrid count={4} />}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          Failed to load users
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              {q ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No users match "<span className="font-mono">{q}</span>"</p>
                  <button onClick={() => setDraft('')} className="text-sm text-accent hover:underline">Clear search</button>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No users found</p>
              )}
            </div>
          ) : (
            <>
              <div className={`transition-opacity duration-200 ${isFetching && isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        {['Username', 'Email', 'Role', 'Permissions', 'Joined'].map((col) => (
                          <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1f2028] divide-y divide-gray-100 dark:divide-gray-800">
                      {data.data.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.username}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                          <td className="px-4 py-3">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleSelect(user, e.target.value)}
                              className="text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent/50"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.permissionsCount}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1 || (isFetching && isPlaceholderData)}
                  >
                    ← Previous
                  </Button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-medium text-gray-900 dark:text-white">{data.meta.page}</span> of{' '}
                    <span className="font-medium text-gray-900 dark:text-white">{data.meta.totalPages}</span>
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= data.meta.totalPages || (isFetching && isPlaceholderData)}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {pending && (
        <RoleChangeConfirmDialog
          user={pending.user}
          newRole={pending.newRole}
          isLoading={changeRole.isPending}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
}
