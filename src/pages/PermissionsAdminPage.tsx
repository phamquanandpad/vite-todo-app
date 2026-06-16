import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Permission } from '../types/api';
import { usePermissionList } from '../hooks/usePermissionsAdmin';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Can } from '../components/auth/Can';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SkeletonGrid } from '../components/ui/Skeleton';
import { PermissionTable } from '../components/permissions/PermissionTable';
import { PermissionFormDialog } from '../components/permissions/PermissionFormDialog';
import { DeletePermissionDialog } from '../components/permissions/DeletePermissionDialog';

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function PermissionsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [draft, setDraft] = useState(q);
  const debounced = useDebouncedValue(draft, 300);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Permission | null>(null);
  const [deleting, setDeleting] = useState<Permission | null>(null);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (debounced) {
        next.set('q', debounced);
      } else {
        next.delete('q');
      }
      next.delete('page');
      return next;
    }, { replace: true });
  }, [debounced, setSearchParams]);

  const { data, isLoading, isError, isFetching, isPlaceholderData } = usePermissionList({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Permissions</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage the permission catalogue</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-sm">
          <Input
            icon={<SearchIcon />}
            placeholder="Search by name prefix… e.g. todos:"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <Can permission="permissions:create">
          <Button onClick={() => setCreating(true)}>+ New permission</Button>
        </Can>
      </div>

      {isLoading && <SkeletonGrid count={4} />}

      {isError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          Failed to load permissions
        </div>
      )}

      {data && (
        <>
          {data.data.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {q ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No permissions match "<span className="font-mono">{q}</span>"</p>
                  <button onClick={() => setDraft('')} className="text-sm text-accent hover:underline">
                    Clear search
                  </button>
                </>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No permissions yet</p>
              )}
            </div>
          ) : (
            <>
              <div className={`transition-opacity duration-200 ${isFetching && isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
                <PermissionTable
                  permissions={data.data}
                  onEdit={setEditing}
                  onDelete={setDeleting}
                />
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

      {creating && <PermissionFormDialog onClose={() => setCreating(false)} />}
      {editing && <PermissionFormDialog permission={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeletePermissionDialog permission={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}
