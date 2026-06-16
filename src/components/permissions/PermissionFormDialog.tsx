import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import type { Permission } from '../../types/api';
import { useCreatePermission, useUpdatePermission } from '../../hooks/usePermissionsAdmin';
import { useToast } from '../toast/useToast';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PermissionUsersTab } from './PermissionUsersTab';

const ROLES = ['admin', 'member'] as const;

const permissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .regex(/^[a-z_]+:[a-z_]+$/, 'Use the form resource:action, e.g. reports:export'),
  description: z.string().optional(),
  roles: z.array(z.string()).optional(),
});
type PermissionFieldValues = z.infer<typeof permissionSchema>;

type Tab = 'details' | 'roles' | 'users';
const TABS: { id: Tab; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'roles', label: 'Roles' },
  { id: 'users', label: 'Users' },
];

interface Props {
  permission?: Permission;
  onClose: () => void;
}

export function PermissionFormDialog({ permission, onClose }: Props) {
  const isEdit = !!permission;
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const create = useCreatePermission();
  const update = useUpdatePermission();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PermissionFieldValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: permission?.name ?? '',
      description: permission?.description ?? '',
      roles: permission?.roles ?? [],
    },
  });

  const onSubmit = (values: PermissionFieldValues) => {
    function handleApiErrors(err: unknown) {
      const msg = (err as AxiosError<{ error: { message: string } }>).response?.data?.error?.message;
      if (msg) setError('name', { message: msg });
    }

    if (isEdit) {
      update.mutate(
        { id: permission!.id, body: { description: values.description, roles: values.roles } },
        {
          onSuccess: () => { toast.success('Permission updated', permission!.name); onClose(); },
          onError: handleApiErrors,
        },
      );
    } else {
      create.mutate({ name: values.name, description: values.description }, {
        onSuccess: (p) => { toast.success('Permission created', p.name); onClose(); },
        onError: handleApiErrors,
      });
    }
  };

  return (
    <Dialog open title={isEdit ? 'Edit permission' : 'New permission'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tab bar — only for edit mode */}
        {isEdit && (
          <div className="flex border-b border-gray-200 dark:border-gray-700 -mx-6 px-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'px-4 py-2 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-b-2 border-accent text-accent font-medium'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Details tab (also the only content for create mode) */}
        {(!isEdit || activeTab === 'details') && (
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="resource:action"
              readOnly={isEdit}
              className={isEdit ? 'opacity-60 cursor-not-allowed' : ''}
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Description"
              placeholder="Short description (optional)"
              {...register('description')}
              error={errors.description?.message}
            />
          </div>
        )}

        {/* Roles tab */}
        {isEdit && activeTab === 'roles' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roles</label>
            <div className="flex gap-4">
              {ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm select-none cursor-pointer">
                  <input
                    type="checkbox"
                    value={role}
                    {...register('roles')}
                    className="rounded border-gray-300 text-accent focus:ring-accent/50"
                  />
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      role === 'admin'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}
                  >
                    {role}
                  </span>
                </label>
              ))}
            </div>
            {permission?.builtin && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This is a built-in permission. Role changes take effect immediately but may be reset the next time the permission sync runs.
              </p>
            )}
          </div>
        )}

        {/* Users tab */}
        {isEdit && activeTab === 'users' && (
          <PermissionUsersTab permissionId={permission!.id} />
        )}

        {/* Action buttons — hidden on Users tab */}
        {activeTab !== 'users' && (
          <div className="flex gap-3 pt-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={create.isPending || update.isPending}>
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </div>
        )}
      </form>
    </Dialog>
  );
}
