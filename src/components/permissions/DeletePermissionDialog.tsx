import type { Permission } from '../../types/api';
import { useDeletePermission } from '../../hooks/usePermissionsAdmin';
import { useToast } from '../toast/useToast';
import { Dialog } from '../ui/Dialog';

interface Props {
  permission: Permission;
  onClose: () => void;
}

export function DeletePermissionDialog({ permission, onClose }: Props) {
  const remove = useDeletePermission();
  const toast = useToast();

  return (
    <Dialog
      open
      variant="destructive"
      title={`Delete ${permission.name}?`}
      description={
        permission.usersCount > 0
          ? `This permission is currently granted to ${permission.usersCount} user(s). Deleting it revokes their access immediately.`
          : 'This permission is not granted to anyone.'
      }
      confirmLabel={remove.isPending ? 'Deleting…' : 'Delete'}
      confirmDisabled={remove.isPending}
      onConfirm={() =>
        remove.mutate(permission.id, {
          onSuccess: () => { toast.success('Permission deleted', permission.name); onClose(); },
        })
      }
      onClose={onClose}
    />
  );
}
