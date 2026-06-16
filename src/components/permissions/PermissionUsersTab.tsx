import { useState } from 'react';
import { usePermissionUsers, useGrantPermissionUser, useRevokePermissionUser } from '../../hooks/usePermissionsAdmin';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Toggle } from '../ui/Toggle';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SkeletonGrid } from '../ui/Skeleton';
import type { PermissionUser } from '../../types/api';

interface Props {
  permissionId: number;
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function RoleBadge({ role }: { role: PermissionUser['role'] }) {
  const styles = role === 'admin'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles}`}>{role}</span>;
}

export function PermissionUsersTab({ permissionId }: Props) {
  const [draft, setDraft] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebouncedValue(draft, 300);
  const grant = useGrantPermissionUser(permissionId);
  const revoke = useRevokePermissionUser(permissionId);

  const params = { q: q || undefined, page, limit: 20 };
  const { data, isLoading, isError, isFetching, isPlaceholderData } = usePermissionUsers(permissionId, params);

  const handleToggle = (user: PermissionUser) => {
    if (user.granted) {
      revoke.mutate(user.id);
    } else {
      grant.mutate(user.id);
    }
  };

  const isPending = grant.isPending || revoke.isPending;

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <Input
          icon={<SearchIcon />}
          placeholder="Search by username or email…"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading && <SkeletonGrid count={4} />}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          Failed to load users
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
              {q ? `No users match "${q}"` : 'No users found'}
            </p>
          ) : (
            <div className={`divide-y divide-gray-100 dark:divide-gray-800 transition-opacity duration-200 ${isFetching && isPlaceholderData ? 'opacity-60' : ''}`}>
              {data.data.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.username}</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
                  </div>
                  <Toggle
                    checked={user.granted}
                    onChange={() => handleToggle(user)}
                    isLoading={isPending}
                    disabled={isPending}
                    aria-label={`${user.granted ? 'Revoke' : 'Grant'} permission for ${user.username}`}
                  />
                </div>
              ))}
            </div>
          )}

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
    </div>
  );
}
