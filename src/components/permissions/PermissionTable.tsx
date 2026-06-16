import type { Permission } from '../../types/api';
import { Button } from '../ui/Button';
import { Can } from '../auth/Can';

interface Props {
  permissions: Permission[];
  onEdit: (p: Permission) => void;
  onDelete: (p: Permission) => void;
}

export function PermissionTable({ permissions, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Description</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Roles</th>
            <th className="px-4 py-3 text-center">Users</th>
            <th className="px-4 py-3 text-center">Built-in</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {permissions.map((p) => (
            <tr key={p.id} className="bg-white dark:bg-[#1f2028] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-gray-100 whitespace-nowrap">
                {p.name}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                {p.description ?? <span className="text-gray-400 dark:text-gray-600 italic">—</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex gap-1 flex-wrap">
                  {p.roles.length === 0
                    ? <span className="text-gray-400 dark:text-gray-600 italic text-xs">—</span>
                    : p.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        {role}
                      </span>
                    ))
                  }
                </div>
              </td>
              <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                {p.usersCount}
              </td>
              <td className="px-4 py-3 text-center">
                {p.builtin && (
                  <span
                    title="Defined in code — cannot be deleted via the API"
                    className="inline-block w-2 h-2 rounded-full bg-accent"
                  />
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Can permission="permissions:update">
                    <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => onEdit(p)}>
                      Edit
                    </Button>
                  </Can>
                  <Can permission="permissions:destroy">
                    <Button
                      variant="danger"
                      className="!px-2 !py-1 text-xs"
                      disabled={p.builtin}
                      title={p.builtin ? 'Built-in permissions cannot be deleted' : undefined}
                      onClick={() => !p.builtin && onDelete(p)}
                    >
                      Delete
                    </Button>
                  </Can>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
